import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * On-demand cache invalidation for the tag-based fetch cache used throughout
 * src/services (tags: 'products', 'product-{slug}', 'category-{slug}', etc).
 * Call this from a WooCommerce webhook (product.updated/product.created) once
 * one is configured, or trigger it manually after editing a product.
 *
 * POST /api/revalidate
 * Headers: x-revalidate-secret: <REVALIDATE_SECRET>
 * Body: { "tags"?: string[], "paths"?: string[] }
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-revalidate-secret');
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ revalidated: false, message: 'Invalid or missing secret' }, { status: 401 });
  }

  let body: { tags?: string[]; paths?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ revalidated: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const tags = body.tags && body.tags.length > 0 ? body.tags : ['products'];
  const paths = body.paths || [];

  // "max" profile forces immediate expiration (equivalent to the pre-Next-16
  // single-argument revalidateTag behavior) rather than deferring to a cache-life config.
  tags.forEach((tag) => revalidateTag(tag, 'max'));
  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({ revalidated: true, tags, paths, now: Date.now() });
}
