import { wcClient } from './woocommerce/client';
import { Product } from '@/types/product';
import { WooCommerceProduct, WooCommerceCategory, WooCommerceTag } from '@/types/woocommerce';

// Note: Re-using the mapper from products.ts to ensure identical formatting
function mapWcProduct(wcProd: WooCommerceProduct): Product {
  return {
    id: wcProd.id.toString(),
    name: wcProd.name,
    slug: wcProd.slug,
    price: parseFloat(wcProd.price || '0'),
    regularPrice: wcProd.regular_price ? parseFloat(wcProd.regular_price) : undefined,
    salePrice: wcProd.sale_price ? parseFloat(wcProd.sale_price) : undefined,
    description: wcProd.description?.replace(/(<([^>]+)>)/gi, '') || '', // Strip HTML
    sku: wcProd.sku || '',
    images: wcProd.images && wcProd.images.length > 0 
      ? wcProd.images.map((img: any) => ({
          id: img.id?.toString() || Math.random().toString(),
          url: img.src,
          alt: img.alt || wcProd.name,
        }))
      : [{
          id: 'fallback',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUJcDFZ4gfxtgf5QZ4A3vCMYjs1GNnlSvqwfSOFoUudjcqTEFGwyItsyiomIUMhVYrv8zbpUSghtF9q1KKoc05XwxQFeuo5Sjas05jBNlpzK487FACTxY_qeNUFAxWuMANmTPUhuZSFcUoWkUrCE8DKXvnxlU6TKwOq6yoSV1S_2mqi8HMXJZHR8FFCCoouBwu5a_a9ZmgvYm_LiGhKoM5OZGcuA2XONxOC-52soC1NTKIGl--7f8k3w',
          alt: wcProd.name,
        }],
    categories: wcProd.categories?.map((cat: any) => ({
      id: cat.id.toString(),
      name: cat.name,
      slug: cat.slug,
    })) || [],
    inStock: wcProd.stock_status === 'instock',
    isNewArrival: wcProd.featured,
    badgeType: wcProd.meta_data?.find((m: any) => m.key === 'badgeType')?.value || undefined,
    material: wcProd.meta_data?.find((m: any) => m.key === 'material')?.value || 'Sterling Silver 925',
    occasionTags: wcProd.meta_data?.find((m: any) => m.key === 'occasionTags')?.value || [],
    relatedIds: wcProd.related_ids || [],
  };
}

export interface SearchSuggestions {
  products: Product[];
  categories: WooCommerceCategory[];
  tags: WooCommerceTag[];
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestions> {
  if (!query || query.trim() === '') {
    return { products: [], categories: [], tags: [] };
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
    
    const mergedProducts = Array.from(productMap.values())
      .slice(0, 6) // Return maximum 6 products overall
      .map(mapWcProduct);

    return {
      products: mergedProducts,
      categories: categoriesRes || [],
      tags: tagsRes || []
    };
  } catch (error) {
    console.error("Failed to fetch search suggestions", error);
    return { products: [], categories: [], tags: [] };
  }
}
