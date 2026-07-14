export interface WooCommerceCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: 'percent' | 'fixed_cart' | 'fixed_product';
  description: string;
  date_expires: string | null;
  usage_count: number;
  individual_use: boolean;
  product_ids: number[];
  excluded_product_ids: number[];
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  limit_usage_to_x_items: number | null;
  free_shipping: boolean;
  product_categories: number[];
  excluded_product_categories: number[];
  exclude_sale_items: boolean;
  minimum_amount: string;
  maximum_amount: string;
  email_restrictions: string[];
}
