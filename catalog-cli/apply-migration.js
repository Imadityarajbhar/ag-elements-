/**
 * Phase 3 production migration — uploads the optimized replacement for each
 * confidently-mapped image in catalog-cli/migration-manifest.json to
 * WordPress media, then repoints (never overwrites, never deletes) the
 * owning WooCommerce product's gallery entry to the new media, one product
 * at a time, verifying after every single write before moving on.
 *
 * SAFETY MODEL (fail-closed by construction, not just by convention):
 *   - Default (no flags), or explicit --dry-run: DRY_RUN = true. Every
 *     write call in this file is behind `if (!DRY_RUN)` — in dry-run mode
 *     the upload/PUT functions are never invoked at all, only logged.
 *   - --apply alone: REFUSED. Exits 1 immediately, before anything else
 *     runs (no product fetch, no backup, nothing) — --apply without
 *     --confirm-production is treated as a mistake, not a lesser mode.
 *   - --apply --confirm-production: the only combination that performs
 *     real writes.
 *   - A failed verification after ANY product write halts the entire run
 *     immediately (no further products are touched) and exits non-zero
 *     with the exact product ID and reason.
 *   - Original WordPress media is never deleted and never overwritten —
 *     this script only ever POSTs new media and PUTs a product's `images`
 *     array to reference it. There is no DELETE call anywhere in this file.
 *
 * SEQUENCE:
 *   1. Load manifest, filter to confidently-mapped rows.
 *   2. BACKUP — fetch the live, current `images[]` for every affected
 *      product and write it to an immutable, uniquely-named file under
 *      catalog-cli/backups/ BEFORE any write. This is the only artifact
 *      rollback-migration.js needs to restore exact pre-migration state.
 *   3. UPLOAD — one WordPress media upload per unique manifest row (shared
 *      images upload exactly once), each immediately verified (response
 *      shape + a live fetch of the new URL) before it's used anywhere.
 *   4. REPOINT — per product, construct a new `images[]` that is a copy of
 *      the backed-up original with only the migrated position(s) swapped
 *      to the new media, preserving order and every untouched entry
 *      exactly. PUT it, then immediately GET the product again and verify
 *      the live gallery matches what was intended, position by position.
 *      Any mismatch stops the run right there.
 *   5. REVALIDATE — only after a product's write is verified, call this
 *      app's own /api/revalidate for that product's cache tag (does not
 *      depend on the WooCommerce webhook being registered).
 *   6. VALIDATE — once every product succeeds, run validate-migration.js
 *      as a subprocess and fail this run if it doesn't exit 0.
 *
 * Usage:
 *   node catalog-cli/apply-migration.js                          # dry run (default)
 *   node catalog-cli/apply-migration.js --dry-run                # dry run (explicit)
 *   node catalog-cli/apply-migration.js --apply --confirm-production   # REAL WRITES
 *   node catalog-cli/apply-migration.js --manifest=<path>         # override manifest (for testing)
 *
 * Never logs WC_CONSUMER_SECRET, WP_APP_PASSWORD, or any Authorization
 * header value — only the fact that auth was attempted/succeeded/failed.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

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

const args = process.argv.slice(2);
const getArg = (prefix, fallback) => {
  const arg = args.find((a) => a.startsWith(prefix));
  return arg ? arg.split('=').slice(1).join('=') : fallback;
};

const DO_APPLY = args.includes('--apply');
const CONFIRMED = args.includes('--confirm-production');
const FORCE_DRY_RUN = args.includes('--dry-run');

if (DO_APPLY && !CONFIRMED) {
  console.error('[apply] FATAL: --apply was passed without --confirm-production. Refusing to proceed.');
  console.error('[apply] Both flags are required together for any production write: --apply --confirm-production');
  process.exitCode = 1; return;
}

const DRY_RUN = FORCE_DRY_RUN || !(DO_APPLY && CONFIRMED);

const API_URL = process.env.NEXT_PUBLIC_WC_API_URL;
const WP_URL = (process.env.NEXT_PUBLIC_WP_URL || '').replace(/\/$/, '');
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
const AUTH = Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64');
const WP_APP_USER = process.env.WP_APP_USER;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

const MANIFEST_PATH = path.join(ROOT, getArg('--manifest=', 'catalog-cli/migration-manifest.json'));
const BACKUP_DIR = path.join(ROOT, 'catalog-cli/backups');
const RESULT_DIR = path.join(ROOT, 'catalog-cli/migration-results');

async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.error(`[apply] fetch failed, retrying in ${backoff}ms... (${e.message})`);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, backoff));
      backoff *= 2;
    }
  }
  return undefined;
}

async function getProduct(id) {
  const res = await fetchWithRetry(`${API_URL}/products/${id}`, { headers: { Authorization: `Basic ${AUTH}` } });
  if (!res.ok) throw new Error(`GET /products/${id} failed: HTTP ${res.status}`);
  return res.json();
}

async function putProduct(id, body) {
  const res = await fetchWithRetry(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Basic ${AUTH}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT /products/${id} failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

async function uploadMedia(buffer, filename, mimeType) {
  if (!WP_APP_USER || !WP_APP_PASSWORD) {
    throw new Error('WP_APP_USER / WP_APP_PASSWORD not configured — cannot upload to WordPress.');
  }
  const wpAuth = Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString('base64');
  const res = await fetchWithRetry(`${WP_URL}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${wpAuth}`,
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`Media upload failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * WordPress auto-generates alt text for a fresh upload (usually empty) —
 * without this, a migrated image silently loses whatever descriptive alt
 * text the original attachment had, a real accessibility/SEO regression.
 * Best-effort: failure here does not abort the migration (the image itself
 * is still correct), but is logged clearly since it's a real, if minor, loss.
 */
