import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  setSearchOpen: (isOpen: boolean) => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
  closeAll: () => set({ isMobileMenuOpen: false, isSearchOpen: false }),
}));
