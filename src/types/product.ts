export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  description: string;
  shortDescription?: string;
  images: { id: string; url: string; alt: string }[];
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
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
  averageRating?: string;
  ratingCount?: number;
  relatedIds?: number[];
  crossSellIds?: number[];
  upsellIds?: number[];
}
