const fs = require('fs');
const path = require('path');

const dir = __dirname;
const products = JSON.parse(fs.readFileSync(path.join(dir, 'audit_products_raw.json'), 'utf8'));

// Confirmed category -> code mapping (store category name, case-insensitive, trimmed)
const CATEGORY_CODE_MAP = {
  'rings': 'RNG',
  "men's ring": 'RNG',
  'necklaces': 'NCK',
  "men's necklace": 'NCK', // user-confirmed: fold into general Necklaces sequence
  'bracelets': 'BRC',
  "men's bracelet": 'MBR',
  'earrings': 'ERG',
  'mangalsutra': 'MNG',
  'anklets': 'ANK',
  'payal': 'PYL',
  'kada': 'KDA',
  'bangles': 'BNG',
};

// Priority order used only if a product's categories map to more than one DIFFERENT code
const CODE_PRIORITY = ['RNG', 'NCK', 'BRC', 'MBR', 'MCH', 'ERG', 'MNG', 'ANK', 'PYL', 'KDA', 'BNG'];

function isBlankSku(sku) {
  return sku === null || sku === undefined || sku === '' || (typeof sku === 'string' && sku.trim() === '');
}

const decisions = [];
const ambiguous = [];

for (const p of products) {
  const cats = (p.categories || []).map(c => c.name);
  const matchedCodes = [...new Set(cats
    .map(name => CATEGORY_CODE_MAP[name.trim().toLowerCase()])
    .filter(Boolean))];

  let code;
  if (matchedCodes.length === 0) {
    code = 'OTH';
  } else if (matchedCodes.length === 1) {
    code = matchedCodes[0];
  } else {
    // genuinely ambiguous - pick by priority but flag it
    code = matchedCodes.sort((a, b) => CODE_PRIORITY.indexOf(a) - CODE_PRIORITY.indexOf(b))[0];
    ambiguous.push({ id: p.id, name: p.name, categories: cats, matchedCodes });
  }

  decisions.push({
    id: p.id,
    name: p.name,
    slug: p.slug,
    status: p.status,
    existingSku: p.sku,
    categories: cats,
    code,
  });
}

if (ambiguous.length > 0) {
  console.log('WARNING: genuinely ambiguous products (multiple different codes matched):');
  ambiguous.forEach(a => console.log(`  #${a.id} "${a.name}" -> [${a.matchedCodes.join(', ')}], picked ${a.matchedCodes[0]}`));
}

// Sort within each code group by product ID ascending (stable, deterministic, safe to extend later)
const byCode = {};
for (const d of decisions) {
  byCode[d.code] = byCode[d.code] || [];
  byCode[d.code].push(d);
}
for (const code of Object.keys(byCode)) {
  byCode[code].sort((a, b) => a.id - b.id);
}

const candidates = [];
for (const code of Object.keys(byCode).sort()) {
  byCode[code].forEach((d, idx) => {
    const seq = String(idx + 1).padStart(4, '0');
    const sku = `AGE-${code}-${seq}`;
    candidates.push({
      id: d.id,
      name: d.name,
      slug: d.slug,
      status: d.status,
      existingSku: d.existingSku,
      needsSku: isBlankSku(d.existingSku),
      categories: d.categories,
      code,
      sequence: idx + 1,
      candidateSku: sku,
    });
  });
}

fs.writeFileSync(path.join(dir, 'candidate_skus.json'), JSON.stringify(candidates, null, 2));

// Collision check within candidates themselves
const skuCount = {};
candidates.forEach(c => { skuCount[c.candidateSku] = (skuCount[c.candidateSku] || 0) + 1; });
const selfCollisions = Object.entries(skuCount).filter(([, n]) => n > 1);

console.log(`\nGenerated ${candidates.length} candidate SKUs.`);
console.log(`Self-collisions within candidate set: ${selfCollisions.length}`);

console.log('\n=== Category breakdown ===');
for (const code of Object.keys(byCode).sort()) {
  console.log(`  ${code}: ${byCode[code].length} products -> AGE-${code}-0001 .. AGE-${code}-${String(byCode[code].length).padStart(4, '0')}`);
}

console.log('\n=== Full candidate list ===');
candidates.forEach(c => {
  console.log(`  #${c.id}\t${c.candidateSku}\t${c.name}\t[${c.categories.join(', ')}]\t(status: ${c.status})`);
});

console.log(`\nWritten: ${path.join(dir, 'candidate_skus.json')}`);
