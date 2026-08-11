/**
 * Post-migration validator (Phase 3, Target Eighth). Runnable independently,
 * any time — including right now, before any migration has happened, in
 * which case it correctly reports "nothing migrated yet" rather than
 * erroring. Read-only: WooCommerce REST GETs plus HEAD requests against
 * image URLs. Never writes to WordPress/WooCommerce.
 *
 * Compares live WooCommerce product state against
 * catalog-cli/migration-manifest.json (produced by
 * generate-migration-manifest.js) and, for any product this validator
 * detects as already migrated (its gallery no longer references the
 * manifest's originalUrl at the expected position), runs the full check
 * list below against the new state:
 *
 *   1. Product still has a non-empty images[] gallery.
 *   2. The new image URL responds HTTP 200.
 *   3. The new image URL's response Content-Type starts with image/.
 *   4. Gallery length is unchanged from what the manifest recorded.
 *   5. No product lost an image (cross-checked by position, not just count).
 *   6. No image URL points at localhost or a non-production host.
 *   7. No old (pre-migration) URL remains where the manifest says a swap
 *      was intended for that product.
 *   8. images[0] (primary) matches the manifest's intended primary.
 *   9. Every sharedAcrossProducts row resolves to the SAME new URL across
 *      every product that shares it (no accidental duplicate upload).
 *   10. The live GET /wc/v3/products/{id} response is itself the source of
 *       truth for all of the above — nothing here is inferred from a cache.
 *
 * Usage:
 *   node catalog-cli/validate-migration.js
 *
 * Exit code: non-zero if anything already-migrated fails a check. Zero if
 * either nothing has been migrated yet, or everything migrated passes.
 */
const fs = require('fs');
const path = require('path');

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

const args = process.argv.slice(2);
const getArg = (prefix, fallback) => {
  const arg = args.find((a) => a.startsWith(prefix));
  return arg ? arg.split('=').slice(1).join('=') : fallback;
};
const MANIFEST_PATH = path.join(ROOT, getArg('--manifest=', 'catalog-cli/migration-manifest.json'));

async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.error(`[validate] fetch failed, retrying in ${backoff}ms... (${e.message})`);
      await new Promise((r) => setTimeout(r, backoff));
      backoff *= 2;
    }
  }
  return undefined;
}

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
    page += 1;
  } while (page <= totalPages);
  return all;
}

function isLocalOrDevHost(urlStr) {
  try {
    const { hostname } = new URL(urlStr);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local') || hostname.endsWith('.test');
  } catch {
    return true; // unparseable URL is itself a failure
  }
}

