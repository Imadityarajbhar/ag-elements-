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
  // Confirmed real, monitored inbox. Previously the site showed two different,
  // unconfirmed addresses (concierge@agelements.com on /contact and /faq, hello@agelements.in
  // in the footer) — neither was verified as real, so both are now this one address.
  email: 'agelementsindia@gmail.com',
  // Confirmed real business contact number. Structured data (schema.ts) previously
  // pointed at a distinct, never-verified placeholder (+91-9876543210); /contact and
  // /faq previously printed a different, also-unverified landline number.
  phone: '+91 82618 87054',
  // Single source of truth for the WhatsApp entry point used by the floating button,
  // footer, and product page — previously each of those hardcoded its own number
  // (two used the same unverified placeholder, the footer's was a literal 91XXXXXXXXXX
  // that could never open a chat). Same confirmed real number as `phone` above.
  whatsappNumber: '+918261887054',
  // Confirmed real accounts only — Pinterest/YouTube/LinkedIn are intentionally not
  // part of this brand's presence, so there's no icon or field for them anywhere.
  social: {
    instagram: 'https://www.instagram.com/agelements_sterlingsilver/',
    facebook: 'https://www.facebook.com/profile.php?id=61560825937238#',
  },
  // Single source of truth for the studio address, used by /contact and the footer so
  // the printed address and the Google Maps deep link can never drift apart.
  address: 'Shriram Govind Kathane, C/O Sarafa Line, opp. Balaji Mandir, Kapada Line, Mahadevpura, Nagpur, Wardha, Maharashtra 442001',
};

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
