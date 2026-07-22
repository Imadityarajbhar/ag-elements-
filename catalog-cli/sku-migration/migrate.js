const fs = require('fs');
const path = require('path');

const dir = __dirname;

// 1. Setup Env
const envPath = path.join(dir, '..', '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length > 0) process.env[key.trim()] = val.join('=').trim();
  });
}

const API_URL = process.env.NEXT_PUBLIC_WC_API_URL;
const AUTH = Buffer.from(process.env.WC_CONSUMER_KEY + ':' + process.env.WC_CONSUMER_SECRET).toString('base64');
const HEADERS = { 'Authorization': 'Basic ' + AUTH, 'Content-Type': 'application/json' };

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, opts = {}, retries = 4, backoff = 800) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, opts);
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
      }
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`[WARN] ${url} failed (${e.message}), retrying in ${backoff}ms...`);
      await sleep(backoff);
      backoff *= 2;
    }
  }
}

function isBlankSku(sku) {
  return sku === null || sku === undefined || sku === '' || (typeof sku === 'string' && sku.trim() === '');
}

async function getAllProductsLive() {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetchWithRetry(`${API_URL}/products?per_page=100&page=${page}&status=any&orderby=id&order=asc`, { headers: HEADERS });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 100) break;
    page++;
    await sleep(150);
  }
  return all;
}

function nextSequenceFor(code, usedSkus) {
  let n = 1;
  while (usedSkus.has(`AGE-${code}-${String(n).padStart(4, '0')}`)) n++;
  return `AGE-${code}-${String(n).padStart(4, '0')}`;
}

async function main() {
  const candidates = JSON.parse(fs.readFileSync(path.join(dir, 'candidate_skus.json'), 'utf8'));

  console.log('Re-fetching live catalog state immediately before writing (idempotency + collision safety)...');
  const liveProducts = await getAllProductsLive();
  const liveById = {};
  liveProducts.forEach(p => { liveById[p.id] = p; });

  const usedSkus = new Set(
    liveProducts.filter(p => !isBlankSku(p.sku)).map(p => p.sku.trim())
  );

  const rollback = [];
  const results = {
    startedAt: new Date().toISOString(),
    processed: 0,
    updated: 0,
    skippedAlreadyHadSku: 0,
    skippedProductMissing: 0,
    collisions: 0,
    retries: 0,
    failures: [],
    updatedList: [],
  };

  const rollbackPath = path.join(dir, `rollback_map_${Date.now()}.json`);
  const resultsPath = path.join(dir, 'migration_results.json');

  for (const cand of candidates) {
    results.processed++;
    const live = liveById[cand.id];

    if (!live) {
      console.warn(`  [SKIP] Product #${cand.id} (${cand.name}) no longer exists live.`);
      results.skippedProductMissing++;
      continue;
    }

    if (!isBlankSku(live.sku)) {
      console.log(`  [SKIP] Product #${cand.id} already has SKU "${live.sku}" - leaving unchanged.`);
      results.skippedAlreadyHadSku++;
      continue;
    }

    // Resolve collision against live catalog + already-assigned-this-run set
    let finalSku = cand.candidateSku;
    let retryCount = 0;
    while (usedSkus.has(finalSku)) {
      results.collisions++;
      retryCount++;
      results.retries++;
      console.warn(`  [COLLISION] ${finalSku} already taken, generating next sequence for ${cand.code}...`);
      finalSku = nextSequenceFor(cand.code, usedSkus);
    }
    usedSkus.add(finalSku); // reserve immediately to avoid collisions within this run

    // Rollback record BEFORE writing
    rollback.push({
      product_id: cand.id,
      name: cand.name,
      old_sku: live.sku,
      new_sku: finalSku,
      timestamp: new Date().toISOString(),
    });
    fs.writeFileSync(rollbackPath, JSON.stringify(rollback, null, 2));

    try {
      console.log(`  Writing SKU ${finalSku} -> Product #${cand.id} (${cand.name})...`);
      await fetchWithRetry(`${API_URL}/products/${cand.id}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify({ sku: finalSku }),
      });

      // Immediate re-read to confirm persistence
      const verifyRes = await fetchWithRetry(`${API_URL}/products/${cand.id}`, { headers: HEADERS });
      const verified = await verifyRes.json();

      if (verified.sku === finalSku) {
        console.log(`    OK verified.`);
        results.updated++;
        results.updatedList.push({ id: cand.id, name: cand.name, sku: finalSku });
      } else {
        console.error(`    MISMATCH: wrote "${finalSku}" but re-read "${verified.sku}"`);
        results.failures.push({ id: cand.id, name: cand.name, attemptedSku: finalSku, reason: `verification mismatch, got "${verified.sku}"` });
      }
    } catch (err) {
      console.error(`    FAILED: ${err.message}`);
      results.failures.push({ id: cand.id, name: cand.name, attemptedSku: finalSku, reason: err.message });
    }

    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    await sleep(350);
  }

  results.finishedAt = new Date().toISOString();
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  console.log('\n================ MIGRATION SUMMARY ================');
  console.log(`Processed:              ${results.processed}`);
  console.log(`Updated (new SKU):      ${results.updated}`);
  console.log(`Skipped (already had):  ${results.skippedAlreadyHadSku}`);
  console.log(`Skipped (missing):      ${results.skippedProductMissing}`);
  console.log(`Collisions resolved:    ${results.collisions}`);
  console.log(`Retries:                ${results.retries}`);
  console.log(`Failures:               ${results.failures.length}`);
  if (results.failures.length) {
    results.failures.forEach(f => console.log(`  FAILED #${f.id} ${f.name}: ${f.reason}`));
  }
  console.log(`\nRollback map: ${rollbackPath}`);
  console.log(`Results file: ${resultsPath}`);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
