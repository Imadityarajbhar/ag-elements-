import { wcClient } from './woocommerce/client';
import { Product } from '@/types/product';
import { WooCommerceProduct, WooCommerceCategory } from '@/types/woocommerce';
import { cache } from 'react';
import { SHOP_FILTERS } from '@/config/shop-filters';

// WooCommerce's `attribute_term` REST param expects a numeric term ID, but the
// values stored on Product (product.material/style/collection/stone) are the
// human-readable term NAME (e.g. "925 Sterling Silver") as returned by the
// products API's `attributes[].options[]`. Resolve name -> ID via the same
// term map the filter UI uses, falling back to the raw value if unresolved.
function resolveAttributeTermId(attributeKey: keyof typeof SHOP_FILTERS.attributes, termName: string): string {
  const terms = SHOP_FILTERS.attributes[attributeKey]?.terms as Record<string, number> | undefined;
  return terms?.[termName]?.toString() || termName;
}

// Helper to map WC product to our Product model
export function mapWcProduct(wcProd: WooCommerceProduct): Product {
  return {
    id: wcProd.id.toString(),
    name: wcProd.name,
    slug: wcProd.slug,
    price: parseFloat(wcProd.price || '0'),
    regularPrice: parseFloat(wcProd.regular_price || wcProd.price || '0'),
    salePrice: wcProd.sale_price ? parseFloat(wcProd.sale_price) : undefined,
    description: wcProd.description?.replace(/(<([^>]+)>)/gi, '') || '', // Strip HTML
    shortDescription: wcProd.short_description?.replace(/(<([^>]+)>)/gi, '') || undefined,
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
    stockStatus: wcProd.stock_status,
    stockQuantity: wcProd.stock_quantity ?? null,
    weight: wcProd.weight || undefined,
    dimensions: wcProd.dimensions?.length ? wcProd.dimensions : undefined,
    isNewArrival: wcProd.featured,
    badgeType: wcProd.meta_data?.find((m: any) => m.key === 'badgeType')?.value || undefined,
    material: wcProd.meta_data?.find((m: any) => m.key === 'material')?.value || wcProd.attributes?.find((a: any) => a.name === 'Material')?.options[0] || '925 Sterling Silver',
    purity: wcProd.meta_data?.find((m: any) => m.key === 'purity')?.value || wcProd.attributes?.find((a: any) => a.name === 'Purity')?.options[0] || undefined,
    finish: wcProd.meta_data?.find((m: any) => m.key === 'finish')?.value || wcProd.attributes?.find((a: any) => a.name === 'Finish')?.options[0] || 'High-polish silver',
    stone: wcProd.meta_data?.find((m: any) => m.key === 'stone')?.value || wcProd.attributes?.find((a: any) => a.name === 'Stone')?.options[0] || undefined,
    style: wcProd.attributes?.find((a: any) => a.name === 'Style')?.options[0] || undefined,
    collection: wcProd.attributes?.find((a: any) => a.name === 'Collection')?.options[0] || undefined,
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
    dateModified: wcProd.date_modified,
    seo: mapSeoMetaData(wcProd.meta_data),
  };
}

// Reads the Yoast-style SEO meta keys written during Phase 6 (_yoast_wpseo_*).
// No SEO plugin needs to be active — WooCommerce stores these as plain post meta.
function mapSeoMetaData(metaData?: { key: string; value: any }[]): Product['seo'] {
  if (!metaData || metaData.length === 0) return undefined;
  const get = (key: string) => {
    const entry = metaData.find((m) => m.key === key);
    return typeof entry?.value === 'string' && entry.value.trim() !== '' ? entry.value : undefined;
  };

  const seo = {
    title: get('_yoast_wpseo_title'),
    metaDescription: get('_yoast_wpseo_metadesc'),
    focusKeyword: get('_yoast_wpseo_focuskw'),
    ogTitle: get('_yoast_wpseo_opengraph-title'),
    ogDescription: get('_yoast_wpseo_opengraph-description'),
    twitterTitle: get('_yoast_wpseo_twitter-title'),
    twitterDescription: get('_yoast_wpseo_twitter-description'),
  };

  return Object.values(seo).some(Boolean) ? seo : undefined;
}

