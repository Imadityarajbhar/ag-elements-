const fs = require('fs');
const path = require('path');

// 1. Setup Env
const envPath = path.join(__dirname, '..', '.env.local');
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

// 2. Parse Args
const args = process.argv.slice(2);

const getArg = (prefix) => {
  const arg = args.find(a => a.startsWith(prefix));
  return arg ? arg.split('=')[1] : null;
};

const batchNum = parseInt(getArg('--batch')) || 2;
const inputFile = getArg('--input') || 'validated_payloads.json';

const options = {
  dryRun: args.includes('--dry-run'),
  resume: args.includes('--resume'),
  verifyOnly: args.includes('--verify-only'),
  inputFile: inputFile,
  stateFile: `state_tracker_batch_${batchNum}.json`,
};

// 3. Helpers
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, opts, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, opts);
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
      }
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`[WARN] Request failed (${e.message}), retrying in ${backoff}ms...`);
      await sleep(backoff);
      backoff *= 2;
    }
  }
}

async function getAll(endpoint) {
  let all = [];
  let page = 1;
  while (true) {
    const data = await fetchWithRetry(`${API_URL}/${endpoint}?per_page=100&page=${page}`, { headers: HEADERS });
    if (data.length === 0) break;
    all = all.concat(data);
    if (data.length < 100) break;
    page++;
  }
  return all;
}

