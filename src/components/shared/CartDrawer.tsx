"use client";

import { useCartStore } from '@/store/cart';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import Link from 'next/link';

import { calculateCartTotals } from '@/lib/cart-utils';
import { Product } from '@/types/product';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FREE_SHIPPING_THRESHOLD, getAvailableShippingMethods, calculateDeliveryEstimate } from '@/services/shipping';
import { ShippingAddress } from '@/types/shipping';
import { validateCoupon } from '@/services/coupon';

export function CartDrawer() {
  const { 
    isOpen, setIsOpen, items, removeItem, updateQuantity, addItem,
    shippingAddress, setShippingAddress, 
    availableShippingMethods, setAvailableShippingMethods,
    selectedShippingMethod, setSelectedShippingMethod,
    appliedCoupon, setAppliedCoupon
  } = useCartStore();
  
  const { subtotal, newSubtotal, discountAmount, shippingCost, total } = calculateCartTotals(items, selectedShippingMethod, appliedCoupon);
  const [upsells, setUpsells] = useState<Product[]>([]);
  
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    
    const result = await validateCoupon(couponCodeInput, subtotal, items);
    
    if (result.isValid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponCodeInput('');
    } else {
      setCouponError(result.error || 'Invalid coupon.');
    }
    
    setIsApplyingCoupon(false);
  };

  
  const [isEstimating, setIsEstimating] = useState(false);
  const [estPincode, setEstPincode] = useState(shippingAddress?.pincode || '');
  const [estState, setEstState] = useState(shippingAddress?.state || '');

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

  const progress = Math.min(100, (newSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - newSubtotal;
  
  const hasFreeShipping = appliedCoupon?.free_shipping || amountToFreeShipping <= 0 || (selectedShippingMethod && selectedShippingMethod.price === 0);

  const handleEstimateShipping = async () => {
    if (!estPincode) return;
    setIsEstimating(true);
    
    const address: ShippingAddress = {
      country: 'IN',
      state: estState,
      city: '',
      pincode: estPincode
    };
    
    setShippingAddress(address);
    const methods = await getAvailableShippingMethods(estPincode);
    setAvailableShippingMethods(methods);
    
    // Auto-select the first method if none selected or if current isn't in list
    if (methods.length > 0) {
      if (!selectedShippingMethod || !methods.find(m => m.id === selectedShippingMethod.id)) {
        setSelectedShippingMethod(methods[0]);
      }
    } else {
      setSelectedShippingMethod(null);
    }
    
    setIsEstimating(false);
  };

  const deliveryEstimate = selectedShippingMethod ? calculateDeliveryEstimate(selectedShippingMethod) : null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-pearl-white flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="font-heading text-headline-md text-brand-amethyst text-left">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length > 0 && (
          <div className="bg-surface-container-lowest px-6 py-3 border-b border-outline-variant/30 text-center animate-in fade-in slide-in-from-top-2 duration-300">
            {hasFreeShipping ? (
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
        
        <div className="flex-1 overflow-y-auto p-6 pt-4">
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
                    {(item.image || item.product.images?.[0]?.url) && (
                      <Image fill sizes="64px" src={item.image || item.product.images[0].url} alt={item.product.name} className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="font-heading text-[18px] text-on-surface line-clamp-2">{item.title || item.product.name}</h4>
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <p className="font-sans text-on-surface-variant text-[12px] mt-0.5 capitalize">
                          {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </p>
                      )}
                      <div className="flex gap-4 mt-1 font-sans text-[14px]">
                        <p className="text-on-surface-variant">₹{(item.price ?? (Number(item.product.price) || 0)).toLocaleString('en-IN')} each</p>
                        <p className="text-charcoal-navy font-semibold">Total: ₹{((item.price ?? (Number(item.product.price) || 0)) * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
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
              
              {/* Shipping Estimator */}
              <div className="border border-outline-variant/30 rounded-lg bg-surface-container-lowest mt-4 overflow-hidden">
                <Accordion type="single" collapsible defaultValue={shippingAddress ? "estimate" : undefined}>
                  <AccordionItem value="estimate" className="border-none">
                    <AccordionTrigger className="px-4 py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                        <span className="font-label-md font-bold uppercase tracking-widest text-charcoal-navy">Estimate Shipping</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input 
                            type="text" 
                            placeholder="Pincode" 
                            value={estPincode}
                            onChange={(e) => setEstPincode(e.target.value)}
                            className="border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-amethyst bg-transparent"
                          />
                          <input 
                            type="text" 
                            placeholder="State" 
                            value={estState}
                            onChange={(e) => setEstState(e.target.value)}
                            className="border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-amethyst bg-transparent"
                          />
                        </div>
                        <Button 
                          onClick={handleEstimateShipping} 
                          disabled={isEstimating || !estPincode}
                          variant="outline" 
                          className="w-full text-xs h-9 uppercase tracking-widest"
                        >
                          {isEstimating ? 'Calculating...' : 'Calculate'}
                        </Button>
                        
                        {availableShippingMethods.length > 0 && (
                          <div className="mt-4 flex flex-col gap-2">
                            <p className="font-label-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-1">Available Methods</p>
                            {availableShippingMethods.map(method => (
                              <label key={method.id} className="flex items-center gap-3 cursor-pointer p-2 border border-outline-variant/30 rounded hover:bg-surface-variant/30">
                                <input 
                                  type="radio" 
                                  name="shippingMethod" 
                                  className="accent-brand-amethyst w-4 h-4"
                                  checked={selectedShippingMethod?.id === method.id}
                                  onChange={() => setSelectedShippingMethod(method)}
                                />
                                <div className="flex-1 flex justify-between items-center">
                                  <span className="font-body-sm text-charcoal-navy">{method.title}</span>
                                  <span className="font-label-sm font-bold uppercase tracking-widest text-ag-purple">
                                    {subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : (method.price === 0 ? 'FREE' : `₹${method.price}`)}
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {deliveryEstimate && (
                          <div className="mt-2 flex gap-2 items-start bg-surface-lavender p-3 rounded text-sm text-brand-amethyst">
                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            <p>Estimated Delivery: <span className="font-bold">{deliveryEstimate.estimatedDateRange}</span></p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {upsells.length > 0 && (
                <div className="mt-4 border-t border-outline-variant/30 pt-6">
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
          <div className="p-6 border-t border-brand-silver bg-pearl-white flex flex-col gap-4">
            
            {/* Coupon Section */}
            <div className="flex flex-col gap-2">
              {appliedCoupon ? (
                <div className="flex justify-between items-center bg-green-50 p-3 rounded border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="material-symbols-outlined text-[18px]">local_offer</span>
                    <span className="font-semibold text-sm">{appliedCoupon.code}</span>
                  </div>
                  <button 
                    onClick={() => setAppliedCoupon(null)} 
                    className="text-on-surface-variant hover:text-charcoal-navy text-xs uppercase tracking-widest font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Coupon code" 
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    className="flex-1 bg-transparent border border-outline-variant/50 focus:border-brand-amethyst focus:ring-0 px-3 py-2 rounded outline-none transition-colors font-body-sm text-charcoal-navy placeholder:text-on-surface-variant/60 uppercase"
                  />
                  <Button 
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCodeInput.trim()}
                    variant="outline" 
                    className="border-outline-variant text-charcoal-navy hover:bg-surface-variant h-auto px-4"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </Button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-[11px] font-semibold">{couponError}</p>}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between font-sans text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span className={appliedCoupon ? "line-through text-on-surface-variant/60" : ""}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between font-sans text-sm text-ag-purple font-semibold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between font-sans text-sm text-on-surface-variant">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 
                    ? (appliedCoupon?.free_shipping || newSubtotal >= FREE_SHIPPING_THRESHOLD || (selectedShippingMethod && selectedShippingMethod.price === 0) ? 'Free' : 'Calculated at checkout') 
                    : `₹${shippingCost.toLocaleString('en-IN')}`}
                </span>
              </div>
              
              <div className="flex justify-between font-headline-md text-[24px] font-medium text-on-surface mt-2 pt-2 border-t border-outline-variant/20">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
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