export const getProducts = cache(async (params?: string): Promise<Product[]> => {
  try {
    const queryString = params ? `&${params}` : '';
    const data = await wcClient.fetch<WooCommerceProduct[]>(`/products?status=publish${queryString}`, { next: { revalidate: 300, tags: ['products'] } });
    return data.map(mapWcProduct);
  } catch (error) {
    console.error("Failed to fetch products from WooCommerce", error);
    return [];
  }
});

export async function getProductsByCategory(frontendSlug: string): Promise<Product[]> {
  const categorySlug = frontendSlug.toLowerCase();

  try {
    // WooCommerce requires category ID for filtering, so first resolve the slug to an ID
    const categories = await wcClient.fetch<WooCommerceCategory[]>(`/products/categories?slug=${categorySlug}`);
    if (!categories || categories.length === 0) {
      return [];
    }
    
    const categoryId = categories[0].id;
    const data = await wcClient.fetch<WooCommerceProduct[]>(`/products?category=${categoryId}&status=publish`, { next: { revalidate: 300, tags: ['products', `category-${categorySlug}`] } });
    return data.map(mapWcProduct);
  } catch (error) {
    console.error(`Failed to fetch products for category ${categorySlug} from WooCommerce`, error);
    return [];
  }
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  try {
    const data = await wcClient.fetch<WooCommerceProduct[]>(`/products?slug=${slug}&status=publish`, { next: { revalidate: 60, tags: ['product', `product-${slug}`] } });
    if (data.length > 0) {
      const product = mapWcProduct(data[0]);
      
      // Fetch variations if it's a variable product
      if (product.type === 'variable') {
        const variationsData = await wcClient.fetch<any[]>(`/products/${product.id}/variations?status=publish`, { next: { revalidate: 60, tags: [`variations-${product.id}`] } });
        product.variations = variationsData.map((v: any) => ({
          id: v.id.toString(),
          price: parseFloat(v.price || '0'),
          regularPrice: v.regular_price ? parseFloat(v.regular_price) : undefined,
          salePrice: v.sale_price ? parseFloat(v.sale_price) : undefined,
          stockStatus: v.stock_status,
          stockQuantity: v.stock_quantity ?? null,
          image: v.image ? { id: v.image.id?.toString(), src: v.image.src, alt: v.image.alt } : undefined,
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
    const data = await wcClient.fetch<WooCommerceProduct[]>(`/products?include=${ids.join(',')}&status=publish`, { next: { revalidate: 300, tags: ['products', `products-by-id`] } });
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

    // "New Arrivals" is defined as products created in the last 30 days via WC's
    // native `after` param — a stable, evergreen signal, unlike a hardcoded
    // "New Arrivals" category ID, which drifts as categories are added/removed in WC.
    if (params.new_arrivals) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.append('after', thirtyDaysAgo.toISOString());
      if (!params.orderby) query.set('orderby', 'date');
      if (!params.order) query.set('order', 'desc');
    }

    const { data, headers } = await wcClient.fetchWithHeaders<WooCommerceProduct[]>(`/products?${query.toString()}`, { next: { revalidate: 300, tags: ['products'] } });
    
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
 * Fetches slug + last-modified for every published product, paginating through
 * the full catalog (not capped at one page) for use in sitemap generation.
 * Uses _fields to keep the payload small since only two fields are needed.
 */
export async function getAllProductsForSitemap(): Promise<{ slug: string; dateModified: string }[]> {
  const results: { slug: string; dateModified: string }[] = [];
  const perPage = 100;
  let page = 1;
  let totalPages = 1;

  try {
    do {
      const { data, headers } = await wcClient.fetchWithHeaders<Pick<WooCommerceProduct, 'slug' | 'date_modified'>[]>(
        `/products?status=publish&per_page=${perPage}&page=${page}&_fields=slug,date_modified`,
        { next: { revalidate: 3600, tags: ['products'] } }
      );
      totalPages = parseInt(headers.get('x-wp-totalpages') || '1', 10);
      results.push(...data.map((p) => ({ slug: p.slug, dateModified: p.date_modified })));
      page += 1;
    } while (page <= totalPages);
  } catch (error) {
    console.error('Failed to fetch products for sitemap', error);
  }

  return results;
}

/**
 * Fetch strict recommendations based on Category, Material, or Price proximity.
 */
export async function getRecommendations(
  product: Product,
  limit: number = 4,
  basis: 'category' | 'material' | 'price' | 'collection' | 'style' | 'stone'
): Promise<Product[]> {
  try {
    let query = `per_page=${limit + 1}&status=publish`; // Fetch limit+1 to exclude current product

    if (basis === 'category' && product.categories.length > 0) {
      query += `&category=${product.categories[0].id}`;
    } else if (basis === 'material' && product.material) {
      query += `&attribute=pa_material&attribute_term=${resolveAttributeTermId('pa_material', product.material)}`;
    } else if (basis === 'collection' && product.collection) {
      query += `&attribute=pa_collection&attribute_term=${resolveAttributeTermId('pa_collection', product.collection)}`;
    } else if (basis === 'style' && product.style) {
      query += `&attribute=pa_style&attribute_term=${resolveAttributeTermId('pa_style', product.style)}`;
    } else if (basis === 'stone' && product.stone) {
      query += `&attribute=pa_stone&attribute_term=${resolveAttributeTermId('pa_stone', product.stone)}`;
    } else if (basis === 'price') {
      const min = Math.max(0, product.price * 0.7);
      const max = product.price * 1.3;
      query += `&min_price=${min}&max_price=${max}`;
      if (product.categories.length > 0) {
        query += `&category=${product.categories[0].id}`; // Constrain price proximity to same category
      }
    }

    const { data } = await wcClient.fetchWithHeaders<WooCommerceProduct[]>(`/products?${query}`, { next: { revalidate: 300, tags: ['products'] } });
    let results = data.map(mapWcProduct).filter(p => p.id !== product.id);
    
    // Fallback if strict criteria returns nothing
    if (results.length === 0 && product.categories.length > 0) {
      const fallbackData = await wcClient.fetch<WooCommerceProduct[]>(`/products?category=${product.categories[0].id}&status=publish&per_page=${limit + 1}`, { next: { revalidate: 300, tags: ['products'] } });
      results = fallbackData.map(mapWcProduct).filter(p => p.id !== product.id);
    }

    return results.slice(0, limit);
  } catch (error) {
    console.error(`Failed to fetch recommendations based on ${basis} for product ${product.id}`, error);
    return [];
  }
}

/**
 * "Intelligent" related products: cascades through same Collection -> same
 * Category -> same Style -> same Material -> same Stone, merging unique
 * results in that priority order, falling back to newest products if the
 * product has none of those attributes set or all cascades come up short.
 */
export async function getRelatedProducts(product: Product, limit: number = 8): Promise<Product[]> {
  const seen = new Set<string>([product.id]);
  const merged: Product[] = [];

  const bases: Array<'collection' | 'category' | 'style' | 'material' | 'stone'> = [
    'collection', 'category', 'style', 'material', 'stone',
  ];

  for (const basis of bases) {
    if (merged.length >= limit) break;
    const batch = await getRecommendations(product, limit, basis);
    for (const p of batch) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        merged.push(p);
      }
    }
  }

  if (merged.length < limit) {
    const newest = await getNewArrivals(limit);
    for (const p of newest) {
      if (merged.length >= limit) break;
      if (!seen.has(p.id)) {
        seen.add(p.id);
        merged.push(p);
      }
    }
  }

  return merged.slice(0, limit);
}

/** Sitewide trending products, ranked by WooCommerce's own popularity (total sales). */
export async function getTrendingProducts(limit: number = 8): Promise<Product[]> {
  try {
    const data = await wcClient.fetch<WooCommerceProduct[]>(
      `/products?status=publish&per_page=${limit}&orderby=popularity&order=desc`,
      { next: { revalidate: 300, tags: ['products'] } }
    );
    return data.map(mapWcProduct);
  } catch (error) {
    console.error('Failed to fetch trending products', error);
    return [];
  }
}

/** Most recently published products, newest first — a real freshness signal, not a category flag. */
export async function getNewArrivals(limit: number = 8): Promise<Product[]> {
  try {
    const data = await wcClient.fetch<WooCommerceProduct[]>(
      `/products?status=publish&per_page=${limit}&orderby=date&order=desc`,
      { next: { revalidate: 300, tags: ['products'] } }
    );
    return data.map(mapWcProduct);
  } catch (error) {
    console.error('Failed to fetch new arrivals', error);
    return [];
  }
}

