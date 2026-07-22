export interface ProductVariation {
  id: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  stockQuantity: number | null;
  image?: { id: string; src: string; alt: string };
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  type?: 'simple' | 'variable' | 'grouped' | 'external';
  price: number;
  regularPrice?: number;
  salePrice?: number;
  description: string;
  shortDescription?: string;
  images: { id: string; src: string; alt: string }[];
  categories: { id: string; name: string; slug: string }[];
  inStock: boolean;
  sku: string;
  isNewArrival?: boolean;
  badgeType?: 'sale' | 'new' | 'bestseller' | 'trending';
  material?: string;
  occasionTags?: string[];
  weight?: string;
  dimensions?: { length: string; width: string; height: string };
  purity?: string;
  finish?: string;
  stone?: string;
  style?: string;
  collection?: string;
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
  stockQuantity?: number | null;
  averageRating?: string;
  ratingCount?: number;
  relatedIds?: number[];
  crossSellIds?: number[];
  upsellIds?: number[];
  attributes?: { name: string; options: string[]; variation: boolean }[];
  variations?: ProductVariation[];
  dateModified?: string;
  /** WooCommerce-authored SEO overrides (Yoast-style meta_data), used to prefer
   * editor-set metadata over frontend-generated fallbacks when present. */
  seo?: {
    title?: string;
    metaDescription?: string;
    focusKeyword?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterTitle?: string;
    twitterDescription?: string;
  };
}
