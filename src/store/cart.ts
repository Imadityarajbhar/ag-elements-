import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, WcStoreCart } from '../types/cart';
import { ApiResult } from '../types/api';

interface CartState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  
  // Remote WooCommerce Store Cart State
  cart: WcStoreCart | null;
  isSyncing: boolean;
  
  // Actions to interact with remote cart
  fetchCart: () => Promise<ApiResult<void>>;
  addItem: (productId: number, quantity: number, variation?: Array<{attribute: string, value: string}>) => Promise<ApiResult<void>>;
  updateItem: (key: string, quantity: number) => Promise<ApiResult<void>>;
  removeItem: (key: string) => Promise<ApiResult<void>>;
  applyCoupon: (code: string) => Promise<ApiResult<void>>;
  removeCoupon: (code: string) => Promise<ApiResult<void>>;
  updateShippingAddress: (address: any) => Promise<ApiResult<void>>;
  selectShippingRate: (packageId: number, rateId: string) => Promise<ApiResult<void>>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      
      cart: null,
      isSyncing: false,
      
      fetchCart: async () => {
        set({ isSyncing: true });
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            set({ cart: data });
            return { success: true, data: undefined };
          } else {
            const err = await res.json();
            return { success: false, error: err.message || 'Failed to fetch cart', code: err.code };
          }
        } catch (error: any) {
          console.error("Failed to fetch cart", error);
          return { success: false, error: error.message || 'Failed to fetch cart' };
        } finally {
          set({ isSyncing: false });
        }
      },
      
      addItem: async (productId, quantity, variation) => {
        set({ isSyncing: true });
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: productId,
              quantity,
              variation
            })
          });
          if (res.ok) {
            const data = await res.json();
            set({ cart: data, isOpen: true }); // Open drawer on success
            return { success: true, data: undefined };
          } else {
            const err = await res.json();
            return { success: false, error: err.message || 'Failed to add item', code: err.code };
          }
        } catch (error: any) {
          console.error("Failed to add item", error);
          return { success: false, error: error.message || 'Failed to add item' };
        } finally {
          set({ isSyncing: false });
        }
      },
      
      updateItem: async (key, quantity) => {
        set({ isSyncing: true });
        try {
          const res = await fetch(`/api/cart/items/${key}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
          });
          if (res.ok) {
            const data = await res.json();
            set({ cart: data });
            return { success: true, data: undefined };
          } else {
            const err = await res.json();
            return { success: false, error: err.message || 'Failed to update item', code: err.code };
          }
        } catch (error: any) {
          console.error("Failed to update item", error);
          return { success: false, error: error.message || 'Failed to update item' };
        } finally {
          set({ isSyncing: false });
        }
      },
      
      removeItem: async (key) => {
        set({ isSyncing: true });
        try {
          const res = await fetch(`/api/cart/items/${key}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            const data = await res.json();
            set({ cart: data });
            return { success: true, data: undefined };
          } else {
            const err = await res.json();
            return { success: false, error: err.message || 'Failed to remove item', code: err.code };
          }
        } catch (error: any) {
          console.error("Failed to remove item", error);
          return { success: false, error: error.message || 'Failed to remove item' };
        } finally {
          set({ isSyncing: false });
        }
      },
      
      applyCoupon: async (code) => {
        set({ isSyncing: true });
        try {
          const res = await fetch('/api/cart/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          if (res.ok) {
            const data = await res.json();
            set({ cart: data });
            return { success: true, data: undefined };
          } else {
            const err = await res.json();
            return { success: false, error: err.message || 'Failed to apply coupon', code: err.code };
          }
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to apply coupon' };
        } finally {
          set({ isSyncing: false });
        }
      },
      
      removeCoupon: async (code) => {
        set({ isSyncing: true });
        try {
          const res = await fetch(`/api/cart/coupons?code=${encodeURIComponent(code)}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            const data = await res.json();
            set({ cart: data });
            return { success: true, data: undefined };
          } else {
            const err = await res.json();
            return { success: false, error: err.message || 'Failed to remove coupon', code: err.code };
          }
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to remove coupon' };
        } finally {
          set({ isSyncing: false });
        }
      },
      
      updateShippingAddress: async (address) => {
        set({ isSyncing: true });
        try {
          const res = await fetch('/api/cart/shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address })
          });
          if (res.ok) {
            const data = await res.json();
            set({ cart: data });
            return { success: true, data: undefined };
          } else {
            const err = await res.json();
            return { success: false, error: err.message || 'Failed to update address', code: err.code };
          }
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to update address' };
        } finally {
          set({ isSyncing: false });
        }
      },
      
      selectShippingRate: async (packageId, rateId) => {
        set({ isSyncing: true });
        try {
          const res = await fetch('/api/cart/shipping', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ packageId, rateId })
          });
          if (res.ok) {
            const data = await res.json();
            set({ cart: data });
            return { success: true, data: undefined };
          } else {
            const err = await res.json();
            return { success: false, error: err.message || 'Failed to select shipping rate', code: err.code };
          }
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to select shipping rate' };
        } finally {
          set({ isSyncing: false });
        }
      }
    }),
    {
      name: 'ag-cart-storage-v2',
      partialize: (state) => ({ 
        cart: state.cart, // Cache the cart to prevent layout shifts on load
      }),
    }
  )
);
