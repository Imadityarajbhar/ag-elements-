import { create } from 'zustand';

export interface UIState {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  closeAll: () => set({ isMobileMenuOpen: false, isSearchOpen: false }),
}));
