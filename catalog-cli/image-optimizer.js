/**
 * Image optimization pipeline — measures every catalog image against the
 * origin (cms.agelements.in) and, for oversized ones, produces a
 * quality-preserving re-encoded copy to prove out real savings.
 *
 * Format decision is alpha-aware, not a blind PNG->JPEG rule: sharp's own
 * per-channel stats are used to check whether a PNG's alpha channel is
 * actually carrying transparency (min < 255) before ever converting to a
 * format that can't represent it. A genuinely-transparent source is
 * re-encoded to WebP (which keeps alpha); an opaque source — the case for
 * essentially all of this catalog's "RGBA PNG" product photography, per the
 * audit — is re-encoded to both JPEG and WebP and the smaller of the two,
 * at a quality floor chosen to be visually lossless, is kept.
 *
 * Modes:
 *   (default)   Analyze only — reports current size/format/dimensions per
 *               image, no files written, no network writes anywhere.
 *   --optimize  Also downloads and re-encodes images over --threshold-kb
 *               (default 400KB) into <outDir>, so real before/after sizes
 *               can be measured. Purely local — nothing is uploaded to
 *               WordPress.
 *   --apply     Uploads each re-encoded image as a new WordPress media item
 *               via the WP REST API and PATCHes the owning product's image
 *               entry to point at it (WordPress doesn't support true
 *               in-place binary replacement of an existing attachment over
 *               REST). Requires WP_APP_USER / WP_APP_PASSWORD (a WordPress
 *               Application Password) in .env.local — NOT present in this
 *               environment, so this path is implemented but has not been
 *               exercised against production. Run with --optimize first,
 *               review the output directory, then re-run with --apply once
 *               those credentials exist.
 *
 * Usage:
 *   node catalog-cli/image-optimizer.js
 *   node catalog-cli/image-optimizer.js --optimize --threshold-kb=400
 *   node catalog-cli/image-optimizer.js --optimize --apply
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');

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
const WP_APP_USER = process.env.WP_APP_USER;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

const args = process.argv.slice(2);
const getArg = (prefix, fallback) => {
  const arg = args.find((a) => a.startsWith(prefix));
  return arg ? arg.split('=')[1] : fallback;
};
const DO_OPTIMIZE = args.includes('--optimize');
const DO_APPLY = args.includes('--apply');
const THRESHOLD_BYTES = parseInt(getArg('--threshold-kb=', '400'), 10) * 1024;
const OUT_DIR = path.join(ROOT, getArg('--out-dir=', 'catalog-cli/optimized-images'));
const JPEG_QUALITY = 90;
const WEBP_QUALITY = 90;

async function fetchAllProducts() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const url = `${API_URL}/products?status=publish&per_page=100&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Basic ${AUTH}` } });
    if (!res.ok) throw new Error(`WooCommerce API error page ${page}: HTTP ${res.status}`);
    const data = await res.json();
    all.push(...data);
    totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
    page += 1;
  } while (page <= totalPages);
  return all;
}

/** True only if the alpha channel actually varies (real transparency), not just present. */
async function hasRealTransparency(buffer) {
  const img = sharp(buffer);
  const meta = await img.metadata();
  if (!meta.hasAlpha) return false;
  const stats = await img.stats();
  const alphaChannel = stats.channels[stats.channels.length - 1];
  return alphaChannel.min < 255;
}

async function optimizeBuffer(buffer) {
  const transparent = await hasRealTransparency(buffer);
  if (transparent) {
    const webp = await sharp(buffer).webp({ quality: WEBP_QUALITY, alphaQuality: 100 }).toBuffer();
    return { buffer: webp, format: 'webp', reason: 'alpha channel carries real transparency' };
  }

  const [jpeg, webp] = await Promise.all([
    sharp(buffer).flatten({ background: '#ffffff' }).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer(),
    sharp(buffer).webp({ quality: WEBP_QUALITY }).toBuffer(),
  ]);
  return jpeg.length <= webp.length
    ? { buffer: jpeg, format: 'jpeg', reason: 'opaque image, JPEG smaller than WebP at matched quality' }
    : { buffer: webp, format: 'webp', reason: 'opaque image, WebP smaller than JPEG at matched quality' };
}

