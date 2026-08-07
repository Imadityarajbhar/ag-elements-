/**
 * Image validator — crawls the live WooCommerce catalog via the REST API and
 * checks every product image URL for the failure classes identified in the
 * image-pipeline audit: 404/403/5xx at origin, redirects, non-image
 * content-types, empty galleries, and URLs duplicated across products.
 *
 * Read-only: makes HEAD (falling back to GET) requests against WordPress
 * media URLs and GET requests against the WooCommerce REST API. Never
 * writes to WooCommerce/WordPress.
 *
 * Usage:
 *   node catalog-cli/image-validator.js [--concurrency=10] [--out=image_validation_report]
 *
 * Output:
 *   <out>.json — full machine-readable results
 *   <out>.md   — human-readable summary report
 *
 * Exit code: 1 if any broken (non-2xx/network-error) image was found, so
 * this can be wired into CI or a scheduled job; 0 otherwise.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach((line) => {
    const [key, ...val] = line.split('=');
    if (key && val.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = val.join('=').trim();
    }
  });
}
loadEnv();

const API_URL = process.env.NEXT_PUBLIC_WC_API_URL;
const AUTH = Buffer.from(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`).toString('base64');

const args = process.argv.slice(2);
const getArg = (prefix, fallback) => {
  const arg = args.find((a) => a.startsWith(prefix));
  return arg ? arg.split('=')[1] : fallback;
};
const CONCURRENCY = parseInt(getArg('--concurrency=', '10'), 10);
const OUT_BASENAME = getArg('--out=', 'image_validation_report');

async function fetchAllProducts() {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    const url = `${API_URL}/products?status=publish&per_page=100&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Basic ${AUTH}` } });
    if (!res.ok) {
      throw new Error(`WooCommerce API error fetching products page ${page}: HTTP ${res.status}`);
    }
    const data = await res.json();
    all.push(...data);
    totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
    console.error(`[image-validator] fetched product page ${page}/${totalPages} (${data.length} products)`);
    page += 1;
  } while (page <= totalPages);
  return all;
}

async function checkImageUrl(url) {
  const start = Date.now();
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: 'GET', redirect: 'manual' });
    }
    const isRedirect = res.status >= 300 && res.status < 400;
    return {
      status: res.status,
      ok: res.status >= 200 && res.status < 300,
      redirect: isRedirect,
      location: isRedirect ? res.headers.get('location') : null,
      contentType: res.headers.get('content-type'),
      contentLength: res.headers.get('content-length') ? parseInt(res.headers.get('content-length'), 10) : null,
      timeMs: Date.now() - start,
    };
  } catch (e) {
    return { status: 0, ok: false, error: e.message, timeMs: Date.now() - start };
  }
}

async function runWithConcurrency(items, worker, concurrency) {
  const queue = [...items];
  const results = [];
  async function run() {
    while (queue.length) {
      const item = queue.shift();
      results.push(await worker(item));
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

async function main() {
  console.error('[image-validator] Fetching full published catalog from WooCommerce REST API...');
  const products = await fetchAllProducts();
  console.error(`[image-validator] ${products.length} published products fetched.`);

  const emptyGalleries = [];
  const missingAltCount = { total: 0 };
  const urlToProducts = new Map();

  for (const p of products) {
    const imgs = p.images || [];
    if (imgs.length === 0) {
      emptyGalleries.push({ id: p.id, slug: p.slug, name: p.name, permalink: p.permalink });
      continue;
    }
    for (const img of imgs) {
      if (!img.alt || String(img.alt).trim() === '') missingAltCount.total += 1;
      if (!img.src) continue;
      if (!urlToProducts.has(img.src)) urlToProducts.set(img.src, []);
      urlToProducts.get(img.src).push({ id: p.id, slug: p.slug, imageId: img.id });
    }
  }

  const uniqueUrls = [...urlToProducts.keys()];
  console.error(`[image-validator] Validating ${uniqueUrls.length} unique image URLs (concurrency=${CONCURRENCY})...`);

  let checked = 0;
  const checkResults = await runWithConcurrency(
    uniqueUrls,
    async (url) => {
      const r = await checkImageUrl(url);
      checked += 1;
      if (checked % 50 === 0) console.error(`[image-validator] checked ${checked}/${uniqueUrls.length}`);
      return { url, products: urlToProducts.get(url), ...r };
    },
    CONCURRENCY
  );

  const broken = checkResults.filter((r) => !r.ok);
  const redirects = checkResults.filter((r) => r.redirect);
  const wrongType = checkResults.filter((r) => r.ok && r.contentType && !r.contentType.startsWith('image/'));
  const duplicates = checkResults.filter((r) => new Set(r.products.map((p) => p.id)).size > 1);
  const oversized1MB = checkResults.filter((r) => r.contentLength && r.contentLength > 1024 * 1024);

  const report = {
    generatedAt: new Date().toISOString(),
    totalProducts: products.length,
    totalUniqueImageUrls: uniqueUrls.length,
    emptyGalleries,
    missingAltTextCount: missingAltCount.total,
    broken,
    redirects,
    nonImageContentType: wrongType,
    duplicateUrlsAcrossProducts: duplicates,
    imagesOver1MB: oversized1MB.map((r) => ({ url: r.url, contentLength: r.contentLength })),
    allResults: checkResults,
  };

  fs.writeFileSync(path.join(ROOT, `${OUT_BASENAME}.json`), JSON.stringify(report, null, 2));

  const md = buildMarkdownReport(report);
  fs.writeFileSync(path.join(ROOT, `${OUT_BASENAME}.md`), md);

  console.error('\n=== SUMMARY ===');
  console.error(`Products: ${report.totalProducts} | Unique image URLs: ${report.totalUniqueImageUrls}`);
  console.error(`Empty galleries: ${emptyGalleries.length}`);
  console.error(`Broken (non-2xx / network error): ${broken.length}`);
  console.error(`Redirects: ${redirects.length}`);
  console.error(`Non-image content-type: ${wrongType.length}`);
  console.error(`Duplicate URLs across products: ${duplicates.length}`);
  console.error(`Images over 1MB: ${oversized1MB.length}`);
  console.error(`Images missing alt text: ${missingAltCount.total}`);
  console.error(`\nReports written to ${OUT_BASENAME}.json and ${OUT_BASENAME}.md`);

  process.exit(broken.length > 0 || emptyGalleries.length > 0 ? 1 : 0);
}

function buildMarkdownReport(r) {
  const lines = [];
  lines.push('# WooCommerce Image Validation Report');
  lines.push('');
  lines.push(`Generated: ${r.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|---|---|');
  lines.push(`| Published products | ${r.totalProducts} |`);
  lines.push(`| Unique image URLs | ${r.totalUniqueImageUrls} |`);
  lines.push(`| Products with empty image galleries | ${r.emptyGalleries.length} |`);
  lines.push(`| Broken image URLs (non-2xx / network error) | ${r.broken.length} |`);
  lines.push(`| Redirects | ${r.redirects.length} |`);
  lines.push(`| Non-image content-type responses | ${r.nonImageContentType.length} |`);
  lines.push(`| URLs duplicated across >1 product | ${r.duplicateUrlsAcrossProducts.length} |`);
  lines.push(`| Images over 1MB | ${r.imagesOver1MB.length} |`);
  lines.push(`| Images missing alt text | ${r.missingAltTextCount} |`);
  lines.push('');

  if (r.broken.length > 0) {
    lines.push('## Broken image URLs');
    lines.push('');
    lines.push('| Status | URL | Affected products |');
    lines.push('|---|---|---|');
    for (const b of r.broken) {
      const products = b.products.map((p) => `${p.slug} (#${p.id})`).join(', ');
      lines.push(`| ${b.status || 'ERR: ' + b.error} | ${b.url} | ${products} |`);
    }
    lines.push('');
  } else {
    lines.push('## Broken image URLs');
    lines.push('');
    lines.push('None found.');
    lines.push('');
  }

  if (r.emptyGalleries.length > 0) {
    lines.push('## Products with empty image galleries');
    lines.push('');
    lines.push('| ID | Slug | Name |');
    lines.push('|---|---|---|');
    for (const e of r.emptyGalleries) {
      lines.push(`| ${e.id} | ${e.slug} | ${e.name} |`);
    }
    lines.push('');
  }

  if (r.duplicateUrlsAcrossProducts.length > 0) {
    lines.push('## Image URLs reused across multiple products');
    lines.push('');
    lines.push('(Not necessarily a defect — may be intentional for near-identical variant listings. Worth a manual glance.)');
    lines.push('');
    lines.push('| URL | Products |');
    lines.push('|---|---|');
    for (const d of r.duplicateUrlsAcrossProducts) {
      const products = [...new Set(d.products.map((p) => `${p.slug} (#${p.id})`))].join(', ');
      lines.push(`| ${d.url} | ${products} |`);
    }
    lines.push('');
  }

  if (r.imagesOver1MB.length > 0) {
    lines.push('## Images over 1MB');
    lines.push('');
    lines.push('| Size | URL |');
    lines.push('|---|---|');
    for (const o of r.imagesOver1MB.slice().sort((a, b) => b.contentLength - a.contentLength)) {
      lines.push(`| ${(o.contentLength / 1024 / 1024).toFixed(2)} MB | ${o.url} |`);
    }
    lines.push('');
    lines.push('See the image-optimization pipeline (`catalog-cli/image-optimizer.js`) for remediation.');
    lines.push('');
  }

  return lines.join('\n');
}

main().catch((e) => {
  console.error('[image-validator] Fatal error:', e);
  process.exit(1);
});
