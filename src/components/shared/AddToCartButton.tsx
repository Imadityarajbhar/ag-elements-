"use client";

import { useState, useMemo, useEffect } from 'react';
import { Product, ProductVariation } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { trackAddToCart } from '@/lib/analytics';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';

export function AddToCartButton({ product, compact = false }: { product: Product, compact?: boolean }) {
  const { addItem, setIsOpen } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isVariable = product.type === 'variable' && product.attributes && product.variations && product.attributes.length > 0;
  
  const [quantity, setQuantity] = useState(1);
  
  // Initialize state from URL params if available
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (!isVariable || !product.attributes) return {};
    const initial: Record<string, string> = {};
    product.attributes.forEach(attr => {
      const urlVal = searchParams.get(attr.name.toLowerCase());
      if (urlVal && attr.options.includes(urlVal)) {
        initial[attr.name] = urlVal;
      }
    });
    return initial;
  });
  const [showError, setShowError] = useState(false);

  const activeVariation = useMemo(() => {
    if (!isVariable || !product.variations) return null;
    return product.variations.find(v => {
      // Check if this variation matches all currently selected options
      return Object.entries(selectedOptions).every(([key, value]) => {
        return !v.attributes[key] || v.attributes[key] === '' || v.attributes[key] === value;
      });
    });
  }, [isVariable, product.variations, selectedOptions]);

  // Derived display values
  const displayPrice = activeVariation ? activeVariation.price : product.price;
  const displayRegularPrice = activeVariation ? activeVariation.regularPrice : product.regularPrice;
  const isOutOfStock = isVariable 
    ? (activeVariation ? activeVariation.stockStatus === 'outofstock' : false)
    : product.stockStatus === 'outofstock';

  const handleOptionSelect = (attributeName: string, option: string) => {
    setSelectedOptions(prev => ({ ...prev, [attributeName]: option }));
    setShowError(false);

    // Update URL to persist selection
    const params = new URLSearchParams(searchParams.toString());
    params.set(attributeName.toLowerCase(), option);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const validateSelection = () => {
    if (isVariable && product.attributes) {
      const missing = product.attributes.some(attr => !selectedOptions[attr.name]);
      if (missing) {
        setShowError(true);
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!validateSelection()) return;

    let variationPayload;
    if (isVariable && selectedOptions) {
      // The Store API expects variation: [ { attribute: 'pa_color', value: 'silver' } ]
      // WooCommerce attributes prefixed with pa_ if global, or just the name if custom.
      // We'll pass them down. For safety, we match WooCommerce format.
      variationPayload = Object.entries(selectedOptions).map(([key, value]) => ({
        attribute: key,
        value: value
      }));
    }

    await addItem(parseInt(product.id), quantity, variationPayload);
    trackAddToCart(product, quantity);
  };

  const handleBuyNow = async () => {
    if (!validateSelection()) return;

    let variationPayload;
    if (isVariable && selectedOptions) {
      variationPayload = Object.entries(selectedOptions).map(([key, value]) => ({
        attribute: key,
        value: value
      }));
    }

    const res = await addItem(parseInt(product.id), quantity, variationPayload);
    trackAddToCart(product, quantity);
    
    if (res.success) {
      router.push('/checkout');
    }
  };



  if (compact) {
    return (
      <div className="flex flex-col gap-1 w-full">
        {showError && (
          <p className="text-red-500 text-[11px] font-medium text-center">Please select options above</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={handleAddToCart} 
            disabled={isOutOfStock}
            className="w-full bg-primary text-primary-foreground font-label-md text-[13px] font-semibold h-10 px-0 rounded hover:brightness-90 transition-all flex justify-center items-center gap-1.5"
          >
            <span>Add to Cart</span>
          </Button>
          <Button 
            onClick={handleBuyNow} 
            disabled={isOutOfStock}
            variant="outline"
            className="w-full border-ag-purple text-ag-purple font-label-md text-[13px] font-semibold h-10 px-0 rounded hover:bg-ag-purple/5 transition-all flex justify-center items-center gap-1.5"
          >
            <span>Buy Now</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Price Display & Sale Badge */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-4 items-center">
          <p className="font-headline-md text-[32px] font-medium text-primary">₹ {displayPrice.toLocaleString('en-IN')}</p>
          {displayRegularPrice && displayPrice < displayRegularPrice && (
            <>
              <p className="font-body-md text-[16px] text-on-surface-variant line-through">₹ {displayRegularPrice.toLocaleString('en-IN')}</p>
              <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold text-[12px] uppercase tracking-widest border border-red-100">
                {Math.round(((displayRegularPrice - displayPrice) / displayRegularPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>
        <p className="text-label-sm text-[12px] font-semibold text-outline uppercase tracking-widest mt-1">Inclusive of all taxes</p>
      </div>

      {/* Variant Selectors (Phase 3 Chips & Swatches) */}
      {isVariable && product.attributes && (
        <div className="flex flex-col gap-6 mt-4">
          {product.attributes.map((attr) => {
            const isColor = attr.name.toLowerCase() === 'color';
            return (
              <div key={attr.name} className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="font-label-sm font-semibold uppercase tracking-widest text-charcoal-navy">
                    {attr.name}
                  </label>
                  <span className="font-label-sm text-on-surface-variant capitalize">
                    {selectedOptions[attr.name] || 'Select'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {attr.options.map(opt => {
                    const isSelected = selectedOptions[attr.name] === opt;
                    if (isColor) {
                      // Basic color mapping for swatch backgrounds
                      const bgMap: Record<string, string> = {
                        'silver': '#C0C0C0',
                        'gold': '#FFD700',
                        'rose gold': '#B76E79',
                        'black': '#000000',
                        'white': '#FFFFFF',
                      };
                      const bgColor = bgMap[opt.toLowerCase()] || '#E0E0E0';
                      
                      return (
                        <button
                          key={opt}
                          onClick={() => handleOptionSelect(attr.name, opt)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-ag-purple ring-offset-2' : 'ring-1 ring-outline-variant hover:ring-charcoal-navy'} ${showError && !selectedOptions[attr.name] ? 'ring-red-500' : ''}`}
                          style={{ backgroundColor: bgColor }}
                          title={opt}
                        />
                      );
                    } else {
                      return (
                        <button
                          key={opt}
                          onClick={() => handleOptionSelect(attr.name, opt)}
                          className={`px-4 py-2 rounded border font-body-md transition-all ${isSelected ? 'border-ag-purple bg-ag-purple/5 text-ag-purple font-semibold' : 'border-outline-variant text-on-surface-variant hover:border-charcoal-navy'} ${showError && !selectedOptions[attr.name] ? 'border-red-500' : ''}`}
                        >
                          {opt}
                        </button>
                      );
                    }
                  })}
                </div>
              </div>
            );
          })}
          {showError && (
            <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">Please select all options before adding to cart.</p>
          )}
        </div>
      )}

      {/* Stock Status & Urgency Badges */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            {activeVariation?.stockStatus === 'onbackorder' ? (
              <>
                <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-yellow-400"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </>
            ) : (
              <>
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isOutOfStock ? 'bg-red-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></span>
              </>
            )}
          </div>
          <span className={`font-label-sm font-bold uppercase tracking-widest text-[12px] ${activeVariation?.stockStatus === 'onbackorder' ? 'text-yellow-700' : isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
            {activeVariation?.stockStatus === 'onbackorder' ? 'Available on Backorder' : isOutOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
        </div>

        {/* Low Stock Warning */}
        {activeVariation?.stockQuantity !== null && activeVariation?.stockQuantity !== undefined && activeVariation.stockQuantity > 0 && activeVariation.stockQuantity < 5 && (
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-widest border border-red-100 w-fit animate-pulse">
            <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
            Hurry! Only {activeVariation.stockQuantity} left in stock
          </div>
        )}
      </div>

        {/* Quantity Selector */}
        <div className="flex flex-col gap-2">
          <label className="font-label-sm font-semibold uppercase tracking-widest text-charcoal-navy">Quantity</label>
          <div className="flex items-center border border-outline-variant/50 rounded w-fit bg-surface-container-lowest h-12">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="px-4 h-full text-charcoal-navy hover:bg-surface-variant disabled:opacity-50 transition-colors"
            >
              -
            </button>
            <span className="w-12 text-center font-body-md text-charcoal-navy">{quantity}</span>
            <button 
              onClick={() => setQuantity(Math.min(activeVariation?.stockQuantity || product.stockQuantity || 99, quantity + 1))}
              disabled={quantity >= (activeVariation?.stockQuantity || product.stockQuantity || 99) || isOutOfStock}
              className="px-4 h-full text-charcoal-navy hover:bg-surface-variant disabled:opacity-50 transition-colors"
            >
              +
            </button>
          </div>
        </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Button 
          onClick={handleAddToCart} 
          disabled={isOutOfStock}
          className="w-full bg-primary text-primary-foreground font-label-md text-[14px] font-semibold py-6 rounded hover:brightness-90 transition-all flex justify-center items-center gap-2"
        >
          <span>Add to Cart</span>
          <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
        </Button>
        <Button 
          onClick={handleBuyNow} 
          disabled={isOutOfStock}
          variant="outline"
          className="w-full border-ag-purple text-ag-purple font-label-md text-[14px] font-semibold py-6 rounded hover:bg-ag-purple/5 transition-all flex justify-center items-center gap-2"
        >
          <span>Buy Now</span>
          <span className="material-symbols-outlined text-[18px]">bolt</span>
        </Button>
      </div>
    </div>
  );
}

export function ProductGallery({ product }: { product: Product }) {
  const searchParams = useSearchParams();
  const isVariable = product.type === 'variable' && product.attributes && product.variations && product.attributes.length > 0;
  
  const activeVariation = useMemo(() => {
    if (!isVariable || !product.variations) return null;
    return product.variations.find(v => {
      return product.attributes?.every(attr => {
        const urlVal = searchParams.get(attr.name.toLowerCase());
        if (!urlVal) return true;
        const attrKey = Object.keys(v.attributes).find(k => k.toLowerCase() === attr.name.toLowerCase());
        const vVal = attrKey ? v.attributes[attrKey] : undefined;
        return !vVal || vVal === '' || vVal === urlVal;
      });
    });
  }, [isVariable, product.variations, product.attributes, searchParams]);

  const activeImage = activeVariation?.image?.url;
  const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuDUJcDFZ4gfxtgf5QZ4A3vCMYjs1GNnlSvqwfSOFoUudjcqTEFGwyItsyiomIUMhVYrv8zbpUSghtF9q1KKoc05XwxQFeuo5Sjas05jBNlpzK487FACTxY_qeNUFAxWuMANmTPUhuZSFcUoWkUrCE8DKXvnxlU6TKwOq6yoSV1S_2mqi8HMXJZHR8FFCCoouBwu5a_a9ZmgvYm_LiGhKoM5OZGcuA2XONxOC-52soC1NTKIGl--7f8k3w";
  
  const mainImage = activeImage || product.images[0]?.url || fallbackImage;

  const baseThumbnails = product.images.length > 0 
    ? product.images 
    : [{ id: 'fallback', url: mainImage, alt: product.name }];
    
  let thumbnails = [...baseThumbnails];
  if (activeVariation?.image && !thumbnails.find(t => t.url === activeVariation.image!.url)) {
     thumbnails.unshift(activeVariation.image);
  }

  thumbnails = thumbnails.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i).slice(0, 5);

  const [displayImage, setDisplayImage] = useState(mainImage);

  useEffect(() => {
    setDisplayImage(mainImage);
  }, [mainImage]);

  return (
    <div className="flex flex-col md:flex-row gap-4 relative items-start w-full h-full">
      <div className="hidden md:flex flex-col gap-4 w-[100px] sticky top-[120px]">
        {thumbnails.map((thumb) => (
          <button 
            key={thumb.id} 
            onClick={() => setDisplayImage(thumb.url)}
            className={`relative w-full aspect-[4/5] bg-surface-lavender rounded overflow-hidden transition-all ${displayImage === thumb.url ? 'ring-2 ring-primary opacity-100' : 'ring-1 ring-outline-variant/30 opacity-60 hover:opacity-100'}`}
          >
            <Image fill sizes="100px" className="object-cover" alt={thumb.alt} src={thumb.url} />
          </button>
        ))}
      </div>
      <div className="relative w-full flex-1 rounded bg-surface-container-lowest overflow-hidden shadow-[0px_4px_20px_rgba(35,33,58,0.05)] aspect-[4/5] md:aspect-auto md:min-h-[600px] md:h-full">
        <Image priority fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" alt={product.name} src={displayImage} />
      </div>
      <div className="flex md:hidden gap-4 w-full overflow-x-auto hide-scrollbar snap-x py-2">
        {thumbnails.map((thumb) => (
          <button 
            key={thumb.id} 
            onClick={() => setDisplayImage(thumb.url)}
            className={`relative snap-start min-w-[80px] aspect-[4/5] bg-surface-lavender rounded overflow-hidden ${displayImage === thumb.url ? 'ring-2 ring-primary opacity-100' : 'ring-1 ring-outline-variant/30 opacity-60'}`}
          >
            <Image fill sizes="80px" className="object-cover" alt={thumb.alt} src={thumb.url} />
          </button>
        ))}
      </div>
    </div>
  );
}