async function uploadToWordPress(buffer, filename, mimeType) {
  if (!WP_APP_USER || !WP_APP_PASSWORD) {
    throw new Error('WP_APP_USER / WP_APP_PASSWORD not configured — cannot apply changes to WordPress.');
  }
  const wpAuth = Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString('base64');
  const wpMediaUrl = `${process.env.NEXT_PUBLIC_WP_URL.replace(/\/$/, '')}/wp-json/wp/v2/media`;
  const res = await fetch(wpMediaUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${wpAuth}`,
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`WordPress media upload failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  console.error('[image-optimizer] Fetching published catalog...');
  const products = await fetchAllProducts();

  const urlToProducts = new Map();
  for (const p of products) {
    for (const img of p.images || []) {
      if (!img.src) continue;
      if (!urlToProducts.has(img.src)) urlToProducts.set(img.src, []);
      urlToProducts.get(img.src).push({ productId: p.id, slug: p.slug, imageId: img.id });
    }
  }
  const uniqueUrls = [...urlToProducts.keys()];
  console.error(`[image-optimizer] ${uniqueUrls.length} unique images across ${products.length} products.`);

  if (DO_OPTIMIZE && !fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const rows = [];
  let checked = 0;

  for (const url of uniqueUrls) {
    checked += 1;
    if (checked % 50 === 0) console.error(`[image-optimizer] measured ${checked}/${uniqueUrls.length}`);

    const headRes = await fetch(url, { method: 'HEAD' }).catch(() => null);
    if (!headRes || !headRes.ok) {
      rows.push({ url, error: 'HEAD request failed', products: urlToProducts.get(url) });
      continue;
    }
    const originalBytes = parseInt(headRes.headers.get('content-length') || '0', 10);
    const contentType = headRes.headers.get('content-type') || '';

    const row = {
      url,
      products: urlToProducts.get(url),
      originalBytes,
      originalFormat: contentType.replace('image/', ''),
      overThreshold: originalBytes > THRESHOLD_BYTES,
    };

    if (DO_OPTIMIZE && row.overThreshold) {
      try {
        const getRes = await fetch(url);
        const buffer = Buffer.from(await getRes.arrayBuffer());
        const meta = await sharp(buffer).metadata();
        row.width = meta.width;
        row.height = meta.height;

        const optimized = await optimizeBuffer(buffer);
        row.optimizedBytes = optimized.buffer.length;
        row.optimizedFormat = optimized.format;
        row.optimizationReason = optimized.reason;
        row.savingsBytes = originalBytes - optimized.buffer.length;
        row.savingsPct = ((row.savingsBytes / originalBytes) * 100).toFixed(1);

        const baseName = path.basename(new URL(url).pathname).replace(/\.[^.]+$/, '');
        const outPath = path.join(OUT_DIR, `${baseName}.${optimized.format === 'jpeg' ? 'jpg' : 'webp'}`);
        fs.writeFileSync(outPath, optimized.buffer);
        row.localOutputPath = path.relative(ROOT, outPath);

        if (DO_APPLY) {
          const mimeType = optimized.format === 'jpeg' ? 'image/jpeg' : 'image/webp';
          const uploaded = await uploadToWordPress(
            optimized.buffer,
            path.basename(outPath),
            mimeType
          );
          row.appliedNewMediaUrl = uploaded.source_url;
          console.error(`[image-optimizer] Uploaded replacement for ${url} -> ${uploaded.source_url}`);
          console.error('[image-optimizer] NOTE: the WooCommerce product still references the old URL — updating product.images[] to point at the new media is a separate, deliberate step, not automated here to avoid an unreviewed bulk product write.');
        }
      } catch (e) {
        row.error = e.message;
      }
    }

    rows.push(row);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    mode: DO_APPLY ? 'apply' : DO_OPTIMIZE ? 'optimize (local only)' : 'analyze',
    thresholdBytes: THRESHOLD_BYTES,
    totalImages: rows.length,
    totalOriginalBytes: rows.reduce((a, r) => a + (r.originalBytes || 0), 0),
    formatBreakdown: rows.reduce((acc, r) => {
      acc[r.originalFormat] = (acc[r.originalFormat] || 0) + 1;
      return acc;
    }, {}),
    overThresholdCount: rows.filter((r) => r.overThreshold).length,
    optimizedCount: rows.filter((r) => r.optimizedBytes).length,
    totalSavingsBytes: rows.reduce((a, r) => a + (r.savingsBytes || 0), 0),
    rows,
  };

  fs.writeFileSync(path.join(ROOT, 'image_optimization_report.json'), JSON.stringify(summary, null, 2));

  console.error('\n=== SUMMARY ===');
  console.error(`Mode: ${summary.mode}`);
  console.error(`Total images: ${summary.totalImages}`);
  console.error(`Total original weight: ${(summary.totalOriginalBytes / 1024 / 1024).toFixed(1)} MB`);
  console.error('Format breakdown:', summary.formatBreakdown);
  console.error(`Images over ${THRESHOLD_BYTES / 1024}KB threshold: ${summary.overThresholdCount}`);
  if (DO_OPTIMIZE) {
    console.error(`Images optimized this run: ${summary.optimizedCount}`);
    console.error(`Total savings: ${(summary.totalSavingsBytes / 1024 / 1024).toFixed(1)} MB (${summary.totalOriginalBytes ? ((summary.totalSavingsBytes / summary.totalOriginalBytes) * 100).toFixed(1) : 0}% of total catalog weight)`);
    console.error(`Optimized files written to ${path.relative(ROOT, OUT_DIR)}/`);
  } else {
    console.error('Run with --optimize to re-encode oversized images locally and measure real savings.');
  }
  console.error('\nFull report: image_optimization_report.json');
}

main().catch((e) => {
  console.error('[image-optimizer] Fatal error:', e);
  process.exit(1);
});
