import { wcClient } from './woocommerce/client';
import { Product } from '@/types/product';
import { WooCommerceProduct, WooCommerceCategory } from '@/types/woocommerce';
import { cache } from 'react';

// Helper to map WC product to our Product model
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
    stockStatus: wcProd.stock_status,
    weight: wcProd.weight || undefined,
    dimensions: wcProd.dimensions?.length ? wcProd.dimensions : undefined,
    isNewArrival: wcProd.featured,
    badgeType: wcProd.meta_data?.find((m: any) => m.key === 'badgeType')?.value || undefined,
    material: wcProd.meta_data?.find((m: any) => m.key === 'material')?.value || wcProd.attributes?.find((a: any) => a.name === 'Material')?.options[0] || '925 Sterling Silver',
    purity: wcProd.meta_data?.find((m: any) => m.key === 'purity')?.value || wcProd.attributes?.find((a: any) => a.name === 'Purity')?.options[0] || undefined,
    finish: wcProd.meta_data?.find((m: any) => m.key === 'finish')?.value || wcProd.attributes?.find((a: any) => a.name === 'Finish')?.options[0] || 'High-polish silver',
    stone: wcProd.meta_data?.find((m: any) => m.key === 'stone')?.value || wcProd.attributes?.find((a: any) => a.name === 'Stone')?.options[0] || undefined,
    occasionTags: wcProd.meta_data?.find((m: any) => m.key === 'occasionTags')?.value || [],
    averageRating: wcProd.average_rating,
    ratingCount: wcProd.rating_count,
    relatedIds: wcProd.related_ids || [],
    crossSellIds: wcProd.cross_sell_ids || [],
    upsellIds: wcProd.upsell_ids || [],
    type: wcProd.type,
    attributes: wcProd.attributes
      ?.filter((attr: any) => attr.variation)
      .map((attr: any) => ({
        name: attr.name,
        options: attr.options,
        variation: attr.variation,
      })),
  };
}

export const getProducts = cache(async (params?: string): Promise<Product[]> => {
  try {
    const queryString = params ? `&${params}` : '';
    const data = await wcClient.fetch<WooCommerceProduct[]>(`/products?status=publish${queryString}`);
    return data.map(mapWcProduct);
  } catch (error) {
    console.error("Failed to fetch products from WooCommerce", error);
    return [];
  }
});

