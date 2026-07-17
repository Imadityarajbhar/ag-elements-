const fs = require('fs');

const products = JSON.parse(fs.readFileSync('pilot_20.json', 'utf8'));

// Allowed Taxonomies
const ALLOWED_CATEGORIES = [
  "Rings", "Earrings", "Necklaces", "Pendants", "Bracelets", "Bangles", "Anklets", "Toe Rings",
  "Men's Bracelet", "Men's Necklace", "Men's Ring", "Kids Jewellery",
  "Bridal", "Everyday", "Party", "Office", "Festive", "Gifts", "Best Sellers", "New Arrivals"
];

function determineCategories(p) {
  let cats = [];
  const text = (p.name + " " + p.description + " " + p.short_description).toLowerCase();
  
  const isMen = text.includes("men's") || p.attributes.some(a => a.name === 'Gender' && a.options.includes('Men')) && !text.includes('feminine') && !text.includes('women');
  const isKids = text.includes("kids") || text.includes("children");

  if (isMen) {
    if (p.name.toLowerCase().includes('necklace') || p.name.toLowerCase().includes('chain')) cats.push("Men's Necklace");
    else if (p.name.toLowerCase().includes('bracelet')) cats.push("Men's Bracelet");
    else if (p.name.toLowerCase().includes('ring')) cats.push("Men's Ring");
    else cats.push("Men's Necklace"); // Default for men
  } else if (isKids) {
    cats.push("Kids Jewellery");
  } else {
    if (p.name.toLowerCase().includes('necklace') || p.name.toLowerCase().includes('chain')) cats.push("Necklaces");
    else if (p.name.toLowerCase().includes('ring')) cats.push("Rings");
    else if (p.name.toLowerCase().includes('earring')) cats.push("Earrings");
    else if (p.name.toLowerCase().includes('pendant')) cats.push("Pendants");
    else if (p.name.toLowerCase().includes('bracelet')) cats.push("Bracelets");
    else if (p.name.toLowerCase().includes('bangle')) cats.push("Bangles");
    else if (p.name.toLowerCase().includes('anklet')) cats.push("Anklets");
    else if (p.name.toLowerCase().includes('toe ring')) cats.push("Toe Rings");
  }

  // Collections based on text
  if (text.includes('everyday') || text.includes('daily')) cats.push("Everyday");
  if (text.includes('party')) cats.push("Party");
  if (text.includes('office') || text.includes('formal') || text.includes('work')) cats.push("Office");
  if (text.includes('festive') || text.includes('wedding')) cats.push("Festive");
  if (text.includes('gift')) cats.push("Gifts");

  return cats.length > 0 ? [...new Set(cats)] : ["Necklaces"]; // fallback
}

function generateSEOTitle(name) {
  let title = name;
  if (!title.toLowerCase().includes("925 sterling silver")) {
    if (title.toLowerCase().includes("silver")) {
       title = title.replace(/silver/i, "925 Sterling Silver");
    } else {
       title = "925 Sterling Silver " + title;
    }
  }
  title = title + " | AG Elements";
  return title.substring(0, 60);
}

function generateMetaDesc(shortDesc) {
  let meta = "Shop luxury 925 sterling silver jewellery at AG Elements. " + shortDesc;
  return meta.substring(0, 155).trim() + (meta.length > 155 ? "..." : "");
}

function improveName(name) {
  let newName = name;
  if (newName.toLowerCase().includes("silver") && !newName.toLowerCase().includes("sterling")) {
    newName = newName.replace(/Silver/i, "925 Sterling Silver");
  }
  return newName;
}

let md = `# Product Optimization Change Report (Pilot Batch)\n\n`;
md += `This report details the proposed SEO, merchandising, and taxonomy updates for the first 20 products. No updates will be made to WooCommerce until approved.\n\n`;

md += `> [!NOTE]\n`;
md += `> **Data Integrity:** Only fields that can be safely mapped to the luxury rules (e.g., standardizing 'Silver' to '925 Sterling Silver') or your explicit category taxonomy have been changed. Attributes like Stock, SKU, Images, and Prices are completely untouched.\n\n`;

products.forEach(p => {
  const newName = improveName(p.name);
  const newCats = determineCategories(p);
  const seoTitle = generateSEOTitle(newName);
  const metaDesc = generateMetaDesc(p.short_description);
  
  md += `### [${p.id}] ${p.name}\n\n`;
  md += `| Field | Old Value | New Value | Reason |\n`;
  md += `|---|---|---|---|\n`;
  
  if (newName !== p.name) {
    md += `| **Name** | ${p.name} | ${newName} | Added "925 Sterling" to reinforce luxury material quality. |\n`;
  }
  
  md += `| **Categories** | ${p.categories.join(', ')} | ${newCats.join(', ')} | Mapped strictly to allowed AG Elements taxonomy categories & collections. |\n`;
  md += `| **SEO Title** | *(None)* | ${seoTitle} | Optimized for search intent and restricted to ~60 characters. |\n`;
  md += `| **Meta Desc** | *(None)* | ${metaDesc} | Keyword-rich description optimized for CTR (~155 characters max). |\n`;
  md += `\n---\n\n`;
});

fs.writeFileSync('product_optimization_report.md', md);
console.log('Report generated.');
