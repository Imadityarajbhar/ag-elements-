const fs = require('fs');

const inputFile = process.argv[2] || 'batch_2_payloads.json';
const outputFile = process.argv[3] || 'validated_payloads.json';

if (!fs.existsSync(inputFile)) {
  console.error(`Input file ${inputFile} not found.`);
  process.exit(1);
}

const payloads = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const validated = [];
const skipped = [];
const seoTitles = new Set();
const seoMetas = new Set();

for (const p of payloads) {
  let warnings = [];
  
  // 1. Required fields
  if (!p.name || p.name.trim() === '') warnings.push("Missing name");
  if (!p.description || p.description.trim() === '') warnings.push("Missing description");
  if (!p.short_description || p.short_description.trim() === '') warnings.push("Missing short_description");
  
  // 2. Categories
  if (!p.categories || p.categories.length === 0) warnings.push("Missing categories");
  
  // 3. HTML validation (basic)
  if (p.description && (p.description.split('<h3>').length !== p.description.split('</h3>').length)) {
    warnings.push("Unmatched HTML tags in description");
  }

  // 4. Meta length & SEO
  if (p.seo) {
    if (p.seo.meta_description && p.seo.meta_description.length > 160) {
      warnings.push(`Meta description too long (${p.seo.meta_description.length} chars)`);
    }
    if (seoTitles.has(p.seo.seo_title)) {
      warnings.push(`Duplicate SEO title detected: ${p.seo.seo_title}`);
    }
    if (seoMetas.has(p.seo.meta_description)) {
      warnings.push("Duplicate meta description detected");
    }
    seoTitles.add(p.seo.seo_title);
    seoMetas.add(p.seo.meta_description);
  }

  // 5. Tags deduplication
  if (p.tags) {
    const uniqueTags = [...new Set(p.tags.map(t => t.name.toLowerCase()))];
    if (uniqueTags.length !== p.tags.length) {
      warnings.push("Duplicate tags detected and auto-fixed");
      p.tags = [...new Set(p.tags.map(t => t.name))].map(t => ({name: t}));
    }
  }

  p.validation_warnings = warnings;

  if (warnings.length > 0 && warnings.some(w => w.includes('Missing'))) {
    console.log(`Skipping Product ID ${p.id} due to critical warnings: ${warnings.join(', ')}`);
    p.status = 'skipped';
    skipped.push(p);
  } else {
    p.status = 'validated';
    validated.push(p);
  }
}

fs.writeFileSync(outputFile, JSON.stringify(validated, null, 2));

console.log(`\nValidation Complete.`);
console.log(`Validated: ${validated.length}`);
console.log(`Skipped: ${skipped.length}`);
if (validated.length > 0) {
  let totalWarnings = validated.reduce((acc, p) => acc + p.validation_warnings.length, 0);
  console.log(`Total non-critical warnings: ${totalWarnings}`);
}
console.log(`Saved validated payloads to ${outputFile}`);
