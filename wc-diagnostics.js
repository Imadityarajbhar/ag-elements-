const fs = require('fs');

try {
  const envConfig = fs.readFileSync('.env.local', 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = match[2].replace(/^['"](.*)['"]$/, '$1');
    }
  });
} catch (err) {}

async function runDiagnostics() {
  const apiUrl = process.env.NEXT_PUBLIC_WC_API_URL;
  const auth = Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64');
  const headers = { 'Authorization': `Basic ${auth}` };

  console.log("\n--- Checking Empty Slugs & Related IDs ---");
  const prodsRes = await fetch(`${apiUrl}/products?per_page=10`, { headers });
  const prods = await prodsRes.json();
  prods.forEach(p => {
    console.log(`${p.id}: ${p.name}`);
    console.log(`  Status: ${p.status}`);
    console.log(`  Slug: "${p.slug}"`);
    console.log(`  Permalink: "${p.permalink}"`);
    console.log(`  Price: "${p.price}" (Type: ${typeof p.price})`);
    console.log(`  Related IDs: ${p.related_ids?.join(', ')}`);
  });
}

runDiagnostics();
