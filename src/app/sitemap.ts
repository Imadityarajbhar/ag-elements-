import { MetadataRoute } from 'next';
import { getAllProductsForSitemap } from '@/services/products';
import { COLLECTION_CONFIG } from '@/config/collections';
import { siteConfig } from '@/lib/seo/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/shipping-returns`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/gifting`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/gifting/finder`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/gifting/gift-cards`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ];

  // 2. Collection Routes
  const collectionRoutes: MetadataRoute.Sitemap = Object.keys(COLLECTION_CONFIG).map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Product Routes — full catalog, paginated (no cap), using each product's
  // real WooCommerce date_modified as the freshness signal.
  const products = await getAllProductsForSitemap();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.dateModified ? new Date(product.dateModified) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
