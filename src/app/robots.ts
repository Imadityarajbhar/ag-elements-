import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/account', '/checkout', '/cart', '/api', '/favorites', '/track-order',
        // Faceted-navigation crawl waste, not SEO landing pages: /shop and
        // /collections/[slug] (src/app/shop/page.tsx, src/app/collections/
        // [slug]/page.tsx) both accept page/search/min_price/max_price/
        // featured/on_sale/order/orderby/stock_status/new_arrivals and 7
        // attribute-taxonomy params (pa_gender, pa_material, pa_collection,
        // pa_stone, pa_occasion, pa_finish, pa_style) purely as filtering
        // UI state — every combination is a content duplicate of the base
        // page and already self-canonicalizes back to the clean URL (see
        // generateMetadata()'s `path` argument on both pages, which never
        // includes the query string). Blocking the query-string variants
        // here stops crawlers from fetching the combinatorial filter space
        // at all, rather than relying on canonical tags to de-index it
        // after the fact. The bare, unfiltered pages — /shop,
        // /collections/[slug], and every real product at /product/[slug] —
        // stay fully crawlable and are the URLs actually listed in
        // sitemap.xml (see src/app/sitemap.ts).
        '/shop?*', '/collections/*?*',
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
