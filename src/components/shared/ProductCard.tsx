"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/shared/Badge';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { useCartStore } from '@/store/cart';
import { WishlistButton } from '@/components/shared/WishlistButton';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, setIsOpen } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addItem(parseInt(product.id), 1);
  };

  return (
    <Link href={`/product/${product.slug}`} className="flex flex-col group cursor-pointer w-full">
      <div className="relative aspect-[4/5] bg-surface-dim mb-4 rounded overflow-hidden">
        {/* Replace isNewArrival with badgeType when types are updated */}
        {product.isNewArrival && (
          <div className="absolute top-2 left-2 z-10 scale-90 tablet:scale-100 origin-top-left">
            <Badge variant="new">New In</Badge>
          </div>
        )}
        
        {/* Wishlist Button Overlay */}
        <div className="absolute top-2 right-2 z-20">
          <WishlistButton product={product} className="bg-pearl-white/80 backdrop-blur-md p-1.5 rounded-full shadow-sm hover:bg-pearl-white" iconClassName="text-[20px]" />
        </div>

        {product.images?.[0] && (
          <Image
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            src={product.images[0].src}
            alt={product.images[0].alt || product.name}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        
        {/* Quick Add Button on Hover (hidden on mobile) */}
        <Button 
          onClick={handleAddToCart}
          className="hidden tablet:flex absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] opacity-0 group-hover:opacity-100 transition-opacity bg-pearl-white/95 text-ag-purple hover:bg-pearl-white font-label-md"
        >
          Quick Add
        </Button>
      </div>
      
      <h3 className="font-body-sm tablet:font-body-md font-medium text-charcoal-navy group-hover:text-ag-purple transition-colors line-clamp-1">
        {product.name}
      </h3>
      
      <div className="mt-1 flex items-center justify-between gap-2">
        <PriceDisplay regularPrice={product.price} salePrice={product.salePrice} />
        
        {/* Mobile Quick Add Button (hidden on tablet/desktop) */}
        <Button 
          onClick={handleAddToCart}
          className="flex tablet:hidden h-8 w-8 p-0 rounded bg-ag-purple text-pearl-white flex-shrink-0 hover:brightness-90 transition-all items-center justify-center"
          aria-label="Add to cart"
        >
          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
        </Button>
      </div>
    </Link>
  );
}
