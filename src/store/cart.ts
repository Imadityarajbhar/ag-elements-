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
  
  // Shipping State
  shippingAddress: import('../types/shipping').ShippingAddress | null;
  availableShippingMethods: import('../types/shipping').ShippingMethod[];
  selectedShippingMethod: import('../types/shipping').ShippingMethod | null;
  setShippingAddress: (address: import('../types/shipping').ShippingAddress) => void;
  setAvailableShippingMethods: (methods: import('../types/shipping').ShippingMethod[]) => void;
  setSelectedShippingMethod: (method: import('../types/shipping').ShippingMethod | null) => void;
  
  // Coupon State
  appliedCoupon: import('../types/coupon').WooCommerceCoupon | null;
  setAppliedCoupon: (coupon: import('../types/coupon').WooCommerceCoupon | null) => void;
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
      
      shippingAddress: null,
      availableShippingMethods: [],
      selectedShippingMethod: null,
      setShippingAddress: (address) => set({ shippingAddress: address }),
      setAvailableShippingMethods: (methods) => set({ availableShippingMethods: methods }),
      setSelectedShippingMethod: (method) => set({ selectedShippingMethod: method }),
      
      appliedCoupon: null,
      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
    }),
    {
      name: 'ag-cart-storage',
      partialize: (state) => ({ 
        items: state.items, 
        buyNowItem: state.buyNowItem,
        shippingAddress: state.shippingAddress,
        selectedShippingMethod: state.selectedShippingMethod,
        appliedCoupon: state.appliedCoupon
      }),
    }
  )
);
