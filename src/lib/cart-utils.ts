import { CartItem } from '@/types/cart';

export function calculateCartTotals(items: CartItem[]) {
  if (!items || !Array.isArray(items)) {
    return { itemCount: 0, subtotal: 0, total: 0 };
  }

  const itemCount = items.reduce((total, item) => total + (item.quantity || 1), 0);
  
  const subtotal = items.reduce((total, item) => {
    // Safely parse price, defaulting to 0 if invalid
    const price = Number(item.product.price) || 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
  
  // For now, total is exactly the subtotal. Shipping will be added at checkout level.
  const total = subtotal;

  return {
    itemCount,
    subtotal,
    total,
  };
}
