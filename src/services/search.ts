import { Product } from '@/types/product';
import { WooCommerceCategory, WooCommerceTag, WooCommerceProduct } from '@/types/woocommerce';

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
          src: img.src,
          alt: img.alt || wcProd.name,
        }))
      : [{
          id: 'fallback',
          src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUJcDFZ4gfxtgf5QZ4A3vCMYjs1GNnlSvqwfSOFoUudjcqTEFGwyItsyiomIUMhVYrv8zbpUSghtF9q1KKoc05XwxQFeuo5Sjas05jBNlpzK487FACTxY_qeNUFAxWuMANmTPUhuZSFcUoWkUrCE8DKXvnxlU6TKwOq6yoSV1S_2mqi8HMXJZHR8FFCCoouBwu5a_a9ZmgvYm_LiGhKoM5OZGcuA2XONxOC-52soC1NTKIGl--7f8k3w',
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
    
    // Fetch from our Next.js API proxy to keep WooCommerce credentials safe on the server
    const response = await fetch(`/api/products/search?q=${encodedQuery}`);
    
    if (!response.ok) {
      throw new Error(`Search API failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Map WooCommerce products to our frontend Product type
    const mappedProducts = (data.products || []).map(mapWcProduct);

    return {
      products: mappedProducts,
      categories: data.categories || [],
      tags: data.tags || []
    };
  } catch (error) {
    console.error("Failed to fetch search suggestions", error);
    return { products: [], categories: [], tags: [] };
  }
}
