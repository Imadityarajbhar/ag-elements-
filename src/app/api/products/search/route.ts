import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { wcClient } from '@/services/woocommerce/client';
import { WooCommerceProduct, WooCommerceCategory, WooCommerceTag } from '@/types/woocommerce';
import { normalizeQuery, stripS, searchSynonyms } from '@/lib/search';
import { COLLECTION_MAP } from '@/config/collections';

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

    // Match category/tag slugs allowing simple singular/plural variance (e.g. a
    // search for "ring" must still match the "rings" category) — stripS-normalized
    // comparison, mirroring the same stemming already used client-side in
    // SearchOverlay's handleSeeAll, which this route-level match was missing.
    const matchesTerm = (candidate: string) => stripS(candidate.toLowerCase()) === stripS(synonym);

    // Filter all matching categories.
    // Also require the slug to have a real frontend collection page — a WooCommerce
    // category can exist and have products (e.g. "office", "party") without ever
    // being wired up as a navigable /collections/* route, and routing a search there
    // would 404.
    const matchedCategories = allCategories.filter(c => matchesTerm(c.slug) && COLLECTION_MAP[c.slug.toLowerCase()] !== undefined);

    // Sort categories: populated > empty, then higher count
    const sortedCategories = matchedCategories.sort((a, b) => {
      // 1. Prefer populated over empty
      const aPopulated = (a.count || 0) > 0 ? 1 : 0;
      const bPopulated = (b.count || 0) > 0 ? 1 : 0;
      if (aPopulated !== bPopulated) return bPopulated - aPopulated;

      // 2. Fallback to higher count
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

    // Local filtering for lightning-fast category/tag results (only categories
    // with a real collection page — see matchedCategories above)
    const categoriesRes = allCategories
      .filter(c => matchesTerm(c.slug) && COLLECTION_MAP[c.slug.toLowerCase()] !== undefined)
      .slice(0, 3);

    const tagsRes = allTags
      .filter(t => matchesTerm(t.slug))
      .slice(0, 3);

    // Relevance score per the requested priority: exact name > prefix match >
    // collection > tags > category > attributes (material/stone/gender/style/
    // occasion) > description. Applied uniformly whether the product came from
    // the category-routed fetch or the generic WC `?search=` fallback.
    const scoreProduct = (p: WooCommerceProduct): number => {
      const name = p.name.toLowerCase();
      if (name === synonym) return 1000;
      if (name.startsWith(synonym)) return 900;
      if (name.includes(synonym)) return 800;

      const attrMatches = (attrName: string) =>
        p.attributes?.some((a) => a.name.toLowerCase() === attrName && a.options.some((o) => o.toLowerCase().includes(synonym)));

      if (attrMatches('collection')) return 700;
      // WC's generic ?search= already matches tag/category text server-side, so we
      // can't independently confirm a tag hit here without another round-trip —
      // approximate via category name, which we do have on the product payload.
      if (p.categories?.some((c) => c.name.toLowerCase().includes(synonym) || c.slug.toLowerCase().includes(synonym))) return 500;
      if (['material', 'stone', 'gender', 'style', 'occasion', 'finish'].some((attrName) => attrMatches(attrName))) return 400;
      if (p.description?.toLowerCase().includes(synonym) || p.short_description?.toLowerCase().includes(synonym)) return 300;
      return 100;
    };

    const sortedProducts = [...productsRes].sort((a, b) => scoreProduct(b) - scoreProduct(a));

    // No direct results: surface trending products as "you might like" suggestions
    // rather than a dead end — never fabricated, always real, currently-popular products.
    let suggestions: WooCommerceProduct[] = [];
    if (sortedProducts.length === 0 && categoriesRes.length === 0 && tagsRes.length === 0) {
      suggestions = await wcClient
        .fetch<WooCommerceProduct[]>('/products?status=publish&per_page=4&orderby=popularity&order=desc')
        .catch(() => []);
    }

    return NextResponse.json({
      products: sortedProducts,
      categories: categoriesRes,
      tags: tagsRes,
      suggestions,
    });
  } catch (error: any) {
    console.error("Failed to fetch search suggestions", error);
    return NextResponse.json({ products: [], categories: [], tags: [], suggestions: [] }, { status: 500 });
  }
}
