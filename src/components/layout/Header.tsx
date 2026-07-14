"use client";

import Link from 'next/link';
import Image from 'next/image';
import { CartIcon } from '@/components/shared/CartIcon';
import { useUIStore } from '@/store/uiStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';

export function Header() {
  const openSearch = useUIStore((state) => state.openSearch);
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
          <button className="tablet:hidden p-2 -ml-2 text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center justify-center">
            <Image src="/brand/logo.png" alt="AG Elements" width={160} height={40} className="h-10 w-auto object-contain" />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden tablet:flex items-center gap-8 group/nav">
            <Link className="text-charcoal-navy hover:text-ag-purple transition-colors duration-300 relative group" href="/shop">
              Shop All
              <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-ag-purple scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
            <Link className="text-charcoal-navy hover:text-ag-purple transition-colors duration-300 relative group" href="/collections/necklaces">
              Necklaces
            </Link>
            <Link className="text-charcoal-navy hover:text-ag-purple transition-colors duration-300 relative group" href="/collections/bracelets">
              Bracelets
            </Link>
            <Link className="text-charcoal-navy hover:text-ag-purple transition-colors duration-300 relative group" href="/collections/earrings">
              Earrings
            </Link>
            <Link className="text-charcoal-navy hover:text-ag-purple transition-colors duration-300 relative group" href="/collections/kada">
              Kada
            </Link>
            <Link className="text-charcoal-navy hover:text-ag-purple transition-colors duration-300 relative group" href="/collections/mangalsutra">
              Mangalsutra
            </Link>
            <Link className="text-charcoal-navy hover:text-ag-purple transition-colors duration-300 relative group" href="/collections/rings">
              Rings
            </Link>
            <Link className="text-ag-purple hover:text-charcoal-navy transition-colors duration-300 relative group font-bold" href="/gifting">
              Gifting
            </Link>
          </div>
          
          {/* Trailing Icons */}
          <div className="flex items-center gap-4 text-charcoal-navy">
            <button onClick={openSearch} className="scale-95 hover:text-ag-purple transition-colors">
              <span className="material-symbols-outlined">search</span>
            </button>
            <Link href={mounted && isAuthenticated ? "/account" : "/account/login"} className="hidden tablet:block scale-95 hover:text-ag-purple transition-colors relative">
              <span className="material-symbols-outlined">person</span>
              {mounted && isAuthenticated && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 border-2 border-pearl-white"></span>
              )}
            </Link>
            <Link href="/wishlist" className="scale-95 hover:text-ag-purple transition-colors relative flex items-center justify-center">
              <span className="material-symbols-outlined">favorite</span>
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
        <Link className="flex flex-col items-center justify-center text-primary bg-secondary/30 rounded-full p-2" href="/">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        </Link>
        <button onClick={openSearch} className="flex flex-col items-center justify-center text-on-surface-variant p-2">
          <span className="material-symbols-outlined">search</span>
        </button>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 relative" href="/wishlist">
          <span className="material-symbols-outlined">favorite</span>
          {mounted && wishlistItems.length > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ag-purple text-[9px] font-bold text-pearl-white">
              {wishlistItems.length}
            </span>
          )}
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 relative" href={mounted && isAuthenticated ? "/account" : "/account/login"}>
          <span className="material-symbols-outlined">person</span>
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
