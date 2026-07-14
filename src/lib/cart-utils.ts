import { CartItem } from '@/types/cart';
import { ShippingMethod } from '@/types/shipping';
import { FREE_SHIPPING_THRESHOLD } from '@/services/shipping';
import { WooCommerceCoupon } from '@/types/coupon';

export function calculateCartTotals(
  items: CartItem[], 
  selectedShippingMethod?: ShippingMethod | null,
  appliedCoupon?: WooCommerceCoupon | null
) {
  if (!items || !Array.isArray(items)) {
    return { itemCount: 0, subtotal: 0, discountAmount: 0, newSubtotal: 0, shippingCost: 0, total: 0 };
  }

  const itemCount = items.reduce((total, item) => total + (item.quantity || 1), 0);
  
  const subtotal = items.reduce((total, item) => {
    // Safely parse price, defaulting to 0 if invalid
    const price = item.price !== undefined ? item.price : (Number(item.product.price) || 0);
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
  
  // Calculate discount based on coupon type
  let discountAmount = 0;
  if (appliedCoupon) {
    const amount = parseFloat(appliedCoupon.amount) || 0;
    if (appliedCoupon.discount_type === 'percent') {
      discountAmount = subtotal * (amount / 100);
    } else if (appliedCoupon.discount_type === 'fixed_cart') {
      discountAmount = amount;
    } else if (appliedCoupon.discount_type === 'fixed_product') {
      // In a full implementation, you'd calculate per product
      discountAmount = amount * itemCount;
    }
  }

  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);
  const newSubtotal = subtotal - discountAmount;
  
  let shippingCost = 0;
  if (selectedShippingMethod) {
    shippingCost = selectedShippingMethod.price;
  }
  
  // Dynamic free shipping rules
  // 1. If coupon grants free shipping
  // 2. If newSubtotal >= FREE_SHIPPING_THRESHOLD
  if (appliedCoupon?.free_shipping || newSubtotal >= FREE_SHIPPING_THRESHOLD) {
    shippingCost = 0;
  }

  const total = newSubtotal + shippingCost;

  return {
    itemCount,
    subtotal,
    discountAmount,
    newSubtotal,
    shippingCost,
    total,
  };
}
