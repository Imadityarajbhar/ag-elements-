/**
 * Fully local, in-memory mock of the WooCommerce REST API + WordPress media
 * upload endpoint + this app's /api/revalidate route — used only to test
 * apply-migration.js and rollback-migration.js without ever touching the
 * real cms.agelements.in. No external network access, no real credentials.
 *
 * Implements exactly the endpoints those two scripts (and validate-migration.js)
 * call: GET/PUT /wc/v3/products(/:id), POST /wp-json/wp/v2/media, GET of an
 * uploaded media's own source_url, and POST /api/revalidate.
 */
const http = require('http');
const { URL } = require('url');

function startMockServer(seedProducts) {
  const products = new Map(seedProducts.map((p) => [p.id, JSON.parse(JSON.stringify(p))]));
  const media = new Map(); // id -> { buffer, contentType }
  let nextMediaId = 9000;
  const revalidateCalls = [];
  const requestLog = [];

  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const url = new URL(req.url, `http://localhost`);
      requestLog.push({ method: req.method, path: url.pathname, hasAuth: !!req.headers.authorization });

      try {
        route(req, res, url, body);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  });

  function json(res, status, obj) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
  }

  function route(req, res, url, body) {
    // GET /wc/v3/products
    if (req.method === 'GET' && url.pathname === '/wc/v3/products') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'x-wp-totalpages': '1' });
      res.end(JSON.stringify([...products.values()]));
      return;
    }

    // GET or PUT /wc/v3/products/:id
    const productMatch = url.pathname.match(/^\/wc\/v3\/products\/(\d+)$/);
    if (productMatch) {
      const id = parseInt(productMatch[1], 10);
      if (req.method === 'GET') {
        const p = products.get(id);
        if (!p) return json(res, 404, { error: 'not found' });
        return json(res, 200, p);
      }
      if (req.method === 'PUT') {
        const p = products.get(id);
        if (!p) return json(res, 404, { error: 'not found' });
        const patch = JSON.parse(body.toString('utf8'));
        if (patch.images) p.images = patch.images;
        products.set(id, p);
        return json(res, 200, p);
      }
    }

    // POST /wp-json/wp/v2/media
    if (req.method === 'POST' && url.pathname === '/wp-json/wp/v2/media') {
      const id = nextMediaId;
      nextMediaId += 1;
      const contentType = req.headers['content-type'] || 'application/octet-stream';
      const ext = contentType === 'image/jpeg' ? 'jpg' : 'webp';
      media.set(id, { buffer: body, contentType });
      return json(res, 201, {
        id,
        source_url: `http://127.0.0.1:${server.address().port}/media-file/${id}.${ext}`,
        media_type: 'image',
        mime_type: contentType,
      });
    }

    // POST /wp-json/wp/v2/media/:id  (alt_text update)
    const mediaPatchMatch = url.pathname.match(/^\/wp-json\/wp\/v2\/media\/(\d+)$/);
    if (req.method === 'POST' && mediaPatchMatch) {
      const id = parseInt(mediaPatchMatch[1], 10);
      const m = media.get(id);
      if (!m) return json(res, 404, { error: 'not found' });
      const patch = JSON.parse(body.toString('utf8'));
      if (typeof patch.alt_text === 'string') m.altText = patch.alt_text;
      return json(res, 200, { id, alt_text: m.altText });
    }

    // GET /media-file/:id.:ext  (serves back an "uploaded" file for verification checks)
    const mediaMatch = url.pathname.match(/^\/media-file\/(\d+)\.\w+$/);
    if (mediaMatch) {
      const id = parseInt(mediaMatch[1], 10);
      const m = media.get(id);
      if (!m) {
        res.writeHead(404);
        return res.end();
      }
      res.writeHead(200, { 'Content-Type': m.contentType, 'Content-Length': m.buffer.length });
      return res.end(req.method === 'HEAD' ? undefined : m.buffer);
    }

    // POST /api/revalidate
    if (req.method === 'POST' && url.pathname === '/api/revalidate') {
      const parsed = body.length ? JSON.parse(body.toString('utf8')) : {};
      revalidateCalls.push({ tags: parsed.tags, secretProvided: !!req.headers['x-revalidate-secret'] });
      return json(res, 200, { revalidated: true, tags: parsed.tags });
    }

    json(res, 404, { error: `mock: no route for ${req.method} ${url.pathname}` });
  }

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      const base = `http://127.0.0.1:${port}`;
      resolve({
        wcApiUrl: `${base}/wc/v3`,
        wpUrl: base,
        siteUrl: base,
        getProductState: (id) => products.get(id),
        getMediaState: (id) => media.get(id),
        getAllProductState: () => [...products.values()],
        getRevalidateCalls: () => revalidateCalls,
        getRequestLog: () => requestLog,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

module.exports = { startMockServer };
