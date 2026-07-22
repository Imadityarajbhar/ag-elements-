const fs = require('fs');
const payloads = JSON.parse(fs.readFileSync('validated_payloads.json', 'utf8'));

const categoryCount = {};

// Duplicate check
const duplicates = [];

for (const p of payloads) {
  const catNames = p.categories.map(c => c.name);
  
  for (const cat of catNames) {
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  }
  
  // Duplicate logic
  const isWomens = catNames.some(c => c === 'Rings' || c === 'Earrings' || c === 'Necklaces' || c === 'Pendants' || c === 'Bracelets' || c === 'Bangles' || c === 'Anklets');
  const isMens = catNames.some(c => c.startsWith("Men's"));
  const isKids = catNames.includes("Kids Jewellery");
  
  if ((isWomens && isMens) || (isWomens && isKids) || (isMens && isKids)) {
    duplicates.push(`Product ${p.id} (${p.name}): Incompatible categories: ${catNames.join(', ')}`);
  }
}

console.log("=== Category Coverage Report ===");
for (const [cat, count] of Object.entries(categoryCount).sort((a,b) => b[1] - a[1])) {
  console.log(`${cat.padEnd(20)} | ${count}`);
}

console.log("\n=== Incompatible Categories Check ===");
if (duplicates.length > 0) {
  duplicates.forEach(d => console.log(d));
} else {
  console.log("No incompatible category combinations found.");
}
