import { Product } from '@/types/product';
import { siteConfig, absoluteUrl } from './site';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl('/brand/logo.png'),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.phone,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: 'English',
    },
    sameAs: Object.values(siteConfig.social),
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function availabilityToSchema(stockStatus?: string): string {
  switch (stockStatus) {
    case 'outofstock':
      return 'https://schema.org/OutOfStock';
    case 'onbackorder':
      return 'https://schema.org/BackOrder';
    default:
      return 'https://schema.org/InStock';
  }
}

/** Never fabricates ratings/reviews — aggregateRating is included only when the
 * product actually has WooCommerce review data. */
export function buildProductSchema(product: Product) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const images = product.images.length > 0 ? product.images.map((img) => img.src) : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(images ? { image: images } : {}),
    description: product.shortDescription || product.description,
    sku: product.sku || undefined,
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
    category: product.categories[0]?.name,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'INR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: availabilityToSchema(product.stockStatus),
    },
    ...(product.averageRating && product.ratingCount && product.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating,
            reviewCount: product.ratingCount,
          },
        }
      : {}),
  };
}

/** ItemList for a category/collection grid — links to the real products shown,
 * never a fabricated or padded list. */
export function buildCollectionItemListSchema(collectionName: string, products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collectionName,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/product/${product.slug}`),
        name: product.name,
      })),
    },
  };
}
