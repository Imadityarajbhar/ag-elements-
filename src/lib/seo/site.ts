/**
 * Single source of truth for site-wide identity used by metadata and
 * structured data. NEXT_PUBLIC_SITE_URL must be the real production origin
 * (no trailing slash) — every canonical, OG, JSON-LD, sitemap and robots URL
 * derives from it.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://agelements.in').replace(/\/$/, '');

export const siteConfig = {
  name: 'AG Elements',
  shortName: 'AG Elements',
  description:
    'AG Elements is a premium headless storefront for handcrafted 925 sterling silver jewelry — necklaces, earrings, rings, bangles and more, rooted in the silversmithing heritage of Wardha.',
  url: SITE_URL,
  ogImage: `${SITE_URL}/brand/og-image.jpg`,
  locale: 'en_IN',
  phone: '+91-9876543210',
  social: {
    instagram: 'https://instagram.com/agelements',
    facebook: 'https://facebook.com/agelements',
  },
};

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
