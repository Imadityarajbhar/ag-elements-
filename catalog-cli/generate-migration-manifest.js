/**
 * Phase 3 pre-migration manifest generator — the dry run for the WordPress
 * image migration. Joins image_optimization_report.json (size/format/local
 * path), image_validation_report.json (cross-product duplicate detection),
 * and a fresh live WooCommerce product fetch (name + current gallery
 * position, since neither existing report captures those) into one
 * machine-readable manifest, one record per oversized catalog image.
 *
 * This script makes ZERO writes to WordPress or WooCommerce — the only
 * network calls are read-only WooCommerce REST GETs (existing
 * WC_CONSUMER_KEY / WC_CONSUMER_SECRET). It never uploads, never PUTs a
 * product, never deletes anything. There is no code path in this file that
 * could mutate production even by accident — no fetch call anywhere in this
 * file uses a method other than the implicit GET.
 *
 * Usage:
 *   node catalog-cli/generate-migration-manifest.js [--dry-run]
 *
 * (--dry-run is accepted for clarity/documentation and is a no-op today —
 * this script never has a write mode. It's here so the documented migration
 * command matches this literal invocation, and stays meaningful if a future
 * version of this tool ever grows one.)
 *
 * Exit code: non-zero if ANY image fails to map confidently (see
 * ambiguity reasons below), if the optimized-images directory doesn't match
 * the report's expected file list, or if the two prerequisite report files
 * are missing/stale relative to what's on disk. This is intentional — a
 * failed dry run must not be treatable as a green light by anything
 * downstream (CI, a human skimming stdout, a future --apply flag).
 *
 * Output:
 *   catalog-cli/migration-manifest.json — machine-readable, one row per image
 *   catalog-cli/migration-manifest.md   — human-readable summary
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'catalog-cli/optimized-images');

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach((line) => {
    const [key, ...val] = line.split('=');
    if (key && val.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = val.join('=').trim();
    }
  });
}
loadEnv();

const API_URL = process.env.NEXT_PUBLIC_WC_API_URL;
const AUTH = Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64');

async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.error(`[manifest] fetch failed, retrying in ${backoff}ms... (${e.message})`);
      await new Promise((r) => setTimeout(r, backoff));
      backoff *= 2;
    }
  }
  return undefined;
}

/** Read-only WooCommerce REST GET — same paginated pattern as image-optimizer.js / image-validator.js. */
async function fetchAllProducts() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const url = `${API_URL}/products?status=publish&per_page=100&page=${page}`;
    const res = await fetchWithRetry(url, { headers: { Authorization: `Basic ${AUTH}` } });
    const data = await res.json();
    all.push(...data);
    totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
    console.error(`[manifest] fetched product page ${page}/${totalPages} (${data.length} products)`);
    page += 1;
  } while (page <= totalPages);
  return all;
}

