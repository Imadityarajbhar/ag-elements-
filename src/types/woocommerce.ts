export interface WooCommerceImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WooCommerceTag {
  id: number;
  name: string;
  slug: string;
}

export interface WooCommerceMetaData {
  id: number;
  key: string;
  value: any;
}

export interface WooCommerceAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  status: 'draft' | 'pending' | 'private' | 'publish';
  featured: boolean;
  catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden';
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  on_sale: boolean;
  purchasable: boolean;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  average_rating: string;
  rating_count: number;
  related_ids?: number[];
  cross_sell_ids?: number[];
  upsell_ids?: number[];
  categories: WooCommerceCategory[];
  images: WooCommerceImage[];
  meta_data: WooCommerceMetaData[];
  attributes: WooCommerceAttribute[];
}

export interface WooCommerceOrderLineItem {
  product_id: number;
  quantity: number;
  variation_id?: number;
}

export interface WooCommerceOrderBilling {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface WooCommerceOrderShipping {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface WooCommerceOrderShippingLine {
  method_id: string;
  method_title: string;
  total: string;
}

export interface WooCommerceOrderPayload {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  billing: WooCommerceOrderBilling;
  shipping: WooCommerceOrderShipping;
  line_items: WooCommerceOrderLineItem[];
  customer_note?: string;
  meta_data?: Array<{ key: string; value: string }>;
  coupon_lines?: Array<{ code: string }>;
  shipping_lines?: WooCommerceOrderShippingLine[];
}

export interface WooCommerceReview {
  id: number;
  date_created: string;
  product_id: number;
  status: 'approved' | 'hold' | 'spam' | 'unspam' | 'trash' | 'untrash';
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
  reviewer_avatar_urls: {
    '24': string;
    '48': string;
    '96': string;
  };
}

export interface WooCommerceVariation {
  id: number;
  date_created: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  status: 'publish' | 'draft' | 'pending' | 'private';
  purchasable: boolean;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  image: WooCommerceImage;
  attributes: Array<{
    id: number;
    name: string;
    option: string;
  }>;
}

export interface WooCommerceOrder {
  id: number;
  status: string;
  total: string;
  meta_data?: WooCommerceMetaData[];
  [key: string]: any;
}
