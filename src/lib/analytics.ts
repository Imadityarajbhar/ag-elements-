import { Product } from "@/types/product";

// Declare global window properties for TS
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Enhanced Ecommerce: View Item
 */
export const trackViewItem = (product: Product) => {
  if (typeof window === "undefined") return;

  // Google Analytics 4
  if (window.gtag) {
    window.gtag("event", "view_item", {
      currency: "INR",
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          affiliation: "AG Elements",
          item_category: product.categories[0]?.name || "Jewelry",
          price: product.price,
          quantity: 1
        }
      ]
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_ids: [product.id],
      content_type: "product",
      content_name: product.name,
      content_category: product.categories[0]?.name || "Jewelry",
      value: product.price,
      currency: "INR"
    });
  }
};

/**
 * Enhanced Ecommerce: Add to Cart
 */
export const trackAddToCart = (product: Product, quantity: number = 1) => {
  if (typeof window === "undefined") return;

  // Google Analytics 4
  if (window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: "INR",
      value: product.price * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          affiliation: "AG Elements",
          item_category: product.categories[0]?.name || "Jewelry",
          price: product.price,
          quantity: quantity
        }
      ]
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "AddToCart", {
      content_ids: [product.id],
      content_type: "product",
      content_name: product.name,
      value: product.price * quantity,
      currency: "INR"
    });
  }
};

/**
 * Enhanced Ecommerce: Purchase
 */
export const trackPurchase = (orderId: string, value: number, items: Array<{ product: Product, quantity: number }>) => {
  if (typeof window === "undefined") return;

  // Google Analytics 4
  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: orderId,
      value: value,
      currency: "INR",
      tax: 0,
      shipping: 0,
      items: items.map(item => ({
        item_id: item.product.id,
        item_name: item.product.name,
        affiliation: "AG Elements",
        item_category: item.product.categories[0]?.name || "Jewelry",
        price: item.product.price,
        quantity: item.quantity
      }))
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      content_ids: items.map(i => i.product.id),
      content_type: "product",
      value: value,
      currency: "INR",
      num_items: items.reduce((acc, curr) => acc + curr.quantity, 0)
    });
  }
};
