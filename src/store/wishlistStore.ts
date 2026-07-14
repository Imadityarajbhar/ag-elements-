import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types/product';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product) =>
        set((state) => {
          if (state.items.find((i) => i.id === product.id)) return state;
          return { items: [...state.items, product] };
        }),
      removeItem: (productId: string) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      clearWishlist: () => set({ items: [] }),
      isInWishlist: (productId: string) => !!get().items.find((i) => i.id === productId),
    }),
    {
      name: 'ag-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
