import { Product } from './product';

export interface CartItem {
  id: string; // Cart line item ID
  productId: string;
  product: Product;
  quantity: number;
  variationId?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  tax: number;
  shipping: number;
  itemCount: number;
}
