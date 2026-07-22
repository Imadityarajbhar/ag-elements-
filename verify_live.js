const fs = require('fs');
const path = require('path');

// Setup Env
const envPath = path.join(__dirname, '.env.local');
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
      return { data: await res.json(), headers: res.headers };
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, backoff));
      backoff *= 2;
    }
  }
}

async function verify() {
  const cats = await fetchWithRetry(`${API_URL}/products/categories`, { headers: HEADERS });
  
  const targetSlugs = ['rings', 'earrings', 'mens-bracelet', 'kids'];
  
  console.log("=== Live API Category Counts ===");
  for (const cat of cats.data) {
    console.log(`${cat.name.padEnd(20)} | ${cat.count} products`);
  }
}

verify().catch(console.error);
