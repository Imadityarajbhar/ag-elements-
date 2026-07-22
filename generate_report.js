const fs = require('fs');

const products = JSON.parse(fs.readFileSync('pilot_20.json', 'utf8'));

// Allowed Taxonomies
const ALLOWED_CATEGORIES = [
  "Rings", "Earrings", "Necklaces", "Pendants", "Bracelets", "Bangles", "Anklets", "Toe Rings",
  "Men's Bracelet", "Men's Necklace", "Men's Ring", "Kids Jewellery",
  "Bridal", "Everyday", "Party", "Office", "Festive", "Gifts", "Best Sellers", "New Arrivals"
];

function determineCategories(p) {
  // Version 2 Categorization Engine
  const CATEGORY_RULES = [
    { category: "Earrings", patterns: [/earring(s)?/i] },
    { category: "Toe Rings", patterns: [/toe\s+ring(s)?/i] },
    { category: "Rings", patterns: [/\bring(s)?\b/i] },
    { category: "Necklaces", patterns: [/\b(necklace|chain)(s)?\b/i] },
    { category: "Pendants", patterns: [/\bpendant(s)?\b/i] },
    { category: "Bangles", patterns: [/\bbangle(s)?\b/i] },
    { category: "Bracelets", patterns: [/\bbracelet(s)?\b/i] },
    { category: "Anklets", patterns: [/\b(anklet|payal)(s)?\b/i] }
  ];

  const COLLECTION_RULES = [
    { category: "Office", patterns: [/\b(office|work|minimal|formal)\b/i] },
    { category: "Party", patterns: [/\b(party|statement|bold)\b/i] },
    { category: "Everyday", patterns: [/\b(everyday|daily)\b/i] },
    { category: "Festive", patterns: [/\b(festive|wedding|bridal)\b/i] },
    { category: "Gifts", patterns: [/\bgift(s)?\b/i] }
  ];

  let cats = [];
  const text = (p.name + " " + (p.description || "") + " " + (p.short_description || "")).toLowerCase();
  
  const hasMenAttr = p.attributes && p.attributes.some(a => a.name === 'Gender' && a.options.includes('Men'));
  const isMen = (text.includes("men's") || /\bmens\b/i.test(text) || hasMenAttr) && !text.includes('feminine') && !text.includes('women');
  const isKids = text.includes("kids") || text.includes("children");

  // Determine base jewelry type
  let baseType = null;
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some(regex => regex.test(text))) {
      baseType = rule.category;
      break; // Single primary category prevents duplicates like Women's + Men's Bracelet
    }
  }

  if (isMen) {
    if (baseType === "Necklaces" || baseType === "Pendants") cats.push("Men's Necklace");
    else if (baseType === "Bracelets" || baseType === "Bangles") cats.push("Men's Bracelet");
    else if (baseType === "Rings" || baseType === "Toe Rings") cats.push("Men's Ring");
    else cats.push("Men's Necklace"); // Default for men
  } else if (isKids) {
    cats.push("Kids Jewellery");
  } else {
    if (baseType) {
      cats.push(baseType);
    }
  }

  // Collections based on text
  for (const rule of COLLECTION_RULES) {
    if (rule.patterns.some(regex => regex.test(text))) {
      cats.push(rule.category);
    }
  }

  if (cats.length === 0) cats.push("Necklaces"); // safety fallback

  return [...new Set(cats)];
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
