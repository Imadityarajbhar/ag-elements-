import { Product } from '@/types/product';
import { WooCommerceCategory, WooCommerceTag } from '@/types/woocommerce';
import { mapWcProduct } from '@/services/products';

export interface SearchSuggestions {
  products: Product[];
  categories: WooCommerceCategory[];
  tags: WooCommerceTag[];
  /** Populated only when there were zero direct matches — currently-trending products, never fabricated. */
  suggestions: Product[];
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestions> {
  if (!query || query.trim() === '') {
    return { products: [], categories: [], tags: [], suggestions: [] };
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());

    // Fetch from our Next.js API proxy to keep WooCommerce credentials safe on the server
    const response = await fetch(`/api/products/search?q=${encodedQuery}`);

    if (!response.ok) {
      throw new Error(`Search API failed with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      products: (data.products || []).map(mapWcProduct),
      categories: data.categories || [],
      tags: data.tags || [],
      suggestions: (data.suggestions || []).map(mapWcProduct),
    };
  } catch (error) {
    console.error("Failed to fetch search suggestions", error);
    return { products: [], categories: [], tags: [], suggestions: [] };
  }
}