export async function getProductsByCategory(frontendSlug: string): Promise<Product[]> {
  // Map frontend URL slugs to actual WooCommerce category slugs
  const slugMap: Record<string, string> = {
    'necklaces': 'neckpieces',
    'bracelets': 'bracelet-womens',
    'rings': 'ring',
    'anklets': 'anklet'
  };
  
  const categorySlug = slugMap[frontendSlug.toLowerCase()] || frontendSlug;

  try {
    // WooCommerce requires category ID for filtering, so first resolve the slug to an ID
    const categories = await wcClient.fetch<WooCommerceCategory[]>(`/products/categories?slug=${categorySlug}`);
    if (!categories || categories.length === 0) {
      return [];
    }
    
    const categoryId = categories[0].id;
    const data = await wcClient.fetch<WooCommerceProduct[]>(`/products?category=${categoryId}&status=publish`);
    return data.map(mapWcProduct);
  } catch (error) {
    console.error(`Failed to fetch products for category ${categorySlug} from WooCommerce`, error);
    return [];
  }
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  try {
    const data = await wcClient.fetch<WooCommerceProduct[]>(`/products?slug=${slug}&status=publish`);
    if (data.length > 0) {
      const product = mapWcProduct(data[0]);
      
      // Fetch variations if it's a variable product
      if (product.type === 'variable') {
        const variationsData = await wcClient.fetch<any[]>(`/products/${product.id}/variations?status=publish`);
        product.variations = variationsData.map((v: any) => ({
          id: v.id.toString(),
          price: parseFloat(v.price || '0'),
          regularPrice: v.regular_price ? parseFloat(v.regular_price) : undefined,
          salePrice: v.sale_price ? parseFloat(v.sale_price) : undefined,
          stockStatus: v.stock_status,
          stockQuantity: v.stock_quantity ?? null,
          image: v.image ? { id: v.image.id?.toString(), url: v.image.src, alt: v.image.alt } : undefined,
          attributes: v.attributes.reduce((acc: any, attr: any) => {
            acc[attr.name] = attr.option;
            return acc;
          }, {}),
        }));
      }

      return product;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch product ${slug} from WooCommerce`, error);
    return null;
  }
});

export const getProductsByIds = cache(async (ids: number[]): Promise<Product[]> => {
  if (!ids || ids.length === 0) return [];
  try {
    const data = await wcClient.fetch<WooCommerceProduct[]>(`/products?include=${ids.join(',')}&status=publish`);
    return data.map(mapWcProduct);
  } catch (error) {
    console.error(`Failed to fetch products by IDs from WooCommerce`, error);
    return [];
  }
});

export interface GetProductsParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string; // ID
  min_price?: string;
  max_price?: string;
  featured?: boolean;
  on_sale?: boolean;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'price' | 'title' | 'popularity' | 'rating';
  attribute?: string;
  attribute_term?: string;
  stock_status?: 'instock' | 'outofstock';
  new_arrivals?: boolean;
}

export interface PaginatedProductsResult {
  products: Product[];
  total: number;
  totalPages: number;
}

export async function getPaginatedProducts(params: GetProductsParams): Promise<PaginatedProductsResult> {
  try {
    const query = new URLSearchParams({ status: 'publish' });
    
    if (params.page) query.append('page', params.page.toString());
    if (params.per_page) query.append('per_page', params.per_page.toString());
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.min_price) query.append('min_price', params.min_price);
    if (params.max_price) query.append('max_price', params.max_price);
    if (params.featured) query.append('featured', 'true');
    if (params.on_sale) query.append('on_sale', 'true');
    if (params.order) query.append('order', params.order);
    if (params.orderby) query.append('orderby', params.orderby);
    if (params.attribute) query.append('attribute', params.attribute);
    if (params.attribute_term) query.append('attribute_term', params.attribute_term);
    if (params.stock_status) query.append('stock_status', params.stock_status);

    // If new_arrivals is toggled, append the New Arrivals category ID (550).
    // WooCommerce handles multiple comma-separated IDs or appends them.
    if (params.new_arrivals) {
      const currentCat = query.get('category');
      if (currentCat) {
        query.set('category', `${currentCat},550`);
      } else {
        query.set('category', '550');
      }
    }

    const { data, headers } = await wcClient.fetchWithHeaders<WooCommerceProduct[]>(`/products?${query.toString()}`);
    
    return {
      products: data.map(mapWcProduct),
      total: parseInt(headers.get('x-wp-total') || '0', 10),
      totalPages: parseInt(headers.get('x-wp-totalpages') || '1', 10),
    };
  } catch (error) {
    console.error("Failed to fetch paginated products from WooCommerce", error);
    return { products: [], total: 0, totalPages: 1 };
  }
}

/**
 * Fetch strict recommendations based on Category, Material, or Price proximity.
 */
export async function getRecommendations(
  product: Product,
  limit: number = 4,
  basis: 'category' | 'material' | 'price'
): Promise<Product[]> {
  try {
    let query = `per_page=${limit + 1}&status=publish`; // Fetch limit+1 to exclude current product

    if (basis === 'category' && product.categories.length > 0) {
      query += `&category=${product.categories[0].id}`;
    } else if (basis === 'material' && product.material) {
      query += `&attribute=material&attribute_term=${product.material}`;
    } else if (basis === 'price') {
      const min = Math.max(0, product.price * 0.7);
      const max = product.price * 1.3;
      query += `&min_price=${min}&max_price=${max}`;
      if (product.categories.length > 0) {
        query += `&category=${product.categories[0].id}`; // Constrain price proximity to same category
      }
    }

    const { data } = await wcClient.fetchWithHeaders<WooCommerceProduct[]>(`/products?${query}`);
    let results = data.map(mapWcProduct).filter(p => p.id !== product.id);
    
    // Fallback if strict criteria returns nothing
    if (results.length === 0 && product.categories.length > 0) {
      const fallbackData = await wcClient.fetch<WooCommerceProduct[]>(`/products?category=${product.categories[0].id}&status=publish&per_page=${limit + 1}`);
      results = fallbackData.map(mapWcProduct).filter(p => p.id !== product.id);
    }

    return results.slice(0, limit);
  } catch (error) {
    console.error(`Failed to fetch recommendations based on ${basis} for product ${product.id}`, error);
    return [];
  }
}

