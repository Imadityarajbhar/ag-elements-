import { wcClient } from './src/services/woocommerce/client.js';

async function testWc() {
  const query = 'ring';
  try {
    const res = await wcClient.fetch(`/products?search=${query}&per_page=6&status=publish`);
    console.log(`WC Raw Search for '${query}' returned ${res.length} products`);
    if (res.length > 0) console.log(res.map(p => p.name));
  } catch (e) {
    console.error("WC Raw Search Error:", e);
  }
}

testWc();
