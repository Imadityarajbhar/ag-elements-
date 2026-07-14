"use client";

import { useCartStore } from '@/store/cart';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

import { calculateCartTotals } from '@/lib/cart-utils';
import { Product } from '@/types/product';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function CartDrawer() {
  const { isOpen, setIsOpen, items, removeItem, updateQuantity, addItem } = useCartStore();
  const { subtotal } = calculateCartTotals(items);
  const [upsells, setUpsells] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen && items.length > 0 && upsells.length === 0) {
      // Mock fetching upsells
      setUpsells([
        {
          id: "upsell-1",
          name: "Silver Polishing Cloth",
          slug: "silver-polishing-cloth",
          price: 499,
          images: [{ id: "u1", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgYShAiK_WIPmW8XzCj504v1jLWuG1cfWTnZsg933i2ucADqVunBR1qG5SLt6vnry3FMYd5IjpuhbkkvpxbiBxVKdw1xPl-_cypjd1BUkgfnLWl5Z2bOp_Ch46lWO9hlVuedtU4st5dLRYuHi67StD9Fie2aQXNqIQLW4Bo1gwfo8_dl16zt-SlIi0eD1QdfaWRkmCg9NsIJWLg6avXY2r9HuoLEivcUOSNR8r0dkjK-reWSX-Jr0odA", alt: "Cloth" }],
          categories: [{ id: "acc", name: "Accessories", slug: "accessories" }],
          inStock: true,
          sku: "POL-01",
          description: "Keep your jewelry shining."
        },
        {
          id: "upsell-2",
          name: "Premium Gift Box",
          slug: "premium-gift-box",
          price: 999,
          images: [{ id: "u2", url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVPG_NxUQQz2Jcu8HJfHRV12nWworIMPWOwMwvagcRprZYeT3xBcfW_m56h-jz47MSacfFos8eF5cUqojKD_4Ui0IXROEqeX_jdhGR2gWp899esWEZFiQiiHoYxF8Pxxfl5sjr2empr26C_Vav7rZEOb0atBAwUYdbrdxBr-jkdrLpGWtw8OwxHGYAcXHrUnDrOJd0bUINio6hgZvL8Cl5P1RP0njtEvhdkqjpAXHKOnMCoeIrxSGYSQ", alt: "Box" }],
          categories: [{ id: "acc", name: "Accessories", slug: "accessories" }],
          inStock: true,
          sku: "BOX-01",
          description: "Elevate your gift."
        }
      ]);
    }
  }, [isOpen, items.length, upsells.length]);

  const FREE_SHIPPING_THRESHOLD = 2000;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-pearl-white flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-heading text-headline-md text-brand-amethyst text-left">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length > 0 && (
          <div className="bg-surface-container-lowest px-4 py-3 -mx-6 mt-2 border-b border-outline-variant/30 text-center animate-in fade-in slide-in-from-top-2 duration-300">
            {amountToFreeShipping <= 0 ? (
              <p className="font-label-md text-[13px] font-bold text-green-600 uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                You unlocked Free Shipping!
              </p>
            ) : (
              <>
                <p className="font-label-md text-[12px] font-bold text-charcoal-navy uppercase tracking-widest mb-2">
                  You are ₹{amountToFreeShipping.toLocaleString('en-IN')} away from <span className="text-ag-purple">Free Shipping</span>
                </p>
                <div className="w-full h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-ag-purple rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto py-6 -mx-6 px-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant gap-4">
              <span className="material-symbols-outlined text-[48px] opacity-20">shopping_bag</span>
              <p className="font-sans text-[16px]">Your cart is empty.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-24 aspect-[4/5] bg-surface-container-low overflow-hidden">
                    {item.product.images?.[0] && (
                    <Image fill sizes="64px" src={item.product.images[0].url} alt={item.product.name} className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="font-heading text-[18px] text-on-surface line-clamp-2">{item.product.name}</h4>
                      <p className="font-sans text-on-surface-variant text-[14px] mt-1">${(Number(item.product.price) || 0).toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center border border-outline-variant rounded">
                        <button 
                          className="px-2 py-1 text-on-surface-variant hover:text-brand-amethyst"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </button>
                        <span className="px-2 font-sans text-[14px] min-w-[24px] text-center">{item.quantity}</span>
                        <button 
                          className="px-2 py-1 text-on-surface-variant hover:text-brand-amethyst"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className="font-sans text-[12px] uppercase tracking-widest text-on-surface-variant underline underline-offset-4 hover:text-destructive transition-colors"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {upsells.length > 0 && (
                <div className="mt-8 border-t border-outline-variant/30 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                  <h4 className="font-label-md text-[12px] font-bold text-on-surface-variant uppercase tracking-widest mb-4 text-center">You May Also Like</h4>
                  <div className="flex flex-col gap-4">
                    {upsells.map((upsell) => (
                      <div key={upsell.id} className="flex gap-4 items-center bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30 hover:border-charcoal-navy transition-colors">
                        <div className="relative w-16 aspect-square bg-surface-variant rounded overflow-hidden">
                          {upsell.images[0] && <Image fill sizes="64px" src={upsell.images[0].url} alt={upsell.name} className="object-cover" />}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-body-sm font-semibold text-charcoal-navy leading-tight">{upsell.name}</h5>
                          <span className="font-label-sm text-on-surface-variant uppercase tracking-widest">₹{upsell.price.toLocaleString('en-IN')}</span>
                        </div>
                        <button 
                          onClick={() => addItem({
                            id: crypto.randomUUID(),
                            productId: upsell.id,
                            product: upsell,
                            quantity: 1
                          })}
                          className="w-8 h-8 rounded-full bg-charcoal-navy text-pearl-white flex items-center justify-center hover:bg-ag-purple transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="pt-6 border-t border-brand-silver mt-auto space-y-6 pb-6">
            <div className="flex justify-between font-headline-md text-[24px] font-medium text-on-surface">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <p className="font-label-sm text-[11px] text-on-surface-variant text-center tracking-widest uppercase font-bold">
              Shipping & taxes calculated at checkout
            </p>
            <Link href="/checkout" onClick={() => setIsOpen(false)} className="block w-full">
              <Button className="w-full h-14 font-label-md text-[14px] uppercase tracking-widest bg-charcoal-navy hover:bg-ag-purple transition-colors">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
