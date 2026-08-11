/**
 * Phase 3 rollback — restores every product in a given migration backup
 * file (written by apply-migration.js, under catalog-cli/backups/) back to
 * its exact pre-migration `images[]`: same media IDs, same URLs, same
 * order. Never deletes anything from the WordPress media library (the
 * migrated/new media simply stops being referenced by any product; it
 * still exists, exactly like the originals it replaced never stopped
 * existing) — this script only ever PUTs a product's `images` array.
 *
 * SAFETY MODEL — identical to apply-migration.js:
 *   - Default, or explicit --dry-run: zero writes, only logs intended PUTs.
 *   - --apply alone: refused (exit 1) — both --apply and
 *     --confirm-production are required together for a real write.
 *   - A failed verification after any product's restore halts the run
 *     immediately with the exact product ID and reason; already-restored
 *     products above are unaffected and remain restored.
 *
 * Usage:
 *   node catalog-cli/rollback-migration.js --backup=catalog-cli/backups/<file>
 *   node catalog-cli/rollback-migration.js --backup=<file> --dry-run
 *   node catalog-cli/rollback-migration.js --backup=<file> --apply --confirm-production
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

const args = process.argv.slice(2);
const getArg = (prefix, fallback) => {
  const arg = args.find((a) => a.startsWith(prefix));
  return arg ? arg.split('=').slice(1).join('=') : fallback;
};

const DO_APPLY = args.includes('--apply');
const CONFIRMED = args.includes('--confirm-production');
const FORCE_DRY_RUN = args.includes('--dry-run');

if (DO_APPLY && !CONFIRMED) {
  console.error('[rollback] FATAL: --apply was passed without --confirm-production. Refusing to proceed.');
  process.exitCode = 1; return;
}
const DRY_RUN = FORCE_DRY_RUN || !(DO_APPLY && CONFIRMED);

const BACKUP_ARG = getArg('--backup=', null);
if (!BACKUP_ARG) {
  console.error('[rollback] FATAL: --backup=<path> is required.');
  process.exitCode = 1; return;
}
const BACKUP_PATH = path.isAbsolute(BACKUP_ARG) ? BACKUP_ARG : path.join(ROOT, BACKUP_ARG);

const API_URL = process.env.NEXT_PUBLIC_WC_API_URL;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
const AUTH = Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64');
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i += 1) {
    try {
      return await fetch(url, options);
    } catch (e) {
      if (i === retries - 1) throw e;
      console.error(`[rollback] fetch failed, retrying in ${backoff}ms... (${e.message})`);
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

async function revalidateProduct(slug) {
  if (!SITE_URL || !REVALIDATE_SECRET) return { ok: false, skipped: true };
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

function imagesMatch(expected, actual) {
  if (!Array.isArray(actual) || actual.length !== expected.length) return false;
  return expected.every((img, i) => actual[i] && actual[i].id === img.id && actual[i].src === img.src);
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function main() {
  console.error(`[rollback] Mode: ${DRY_RUN ? 'DRY RUN — zero production writes will occur' : '*** PRODUCTION WRITE MODE ***'}`);

  if (!fs.existsSync(BACKUP_PATH)) {
    console.error(`[rollback] FATAL: backup file not found: ${BACKUP_PATH}`);
    process.exitCode = 1; return;
  }
  const backup = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
  const products = Object.values(backup.products || {});
  console.error(`[rollback] Backup: ${path.relative(ROOT, BACKUP_PATH)} (generated ${backup.generatedAt}, ${products.length} product(s))`);

  const results = [];
  for (const original of products) {
    const expectedImages = original.images.map((img) => ({ id: img.id, src: img.src }));

    if (DRY_RUN) {
      console.error(`[rollback] [dry-run] would restore product #${original.id} (${original.slug}) to gallery: ${expectedImages.map((i) => i.id).join(',')}`);
      results.push({ productId: original.id, slug: original.slug, status: 'dry-run' });
      continue;
    }

    try {
      await putProduct(original.id, { images: expectedImages });
      const verified = await getProduct(original.id);
      if (!imagesMatch(expectedImages, verified.images)) {
        console.error(`\n[rollback] STOPPED: verification failed restoring product #${original.id} (${original.slug})`);
        console.error(`[rollback] Expected gallery: ${JSON.stringify(expectedImages)}`);
        console.error(`[rollback] Actual gallery:   ${JSON.stringify((verified.images || []).map((i) => ({ id: i.id, src: i.src })))}`);
        console.error('[rollback] Halting immediately. Products restored above remain restored.');
        writeResults(results.concat([{ productId: original.id, slug: original.slug, status: 'FAILED_VERIFICATION' }]));
        process.exitCode = 1; return;
      }
      console.error(`[rollback] Product #${original.id} (${original.slug}) restored and verified.`);
      const revalidate = await revalidateProduct(original.slug);
      results.push({ productId: original.id, slug: original.slug, status: 'success', revalidate });
    } catch (e) {
      console.error(`\n[rollback] STOPPED: error restoring product #${original.id} (${original.slug}): ${e.message}`);
      writeResults(results.concat([{ productId: original.id, slug: original.slug, status: 'ERROR', error: e.message }]));
      process.exitCode = 1; return;
    }
  }

  writeResults(results);
  console.error(DRY_RUN ? '\n[rollback] Dry run complete. No production writes occurred.' : '\n[rollback] Rollback complete. All products restored and verified.');
  process.exitCode = 0; return;
}

function writeResults(results) {
  const dir = path.join(ROOT, 'catalog-cli/migration-results');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const resultPath = path.join(dir, `${DRY_RUN ? 'DRYRUN-' : ''}rollback-result-${timestampSlug()}.json`);
  fs.writeFileSync(resultPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    sourceBackup: path.relative(ROOT, BACKUP_PATH),
    results,
  }, null, 2));
  console.error(`[rollback] Result written: ${path.relative(ROOT, resultPath)}`);
}

main().catch((e) => {
  console.error('[rollback] Fatal error:', e.message);
  process.exitCode = 1; return;
});
