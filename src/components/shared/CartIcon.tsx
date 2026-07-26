"use client";

import { useCartStore } from '@/store/cart';

export function CartIcon() {
  // Selectors — this component only cares about item count and the open
  // action, so it shouldn't re-render on isSyncing/isOpen churn either.
  const itemCount = useCartStore((s) => s.cart?.items_count || 0);
  const setIsOpen = useCartStore((s) => s.setIsOpen);

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
