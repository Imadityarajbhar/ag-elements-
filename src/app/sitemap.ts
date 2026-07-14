import { MetadataRoute } from 'next';
import { getProducts } from '@/services/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agelements.example.com';

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/shipping-returns`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/gifting`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/gifting/finder`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/gifting/gift-cards`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // 2. Collection Routes
  const collections = ['necklaces', 'rings', 'earrings', 'bracelets', 'sets'];
  const collectionRoutes: MetadataRoute.Sitemap = collections.map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Product Routes
  // Note: For a very large catalog, this should be paginated or optimized.
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts('per_page=100'); // Fetch up to 100 products for demo
    productRoutes = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
