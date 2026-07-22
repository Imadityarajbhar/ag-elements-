const fs = require('fs');

const inputFile = process.argv[2] || 'products_dump.json';
const outputFile = process.argv[3] || 'batch_2_payloads.json';
const start = parseInt(process.argv[4]) || 5;
const batchSize = parseInt(process.argv[5]) || 20;

if (!fs.existsSync(inputFile)) {
  console.error(`Input file ${inputFile} not found.`);
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const batch = products.slice(start, start + batchSize);

const ALLOWED_CATEGORIES = [
  "Rings", "Earrings", "Necklaces", "Pendants", "Bracelets", "Bangles", "Anklets", "Toe Rings",
  "Men's Bracelet", "Men's Necklace", "Men's Ring", "Kids Jewellery",
  "Bridal", "Everyday", "Party", "Office", "Festive", "Gifts", "Best Sellers", "New Arrivals"
];

function generateContent(p) {
  const name = p.name;
  const is925 = p.attributes.some(a => a.name === 'Material' && a.options.includes('925 Sterling Silver')) || 
                p.description.toLowerCase().includes('925') || 
                p.short_description.toLowerCase().includes('925');
  
  const materialLabel = is925 ? "925 Sterling Silver" : "Silver";
  
  const text = (name + " " + p.description + " " + p.short_description).toLowerCase();
  
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
  const isMen = (text.includes("men's") || /\bmens\b/i.test(text) || p.attributes.some(a => a.name === 'Gender' && a.options.includes('Men'))) && !text.includes('feminine') && !text.includes('women');
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

  if (cats.length === 0) cats.push("Everyday"); // Fallback

  // Enhanced Short Description
  const shortDesc = `Designed for effortless sophistication, the ${name} complements both everyday essentials and elevated evening looks. A refined profile that makes it an enduring addition to any modern jewellery collection.`;

  // Enhanced Long Description (Structured)
  const longDesc = `
<h3>Introduction</h3>
<p>Experience the perfect blend of modern craftsmanship and timeless design with the ${name}. Engineered for durability and style, this piece elevates your accessory game effortlessly.</p>

<h3>Design Story</h3>
<p>Inspired by contemporary minimalism and architectural forms, the design emphasizes clean lines and a premium finish. It is crafted for the individual who appreciates subtle luxury and bold presence.</p>

<h3>Key Features</h3>
<ul>
<li>Premium Material: ${materialLabel}</li>
<li>Exquisite Finish: Precision polished for a lasting, radiant shine.</li>
<li>Versatile Profile: Seamlessly transitions from day to night.</li>
</ul>

<h3>Styling Suggestions</h3>
<p>Suitable for both everyday styling and special occasions. Wear it solo for an understated, refined appearance, or layer it to create a personalized, dynamic fashion statement.</p>

<h3>Care Instructions</h3>
<p>Maintain its brilliance by avoiding direct contact with harsh chemicals, lotions, and perfumes. Store gently in the provided AG Elements pouch when not in use.</p>

<h3>Why AG Elements</h3>
<p>At AG Elements, we bridge the gap between traditional craftsmanship and contemporary style. Every piece is a testament to our commitment to quality, ensuring you wear jewelry that truly stands out.</p>
`.trim();

  // SEO Fields
  let seoTitle = `${name} | AG Elements`;
  if (seoTitle.length < 50 && is925 && !name.toLowerCase().includes('925')) {
    seoTitle = `925 Sterling Silver ${name} | AG Elements`;
  }
  seoTitle = seoTitle.substring(0, 60);

  const metaDesc = `Discover the ${name} at AG Elements. Crafted from ${materialLabel}, this piece offers timeless elegance and modern style. Shop premium luxury today.`.substring(0, 155);

  const focusKeyword = name.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').slice(0, 3).join(' ');

  // Tags
  const baseTags = [materialLabel, "Luxury Jewellery", "Designer Piece"];
  if (isMen) baseTags.push("Men's Jewellery", "Gift For Him");
  else baseTags.push("Women's Jewellery", "Gift For Her");
  
  if (text.includes('chain')) baseTags.push("Silver Chain");
  if (text.includes('bracelet')) baseTags.push("Designer Bracelet");
  
  return {
    id: p.id,
    original_name: p.name,
    name: p.name, // Keep name untouched unless we explicitly want to change it. User said avoid excessive length.
    short_description: shortDesc,
    description: longDesc,
    categories: [...new Set(cats)].map(c => ({ name: c })),
    tags: [...new Set(baseTags)].map(t => ({ name: t })),
    attributes: p.attributes.map(a => ({ name: a.name, options: a.options, visible: true })),
    seo: {
      focus_keyword: focusKeyword,
      seo_title: seoTitle,
      meta_description: metaDesc,
      slug_suggestion: focusKeyword.replace(/ /g, '-')
    }
  };
}

const optimized = batch.map(generateContent);

fs.writeFileSync(outputFile, JSON.stringify(optimized, null, 2));
console.log(`Optimized ${optimized.length} products. Saved to ${outputFile}`);
