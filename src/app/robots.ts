import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account', '/checkout', '/cart', '/api', '/favorites', '/track-order'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
