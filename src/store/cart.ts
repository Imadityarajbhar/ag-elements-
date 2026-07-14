import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types/cart';

interface CartState {
  items: CartItem[];
  buyNowItem: CartItem | null;
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setBuyNowItem: (item: CartItem) => void;
  clearBuyNowItem: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      buyNowItem: null,
      isOpen: false,
      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === newItem.productId && i.variationId === newItem.variationId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...newItem, id: crypto.randomUUID() }] };
        });
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),
      setBuyNowItem: (item) => set({ buyNowItem: item }),
      clearBuyNowItem: () => set({ buyNowItem: null }),
    }),
    {
      name: 'ag-cart-storage',
      partialize: (state) => ({ items: state.items, buyNowItem: state.buyNowItem }),
    }
  )
);
