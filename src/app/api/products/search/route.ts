import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { wcClient } from '@/services/woocommerce/client';
import { WooCommerceProduct, WooCommerceCategory, WooCommerceTag } from '@/types/woocommerce';
import { normalizeQuery, stripS, searchSynonyms } from '@/lib/search';

const getCachedCategories = unstable_cache(
  async () => {
    return wcClient.fetch<WooCommerceCategory[]>('/products/categories?per_page=100').catch(() => []);
  },
  ['wc-categories-search'],
  { revalidate: 3600 } // Cache for 1 hour
);

const getCachedTags = unstable_cache(
  async () => {
    return wcClient.fetch<WooCommerceTag[]>('/products/tags?per_page=100').catch(() => []);
  },
  ['wc-tags-search'],
  { revalidate: 3600 }
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim() === '') {
    return NextResponse.json({ products: [], categories: [], tags: [] });
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const normalizedQuery = normalizeQuery(query);
    const synonym = searchSynonyms[normalizedQuery] || normalizedQuery;
    
    // Fetch cached categories and tags first (0ms)
    const [allCategories, allTags] = await Promise.all([
      getCachedCategories(),
      getCachedTags(),
    ]);

    // Filter all matching categories
    const matchedCategories = allCategories.filter(c => {
      const cName = normalizeQuery(c.name);
      const cSlug = normalizeQuery(c.slug);
      const q = synonym;
      
      return cName === q || cSlug === q || stripS(cName) === stripS(q);
    });

    // Sort categories: populated > empty, then exact > stemmed, then higher count
    const sortedCategories = matchedCategories.sort((a, b) => {
      // 1. Prefer populated over empty
      const aPopulated = (a.count || 0) > 0 ? 1 : 0;
      const bPopulated = (b.count || 0) > 0 ? 1 : 0;
      if (aPopulated !== bPopulated) return bPopulated - aPopulated;

      // 2. Prefer exact match over stemmed
      const aName = normalizeQuery(a.name);
      const aSlug = normalizeQuery(a.slug);
      const bName = normalizeQuery(b.name);
      const bSlug = normalizeQuery(b.slug);
      
      const aExact = aName === synonym || aSlug === synonym ? 1 : 0;
      const bExact = bName === synonym || bSlug === synonym ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;

      // 3. Fallback to higher count
      return (b.count || 0) - (a.count || 0);
    });

    const exactCategory = sortedCategories[0];

    // Only use category routing if the category actually has products
    const validCategory = exactCategory && (exactCategory.count || 0) > 0 ? exactCategory : null;

    // If an exact category matches the search term AND has products, fetch products from that category.
    // Otherwise, perform a standard text search.
    const productsPromise = validCategory
      ? wcClient.fetch<WooCommerceProduct[]>(`/products?category=${validCategory.id}&per_page=6&status=publish`).catch(() => [])
      : wcClient.fetch<WooCommerceProduct[]>(`/products?search=${encodedQuery}&per_page=6&status=publish`).catch(() => []);

    const productsRes = await productsPromise;

    // Local filtering for lightning-fast category/tag results
    const categoriesRes = allCategories
      .filter(c => c.name.toLowerCase().includes(synonym))
      .slice(0, 3);
      
    const tagsRes = allTags
      .filter(t => t.name.toLowerCase().includes(synonym))
      .slice(0, 3);

    // Sort products: Exact matches > Partial matches
    const sortedProducts = productsRes.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      const aExact = aName === synonym ? 1 : 0;
      const bExact = bName === synonym ? 1 : 0;
      
      if (aExact !== bExact) return bExact - aExact;
      
      // If neither or both are exact, prefer startsWith
      const aStarts = aName.startsWith(synonym) ? 1 : 0;
      const bStarts = bName.startsWith(synonym) ? 1 : 0;
      
      if (aStarts !== bStarts) return bStarts - aStarts;

      // Prefer products where the title simply includes the query (vs just description matching)
      const aIncludes = aName.includes(synonym) ? 1 : 0;
      const bIncludes = bName.includes(synonym) ? 1 : 0;
      
      return bIncludes - aIncludes;
    });

    return NextResponse.json({
      products: sortedProducts,
      categories: categoriesRes,
      tags: tagsRes
    });
  } catch (error: any) {
    console.error("Failed to fetch search suggestions", error);
    try {
      require('fs').appendFileSync('search-error.log', error.stack + '\n');
    } catch(e) {}
    return NextResponse.json({ products: [], categories: [], tags: [] }, { status: 500 });
  }
}
