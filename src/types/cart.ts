import { Product } from './product';

export interface CartItem {
  id: string; // Internal id / key
  productId: string;
  product?: Product;
  quantity: number;
  variationId?: string;
  selectedOptions?: Record<string, string>;
  price?: number; 
  image?: string;
  title?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  tax: number;
  shipping: number;
  itemCount: number;
}

// WooCommerce Store API Typings
export interface WcStoreCartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  permalink: string;
  images: Array<{
    id: number;
    src: string;
    thumbnail: string;
    alt: string;
    name: string;
  }>;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    price_range: string | null;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_prefix: string;
    currency_suffix: string;
    raw_prices: {
      precision: number;
      price: string;
      regular_price: string;
      sale_price: string;
    };
  };
  totals: {
    line_subtotal: string;
    line_subtotal_tax: string;
    line_total: string;
    line_total_tax: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_prefix: string;
    currency_suffix: string;
  };
  quantity_limits: {
    minimum: number;
    maximum: number;
    multiple_of: number;
    is_multiple_of: boolean;
  };
  variation: Array<{ attribute: string; value: string }>;
  item_data: any[];
}

export interface WcStoreCart {
  items: WcStoreCartItem[];
  coupons: Array<{
    code: string;
    discount_type: string;
    totals: {
      total_discount: string;
      total_discount_tax: string;
      currency_code: string;
      currency_symbol: string;
      currency_minor_unit: number;
      currency_prefix: string;
      currency_suffix: string;
    }
  }>;
  fees: any[];
  totals: {
    total_items: string;
    total_items_tax: string;
    total_fees: string;
    total_fees_tax: string;
    total_discount: string;
    total_discount_tax: string;
    total_shipping: string;
    total_shipping_tax: string;
    total_price: string;
    total_tax: string;
    tax_lines: Array<{
      name: string;
      price: string;
    }>;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_prefix: string;
    currency_suffix: string;
  };
  shipping_address: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone: string;
  };
  billing_address: any;
  needs_payment: boolean;
  needs_shipping: boolean;
  payment_requirements: string[];
  has_calculated_shipping: boolean;
  shipping_rates: Array<{
    package_id: number;
    name: string;
    destination: any;
    items: Array<{ key: string; name: string; quantity: number }>;
    shipping_rates: Array<{
      rate_id: string;
      name: string;
      description: string;
      delivery_time: string;
      price: string;
      taxes: string;
      instance_id: number;
      method_id: string;
      meta_data: Array<{ key: string; value: string }>;
      selected: boolean;
      currency_code: string;
      currency_symbol: string;
      currency_minor_unit: number;
      currency_prefix: string;
      currency_suffix: string;
    }>;
  }>;
  items_count: number;
  items_weight: number;
  cross_sells: any[];
  errors: any[];
  payment_methods: string[];
}