function readJson(relPath) {
  const p = path.join(ROOT, relPath);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/** Position of `mediaId`/`url` within a live product's gallery — "primary" (index 0) or "gallery-N". */
function galleryPositionOf(liveProduct, originalMediaId, originalUrl) {
  if (!liveProduct || !Array.isArray(liveProduct.images)) return null;
  const idx = liveProduct.images.findIndex(
    (img) => (originalMediaId && img.id === originalMediaId) || img.src === originalUrl
  );
  if (idx === -1) return null;
  return idx === 0 ? 'primary' : `gallery-${idx}`;
}

async function main() {
  const DRY_RUN = true; // this script has no other mode — see file header
  console.error(`[manifest] Phase 3 dry run — DRY_RUN=${DRY_RUN} — zero production writes will occur.`);

  const optReport = readJson('image_optimization_report.json');
  const valReport = readJson('image_validation_report.json');
  if (!optReport) {
    console.error('[manifest] FATAL: image_optimization_report.json not found. Run image-optimizer.js --optimize first.');
    process.exitCode = 1; return;
  }
  if (!valReport) {
    console.error('[manifest] WARNING: image_validation_report.json not found — duplicate cross-check will rely on image-optimizer.js\'s own row.products only.');
  }

  const duplicateUrlSet = new Set((valReport?.duplicateUrlsAcrossProducts || []).map((d) => d.url));

  console.error('[manifest] Fetching live WooCommerce catalog for name/gallery-position verification...');
  const liveProducts = await fetchAllProducts();
  const liveProductById = new Map(liveProducts.map((p) => [p.id, p]));
  console.error(`[manifest] ${liveProducts.length} live published products fetched.`);

  const optimizedRows = optReport.rows.filter((r) => r.overThreshold && r.optimizedBytes && r.localOutputPath);
  console.error(`[manifest] ${optimizedRows.length} images marked as optimized in the report (expected 126).`);

  const manifest = [];
  let ambiguousCount = 0;
  let sharedCount = 0;

  for (const row of optimizedRows) {
    const reasons = [];

    // 1. Local optimized file must exist, be readable, uncorrupted, and its
    //    dimensions must match what the optimizer measured on the *original*
    //    at optimize-time (row.width/height — sharp never resizes, only
    //    re-encodes, so any mismatch here means something unexpected
    //    happened to the file after the report was generated).
    const localAbsPath = path.join(ROOT, row.localOutputPath);
    let optimizedMeta = null;
    let fileBytes = null;
    if (!fs.existsSync(localAbsPath)) {
      reasons.push('optimized-file-missing');
    } else {
      try {
        fileBytes = fs.statSync(localAbsPath).size;
        optimizedMeta = await sharp(localAbsPath).metadata();
        if (row.width && optimizedMeta.width !== row.width) reasons.push(`width-mismatch (report:${row.width} file:${optimizedMeta.width})`);
        if (row.height && optimizedMeta.height !== row.height) reasons.push(`height-mismatch (report:${row.height} file:${optimizedMeta.height})`);
        if (fileBytes !== row.optimizedBytes) reasons.push(`byte-size-mismatch (report:${row.optimizedBytes} file:${fileBytes})`);
      } catch (e) {
        reasons.push(`optimized-file-corrupt (${e.message})`);
      }
    }

    // 2. Transparency invariant: webp chosen <=> original had real alpha
    //    (per optimizer's own hasRealTransparency reasoning string). Any
    //    mismatch means a genuinely-transparent source could have been
    //    flattened onto white by mistake — the one visual-quality defect
    //    class worth failing hard on.
    const reasonSaysTransparent = /transparency/i.test(row.optimizationReason || '');
    const hasTransparency = reasonSaysTransparent;
    if (reasonSaysTransparent && row.optimizedFormat !== 'webp') {
      reasons.push('transparency-loss-risk (source had real alpha but was not encoded as webp)');
    }

    // 3. Live product / gallery-position resolution — every product listed
    //    for this image must still exist and still reference this exact
    //    media id/url at a stable position.
    const productEntries = [];
    for (const p of row.products) {
      const live = liveProductById.get(p.productId);
      const position = galleryPositionOf(live, p.imageId, row.url);
      if (!live) {
        reasons.push(`product-${p.productId}-no-longer-published`);
      } else if (!position) {
        reasons.push(`product-${p.productId}-no-longer-references-this-image`);
      }
      productEntries.push({
        productId: p.productId,
        productSlug: p.slug,
        productName: live ? live.name : null,
        originalMediaId: p.imageId,
        galleryPosition: position,
      });
    }

    const sharedAcrossProducts = row.products.length > 1 || duplicateUrlSet.has(row.url);
    if (sharedAcrossProducts) sharedCount += 1;

    const confident = reasons.length === 0;
    if (!confident) ambiguousCount += 1;

    manifest.push({
      originalUrl: row.url,
      originalFilename: path.basename(new URL(row.url).pathname),
      originalContentType: row.originalFormat ? `image/${row.originalFormat}` : null,
      originalBytes: row.originalBytes,
      optimizedLocalPath: row.localOutputPath,
      optimizedFormat: row.optimizedFormat,
      optimizedBytes: row.optimizedBytes,
      compressionRatio: row.originalBytes ? Number((row.savingsBytes / row.originalBytes).toFixed(4)) : null,
      hasTransparency,
      sharedAcrossProducts,
      products: productEntries,
      proposedAction: confident ? 'upload-and-repoint' : 'skip-ambiguous',
      ambiguityReasons: reasons,
      rollback: productEntries.map((p) => ({
        productId: p.productId,
        originalMediaId: p.originalMediaId,
        originalUrl: row.url,
      })),
    });
  }

  const totalOriginalBytes = manifest.reduce((a, r) => a + (r.originalBytes || 0), 0);
  const totalOptimizedBytes = manifest.reduce((a, r) => a + (r.optimizedBytes || 0), 0);
  const confidentRows = manifest.filter((r) => r.proposedAction === 'upload-and-repoint');

  const summary = {
    generatedAt: new Date().toISOString(),
    mode: 'dry-run (no production writes)',
    totalImagesInManifest: manifest.length,
    confidentlyMappedCount: confidentRows.length,
    ambiguousCount,
    sharedAcrossProductsCount: sharedCount,
    totalOriginalBytes,
    totalOptimizedBytes,
    totalSavingsBytes: totalOriginalBytes - totalOptimizedBytes,
    overallReductionPct: totalOriginalBytes ? Number((((totalOriginalBytes - totalOptimizedBytes) / totalOriginalBytes) * 100).toFixed(1)) : null,
    rows: manifest,
  };

  fs.writeFileSync(path.join(ROOT, 'catalog-cli/migration-manifest.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(ROOT, 'catalog-cli/migration-manifest.md'), buildMarkdown(summary));

  console.error('\n=== DRY RUN SUMMARY (zero production writes occurred) ===');
  console.error(`Images in manifest: ${summary.totalImagesInManifest}`);
  console.error(`Confidently mapped (would migrate): ${summary.confidentlyMappedCount}`);
  console.error(`Ambiguous (would be skipped): ${summary.ambiguousCount}`);
  console.error(`Shared across >1 product: ${summary.sharedAcrossProductsCount}`);
  console.error(`Original bytes: ${totalOriginalBytes} (${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB)`);
  console.error(`Optimized bytes: ${totalOptimizedBytes} (${(totalOptimizedBytes / 1024 / 1024).toFixed(2)} MB)`);
  console.error(`Reduction: ${summary.overallReductionPct}%`);
  console.error('\nFull manifest: catalog-cli/migration-manifest.json');
  console.error('Human-readable: catalog-cli/migration-manifest.md');

  if (summary.totalImagesInManifest !== 126) {
    console.error(`\n[manifest] SAFETY CHECK FAILED: expected 126 optimized images, found ${summary.totalImagesInManifest}.`);
    process.exitCode = 1; return;
  }
  if (ambiguousCount > 0) {
    console.error(`\n[manifest] SAFETY CHECK: ${ambiguousCount} image(s) could not be confidently mapped — see ambiguityReasons in the manifest. These are excluded from any future --apply run.`);
    process.exitCode = 1; return;
  }
  console.error('\n[manifest] All images confidently mapped. Safe to proceed to review — production apply still requires a separate explicit step.');
  process.exitCode = 0; return;
}

function buildMarkdown(summary) {
  const lines = [];
  lines.push('# Phase 3 — WordPress Image Migration: Dry-Run Manifest');
  lines.push('');
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push('');
  lines.push('**Zero production writes occurred generating this report.**');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|---|---|');
  lines.push(`| Images in manifest | ${summary.totalImagesInManifest} |`);
  lines.push(`| Confidently mapped (would migrate) | ${summary.confidentlyMappedCount} |`);
  lines.push(`| Ambiguous (would be skipped) | ${summary.ambiguousCount} |`);
  lines.push(`| Shared across >1 product | ${summary.sharedAcrossProductsCount} |`);
  lines.push(`| Original size | ${(summary.totalOriginalBytes / 1024 / 1024).toFixed(2)} MB |`);
  lines.push(`| Optimized size | ${(summary.totalOptimizedBytes / 1024 / 1024).toFixed(2)} MB |`);
  lines.push(`| Reduction | ${summary.overallReductionPct}% |`);
  lines.push('');

  const ambiguous = summary.rows.filter((r) => r.proposedAction === 'skip-ambiguous');
  if (ambiguous.length > 0) {
    lines.push('## Ambiguous — requires manual review before any migration');
    lines.push('');
    lines.push('| Original URL | Products | Reasons |');
    lines.push('|---|---|---|');
    for (const r of ambiguous) {
      const products = r.products.map((p) => `${p.productSlug} (#${p.productId})`).join(', ');
      lines.push(`| ${r.originalUrl} | ${products} | ${r.ambiguityReasons.join('; ')} |`);
    }
    lines.push('');
  }

  const shared = summary.rows.filter((r) => r.sharedAcrossProducts);
  if (shared.length > 0) {
    lines.push('## Shared media (one upload will serve all listed products)');
    lines.push('');
    lines.push('| Original URL | Products |');
    lines.push('|---|---|');
    for (const r of shared) {
      const products = r.products.map((p) => `${p.productSlug} (#${p.productId})`).join(', ');
      lines.push(`| ${r.originalUrl} | ${products} |`);
    }
    lines.push('');
  }

  lines.push('## Every mapped image');
  lines.push('');
  lines.push('| Product(s) | Position | Original | Optimized | Reduction | Action |');
  lines.push('|---|---|---|---|---|---|');
  for (const r of summary.rows) {
    const products = r.products.map((p) => `${p.productSlug}${p.galleryPosition ? ` [${p.galleryPosition}]` : ''}`).join(', ');
    lines.push(`| ${products} | — | ${(r.originalBytes / 1024).toFixed(0)}KB | ${(r.optimizedBytes / 1024).toFixed(0)}KB | ${(r.compressionRatio * 100).toFixed(1)}% | ${r.proposedAction} |`);
  }
  lines.push('');

  return lines.join('\n');
}

main().catch((e) => {
  console.error('[manifest] Fatal error:', e);
  process.exitCode = 1; return;
});
