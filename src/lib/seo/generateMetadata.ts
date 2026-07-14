import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const siteConfig = {
  name: 'AG Elements',
  description: 'Premium luxury jewelry.',
  url: 'https://agelements.example.com',
  ogImage: '/brand/og-image.jpg',
};

export const generateMetadata = ({
  title,
  description,
  image,
  url,
}: SEOProps): Metadata => {
  const currentUrl = url || siteConfig.url;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url),
    title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
    description: description || siteConfig.description,
    alternates: {
      canonical: currentUrl,
    },
    openGraph: {
      type: 'website',
      url: currentUrl,
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: image || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || siteConfig.name,
      description: description || siteConfig.description,
      images: [image || siteConfig.ogImage],
    },
  };
};
