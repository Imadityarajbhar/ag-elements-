import { Metadata } from 'next';
import { siteConfig, absoluteUrl } from './site';

interface SEOProps {
  title?: string;
  description?: string;
  /** Absolute or root-relative image URL. Defaults to the site OG image. */
  image?: string;
  /** Root-relative path (e.g. "/product/silver-ring") used to build canonical + OG url. */
  path?: string;
  keywords?: string[];
  /** Open Graph type. Next's OpenGraph type union doesn't include "product", so
   * product pages pass "website" and carry price/availability via JSON-LD instead. */
  type?: 'website' | 'article';
  noIndex?: boolean;
}

export const generateMetadata = ({
  title,
  description,
  image,
  path,
  keywords,
  type = 'website',
  noIndex = false,
}: SEOProps): Metadata => {
  // WooCommerce-authored SEO titles (Phase 6 _yoast_wpseo_title data) already end
  // with "| AG Elements", while some hardcoded frontend titles lead with it
  // instead (e.g. "AG Elements | Timeless Elegance") — check anywhere in the
  // string, not just as a suffix, to avoid double-branding either pattern.
  const alreadyBranded = title && title.toLowerCase().includes(siteConfig.name.toLowerCase());
  const resolvedTitle = title
    ? alreadyBranded
      ? title
      : `${title} | ${siteConfig.name}`
    : `${siteConfig.name} | Luxury Sterling Silver Jewelry`;
  const resolvedDescription = description || siteConfig.description;
  const canonicalUrl = path ? absoluteUrl(path) : siteConfig.url;
  const resolvedImage = image ? absoluteUrl(image) : siteConfig.ogImage;

  return {
    metadataBase: new URL(siteConfig.url),
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type,
      url: canonicalUrl,
      title: resolvedTitle,
      description: resolvedDescription,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [resolvedImage],
    },
  };
};