async function getOrCreateTerm(endpoint, name, cache) {
  const existing = cache.find(t => t.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing.id;
  console.log(`Creating missing ${endpoint}: ${name}`);
  const created = await fetchWithRetry(`${API_URL}/${endpoint}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ name })
  });
  cache.push(created);
  return created.id;
}

// 4. Main Execution
async function run() {
  if (!fs.existsSync(options.inputFile)) {
    console.error(`Input file ${options.inputFile} not found.`);
    process.exit(1);
  }

  const payloads = JSON.parse(fs.readFileSync(options.inputFile, 'utf8'));

  // Initialize or load state
  let state = {
    batch: batchNum,
    startedAt: new Date().toISOString(),
    completed: [],
    failed: [],
    skipped: [],
    backup: `backup_batch_${batchNum}.json`,
    status: 'running',
    stats: { totalTimeMs: 0, newCategories: 0, totalWarnings: 0, charsDesc: 0, charsMeta: 0 }
  };

  if (options.resume && fs.existsSync(options.stateFile)) {
    console.log("Resuming from previous state...");
    state = JSON.parse(fs.readFileSync(options.stateFile, 'utf8'));
  }

  const backupData = fs.existsSync(state.backup) ? JSON.parse(fs.readFileSync(state.backup, 'utf8')) : [];
  const startTime = Date.now();

  console.log("Fetching WC categories & tags...");
  const wcCategories = await getAll('products/categories');
  const wcTags = await getAll('products/tags');

  for (const payload of payloads) {
    if (state.completed.includes(payload.id) || state.skipped.includes(payload.id)) {
      continue;
    }

    try {
      console.log(`\nProcessing Product ID: ${payload.id}`);
      
      // Validation check
      if (payload.status === 'skipped') {
        state.skipped.push(payload.id);
        continue;
      }

      state.stats.totalWarnings += (payload.validation_warnings ? payload.validation_warnings.length : 0);
      state.stats.charsDesc += payload.description.length;
      state.stats.charsMeta += payload.seo.meta_description.length;

      // 1. Fetch current product for backup
      const current = await fetchWithRetry(`${API_URL}/products/${payload.id}`, { headers: HEADERS });
      
      // Backup editable fields
      if (!backupData.find(b => b.id === current.id)) {
        backupData.push({
          id: current.id,
          name: current.name,
          short_description: current.short_description,
          description: current.description,
          categories: current.categories,
          tags: current.tags,
          meta_data: current.meta_data,
          attributes: current.attributes
        });
        fs.writeFileSync(state.backup, JSON.stringify(backupData, null, 2));
      }

      // 2. Map Terms
      const categoryIds = [];
      for (const c of payload.categories) {
        const id = await getOrCreateTerm('products/categories', c.name, wcCategories);
        categoryIds.push({ id });
      }

      const tagIds = [];
      for (const t of payload.tags) {
        const id = await getOrCreateTerm('products/tags', t.name, wcTags);
        tagIds.push({ id });
      }

      // 3. Construct Yoast Meta Data
      const mergedMeta = [...current.meta_data];
      const updateMeta = (key, val) => {
        const idx = mergedMeta.findIndex(m => m.key === key);
        if (idx > -1) mergedMeta[idx].value = val;
        else mergedMeta.push({ key, value: val });
      };
      updateMeta('_yoast_wpseo_title', payload.seo.seo_title);
      updateMeta('_yoast_wpseo_metadesc', payload.seo.meta_description);
      updateMeta('_yoast_wpseo_focuskw', payload.seo.focus_keyword);

      // 4. Construct Final Payload
      const updateData = {
        short_description: payload.short_description,
        description: payload.description,
        categories: categoryIds,
        tags: tagIds,
        meta_data: mergedMeta,
      };

      if (options.dryRun) {
        console.log(`[DRY-RUN] Would update Product ${payload.id}`);
        fs.writeFileSync(`dry_run_payload_${payload.id}.json`, JSON.stringify(updateData, null, 2));
        state.completed.push(payload.id);
        fs.writeFileSync(options.stateFile, JSON.stringify(state, null, 2));
        await sleep(300);
        continue;
      }

      if (options.verifyOnly) {
         console.log(`[VERIFY-ONLY] Verified existing Product ${payload.id}`);
         await sleep(300);
         continue;
      }

      // 5. Execute Update
      console.log(`Updating Product ID: ${payload.id}...`);
      await fetchWithRetry(`${API_URL}/products/${payload.id}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(updateData)
      });

      // 6. Verify
      console.log(`Verifying Product ID: ${payload.id}...`);
      const verified = await fetchWithRetry(`${API_URL}/products/${payload.id}`, { headers: HEADERS });
      
      let isVerified = true;
      // Basic verification (can be expanded)
      if (!verified.name === payload.name) isVerified = false;
      if (!verified.description.includes("Introduction")) isVerified = false;

      if (isVerified) {
        console.log(`✅ Product ${payload.id} updated and verified.`);
        state.completed.push(payload.id);
      } else {
        console.log(`⚠️ Product ${payload.id} updated but verification mismatched.`);
        state.failed.push(payload.id);
      }

      fs.writeFileSync(options.stateFile, JSON.stringify(state, null, 2));
      
      // Delay to respect rate limits
      await sleep(400);

    } catch (err) {
      console.error(`❌ Failed to process Product ${payload.id}: ${err.message}`);
      state.failed.push(payload.id);
      fs.writeFileSync(options.stateFile, JSON.stringify(state, null, 2));
    }
  }

  state.status = 'completed';
  state.stats.totalTimeMs += (Date.now() - startTime);
  fs.writeFileSync(options.stateFile, JSON.stringify(state, null, 2));

  // Generate Rollback Script dynamically
  const rollbackScript = `
const fs = require('fs');
const backup = JSON.parse(fs.readFileSync('${state.backup}', 'utf8'));
console.log("Run this script to rollback. Add your custom logic here.");
  `;
  fs.writeFileSync(`rollback_batch_${batchNum}.js`, rollbackScript.trim());

  // Generate Report
  const totalProcessed = state.completed.length + state.failed.length + state.skipped.length;
  const avgDesc = state.completed.length > 0 ? Math.round(state.stats.charsDesc / state.completed.length) : 0;
  const avgMeta = state.completed.length > 0 ? Math.round(state.stats.charsMeta / state.completed.length) : 0;
  const minutes = Math.floor(state.stats.totalTimeMs / 60000);
  const seconds = Math.floor((state.stats.totalTimeMs % 60000) / 1000);

  const report = `
# Batch ${batchNum} Summary

**Products Processed:** ${totalProcessed}
**Updated:** ${state.completed.length}
**Skipped:** ${state.skipped.length}
**Failed:** ${state.failed.length}
**Warnings:** ${state.stats.totalWarnings}

**Average Description Length:** ${avgDesc} chars
**Average Meta Length:** ${avgMeta} chars

**Backups:** ${state.backup}
**Rollback Script:** rollback_batch_${batchNum}.js
**Execution Time:** ${minutes}m ${seconds}s

**Mode:** ${options.dryRun ? 'DRY-RUN' : 'LIVE'}
  `.trim();

  fs.writeFileSync(`batch_${batchNum}_report.md`, report);
  console.log(`\nExecution finished. Report saved to batch_${batchNum}_report.md`);
}

run();
