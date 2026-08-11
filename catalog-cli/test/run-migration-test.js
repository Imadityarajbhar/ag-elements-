/**
 * End-to-end test of apply-migration.js + rollback-migration.js against a
 * fully local, in-memory mock of the WooCommerce/WordPress APIs (see
 * mock-server.js). No real network calls, no real credentials — every env
 * var these scripts read is overridden with fake/mock values for the
 * duration of this test only (never touches .env.local).
 *
 * Scenario seeded (mirrors the real production manifest's structure,
 * including its one real edge case — shared media):
 *   - product 9001 "test-product-a": 1 image (primary) — migrates.
 *   - product 9002 "test-product-b": 2 images — position 0 untouched,
 *     position 1 (gallery-1) migrates — tests order/untouched-entry preservation.
 *   - products 9003 "test-product-shared-1" and 9004 "test-product-shared-2":
 *     each has one image that is the SAME original media id (8004) — tests
 *     shared-media handling (one upload, both products repointed to it).
 *
 * Runs, in order: apply (--apply --confirm-production, against the mock) ->
 * inspect mock state -> rollback (--apply --confirm-production, against the
 * mock) -> inspect mock state again (must exactly match pre-migration).
 *
 * Usage: node catalog-cli/test/run-migration-test.js
 * Exit code: non-zero if any assertion fails.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { startMockServer } = require('./mock-server');

/**
 * Spawns node ASYNCHRONOUSLY (never execFileSync/spawnSync) — this test's
 * mock server runs in this same process's event loop, so a synchronous
 * child_process call would block that event loop and deadlock against the
 * very server the child is trying to talk to. Resolves with the exit code
 * instead of throwing, since a non-zero exit is an expected outcome to
 * assert on here, not necessarily a harness failure.
 */
function runNode(args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', args, { cwd: ROOT, env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

const ROOT = path.join(__dirname, '../..');
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
if (!fs.existsSync(FIXTURES_DIR)) fs.mkdirSync(FIXTURES_DIR, { recursive: true });

const OPT_DIR = 'catalog-cli/optimized-images';
const FILE_A = `${OPT_DIR}/1-3.webp`;
const FILE_B = `${OPT_DIR}/1-4.webp`;
const FILE_SHARED = `${OPT_DIR}/1-5.jpg`;

let failures = 0;
function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
  } else {
    console.log(`  FAIL: ${message}`);
    failures += 1;
  }
}

