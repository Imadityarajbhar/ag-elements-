"use client";
import { Flame, Loader2 } from 'lucide-react';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/shared/Badge';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { useCartStore } from '@/store/cart';
import { WishlistButton } from '@/components/shared/WishlistButton';
import { ProductImage } from '@/components/shared/ProductImage';

interface ProductCardProps {
  product: Product;
  /** Overrides the default grid-tuned `sizes` for callers rendering this card in a different layout (e.g. a fixed-width carousel). */
  sizes?: string;
}

export function ProductCard({ product, sizes = "(max-width: 768px) 50vw, 25vw" }: ProductCardProps) {
  // Selector, not whole-store destructuring — see AddToCartButton for why:
  // this is what stops every card in a grid re-rendering on any cart change.
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const isOutOfStock = product.stockStatus === 'outofstock' || product.inStock === false;
  const isBackorder = product.stockStatus === 'onbackorder';
  const showLowStock = product.stockQuantity !== null && product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity <= 5;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(parseInt(product.id), 1);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className="flex flex-col group cursor-pointer w-full">
      <div className="relative aspect-[4/5] bg-surface-dim mb-4 rounded overflow-hidden">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 scale-90 tablet:scale-100 origin-top-left">
          {product.isNewArrival && (
            <Badge variant="new">New In</Badge>
          )}
          {isOutOfStock ? (
            <Badge className="bg-red-500 text-white border-red-600">Out of Stock</Badge>
          ) : isBackorder ? (
            <Badge className="bg-yellow-500 text-white border-yellow-600">Backorder</Badge>
          ) : showLowStock ? (
            <Badge className="bg-red-50 text-red-700 border-red-200 shadow-sm animate-pulse flex items-center gap-1">
              <Flame className="text-[12px]" />
              Only {product.stockQuantity} left
            </Badge>
          ) : null}
        </div>
        
        {/* Wishlist Button Overlay */}
        <div className="absolute top-2 right-2 z-20">
          <WishlistButton product={product} className="bg-pearl-white/80 backdrop-blur-md p-1.5 rounded-full shadow-sm hover:bg-pearl-white" iconClassName="text-[20px]" />
        </div>

        <ProductImage
          fill
          sizes={sizes}
          src={product.images?.[0]?.src}
          alt={product.images?.[0]?.alt || product.name}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Quick Add Button on Hover (hidden on mobile) */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className="hidden tablet:flex absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] opacity-0 group-hover:opacity-100 transition-opacity bg-pearl-white/95 text-ag-purple hover:bg-pearl-white font-label-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? <Loader2 className="text-[16px] animate-spin" /> : isOutOfStock ? 'Out of Stock' : 'Quick Add'}
        </Button>
      </div>
      
      <h3 className="font-body-sm tablet:font-body-md font-medium text-charcoal-navy group-hover:text-ag-purple transition-colors line-clamp-1">
        {product.name}
      </h3>
      
      <div className="mt-1 flex items-center justify-between gap-2">
        <PriceDisplay regularPrice={product.regularPrice || product.price} salePrice={product.salePrice} />
        
        {/* Mobile Quick Add Button (hidden on tablet/desktop) */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className="flex tablet:hidden h-8 w-8 p-0 rounded bg-ag-purple text-pearl-white flex-shrink-0 hover:brightness-90 transition-all items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add to cart"
        >
          {isAdding ? (
            <Loader2 className="text-[16px] animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[18px]">{isOutOfStock ? 'remove_shopping_cart' : 'add_shopping_cart'}</span>
          )}
        </Button>
      </div>
    </Link>
  );
}
