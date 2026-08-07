import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * WooCommerce webhook receiver — on-demand cache invalidation for product
 * data (see src/app/api/revalidate/route.ts, which this replaces the need to
 * call manually for product changes). Without this, product pages only ever
 * refresh on the existing 60–300s time-based ISR window, and only once
 * someone actually requests the page after that window elapses — under low
 * traffic that can silently stretch to hours, serving stale image/price/
 * stock data (including references to since-deleted media) far longer than
 * the nominal window suggests.
 *
 * Setup (WooCommerce Admin, outside this repo — not completed by this
 * change): Settings → Advanced → Webhooks → Add webhook, once per topic:
 *   Topic: Product created   → Delivery URL: https://agelements.in/api/webhooks/woocommerce
 *   Topic: Product updated   → same URL
 *   Topic: Product deleted   → same URL
 *   Secret: any strong random value, copied into this project's
 *           WOOCOMMERCE_WEBHOOK_SECRET env var (server-side only, never
 *           NEXT_PUBLIC_) on Vercel.
 *
 * WooCommerce signs every delivery with X-WC-Webhook-Signature: a base64
 * HMAC-SHA256 of the raw request body, keyed by that same secret. Payloads
 * are verified against it before anything else runs.
 */

const TAG_BY_TOPIC: Record<string, (payload: WooCommerceWebhookProduct) => string[]> = {
  'product.created': (p) => ['products', `product-${p.slug}`],
  'product.updated': (p) => ['products', `product-${p.slug}`, `variations-${p.id}`],
  'product.deleted': (p) => ['products', `product-${p.slug}`, 'products-by-id'],
  'product.restored': (p) => ['products', `product-${p.slug}`],
};

interface WooCommerceWebhookProduct {
  id: number;
  slug: string;
  [key: string]: unknown;
}

function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;

  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');

  const signatureBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expected);

  return signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET;
  const topic = request.headers.get('x-wc-webhook-topic');
  const deliveryId = request.headers.get('x-wc-webhook-delivery-id');
  const signatureHeader = request.headers.get('x-wc-webhook-signature');
  const rawBody = await request.text();

  if (!secret) {
    console.error('[woocommerce-webhook] WOOCOMMERCE_WEBHOOK_SECRET is not configured — rejecting delivery', { topic, deliveryId });
    return NextResponse.json({ received: false, error: 'Webhook not configured' }, { status: 500 });
  }

  if (!verifySignature(rawBody, signatureHeader, secret)) {
    console.error('[woocommerce-webhook] Signature verification failed', { topic, deliveryId });
    return NextResponse.json({ received: false, error: 'Invalid signature' }, { status: 401 });
  }

  // WooCommerce sends an empty-body test ping the moment a webhook is saved
  // in wp-admin, before any real topic fires — valid signature, nothing to
  // revalidate yet.
  if (!rawBody) {
    console.log('[woocommerce-webhook] Verified empty ping payload (webhook activation test)', { topic, deliveryId });
    return NextResponse.json({ received: true, action: 'none (ping)' });
  }

  let payload: WooCommerceWebhookProduct;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error('[woocommerce-webhook] Verified signature but body is not valid JSON', { topic, deliveryId });
    return NextResponse.json({ received: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const tagsForTopic = topic ? TAG_BY_TOPIC[topic] : undefined;

  if (!tagsForTopic) {
    console.warn('[woocommerce-webhook] Verified delivery for an unhandled topic — no revalidation performed', { topic, deliveryId, productId: payload?.id });
    return NextResponse.json({ received: true, action: 'none (unhandled topic)' });
  }

  const tags = tagsForTopic(payload);
  tags.forEach((tag) => revalidateTag(tag, 'max'));

  console.log('[woocommerce-webhook] Revalidated cache tags', {
    topic,
    deliveryId,
    productId: payload.id,
    slug: payload.slug,
    tags,
  });

  return NextResponse.json({ received: true, action: 'revalidated', tags });
}
