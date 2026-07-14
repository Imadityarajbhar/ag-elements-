"use client";

import { useCartStore } from '@/store/cart';

export function CartIcon() {
  const { cart, setIsOpen } = useCartStore();
  const itemCount = cart?.items_count || 0;

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
