const fs = require('fs');
const path = require('path');

// 1. Setup Env
const envPath = path.join(__dirname, '..', '..', '.env.local');
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

async function getAllProducts() {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetchWithRetry(`${API_URL}/products?per_page=100&page=${page}&status=any&orderby=id&order=asc`, { headers: HEADERS });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all = all.concat(data);
    console.log(`  fetched page ${page} (${data.length} products, total ${all.length})`);
    if (data.length < 100) break;
    page++;
    await sleep(150);
  }
  return all;
}

async function getVariations(productId) {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetchWithRetry(`${API_URL}/products/${productId}/variations?per_page=100&page=${page}`, { headers: HEADERS });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 100) break;
    page++;
    await sleep(100);
  }
  return all;
}

async function getAllCategories() {
  let all = [];
  let page = 1;
  while (true) {
    const res = await fetchWithRetry(`${API_URL}/products/categories?per_page=100&page=${page}`, { headers: HEADERS });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 100) break;
    page++;
  }
  return all;
}

function isBlankSku(sku) {
  return sku === null || sku === undefined || sku === '' || (typeof sku === 'string' && sku.trim() === '');
}

function isWhitespaceOnlySku(sku) {
  return typeof sku === 'string' && sku !== '' && sku.trim() === '';
}

async function main() {
  console.log(`API: ${API_URL}\n`);
  console.log('Fetching all products (status=any, includes draft/private/trash-excluded by default WC "any")...');
  const products = await getAllProducts();
  console.log(`Total top-level products fetched: ${products.length}\n`);

  console.log('Fetching category taxonomy...');
  const categories = await getAllCategories();

  console.log('Fetching variations for variable products...');
  const variableProducts = products.filter(p => p.type === 'variable');
  const variationsByProduct = {};
  let totalVariations = 0;
  for (const vp of variableProducts) {
    const vars = await getVariations(vp.id);
    variationsByProduct[vp.id] = vars;
    totalVariations += vars.length;
    console.log(`  Product ${vp.id} (${vp.name}): ${vars.length} variations`);
  }
  console.log(`Total variations fetched: ${totalVariations}\n`);

  // Build a flat list of "sku entities" = simple products + each variation
  // (variable "parent" products in WooCommerce normally do NOT carry their own sellable SKU,
  // the variations do - but we still record parent SKU state for the audit)
  const entities = [];
  for (const p of products) {
    entities.push({
      kind: p.type === 'variable' ? 'variable-parent' : 'simple',
      id: p.id,
      parent_id: null,
      name: p.name,
      slug: p.slug,
      status: p.status,
      catalog_visibility: p.catalog_visibility,
      sku: p.sku,
      categories: (p.categories || []).map(c => c.name),
    });
    if (p.type === 'variable') {
      for (const v of (variationsByProduct[p.id] || [])) {
        entities.push({
          kind: 'variation',
          id: v.id,
          parent_id: p.id,
          name: `${p.name} - ${(v.attributes || []).map(a => a.option).join(', ')}`,
          slug: p.slug,
          status: v.status,
          catalog_visibility: null,
          sku: v.sku,
          categories: (p.categories || []).map(c => c.name),
        });
      }
    }
  }

  // ---- Audit metrics ----
  const totalProducts = products.length;
  const withSku = products.filter(p => !isBlankSku(p.sku)).length;
  const withoutSku = totalProducts - withSku;

  const hidden = products.filter(p => p.catalog_visibility === 'hidden').length;
  const draft = products.filter(p => p.status === 'draft').length;
  const privateStatus = products.filter(p => p.status === 'private').length;
  const publish = products.filter(p => p.status === 'publish').length;
  const pending = products.filter(p => p.status === 'pending').length;

  const skuBearingEntities = entities.filter(e => !isBlankSku(e.sku));
  const blankSkuEntities = entities.filter(e => isBlankSku(e.sku));
  const nullSkuEntities = entities.filter(e => e.sku === null || e.sku === undefined);
  const emptyStringSkuEntities = entities.filter(e => e.sku === '');
  const whitespaceSkuEntities = entities.filter(e => isWhitespaceOnlySku(e.sku));

  // Case-sensitive duplicates
  const exactMap = {};
  for (const e of skuBearingEntities) {
    exactMap[e.sku] = exactMap[e.sku] || [];
    exactMap[e.sku].push(e);
  }
  const exactDupes = Object.entries(exactMap).filter(([, v]) => v.length > 1);

  // Case-insensitive duplicates (that aren't already exact dupes of each other in same case)
  const ciMap = {};
  for (const e of skuBearingEntities) {
    const key = e.sku.trim().toLowerCase();
    ciMap[key] = ciMap[key] || [];
    ciMap[key].push(e);
  }
  const ciDupes = Object.entries(ciMap).filter(([, v]) => v.length > 1);

  const malformed = skuBearingEntities.filter(e => typeof e.sku === 'string' && e.sku !== e.sku.trim());

  console.log('\n================ PRE-MIGRATION AUDIT ================\n');
  console.log(`Total products (top-level):        ${totalProducts}`);
  console.log(`  publish:                          ${publish}`);
  console.log(`  draft:                             ${draft}`);
  console.log(`  private:                           ${privateStatus}`);
  console.log(`  pending:                           ${pending}`);
  console.log(`  catalog_visibility=hidden:          ${hidden}`);
  console.log(`Variable products:                  ${variableProducts.length}`);
  console.log(`Total variations:                    ${totalVariations}`);
  console.log(`Total SKU-bearing entities (products+variations): ${entities.length}`);
  console.log('');
  console.log(`Products WITH SKU (top-level):       ${withSku}`);
  console.log(`Products WITHOUT SKU (top-level):    ${withoutSku}`);
  console.log('');
  console.log(`Entities with SKU set:               ${skuBearingEntities.length}`);
  console.log(`Entities with blank/null/empty SKU:   ${blankSkuEntities.length}`);
  console.log(`  null SKU:                           ${nullSkuEntities.length}`);
  console.log(`  empty-string SKU:                   ${emptyStringSkuEntities.length}`);
  console.log(`  whitespace-only SKU:                ${whitespaceSkuEntities.length}`);
  console.log(`Entities with leading/trailing whitespace in SKU: ${malformed.length}`);
  console.log('');
  console.log(`Case-sensitive duplicate SKU groups:  ${exactDupes.length}`);
  for (const [sku, list] of exactDupes) {
    console.log(`  "${sku}" -> ${list.map(e => `${e.kind}#${e.id} (${e.name})`).join(' | ')}`);
  }
  console.log(`Case-insensitive duplicate SKU groups (incl. exact): ${ciDupes.length}`);
  for (const [sku, list] of ciDupes) {
    if (list.length > 1) {
      const variantForms = new Set(list.map(e => e.sku));
      if (variantForms.size > 1) {
        console.log(`  "${sku}" (mixed case) -> ${list.map(e => `${e.kind}#${e.id} sku="${e.sku}"`).join(' | ')}`);
      }
    }
  }

  // Category coverage check against known codes
  const CATEGORY_CODE_MAP = {
    'rings': 'RNG',
    'necklaces': 'NCK',
    'bracelets': 'BRC',
    "men's bracelet": 'MBR',
    'mens bracelet': 'MBR',
    "men's chain": 'MCH',
    'mens chain': 'MCH',
    'earrings': 'ERG',
    'mangalsutra': 'MNG',
    'anklets': 'ANK',
    'payal': 'PYL',
    'kada': 'KDA',
    'bangles': 'BNG',
  };

  console.log('\n================ CATEGORY TAXONOMY ================\n');
  console.log(`Total categories in store: ${categories.length}`);
  const catById = {};
  categories.forEach(c => { catById[c.id] = c; });
  categories.forEach(c => {
    const parentName = c.parent ? (catById[c.parent] ? catById[c.parent].name : c.parent) : '(root)';
    const norm = c.name.trim().toLowerCase();
    const mapped = CATEGORY_CODE_MAP[norm] || null;
    console.log(`  [${c.id}] ${c.name}  (parent: ${parentName}, count: ${c.count})${mapped ? `  => ${mapped}` : ''}`);
  });

  // Per-product ambiguity check: how many of a product's categories map to a known type code?
  const ambiguous = [];
  const unmapped = [];
  const productCategoryDecision = {};
  for (const p of products) {
    const cats = (p.categories || []).map(c => c.name);
    const matches = cats.filter(name => CATEGORY_CODE_MAP[name.trim().toLowerCase()]);
    if (matches.length === 0) {
      unmapped.push({ id: p.id, name: p.name, categories: cats });
      productCategoryDecision[p.id] = { code: 'OTH', matchedCategories: [] };
    } else if (matches.length > 1) {
      const uniqueCodes = new Set(matches.map(m => CATEGORY_CODE_MAP[m.trim().toLowerCase()]));
      if (uniqueCodes.size > 1) {
        ambiguous.push({ id: p.id, name: p.name, categories: cats, matches });
      }
      productCategoryDecision[p.id] = { code: CATEGORY_CODE_MAP[matches[0].trim().toLowerCase()], matchedCategories: matches };
    } else {
      productCategoryDecision[p.id] = { code: CATEGORY_CODE_MAP[matches[0].trim().toLowerCase()], matchedCategories: matches };
    }
  }

  console.log('\n================ CATEGORY CODE MAPPING CHECK ================\n');
  console.log(`Products with NO known type-category match (would fall to OTH): ${unmapped.length}`);
  unmapped.slice(0, 30).forEach(u => console.log(`  #${u.id} "${u.name}" -> categories: [${u.categories.join(', ')}]`));
  if (unmapped.length > 30) console.log(`  ... and ${unmapped.length - 30} more`);

  console.log(`\nProducts matching MULTIPLE DIFFERENT type-category codes (ambiguous primary category): ${ambiguous.length}`);
  ambiguous.slice(0, 30).forEach(a => console.log(`  #${a.id} "${a.name}" -> matched: [${a.matches.join(', ')}]`));
  if (ambiguous.length > 30) console.log(`  ... and ${ambiguous.length - 30} more`);

  // Persist full data for reuse by the migration script
  const outDir = __dirname;
  fs.writeFileSync(path.join(outDir, 'audit_products_raw.json'), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(outDir, 'audit_variations_raw.json'), JSON.stringify(variationsByProduct, null, 2));
  fs.writeFileSync(path.join(outDir, 'audit_categories_raw.json'), JSON.stringify(categories, null, 2));
  fs.writeFileSync(path.join(outDir, 'audit_entities.json'), JSON.stringify(entities, null, 2));
  fs.writeFileSync(path.join(outDir, 'audit_category_decisions.json'), JSON.stringify(productCategoryDecision, null, 2));

  const summary = {
    generatedAt: new Date().toISOString(),
    totalProducts,
    publish, draft, privateStatus, pending, hidden,
    variableProducts: variableProducts.length,
    totalVariations,
    totalEntities: entities.length,
    withSku, withoutSku,
    entitiesWithSku: skuBearingEntities.length,
    entitiesBlankSku: blankSkuEntities.length,
    nullSku: nullSkuEntities.length,
    emptyStringSku: emptyStringSkuEntities.length,
    whitespaceOnlySku: whitespaceSkuEntities.length,
    malformedWhitespace: malformed.length,
    exactDuplicateGroups: exactDupes.length,
    exactDuplicates: exactDupes.map(([sku, list]) => ({ sku, entities: list.map(e => ({ kind: e.kind, id: e.id, name: e.name })) })),
    caseInsensitiveDuplicateGroups: ciDupes.filter(([, v]) => v.length > 1).length,
    unmappedCategoryCount: unmapped.length,
    ambiguousCategoryCount: ambiguous.length,
    ambiguousProducts: ambiguous,
    unmappedProducts: unmapped,
  };
  fs.writeFileSync(path.join(outDir, 'audit_summary.json'), JSON.stringify(summary, null, 2));

  console.log('\n================ FILES WRITTEN ================');
  console.log(path.join(outDir, 'audit_products_raw.json'));
  console.log(path.join(outDir, 'audit_variations_raw.json'));
  console.log(path.join(outDir, 'audit_categories_raw.json'));
  console.log(path.join(outDir, 'audit_entities.json'));
  console.log(path.join(outDir, 'audit_category_decisions.json'));
  console.log(path.join(outDir, 'audit_summary.json'));

  if (exactDupes.length > 0) {
    console.log('\n*** ABORT CONDITION MET: duplicate SKUs already exist in the catalog. ***');
    console.log('*** Per migration rules, SKU generation must not proceed until duplicates are resolved/reviewed. ***');
  } else {
    console.log('\nNo pre-existing duplicate SKUs detected. Safe to proceed to category-mapping confirmation.');
  }
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