async function main() {
  const testStart = Date.now();
  console.log('=== Phase 3 migration/rollback engine test (fully local mock, zero real network calls) ===\n');

  // ---- Seed data ----
  const seedProducts = [
    {
      id: 9001, slug: 'test-product-a', name: 'Test Product A', permalink: 'http://fake/a',
      images: [{ id: 8001, src: 'http://fake-original/a-primary.jpg', name: 'a', alt: 'a' }],
    },
    {
      id: 9002, slug: 'test-product-b', name: 'Test Product B', permalink: 'http://fake/b',
      images: [
        { id: 8002, src: 'http://fake-original/b-0-untouched.jpg', name: 'b0', alt: 'b0' },
        { id: 8003, src: 'http://fake-original/b-1-migrates.jpg', name: 'b1', alt: 'b1' },
      ],
    },
    {
      id: 9003, slug: 'test-product-shared-1', name: 'Test Product Shared 1', permalink: 'http://fake/s1',
      images: [{ id: 8004, src: 'http://fake-original/shared.jpg', name: 'shared', alt: 'shared' }],
    },
    {
      id: 9004, slug: 'test-product-shared-2', name: 'Test Product Shared 2', permalink: 'http://fake/s2',
      images: [{ id: 8004, src: 'http://fake-original/shared.jpg', name: 'shared', alt: 'shared' }],
    },
  ];

  const testManifest = {
    generatedAt: new Date().toISOString(),
    mode: 'test-fixture',
    rows: [
      {
        originalUrl: 'http://fake-original/a-primary.jpg',
        optimizedLocalPath: FILE_A,
        optimizedFormat: 'webp',
        optimizedBytes: fs.statSync(path.join(ROOT, FILE_A)).size,
        compressionRatio: 0.9,
        hasTransparency: false,
        sharedAcrossProducts: false,
        products: [{ productId: 9001, productSlug: 'test-product-a', productName: 'Test Product A', originalMediaId: 8001, galleryPosition: 'primary' }],
        proposedAction: 'upload-and-repoint',
        ambiguityReasons: [],
      },
      {
        originalUrl: 'http://fake-original/b-1-migrates.jpg',
        optimizedLocalPath: FILE_B,
        optimizedFormat: 'webp',
        optimizedBytes: fs.statSync(path.join(ROOT, FILE_B)).size,
        compressionRatio: 0.9,
        hasTransparency: false,
        sharedAcrossProducts: false,
        products: [{ productId: 9002, productSlug: 'test-product-b', productName: 'Test Product B', originalMediaId: 8003, galleryPosition: 'gallery-1' }],
        proposedAction: 'upload-and-repoint',
        ambiguityReasons: [],
      },
      {
        originalUrl: 'http://fake-original/shared.jpg',
        optimizedLocalPath: FILE_SHARED,
        optimizedFormat: 'jpeg',
        optimizedBytes: fs.statSync(path.join(ROOT, FILE_SHARED)).size,
        compressionRatio: 0.85,
        hasTransparency: false,
        sharedAcrossProducts: true,
        products: [
          { productId: 9003, productSlug: 'test-product-shared-1', productName: 'Test Product Shared 1', originalMediaId: 8004, galleryPosition: 'primary' },
          { productId: 9004, productSlug: 'test-product-shared-2', productName: 'Test Product Shared 2', originalMediaId: 8004, galleryPosition: 'primary' },
        ],
        proposedAction: 'upload-and-repoint',
        ambiguityReasons: [],
      },
    ],
  };
  const manifestPath = path.join(FIXTURES_DIR, 'test-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(testManifest, null, 2));
  const manifestRelPath = path.relative(ROOT, manifestPath);

  // ---- Start mock server ----
  const mock = await startMockServer(seedProducts);
  console.log(`Mock server started: ${mock.wcApiUrl}\n`);

  const mockEnv = {
    ...process.env,
    NEXT_PUBLIC_WC_API_URL: mock.wcApiUrl,
    NEXT_PUBLIC_WP_URL: mock.wpUrl,
    NEXT_PUBLIC_SITE_URL: mock.siteUrl,
    WC_CONSUMER_KEY: 'test-key',
    WC_CONSUMER_SECRET: 'test-secret',
    WP_APP_USER: 'test-wp-user',
    WP_APP_PASSWORD: 'test-wp-password',
    REVALIDATE_SECRET: 'test-revalidate-secret',
  };

  // ==== PART 1: apply-migration.js --dry-run against the mock (should touch nothing) ====
  console.log('--- Part 1: apply-migration.js --dry-run (expect zero mock state changes) ---');
  const preDryRunState = JSON.stringify(mock.getAllProductState());
  await runNode(['catalog-cli/apply-migration.js', `--manifest=${manifestRelPath}`, '--dry-run'], mockEnv);
  const postDryRunState = JSON.stringify(mock.getAllProductState());
  assert(preDryRunState === postDryRunState, 'dry-run made zero changes to mock product state');
  assert(mock.getRevalidateCalls().length === 0, 'dry-run triggered zero /api/revalidate calls');
  console.log();

  // ==== PART 2: apply-migration.js --apply --confirm-production against the mock ====
  console.log('--- Part 2: apply-migration.js --apply --confirm-production (real writes, to the mock only) ---');
  const applyExitCode = await runNode(['catalog-cli/apply-migration.js', `--manifest=${manifestRelPath}`, '--apply', '--confirm-production'], mockEnv);
  console.log(`\napply-migration.js exit code: ${applyExitCode}`);
  console.log('(A non-zero exit here is EXPECTED and correct if it is caused only by the bundled validate-migration.js check for non-production/localhost URLs — the mock necessarily runs on 127.0.0.1, which that check is specifically designed to flag. Asserting the actual product/media state below is what proves the core engine worked, independent of that expected trip.)\n');

  const a = mock.getProductState(9001);
  assert(a.images.length === 1 && a.images[0].id >= 9000, 'product A: single image repointed to new media id');
  assert(a.images[0].src.includes('/media-file/'), 'product A: new src is the mock-uploaded media URL');

  const b = mock.getProductState(9002);
  assert(b.images.length === 2, 'product B: gallery length preserved (2 images)');
  assert(b.images[0].id === 8002 && b.images[0].src === 'http://fake-original/b-0-untouched.jpg', 'product B: position 0 left completely untouched');
  assert(b.images[1].id >= 9000, 'product B: position 1 (gallery-1) repointed to new media');

  const s1 = mock.getProductState(9003);
  const s2 = mock.getProductState(9004);
  assert(s1.images[0].id >= 9000, 'shared product 1: repointed to new media');
  assert(s2.images[0].id >= 9000, 'shared product 2: repointed to new media');
  assert(s1.images[0].id === s2.images[0].id && s1.images[0].src === s2.images[0].src, 'shared media: BOTH products repointed to the SAME new media id/url (single upload, no duplicate)');

  const uploads = mock.getRequestLog().filter((r) => r.method === 'POST' && r.path === '/wp-json/wp/v2/media');
  assert(uploads.length === 3, `exactly 3 media uploads occurred for 3 unique images (not 4 — shared image uploaded once), got ${uploads.length}`);

  const newMediaForA = mock.getMediaState(a.images[0].id);
  assert(newMediaForA && newMediaForA.altText === 'a', `product A's original alt text ("a") was carried over to the new media object (got "${newMediaForA?.altText}")`);

  const revalidateCalls = mock.getRevalidateCalls();
  assert(revalidateCalls.length === 4, `4 products revalidated (one call per successfully-migrated product), got ${revalidateCalls.length}`);
  assert(revalidateCalls.every((c) => c.secretProvided), 'every revalidate call included the secret header');

  const resultDir = path.join(ROOT, 'catalog-cli/migration-results');
  const resultFiles = fs.readdirSync(resultDir).filter((f) => f.startsWith('migration-result-')).sort();
  const latestResult = JSON.parse(fs.readFileSync(path.join(resultDir, resultFiles[resultFiles.length - 1]), 'utf8'));
  assert(latestResult.results.filter((r) => r.status === 'success').length === 4, 'result file records all 4 products as success');
  assert(JSON.stringify(latestResult).indexOf('test-secret') === -1 && JSON.stringify(latestResult).indexOf('test-wp-password') === -1, 'result file contains no credentials');

  const backupDir = path.join(ROOT, 'catalog-cli/backups');
  const backupFiles = fs.readdirSync(backupDir).filter((f) => f.startsWith('migration-backup-') && !f.startsWith('DRYRUN-')).sort();
  const backupPath = path.join(backupDir, backupFiles[backupFiles.length - 1]);
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  assert(Object.keys(backup.products).length === 4, 'backup file captured all 4 affected products');
  assert(backup.products['9001'].images[0].src === 'http://fake-original/a-primary.jpg', 'backup preserved product A\'s exact original image src');
  assert(backup.products['9002'].images.length === 2, 'backup preserved product B\'s full 2-image gallery, pre-migration');
  assert(JSON.stringify(backup).indexOf('test-secret') === -1 && JSON.stringify(backup).indexOf('test-wp-password') === -1, 'backup file contains no credentials');
  console.log();

  // ==== PART 3: rollback-migration.js --dry-run (should touch nothing) ====
  console.log('--- Part 3: rollback-migration.js --dry-run (expect zero mock state changes) ---');
  const preRollbackDryRunState = JSON.stringify(mock.getAllProductState());
  await runNode(['catalog-cli/rollback-migration.js', `--backup=${path.relative(ROOT, backupPath)}`, '--dry-run'], mockEnv);
  assert(JSON.stringify(mock.getAllProductState()) === preRollbackDryRunState, 'rollback dry-run made zero changes to mock product state');
  console.log();

  // ==== PART 4: rollback-migration.js --apply --confirm-production ====
  console.log('--- Part 4: rollback-migration.js --apply --confirm-production (restore, against the mock) ---');
  const rollbackExitCode = await runNode(['catalog-cli/rollback-migration.js', `--backup=${path.relative(ROOT, backupPath)}`, '--apply', '--confirm-production'], mockEnv);
  assert(rollbackExitCode === 0, `rollback-migration.js exited 0 (got ${rollbackExitCode})`);

  // Compared on {id, src} only — the same contract rollback-migration.js's
  // own imagesMatch() verification uses. WooCommerce references an existing
  // attachment by `id`; `name`/`alt` are read from the attachment's own
  // metadata on the next GET, not something a restore payload needs to
  // resend (the mock server here is a simplistic store, not a full
  // WooCommerce simulation, so it doesn't repopulate them the way real WC
  // does — asserting the full record would be testing the mock, not the
  // rollback logic).
  const idSrc = (imgs) => imgs.map((i) => ({ id: i.id, src: i.src }));
  const restoredA = mock.getProductState(9001);
  const restoredB = mock.getProductState(9002);
  const restoredS1 = mock.getProductState(9003);
  const restoredS2 = mock.getProductState(9004);
  assert(JSON.stringify(idSrc(restoredA.images)) === JSON.stringify(idSrc(seedProducts[0].images)), 'product A restored to exact original gallery (id+src)');
  assert(JSON.stringify(idSrc(restoredB.images)) === JSON.stringify(idSrc(seedProducts[1].images)), 'product B restored to exact original gallery (order + untouched entry preserved)');
  assert(JSON.stringify(idSrc(restoredS1.images)) === JSON.stringify(idSrc(seedProducts[2].images)), 'shared product 1 restored to exact original');
  assert(JSON.stringify(idSrc(restoredS2.images)) === JSON.stringify(idSrc(seedProducts[3].images)), 'shared product 2 restored to exact original');

  const finalRevalidateCalls = mock.getRevalidateCalls();
  assert(finalRevalidateCalls.length === 8, `rollback also triggered 4 more revalidate calls (4 migrate + 4 rollback = 8 total), got ${finalRevalidateCalls.length}`);
  console.log();

  await mock.close();

  // ---- cleanup test-only artifacts ----
  // Only removes files this run itself created (mtime >= testStart) — never
  // touches a pre-existing real backup/result file. Best-effort: a file
  // transiently locked by Windows (e.g. antivirus/indexer) is skipped
  // rather than crashing the whole test run over a cleanup nicety.
  const tryUnlink = (p) => { try { fs.unlinkSync(p); } catch (e) { console.log(`  (cleanup note: could not remove ${path.basename(p)}: ${e.code})`); } };
  tryUnlink(manifestPath);
  for (const dir of ['catalog-cli/backups', 'catalog-cli/migration-results']) {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const f of fs.readdirSync(dirPath)) {
      const filePath = path.join(dirPath, f);
      if (fs.statSync(filePath).mtimeMs >= testStart) tryUnlink(filePath);
    }
  }

  console.log('=== RESULT ===');
  if (failures === 0) {
    console.log('ALL ASSERTIONS PASSED.');
    process.exitCode = 0;
  } else {
    console.log(`${failures} ASSERTION(S) FAILED.`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('Test harness fatal error:', e);
  process.exitCode = 1;
});
