import { NextResponse } from 'next/server';
import { wcClient } from '@/services/woocommerce/client';
import { WooCommerceProduct, WooCommerceCategory, WooCommerceTag } from '@/types/woocommerce';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim() === '') {
    return NextResponse.json({ products: [], categories: [], tags: [] });
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    
    // We run the requests in parallel for maximum speed
    const [productsRes, skuProductsRes, categoriesRes, tagsRes] = await Promise.all([
      // Search by title/description
      wcClient.fetch<WooCommerceProduct[]>(`/products?search=${encodedQuery}&per_page=5&status=publish`).catch(() => []),
      // Search specifically by SKU
      wcClient.fetch<WooCommerceProduct[]>(`/products?sku=${encodedQuery}&per_page=5&status=publish`).catch(() => []),
      // Search Categories
      wcClient.fetch<WooCommerceCategory[]>(`/products/categories?search=${encodedQuery}&per_page=3`).catch(() => []),
      // Search Tags
      wcClient.fetch<WooCommerceTag[]>(`/products/tags?search=${encodedQuery}&per_page=3`).catch(() => []),
    ]);

    // Merge and deduplicate products (SKU matches + Title/Content matches)
    const productMap = new Map<number, WooCommerceProduct>();
    
    skuProductsRes.forEach(p => productMap.set(p.id, p));
    productsRes.forEach(p => productMap.set(p.id, p));
    
    const mergedProducts = Array.from(productMap.values()).slice(0, 6);

    return NextResponse.json({
      products: mergedProducts,
      categories: categoriesRes || [],
      tags: tagsRes || []
    });
  } catch (error) {
    console.error("Failed to fetch search suggestions from WooCommerce", error);
    return NextResponse.json({ products: [], categories: [], tags: [] }, { status: 500 });
  }
}
