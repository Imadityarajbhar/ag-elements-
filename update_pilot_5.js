const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length > 0) env[key.trim()] = val.join('=').trim();
});

const API_URL = env.NEXT_PUBLIC_WC_API_URL;
const AUTH = Buffer.from(env.WC_CONSUMER_KEY + ':' + env.WC_CONSUMER_SECRET).toString('base64');
const HEADERS = { 'Authorization': 'Basic ' + AUTH, 'Content-Type': 'application/json' };

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
      }
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`[WARN] Fetch failed, retrying in ${backoff}ms... (${e.message})`);
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

const payloads = [
  {
    id: 4314,
    name: "Minimal Silver Box Chain Necklace",
    short_description: "Crafted for daily wear, this sleek silver box chain necklace offers a refined, minimalist design. Lightweight, comfortable, and perfect for modern styling.",
    description: "<h3>Introduction</h3>\n<p>Complete your everyday look with this elegant silver box chain necklace, crafted for those who appreciate clean sophistication and versatile fashion. Featuring a sleek box-link chain design with a polished metallic finish, this necklace delivers a refined modern aesthetic suitable for every occasion.</p>\n\n<h3>Features</h3>\n<ul>\n<li>Material: Silver (Rhodium Plated)</li>\n<li>Stone: AAA+ Cubic Zirconia</li>\n<li>Design: Classic Box Chain</li>\n</ul>\n\n<h3>Styling</h3>\n<p>Its lightweight and comfortable construction makes it perfect for all-day wear. Style it alone for a subtle minimalist statement or layer it with pendants and other chains for a trendy contemporary look.</p>\n\n<h3>Care Instructions</h3>\n<p>To maintain its shine, avoid direct contact with perfumes, lotions, and harsh chemicals. Store in a cool, dry place, preferably in the provided AG Elements pouch.</p>\n\n<h3>Why AG Elements</h3>\n<p>At AG Elements, we believe in crafting premium jewelry that combines timeless elegance with modern durability. Every piece is designed to be a lasting addition to your wardrobe.</p>",
    categories: ["Men's Necklace", "Everyday"],
    tags: ["Silver Chain", "Minimal Necklace", "Gift For Him", "Daily Wear", "Men's Jewellery"],
    meta_data: [
      { key: "_yoast_wpseo_title", value: "Minimal Silver Box Chain Necklace | AG Elements" },
      { key: "_yoast_wpseo_metadesc", value: "Elevate your everyday style with our Minimal Silver Box Chain Necklace. A versatile, sleek accessory designed for the modern man." }
    ],
    attributes: [
      { name: "Material", options: ["Silver"], visible: true },
      { name: "Gender", options: ["Men"], visible: true },
      { name: "Occasion", options: ["Casual", "Everyday"], visible: true },
      { name: "Finish", options: ["Rhodium Plated"], visible: true },
      { name: "Stone", options: ["AAA+ Cubic Zirconia"], visible: true }
    ]
  },
  {
    id: 4328,
    name: "925 Sterling Silver Gold Cuban Link Chain Necklace",
    short_description: "Make a bold statement with this premium 925 Sterling Silver Cuban Link Chain, finished in luxurious gold. Built for confidence and modern streetwear styling.",
    description: "<h3>Introduction</h3>\n<p>Make a confident style statement with this luxury gold Cuban link chain necklace, designed for those who appreciate bold modern fashion and timeless elegance. Crafted from premium 925 Sterling Silver, this classic interlocking chain delivers a powerful look.</p>\n\n<h3>Features</h3>\n<ul>\n<li>Material: 925 Sterling Silver (Rhodium Plated, Gold-Tone)</li>\n<li>Stone: AAA+ Cubic Zirconia</li>\n<li>Design: Bold Cuban Link</li>\n</ul>\n\n<h3>Styling</h3>\n<p>This sturdy chain is ideal for everyday wear or party looks. Wear it solo over a solid tee for maximum impact, or layer it with thinner chains to create a stacked, premium luxury aesthetic.</p>\n\n<h3>Care Instructions</h3>\n<p>Protect the gold finish by keeping the chain away from excessive moisture and harsh grooming products. Wipe gently with a soft cloth after wear.</p>\n\n<h3>Why AG Elements</h3>\n<p>AG Elements brings you uncompromising quality. We merge classic chain link designs with premium 925 sterling silver to deliver jewelry that stands out.</p>",
    categories: ["Men's Necklace", "Party"],
    tags: ["Cuban Link", "925 Sterling Silver", "Gold Chain", "Statement Necklace", "Luxury Jewellery"],
    meta_data: [
      { key: "_yoast_wpseo_title", value: "Gold Cuban Link Chain in 925 Sterling Silver | AG Elements" },
      { key: "_yoast_wpseo_metadesc", value: "Discover the bold Gold Cuban Link Chain crafted in 925 Sterling Silver. A premium, standout necklace perfect for modern styling and party wear." }
    ],
    attributes: [
      { name: "Material", options: ["925 Sterling Silver"], visible: true },
      { name: "Gender", "options": ["Men"], visible: true },
      { name: "Occasion", "options": ["Casual", "Everyday", "Party"], visible: true },
      { name: "Finish", "options": ["Rhodium Plated"], visible: true },
      { name: "Stone", "options": ["AAA+ Cubic Zirconia"], visible: true }
    ]
  },
  {
    id: 4316,
    name: "Classic Silver Cable Chain Necklace",
    short_description: "Add effortless sophistication to your look with this classic silver cable chain. Lightweight, timeless, and perfectly suited for daily office or casual wear.",
    description: "<h3>Introduction</h3>\n<p>Add effortless sophistication to your jewelry collection with this classic silver cable chain necklace. Crafted with finely linked chain detailing and a polished metallic finish, this necklace offers a clean minimalist look that complements every style beautifully.</p>\n\n<h3>Features</h3>\n<ul>\n<li>Material: Silver (Rhodium Plated)</li>\n<li>Stone: AAA+ Cubic Zirconia</li>\n<li>Design: Classic Cable Chain</li>\n</ul>\n\n<h3>Styling</h3>\n<p>Its lightweight and versatile design makes it ideal for office wear or weekend casuals. Wear it alone for a subtle elegant appearance or layer it with your favorite pendants.</p>\n\n<h3>Care Instructions</h3>\n<p>Keep your silver chain looking brand new by storing it in an airtight container or jewelry pouch. Avoid exposure to harsh household chemicals.</p>\n\n<h3>Why AG Elements</h3>\n<p>AG Elements designs versatile, high-quality essentials. Our chains are crafted to offer modern elegance that easily adapts to your unique lifestyle.</p>",
    categories: ["Men's Necklace", "Office"],
    tags: ["Silver Chain", "Cable Chain", "Office Wear", "Minimalist Jewellery"],
    meta_data: [
      { key: "_yoast_wpseo_title", value: "Classic Silver Cable Chain Necklace | AG Elements" },
      { key: "_yoast_wpseo_metadesc", value: "Shop the Classic Silver Cable Chain Necklace at AG Elements. A refined, versatile accessory for men that transitions seamlessly from office to casual wear." }
    ],
    attributes: [
      { name: "Material", options: ["Silver"], visible: true },
      { name: "Gender", "options": ["Men"], visible: true },
      { name: "Occasion", "options": ["Casual", "Everyday", "Festive"], visible: true },
      { name: "Finish", "options": ["Rhodium Plated"], visible: true },
      { name: "Stone", "options": ["AAA+ Cubic Zirconia"], visible: true }
    ]
  },
  {
    id: 4239,
    name: "Classic Silver Ball Chain Necklace",
    short_description: "A sleek silver ball chain necklace featuring a sequence of polished metallic beads. Effortless everyday luxury in a minimalist design.",
    description: "<h3>Introduction</h3>\n<p>Enhance your jewelry collection with this elegant silver ball chain necklace, designed for modern minimal styling and effortless versatility. Featuring a finely crafted sequence of polished metallic beads, this necklace offers a sleek refined look.</p>\n\n<h3>Features</h3>\n<ul>\n<li>Material: Silver (Rhodium Plated)</li>\n<li>Stone: AAA+ Cubic Zirconia</li>\n<li>Design: Beaded Ball Chain</li>\n</ul>\n\n<h3>Styling</h3>\n<p>Its lightweight and minimalist design makes it perfect for daily wear. Pair it with a classic white shirt for a clean sophisticated appearance, or layer it with a dog-tag pendant for a streetwear edge.</p>\n\n<h3>Care Instructions</h3>\n<p>Gently polish with a microfiber cloth to maintain the shine of the silver beads. Avoid wearing during strenuous activities or swimming.</p>\n\n<h3>Why AG Elements</h3>\n<p>At AG Elements, our focus is on precision craftsmanship. We create modern essentials that blend seamlessly into your daily wardrobe.</p>",
    categories: ["Men's Necklace", "Everyday"],
    tags: ["Ball Chain", "Silver Necklace", "Minimalist Jewellery", "Gift For Him"],
    meta_data: [
      { key: "_yoast_wpseo_title", value: "Classic Silver Ball Chain Necklace | AG Elements" },
      { key: "_yoast_wpseo_metadesc", value: "Upgrade your style with the Classic Silver Ball Chain Necklace from AG Elements. Featuring polished metallic beads for a sleek, contemporary look." }
    ],
    attributes: [
      { name: "Material", options: ["Silver"], visible: true },
      { name: "Gender", "options": ["Men"], visible: true },
      { name: "Occasion", "options": ["Casual"], visible: true },
      { name: "Finish", "options": ["Rhodium Plated"], visible: true },
      { name: "Stone", "options": ["AAA+ Cubic Zirconia"], visible: true }
    ]
  },
  {
    id: 4318,
    name: "Modern Silver Link Chain Necklace",
    short_description: "Upgrade your aesthetic with this bold, modern silver link chain. Engineered for everyday durability and sleek contemporary styling.",
    description: "<h3>Introduction</h3>\n<p>Upgrade your accessory collection with this modern silver link chain necklace, crafted to deliver timeless style with a contemporary edge. Featuring clean interconnected links and a polished metallic finish, this necklace creates a bold yet versatile fashion statement.</p>\n\n<h3>Features</h3>\n<ul>\n<li>Material: Silver (Rhodium Plated)</li>\n<li>Stone: AAA+ Cubic Zirconia</li>\n<li>Design: Bold Interlocking Links</li>\n</ul>\n\n<h3>Styling</h3>\n<p>The modern chain pattern makes it ideal for solo styling over a dark sweater or layering with other necklaces for a trendy stacked appearance. Perfect for both casual fashion and smart evening looks.</p>\n\n<h3>Care Instructions</h3>\n<p>Maintain the brilliant rhodium-plated finish by avoiding exposure to harsh chemicals. Clean gently with a soft cloth after use.</p>\n\n<h3>Why AG Elements</h3>\n<p>AG Elements creates jewelry for those who demand both style and durability. Our pieces are crafted to be the modern cornerstones of your accessory collection.</p>",
    categories: ["Men's Necklace", "Everyday"],
    tags: ["Link Chain", "Silver Necklace", "Modern Jewellery", "Statement Necklace"],
    meta_data: [
      { key: "_yoast_wpseo_title", value: "Modern Silver Link Chain Necklace | AG Elements" },
      { key: "_yoast_wpseo_metadesc", value: "Discover the Modern Silver Link Chain Necklace by AG Elements. A bold, minimalist accessory designed to add a contemporary edge to your everyday look." }
    ],
    attributes: [
      { name: "Material", options: ["Silver"], visible: true },
      { name: "Gender", "options": ["Men"], visible: true },
      { name: "Occasion", "options": ["Casual", "Everyday"], visible: true },
      { name: "Finish", "options": ["Rhodium Plated"], visible: true },
      { name: "Stone", "options": ["AAA+ Cubic Zirconia"], visible: true }
    ]
  }
];

