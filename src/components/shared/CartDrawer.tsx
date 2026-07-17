"use client";

import { useCartStore } from '@/store/cart';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import Link from 'next/link';

import { Product } from '@/types/product';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { mapWooCommerceError } from '@/lib/error-mapper';
import { toast } from 'sonner';

export function CartDrawer() {
  const { 
    isOpen, setIsOpen, cart, isSyncing, fetchCart, updateItem, removeItem, addItem
  } = useCartStore();
  
  const [upsells, setUpsells] = useState<Product[]>([]);
  
  // We'll leave coupon and shipping UI placeholders for Phase 5 & 8
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setCouponError(null);
    const result = await useCartStore.getState().applyCoupon(couponCodeInput);
    if (result.success) {
      setCouponCodeInput('');
    } else {
      setCouponError(mapWooCommerceError(result.code || '', result.error));
    }
  };

  const handleRemoveCoupon = async (code: string) => {
    setCouponError(null);
    const result = await useCartStore.getState().removeCoupon(code);
    if (!result.success) {
      setCouponError(mapWooCommerceError(result.code || '', result.error));
    }
  };

  useEffect(() => {
    if (isOpen && !cart) {
      fetchCart();
    }
  }, [isOpen, cart, fetchCart]);

  useEffect(() => {
    if (isOpen && cart && cart.items.length > 0 && upsells.length === 0) {
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
        }
      ] as any);
    }
  }, [isOpen, cart?.items.length, upsells.length]);

  const items = cart?.items || [];
  const totals = cart?.totals;
  const needsShipping = cart?.needs_shipping;

  const totalRaw = parseInt(totals?.total_price || '0', 10) / (10 ** (totals?.currency_minor_unit || 2));
  const subtotalRaw = parseInt(totals?.total_items || '0', 10) / (10 ** (totals?.currency_minor_unit || 2));
  const discountRaw = parseInt(totals?.total_discount || '0', 10) / (10 ** (totals?.currency_minor_unit || 2));
  const shippingRaw = parseInt(totals?.total_shipping || '0', 10) / (10 ** (totals?.currency_minor_unit || 2));

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-pearl-white flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="font-heading text-headline-md text-brand-amethyst text-left flex items-center gap-2">
            Your Cart {isSyncing && <span className="text-[10px] uppercase bg-surface-lavender px-2 py-0.5 rounded animate-pulse">Syncing...</span>}
          </SheetTitle>
        </SheetHeader>

        
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant gap-4">
              <span className="material-symbols-outlined text-[48px] opacity-20">shopping_bag</span>
              <p className="font-sans text-[16px]">Your cart is empty.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => {
                const lineTotalRaw = parseInt(item.totals.line_total, 10) / (10 ** totals!.currency_minor_unit);
                const unitPriceRaw = parseInt(item.prices.price, 10) / (10 ** totals!.currency_minor_unit);

                return (
                  <div key={item.key} className={`flex gap-4 ${isSyncing ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="relative w-24 aspect-[4/5] bg-surface-container-low overflow-hidden">
                      {item.images?.[0]?.src && (
                        <Image fill sizes="64px" src={item.images[0].src} alt={item.name} className="object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h4 className="font-heading text-[18px] text-on-surface line-clamp-2" dangerouslySetInnerHTML={{ __html: item.name }} />
                        {item.variation && item.variation.length > 0 && (
                          <p className="font-sans text-on-surface-variant text-[12px] mt-0.5 capitalize">
                            {item.variation.map(v => `${v.attribute.replace('pa_', '')}: ${v.value}`).join(' | ')}
                          </p>
                        )}
                        <div className="flex gap-4 mt-1 font-sans text-[14px]">
                          <p className="text-on-surface-variant">₹{unitPriceRaw.toLocaleString('en-IN')} each</p>
                          <p className="text-charcoal-navy font-semibold">Total: ₹{lineTotalRaw.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-outline-variant rounded">
                          <button 
                            className="px-2 py-1 text-on-surface-variant hover:text-brand-amethyst disabled:opacity-50"
                            onClick={async () => {
                              const res = await updateItem(item.key, Math.max(1, item.quantity - 1));
                              if (!res.success) toast.error(mapWooCommerceError(res.code || '', res.error));
                            }}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-2 font-sans text-[14px] min-w-[24px] text-center">{item.quantity}</span>
                          <button 
                            className="px-2 py-1 text-on-surface-variant hover:text-brand-amethyst disabled:opacity-50"
                            onClick={async () => {
                              const max = item.quantity_limits?.maximum ?? 9999;
                              if (item.quantity >= max) return;
                              const res = await updateItem(item.key, item.quantity + 1);
                              if (!res.success) toast.error(mapWooCommerceError(res.code || '', res.error));
                            }}
                            disabled={item.quantity_limits ? item.quantity >= item.quantity_limits.maximum : false}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="font-sans text-[12px] uppercase tracking-widest text-on-surface-variant underline underline-offset-4 hover:text-destructive transition-colors"
                          onClick={() => removeItem(item.key)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Shipping Estimator */}
              <div className="border border-outline-variant/30 rounded-lg bg-surface-container-lowest mt-4 overflow-hidden">
                <Accordion>
                  <AccordionItem value="estimate" className="border-none">
                    <AccordionTrigger className="px-4 py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                        <span className="font-label-md font-bold uppercase tracking-widest text-charcoal-navy">Estimate Shipping</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="flex flex-col gap-3">
                        <p className="font-body-sm text-on-surface-variant">Enter your PIN code to estimate delivery options.</p>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            id="cart-pincode"
                            placeholder="PIN code (e.g. 400001)" 
                            maxLength={6}
                            className="flex-1 bg-transparent border border-outline-variant/50 focus:border-brand-amethyst focus:ring-0 px-3 py-2 rounded outline-none transition-colors font-body-sm text-charcoal-navy placeholder:text-on-surface-variant/60"
                            defaultValue={cart?.shipping_address?.postcode || ''}
                          />
                          <Button 
                            variant="outline"
                            disabled={isSyncing}
                            onClick={() => {
                              const el = document.getElementById('cart-pincode') as HTMLInputElement;
                              if (el && el.value.length === 6) {
                                useCartStore.getState().updateShippingAddress({
                                  country: 'IN',
                                  postcode: el.value
                                });
                              }
                            }}
                            className="border-outline-variant text-charcoal-navy hover:bg-surface-variant h-auto px-4"
                          >
                            Calculate
                          </Button>
                        </div>
                        
                        {/* Display Shipping Rates from Cart */}
                        {cart?.shipping_rates && cart.shipping_rates.length > 0 && (
                          <div className="mt-3 flex flex-col gap-2">
                            {cart.shipping_rates[0].shipping_rates.map((rate: any) => (
                              <label key={rate.rate_id} className="flex items-center justify-between p-2 border border-outline-variant/30 rounded cursor-pointer hover:bg-surface-variant/50">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="radio" 
                                    name="shipping_rate"
                                    checked={rate.selected}
                                    onChange={() => useCartStore.getState().selectShippingRate(cart.shipping_rates[0].package_id, rate.rate_id)}
                                    className="accent-ag-purple"
                                  />
                                  <span className="font-body-sm text-charcoal-navy">{rate.name}</span>
                                </div>
                                <span className="font-label-sm font-bold text-ag-purple uppercase tracking-widest">
                                  {parseInt(rate.price, 10) === 0 ? 'FREE' : `₹${parseInt(rate.price, 10) / (10 ** totals!.currency_minor_unit)}`}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-brand-silver bg-pearl-white flex flex-col gap-4">
            
            {/* Coupon Section */}
            <div className="flex flex-col gap-2">
              {cart?.coupons && cart.coupons.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {cart.coupons.map(coupon => (
                    <div key={coupon.code} className="flex justify-between items-center bg-green-50/50 p-2 rounded border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 font-sans text-sm">
                        <span className="material-symbols-outlined text-[16px]">local_offer</span>
                        <span className="font-semibold uppercase">{coupon.code}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveCoupon(coupon.code)}
                        className="text-on-surface-variant hover:text-charcoal-navy text-[12px] font-semibold underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Coupon code" 
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyCoupon();
                      }
                    }}
                    className="flex-1 bg-transparent border border-outline-variant/50 focus:border-brand-amethyst focus:ring-0 px-3 py-2 rounded outline-none transition-colors font-body-sm text-charcoal-navy placeholder:text-on-surface-variant/60 uppercase"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyCoupon}
                    disabled={!couponCodeInput.trim() || isSyncing}
                    className="border-outline-variant text-charcoal-navy hover:bg-surface-variant h-auto px-4"
                  >
                    Apply
                  </Button>
                </div>
              )}
              {couponError && (
                <p className="text-red-500 font-sans text-xs mt-1 bg-red-50 p-2 rounded border border-red-100 flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {couponError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between font-sans text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>₹{subtotalRaw.toLocaleString('en-IN')}</span>
              </div>
              
              {discountRaw > 0 && (
                <div className="flex justify-between font-sans text-sm text-ag-purple font-semibold">
                  <span>Discount</span>
                  <span>-₹{discountRaw.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between font-sans text-sm text-on-surface-variant">
                <span>Shipping</span>
                <span>
                  {shippingRaw === 0 ? (needsShipping ? 'Calculated at checkout' : 'Free') : `₹${shippingRaw.toLocaleString('en-IN')}`}
                </span>
              </div>
              
              <div className="flex justify-between font-headline-md text-[24px] font-medium text-on-surface mt-2 pt-2 border-t border-outline-variant/20">
                <span>Total</span>
                <span>₹{totalRaw.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <Link href="/checkout" onClick={() => setIsOpen(false)} className="block w-full">
              <Button disabled={isSyncing} className="w-full h-14 font-label-md text-[14px] uppercase tracking-widest bg-charcoal-navy hover:bg-ag-purple transition-colors">
                {isSyncing ? 'Syncing Cart...' : 'Proceed to Checkout'}
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
