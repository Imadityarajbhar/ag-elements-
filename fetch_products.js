const fs = require('fs');

async function fetchProducts() {
  const url = 'https://agelements.in/wp-json/wc/v3/products?per_page=100';
  const auth = Buffer.from('ck_19bde5b7f0786af870102cfe1e8b29807ecc4098:cs_221e0f2a9eaad7087051094f92332c1d7d2c49c8').toString('base64');
  
  try {
    const res = await fetch(url, { headers: { Authorization: 'Basic ' + auth } });
    const data = await res.json();
    fs.writeFileSync('products_dump.json', JSON.stringify(data, null, 2));
    console.log(`Fetched ${data.length} products and saved to products_dump.json`);
  } catch (err) {
    console.error('Error fetching products', err);
  }
}
fetchProducts();