async function run() {
  console.log("Fetching existing categories and tags...");
  const wcCategories = await getAll('products/categories');
  const wcTags = await getAll('products/tags');

  let report = `# Pilot 5-Product Update Report\n\n`;
  let backupData = [];

  for (const payload of payloads) {
    try {
      console.log(`\nProcessing Product ID: ${payload.id}`);
      
      // 1. Fetch current product for backup
      const current = await fetchWithRetry(`${API_URL}/products/${payload.id}`, { headers: HEADERS });
      
      // Backup editable fields
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

      // 2. Map Categories and Tags to IDs
      const categoryIds = [];
      for (const cName of payload.categories) {
        const id = await getOrCreateTerm('products/categories', cName, wcCategories);
        categoryIds.push({ id });
      }

      const tagIds = [];
      for (const tName of payload.tags) {
        const id = await getOrCreateTerm('products/tags', tName, wcTags);
        tagIds.push({ id });
      }

      // 3. Merge attributes
      let mergedAttributes = [...current.attributes];
      for (const newAttr of payload.attributes) {
        const existingIndex = mergedAttributes.findIndex(a => a.name.toLowerCase() === newAttr.name.toLowerCase());
        if (existingIndex > -1) {
          mergedAttributes[existingIndex] = { ...mergedAttributes[existingIndex], ...newAttr };
        } else {
          mergedAttributes.push(newAttr);
        }
      }

      // 4. Construct final payload
      const updateData = {
        name: payload.name,
        short_description: payload.short_description,
        description: payload.description,
        categories: categoryIds,
        tags: tagIds,
        attributes: mergedAttributes,
        meta_data: payload.meta_data // WP REST API merges meta_data by key if provided, or appends. Yoast keys will update.
      };

      // 5. Update Product
      console.log(`Updating Product ID: ${payload.id}...`);
      await fetchWithRetry(`${API_URL}/products/${payload.id}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(updateData)
      });

      // 6. Verify Update
      console.log(`Verifying Product ID: ${payload.id}...`);
      const verified = await fetchWithRetry(`${API_URL}/products/${payload.id}`, { headers: HEADERS });
      
      let isVerified = true;
      if (verified.name !== payload.name) isVerified = false;
      
      if (isVerified) {
        console.log(`✅ Product ${payload.id} updated and verified successfully.`);
        report += `### Product ${payload.id}\n- **Status:** ✅ Updated & Verified\n- **Name:** ${verified.name}\n\n`;
      } else {
        console.log(`⚠️ Product ${payload.id} updated but verification mismatched!`);
        report += `### Product ${payload.id}\n- **Status:** ⚠️ Verification Mismatch\n\n`;
      }

    } catch (err) {
      console.error(`❌ Failed to update Product ${payload.id}: ${err.message}`);
      report += `### Product ${payload.id}\n- **Status:** ❌ Failed (${err.message})\n\n`;
    }
  }

  fs.writeFileSync('backup_pilot_5.json', JSON.stringify(backupData, null, 2));
  console.log('\nBackup saved to backup_pilot_5.json');

  fs.writeFileSync('update_report.md', report);
  console.log('Update report saved to update_report.md');
}

run();
