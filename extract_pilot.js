const fs = require('fs');

const raw = fs.readFileSync('products_dump.json', 'utf8');
const products = JSON.parse(raw);

const pilotBatch = products.slice(0, 20).map(p => ({
  id: p.id,
  name: p.name,
  short_description: p.short_description.replace(/<[^>]+>/g, '').trim(),
  description: p.description.replace(/<[^>]+>/g, '').trim(),
  categories: p.categories.map(c => c.name),
  tags: p.tags.map(t => t.name),
  attributes: p.attributes.map(a => ({ name: a.name, options: a.options }))
}));

fs.writeFileSync('pilot_20.json', JSON.stringify(pilotBatch, null, 2));
console.log('Saved pilot_20.json');
