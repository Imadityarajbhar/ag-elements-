"use client";

import React, { useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/wishlistStore';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  product: Product;
  className?: string;
  iconClassName?: string;
  withText?: boolean;
}

export function WishlistButton({ product, className, iconClassName, withText }: WishlistButtonProps) {
  const { items, addItem, removeItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render an empty un-clickable heart before hydration to avoid hydration mismatch
    return (
      <button className={cn("text-on-surface-variant", className)} disabled>
        <span className={cn("material-symbols-outlined", iconClassName)}>favorite</span>
        {withText && <span className="font-label-md uppercase tracking-widest font-semibold ml-2">Add to Wishlist</span>}
      </button>
    );
  }

  const inWishlist = !!items.find(i => i.id === product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link
    e.stopPropagation();
    
    if (inWishlist) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  return (
    <button 
      onClick={toggleWishlist}
      className={cn(
        "transition-colors flex items-center justify-center hover:scale-110",
        inWishlist ? "text-ag-purple" : "text-on-surface-variant hover:text-ag-purple",
        className
      )}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <span 
        className={cn("material-symbols-outlined", iconClassName)} 
        style={{ fontVariationSettings: inWishlist ? "'FILL' 1" : "'FILL' 0" }}
      >
        favorite
      </span>
      {withText && (
        <span className="font-label-md uppercase tracking-widest font-semibold ml-2">
          {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </span>
      )}
    </button>
  );
}