async function setMediaAltText(mediaId, altText) {
  if (!altText) return { ok: true, skipped: true };
  const wpAuth = Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString('base64');
  const res = await fetchWithRetry(`${WP_URL}/wp-json/wp/v2/media/${mediaId}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${wpAuth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alt_text: altText }),
  }, 2, 500).catch((e) => ({ ok: false, _err: e.message }));
  return { ok: !!res?.ok, status: res?.status };
}

/** Verify an uploaded media object is real and resolvable before it's ever referenced by a product. */
async function verifyUploadedMedia(uploaded) {
  if (!uploaded || !uploaded.id || !uploaded.source_url) {
    return { ok: false, reason: 'upload response missing id/source_url' };
  }
  if (uploaded.media_type && uploaded.media_type !== 'image') {
    return { ok: false, reason: `media_type is "${uploaded.media_type}", expected "image"` };
  }
  const check = await fetchWithRetry(uploaded.source_url, { method: 'GET' }, 2, 500).catch((e) => ({ ok: false, _err: e.message }));
  if (!check || !check.ok) {
    return { ok: false, reason: `new media URL did not return 200 (${check?.status ?? check?._err ?? 'no response'})` };
  }
  const contentType = check.headers?.get ? check.headers.get('content-type') : null;
  if (!contentType || !contentType.startsWith('image/')) {
    return { ok: false, reason: `new media URL content-type is "${contentType}", expected image/*` };
  }
  return { ok: true };
}

async function revalidateProduct(slug) {
  if (!SITE_URL || !REVALIDATE_SECRET) {
    console.error(`[apply] SKIPPED revalidate for ${slug} — NEXT_PUBLIC_SITE_URL or REVALIDATE_SECRET not configured.`);
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetchWithRetry(`${SITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': REVALIDATE_SECRET, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: ['products', `product-${slug}`] }),
    }, 2, 500);
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** Deep, order-sensitive comparison of two WooCommerce `images[]` arrays by id+src. */
function imagesMatch(expected, actual) {
  if (!Array.isArray(actual) || actual.length !== expected.length) return false;
  return expected.every((img, i) => actual[i] && actual[i].id === img.id && actual[i].src === img.src);
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function main() {
  console.error(`[apply] Mode: ${DRY_RUN ? 'DRY RUN — zero production writes will occur' : '*** PRODUCTION WRITE MODE ***'}`);
  console.error(`[apply] Manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`[apply] FATAL: manifest not found at ${MANIFEST_PATH}. Run generate-migration-manifest.js first.`);
    process.exitCode = 1; return;
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const rows = manifest.rows.filter((r) => r.proposedAction === 'upload-and-repoint');
  if (rows.length === 0) {
    console.error('[apply] No confidently-mapped rows in manifest. Nothing to do.');
    process.exitCode = 0; return;
  }
  console.error(`[apply] ${rows.length} image(s) to migrate.`);

  const productIds = [...new Set(rows.flatMap((r) => r.products.map((p) => p.productId)))];
  console.error(`[apply] ${productIds.length} product(s) affected.`);

  // ---- STEP 1: BACKUP (read-only, always performed, even in dry-run — it's
  // the rehearsal that proves the backup mechanism itself works before it's
  // ever load-bearing, and it never writes to WordPress/WooCommerce). ----
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.error('[apply] Backing up current live gallery state for every affected product...');
  const backupProducts = {};
  for (const id of productIds) {
    const live = await getProduct(id);
    backupProducts[id] = {
      id: live.id,
      slug: live.slug,
      name: live.name,
      images: live.images.map((img) => ({ id: img.id, src: img.src, name: img.name, alt: img.alt })),
    };
  }
  const backup = {
    generatedAt: new Date().toISOString(),
    manifestGeneratedAt: manifest.generatedAt,
    dryRun: DRY_RUN,
    productCount: productIds.length,
    products: backupProducts,
  };
  const backupFilename = `${DRY_RUN ? 'DRYRUN-' : ''}migration-backup-${timestampSlug()}.json`;
  const backupPath = path.join(BACKUP_DIR, backupFilename);
  if (fs.existsSync(backupPath)) {
    console.error(`[apply] FATAL: backup path already exists (${backupPath}) — refusing to overwrite an existing backup.`);
    process.exitCode = 1; return;
  }
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.error(`[apply] Backup written: ${path.relative(ROOT, backupPath)} (immutable — this file is never rewritten by this script)`);

  // ---- STEP 2: UPLOAD optimized media, one per unique manifest row ----
  console.error(`\n[apply] Uploading ${rows.length} optimized image(s)...`);
  const uploadedByUrl = new Map(); // originalUrl -> {id, source_url}
  for (const row of rows) {
    const sharedNote = row.sharedAcrossProducts ? ` (SHARED — serves ${row.products.length} products)` : '';
    if (DRY_RUN) {
      console.error(`[apply] [dry-run] would upload ${row.optimizedLocalPath} (${row.optimizedBytes} bytes, ${row.optimizedFormat})${sharedNote}`);
      uploadedByUrl.set(row.originalUrl, { id: -1, source_url: `[dry-run-would-be-new-url-for]${row.originalUrl}` });
      continue;
    }
    const localAbsPath = path.join(ROOT, row.optimizedLocalPath);
    const buffer = fs.readFileSync(localAbsPath);
    const mimeType = row.optimizedFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const filename = path.basename(localAbsPath);
    const uploaded = await uploadMedia(buffer, filename, mimeType);
    const verification = await verifyUploadedMedia(uploaded);
    if (!verification.ok) {
      console.error(`\n[apply] STOPPED: uploaded media failed verification for ${row.originalUrl}`);
      console.error(`[apply] Reason: ${verification.reason}`);
      console.error('[apply] No product has been repointed to this media. Halting before any product write for this image.');
      process.exitCode = 1; return;
    }
    console.error(`[apply] Uploaded + verified: ${filename} -> ${uploaded.source_url}${sharedNote}`);

    const originalAlt = backupProducts[row.products[0].productId]?.images.find((img) => img.id === row.products[0].originalMediaId)?.alt;
    const altResult = await setMediaAltText(uploaded.id, originalAlt);
    if (originalAlt && !altResult.ok) {
      console.error(`[apply] WARNING: could not carry over alt text ("${originalAlt}") to the new media (id ${uploaded.id}) — image itself is correct, but this is a minor accessibility/SEO regression worth fixing manually in WordPress.`);
    } else if (originalAlt) {
      console.error(`[apply] Alt text preserved: "${originalAlt}"`);
    }

    uploadedByUrl.set(row.originalUrl, { id: uploaded.id, source_url: uploaded.source_url });
  }

  // ---- STEP 3: REPOINT products, one at a time, verify-then-proceed ----
  console.error(`\n[apply] Repointing ${productIds.length} product(s)...`);
  const results = [];
  for (const id of productIds) {
    const original = backupProducts[id];
    const newImages = original.images.map((img) => {
      const migratingRow = rows.find(
        (r) => r.products.some((p) => p.productId === id && p.originalMediaId === img.id)
      );
      if (!migratingRow) return img; // untouched entry — preserved exactly
      const replacement = uploadedByUrl.get(migratingRow.originalUrl);
      return { id: replacement.id, src: replacement.source_url };
    });

    if (DRY_RUN) {
      console.error(`[apply] [dry-run] would PUT product #${id} (${original.slug}) — gallery: ${original.images.map((i) => i.id).join(',')} -> ${newImages.map((i) => i.id).join(',')}`);
      results.push({ productId: id, slug: original.slug, status: 'dry-run', revalidate: null });
      continue;
    }

    try {
      await putProduct(id, { images: newImages.map((img) => ({ id: img.id, src: img.src })) });
      const verified = await getProduct(id);
      if (!imagesMatch(newImages, verified.images)) {
        console.error(`\n[apply] STOPPED: verification failed for product #${id} (${original.slug})`);
        console.error(`[apply] Expected gallery: ${JSON.stringify(newImages.map((i) => ({ id: i.id, src: i.src })))}`);
        console.error(`[apply] Actual gallery:   ${JSON.stringify((verified.images || []).map((i) => ({ id: i.id, src: i.src })))}`);
        console.error('[apply] Halting immediately. No further products will be touched. Already-migrated products above remain migrated — use rollback-migration.js with the backup written above if you need to undo them.');
        writeResults(results.concat([{ productId: id, slug: original.slug, status: 'FAILED_VERIFICATION' }]), backupPath);
        process.exitCode = 1; return;
      }
      console.error(`[apply] Product #${id} (${original.slug}) migrated and verified.`);
      const revalidate = await revalidateProduct(original.slug);
      results.push({ productId: id, slug: original.slug, status: 'success', revalidate });
    } catch (e) {
      console.error(`\n[apply] STOPPED: error migrating product #${id} (${original.slug}): ${e.message}`);
      writeResults(results.concat([{ productId: id, slug: original.slug, status: 'ERROR', error: e.message }]), backupPath);
      process.exitCode = 1; return;
    }
  }

  writeResults(results, backupPath);

  if (DRY_RUN) {
    console.error('\n[apply] Dry run complete. No production writes occurred. Re-run with --apply --confirm-production to execute for real.');
    process.exitCode = 0; return;
  }

  // ---- STEP 4: post-migration validation — fail the run if it fails ----
  console.error('\n[apply] Running validate-migration.js...');
  try {
    execFileSync('node', [path.join(ROOT, 'catalog-cli/validate-migration.js'), `--manifest=${path.relative(ROOT, MANIFEST_PATH)}`], { stdio: 'inherit' });
    console.error('\n[apply] Migration complete and validated successfully.');
    process.exitCode = 0; return;
  } catch (e) {
    console.error('\n[apply] FATAL: post-migration validation FAILED. The product writes above already happened and were individually verified, but the holistic validator found a problem — investigate immediately.');
    process.exitCode = 1; return;
  }
}

function writeResults(results, backupPath) {
  if (!fs.existsSync(RESULT_DIR)) fs.mkdirSync(RESULT_DIR, { recursive: true });
  const resultPath = path.join(RESULT_DIR, `${DRY_RUN ? 'DRYRUN-' : ''}migration-result-${timestampSlug()}.json`);
  fs.writeFileSync(resultPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    backupFile: path.relative(ROOT, backupPath),
    results,
  }, null, 2));
  console.error(`[apply] Result written: ${path.relative(ROOT, resultPath)}`);
}

main().catch((e) => {
  console.error('[apply] Fatal error:', e.message);
  process.exitCode = 1; return;
});
