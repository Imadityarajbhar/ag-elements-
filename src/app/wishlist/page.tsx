"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cart';
import { Product } from '@/types/product';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

function WishlistContent() {
  const { items, removeItem, addItem } = useWishlistStore();
  const cartStore = useCartStore();
  const searchParams = useSearchParams();
  const shareIds = searchParams.get('share');

  const [mounted, setMounted] = useState(false);
  const [sharedProducts, setSharedProducts] = useState<Product[] | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (shareIds && mounted) {
      // Fetch shared products
      fetch(`/api/products?include=${shareIds}`)
        .then(res => res.json())
        .then(data => setSharedProducts(data))
        .catch(err => console.error("Failed to load shared wishlist", err));
    }
  }, [shareIds, mounted]);

  if (!mounted) return <div className="min-h-[50vh]" />;

  const isSharedView = !!shareIds;
  const displayItems = isSharedView && sharedProducts ? sharedProducts : items;

  const handleMoveToCart = async (product: Product) => {
    await cartStore.addItem(parseInt(product.id), 1);
    if (!isSharedView) {
      removeItem(product.id);
    }
  };

  const handleShare = () => {
    if (items.length === 0) return;
    const ids = items.map(i => i.id).join(',');
    const url = `${window.location.origin}/wishlist?share=${ids}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  const handleSaveSharedItem = (product: Product) => {
    addItem(product);
  };

  return (
    <main className="w-full max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop py-8 md:py-16 min-h-[60vh]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div>
          <h1 className="font-headline-lg text-[40px] md:text-[48px] font-medium text-charcoal-navy">
            {isSharedView ? "Shared Wishlist" : "Your Wishlist"}
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-2">
            {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        
        {!isSharedView && items.length > 0 && (
          <Button 
            onClick={handleShare}
            variant="outline"
            className="flex items-center gap-2 border-ag-purple text-ag-purple hover:bg-ag-purple hover:text-pearl-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            {copyStatus === 'copied' ? 'Link Copied!' : 'Share Wishlist'}
          </Button>
        )}
      </div>

      {displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">favorite_border</span>
          <h2 className="font-headline-md text-[28px] text-charcoal-navy mb-4">Your wishlist is empty</h2>
          <p className="font-body-md text-on-surface-variant max-w-md mb-8">Save your favorite pieces here to view them later or share them with friends.</p>
          <Link href="/shop" className="bg-charcoal-navy text-pearl-white px-8 py-4 rounded uppercase font-label-md tracking-widest font-semibold hover:bg-charcoal-navy/90 transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {displayItems.map((product) => (
            <div key={product.id} className="group relative flex flex-col bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-[0px_4px_20px_rgba(35,33,58,0.05)] transition-all">
              {!isSharedView && (
                <button 
                  onClick={() => removeItem(product.id)}
                  className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-pearl-white/80 hover:bg-pearl-white text-on-surface-variant hover:text-red-500 rounded-full backdrop-blur transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
              
              <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-surface-lavender overflow-hidden">
                <Image 
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  src={product.images?.[0]?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUJcDFZ4gfxtgf5QZ4A3vCMYjs1GNnlSvqwfSOFoUudjcqTEFGwyItsyiomIUMhVYrv8zbpUSghtF9q1KKoc05XwxQFeuo5Sjas05jBNlpzK487FACTxY_qeNUFAxWuMANmTPUhuZSFcUoWkUrCE8DKXvnxlU6TKwOq6yoSV1S_2mqi8HMXJZHR8FFCCoouBwu5a_a9ZmgvYm_LiGhKoM5OZGcuA2XONxOC-52soC1NTKIGl--7f8k3w'} 
                  alt={product.name} 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              
              <div className="p-4 flex flex-col flex-1">
                <Link href={`/product/${product.slug}`} className="flex-1">
                  <h3 className="font-headline-sm text-[18px] font-semibold text-charcoal-navy mb-2 line-clamp-1 group-hover:text-ag-purple transition-colors">{product.name}</h3>
                  <PriceDisplay regularPrice={product.price} salePrice={product.salePrice} />
                </Link>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={() => handleMoveToCart(product)}
                    className="flex-1 bg-ag-purple hover:bg-ag-purple/90 text-pearl-white font-label-sm uppercase tracking-widest"
                  >
                    Move to Cart
                  </Button>
                  
                  {isSharedView && (
                    <Button
                      onClick={() => handleSaveSharedItem(product)}
                      variant="outline"
                      className="border-ag-purple text-ag-purple hover:bg-ag-purple hover:text-pearl-white"
                      title="Save to your Wishlist"
                    >
                      <span className="material-symbols-outlined text-[18px]">favorite</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ag-purple"></div></div>}>
      <WishlistContent />
    </Suspense>
  );
}