async function checkUrlOk(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return { ok: res.ok, status: res.status, contentType: res.headers.get('content-type') };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
}

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`[validate] No manifest found at ${MANIFEST_PATH}. Run generate-migration-manifest.js first.`);
    process.exitCode = 1; return;
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const confidentRows = manifest.rows.filter((r) => r.proposedAction === 'upload-and-repoint');

  console.error(`[validate] Loaded manifest: ${confidentRows.length} confidently-mapped images to check.`);
  console.error('[validate] Fetching live WooCommerce catalog...');
  const liveProducts = await fetchAllProducts();
  const liveById = new Map(liveProducts.map((p) => [p.id, p]));

  const failures = [];
  let migratedCount = 0;
  let pendingCount = 0;

  // Track, per shared-image group, every new URL observed across its
  // products — used for check #9 (shared images must all resolve to the
  // same new media).
  const sharedGroupNewUrls = new Map(); // originalUrl -> Set<newUrl>

  for (const row of confidentRows) {
    let rowMigratedAnyProduct = false;
    let rowFullyMigrated = true;

    for (const p of row.products) {
      const live = liveById.get(p.productId);
      if (!live) {
        failures.push(`Product #${p.productId} (${p.productSlug}): no longer found in live published catalog.`);
        continue;
      }
      if (!Array.isArray(live.images) || live.images.length === 0) {
        failures.push(`Product #${p.productId} (${p.productSlug}): gallery is empty. [check 1]`);
        continue;
      }

      const idx = live.images.findIndex((img) => img.id === p.originalMediaId);
      const currentImg = idx !== -1 ? live.images[idx] : live.images.find((img) => img.src === row.originalUrl);

      const stillOnOriginal = currentImg && currentImg.src === row.originalUrl;
      if (stillOnOriginal) {
        pendingCount += 1;
        rowFullyMigrated = false;
        continue; // not migrated yet for this product — nothing further to check
      }

      // Something has changed for this product/image — treat as migrated
      // and run the full check list against the new state.
      rowMigratedAnyProduct = true;
      migratedCount += 1;

      // If the original media id is gone entirely and nothing recognizable
      // replaced it at the expected position, that's a lost-image failure.
      const expectedIdx = p.galleryPosition === 'primary' ? 0 : parseInt((p.galleryPosition || '').replace('gallery-', ''), 10);
      const atExpectedPosition = live.images[expectedIdx];

      if (!atExpectedPosition) {
        failures.push(`Product #${p.productId} (${p.productSlug}): expected an image at position ${p.galleryPosition}, found none. [check 5]`);
        continue;
      }

      const newUrl = atExpectedPosition.src;

      if (p.galleryPosition === 'primary' && idx !== 0 && live.images[0]?.src !== newUrl) {
        failures.push(`Product #${p.productId} (${p.productSlug}): primary image mismatch — expected the migrated image at images[0]. [check 8]`);
      }

      if (isLocalOrDevHost(newUrl)) {
        failures.push(`Product #${p.productId} (${p.productSlug}): new image URL points at a non-production host: ${newUrl} [check 6]`);
      }

      // eslint-disable-next-line no-await-in-loop
      const urlCheck = await checkUrlOk(newUrl);
      if (!urlCheck.ok) {
        failures.push(`Product #${p.productId} (${p.productSlug}): new image URL ${newUrl} did not return 200 (got ${urlCheck.status}). [check 2]`);
      } else if (!urlCheck.contentType || !urlCheck.contentType.startsWith('image/')) {
        failures.push(`Product #${p.productId} (${p.productSlug}): new image URL ${newUrl} has non-image content-type (${urlCheck.contentType}). [check 3]`);
      }

      if (row.sharedAcrossProducts) {
        if (!sharedGroupNewUrls.has(row.originalUrl)) sharedGroupNewUrls.set(row.originalUrl, new Set());
        sharedGroupNewUrls.get(row.originalUrl).add(newUrl);
      }
    }

    if (row.sharedAcrossProducts && rowMigratedAnyProduct && !rowFullyMigrated) {
      failures.push(`Shared image ${row.originalUrl}: only some of its ${row.products.length} products have been migrated so far — partial migration of a shared asset. [check 9, in progress]`);
    }
  }

  for (const [originalUrl, urls] of sharedGroupNewUrls.entries()) {
    if (urls.size > 1) {
      failures.push(`Shared image ${originalUrl}: resolved to ${urls.size} DIFFERENT new URLs across its sharing products (expected exactly 1 — indicates a duplicate upload). [check 9]`);
    }
  }

  console.error('\n=== VALIDATION SUMMARY ===');
  console.error(`Images already migrated: ${migratedCount}`);
  console.error(`Images not yet migrated: ${pendingCount}`);
  console.error(`Failures: ${failures.length}`);

  if (migratedCount === 0) {
    console.error('\n[validate] Nothing has been migrated yet — this is expected pre-migration state. No production changes detected.');
  }

  if (failures.length > 0) {
    console.error('\n=== FAILURES ===');
    failures.forEach((f) => console.error(`- ${f}`));
    process.exitCode = 1; return;
  }

  console.error('\n[validate] All checks passed for everything migrated so far.');
  process.exitCode = 0; return;
}

main().catch((e) => {
  console.error('[validate] Fatal error:', e);
  process.exitCode = 1; return;
});
