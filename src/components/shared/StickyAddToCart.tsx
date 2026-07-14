"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { AddToCartButton } from "./AddToCartButton";
import Image from "next/image";

export function StickyAddToCart({ product }: { product: Product }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling down ~600px (past the main Add To Cart button)
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-pearl-white border-t border-outline-variant/30 shadow-[0px_-4px_20px_rgba(35,33,58,0.05)] z-[40] animate-in slide-in-from-bottom-full duration-300">
      <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop py-3 flex items-center justify-between gap-4">
        
        {/* Product Info (Hidden on very small screens) */}
        <div className="hidden sm:flex items-center gap-4 flex-1">
          {product.images?.[0] && (
            <div className="w-12 h-12 relative bg-surface-container-lowest rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
              <Image fill sizes="48px" src={product.images[0].url} alt={product.name} className="object-cover" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-body-md font-semibold text-charcoal-navy line-clamp-1">{product.name}</span>
            <span className="font-label-sm text-on-surface-variant tracking-widest uppercase">₹{product.price.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-1 sm:flex-none sm:w-[300px]">
          <AddToCartButton product={product} compact />
        </div>

      </div>
    </div>
  );
}
