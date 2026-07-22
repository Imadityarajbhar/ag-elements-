"use client";
import { Menu, ChevronDown, Search, User, Heart, Home } from 'lucide-react';

import Link from 'next/link';
import Image from 'next/image';
import { CartIcon } from '@/components/shared/CartIcon';
import { useUIStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';

export function Header() {
  const openSearch = useUIStore((state) => state.openSearch);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <header className="sticky top-0 z-50 flex flex-col w-full transition-all duration-300">
      {/* 1. Announcement Bar */}
      <div className="flex w-full py-2 justify-center items-center gap-4 bg-lavender-blush text-ag-purple font-label-sm uppercase tracking-[0.02em] relative overflow-hidden">
        <div className="flex animate-[slide_15s_linear_infinite] whitespace-nowrap gap-16">
          <span>All India Delivery Available</span>
          <span>•</span>
          <span>Free Shipping on Orders over ₹2000</span>
          <span>•</span>
          <span>Festive Offer: 15% off new arrivals</span>
          <span>•</span>
          <span>All India Delivery Available</span>
        </div>
      </div>
      
      {/* 2. TopNavBar */}
      <nav className="flex flex-col items-center bg-pearl-white/95 backdrop-blur-md text-ag-purple font-label-md editorial-shadow">
        <div className="w-full max-w-[1440px] px-margin-mobile tablet:px-margin-desktop py-4 flex justify-between items-center">
          {/* Mobile Menu Icon */}
          <button onClick={() => setMobileMenuOpen(true)} className="tablet:hidden p-2 -ml-2 text-primary">
            <Menu  />
          </button>
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center justify-center">
            <Image src="/brand/logo.png" alt="AG Elements" width={160} height={40} className="h-10 w-auto object-contain" />
          </Link>
          
          {/* Desktop Navigation */}
          {/* Desktop Navigation */}
          <div className="hidden tablet:flex items-center gap-6 group/nav justify-center">
            <Link className="text-charcoal-navy hover:text-ag-purple transition-colors duration-300 relative group" href="/shop">
              Shop All
              <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-ag-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
            <Link className="text-charcoal-navy hover:text-ag-purple transition-colors duration-300 relative group" href="/collections/necklaces">
              Necklaces
            </Link>
            
            {/* Bracelets & Bangles Dropdown */}
            <div className="relative group/dropdown h-full flex items-center py-2">
              <Link href="/collections/bracelets" className="text-charcoal-navy group-hover/dropdown:text-ag-purple transition-colors duration-300 relative flex items-center gap-1 cursor-pointer">
                Bracelets
                <ChevronDown className="text-[16px] transition-transform duration-300 group-hover/dropdown:rotate-180" />
                <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-ag-purple scale-x-0 group-hover/dropdown:scale-x-100 transition-transform origin-left"></span>
              </Link>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-50">
                <div className="bg-pearl-white border border-outline-variant/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md flex flex-col min-w-[160px] py-2 overflow-hidden">
                  <Link href="/collections/bracelets" className="px-4 py-2 hover:bg-surface-lavender hover:text-ag-purple text-[13px] font-medium transition-colors">
                    All Bracelets
                  </Link>
                  <Link href="/collections/bangles" className="px-4 py-2 hover:bg-surface-lavender hover:text-ag-purple text-[13px] font-medium transition-colors">
                    Bangles
                  </Link>
                </div>
              </div>
            </div>

            <Link className="text-charcoal-navy hover:text-ag-purple transition-colors duration-300 relative group" href="/collections/earrings">
              Earrings
            </Link>
            
            <Link className="text-charcoal-navy hover:text-ag-purple transition-colors duration-300 relative group" href="/collections/rings">
              Rings
            </Link>

            {/* Men's Dropdown */}
            <div className="relative group/dropdown h-full flex items-center py-2">
              <span className="text-charcoal-navy group-hover/dropdown:text-ag-purple transition-colors duration-300 relative flex items-center gap-1 cursor-pointer">
                Men's
                <ChevronDown className="text-[16px] transition-transform duration-300 group-hover/dropdown:rotate-180" />
                <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-ag-purple scale-x-0 group-hover/dropdown:scale-x-100 transition-transform origin-left"></span>
              </span>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 z-50">
                <div className="bg-pearl-white border border-outline-variant/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md flex flex-col min-w-[160px] py-2 overflow-hidden">
                  <Link href="/collections/mens-bracelet" className="px-4 py-2 hover:bg-surface-lavender hover:text-ag-purple text-[13px] font-medium transition-colors">
                    Men's Bracelet
                  </Link>
                  <Link href="/collections/mens-necklace" className="px-4 py-2 hover:bg-surface-lavender hover:text-ag-purple text-[13px] font-medium transition-colors">
                    Men's Necklace
                  </Link>
                </div>
              </div>
            </div>

            <Link className="text-ag-purple hover:text-charcoal-navy transition-colors duration-300 relative group font-bold" href="/gifting">
              Gifting
            </Link>
          </div>
          
          {/* Trailing Icons */}
          <div className="flex items-center gap-4 text-charcoal-navy">
            <button onClick={openSearch} aria-label="Search" className="scale-95 hover:text-ag-purple transition-colors">
              <Search  />
            </button>
            <Link href={mounted && isAuthenticated ? "/account" : "/account/login"} aria-label={mounted && isAuthenticated ? "Account" : "Log in"} className="hidden tablet:block scale-95 hover:text-ag-purple transition-colors relative">
              <User  />
              {mounted && isAuthenticated && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 border-2 border-pearl-white"></span>
              )}
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="scale-95 hover:text-ag-purple transition-colors relative flex items-center justify-center">
              <Heart  />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ag-purple text-[9px] font-bold text-pearl-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <div className="scale-95 hover:text-ag-purple transition-colors">
              <CartIcon />
            </div>
          </div>
        </div>
      </nav>
      
      <style>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-pearl-white/90 backdrop-blur-md border-t border-outline-variant/30 flex tablet:hidden justify-around items-center h-16 px-4 shadow-[0px_-4px_20px_rgba(35,33,58,0.05)]">
        <Link aria-label="Home" className="flex flex-col items-center justify-center text-primary bg-secondary/30 rounded-full p-2" href="/">
          <Home  />
        </Link>
        <button onClick={openSearch} aria-label="Search" className="flex flex-col items-center justify-center text-on-surface-variant p-2">
          <Search  />
        </button>
        <Link aria-label="Wishlist" className="flex flex-col items-center justify-center text-on-surface-variant p-2 relative" href="/wishlist">
          <Heart  />
          {mounted && wishlistItems.length > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ag-purple text-[9px] font-bold text-pearl-white">
              {wishlistItems.length}
            </span>
          )}
        </Link>
        <Link aria-label={mounted && isAuthenticated ? "Account" : "Log in"} className="flex flex-col items-center justify-center text-on-surface-variant p-2 relative" href={mounted && isAuthenticated ? "/account" : "/account/login"}>
          <User  />
          {mounted && isAuthenticated && (
            <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 border-2 border-pearl-white"></span>
          )}
        </Link>
        <div className="flex flex-col items-center justify-center text-on-surface-variant p-2">
          <CartIcon />
        </div>
      </nav>
    </header>
  );
}
