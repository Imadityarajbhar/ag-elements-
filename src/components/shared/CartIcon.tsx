"use client";

import { useCartStore } from '@/store/cart';
import { calculateCartTotals } from '@/lib/cart-utils';

export function CartIcon() {
  const { items, setIsOpen } = useCartStore();
  const { itemCount } = calculateCartTotals(items);

  return (
    <button 
      onClick={() => setIsOpen(true)}
      className="relative material-symbols-outlined text-brand-amethyst" 
      aria-label="Cart"
    >
      shopping_bag
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-brand-amethyst text-white text-[8px] px-1 rounded-full">
          {itemCount}
        </span>
      )}
    </button>
  );
}
