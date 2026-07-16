import { Product } from '@/types/product';
import { useWishlistStore } from '@/store/wishlistStore';

export interface WishlistService {
  add(product: Product): Promise<void>;
  remove(productId: string): Promise<void>;
  list(): Promise<Product[]>;
  clear(): Promise<void>;
  mergeGuestWishlist(): Promise<void>;
}

/**
 * Lightweight WishlistService implementation.
 * Currently backed by zustand store, which can be modified later 
 * to sync with a dedicated backend or plugin without changing UI components.
 */
class ClientWishlistService implements WishlistService {
  async add(product: Product): Promise<void> {
    useWishlistStore.getState().addItem(product);
  }

  async remove(productId: string): Promise<void> {
    useWishlistStore.getState().removeItem(productId);
  }

  async list(): Promise<Product[]> {
    return useWishlistStore.getState().items;
  }

  async clear(): Promise<void> {
    useWishlistStore.getState().clearWishlist();
  }

  async mergeGuestWishlist(): Promise<void> {
    // In the future, this will send local storage items to the authenticated backend.
    // For now, the items remain in the local store.
    const items = useWishlistStore.getState().items;
    if (items.length > 0) {
      console.log('Merging guest wishlist items with authenticated profile...', items);
      // await fetch('/api/account/wishlist/merge', { method: 'POST', body: JSON.stringify({ items }) });
    }
  }
}

export const wishlistService = new ClientWishlistService();
