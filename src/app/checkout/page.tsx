"use client";

import { useState, FormEvent, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/authStore";
import { calculateCartTotals } from "@/lib/cart-utils";
import { WooCommerceOrderPayload } from "@/types/woocommerce";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { trackPurchase } from "@/lib/analytics";
import { getAvailableShippingMethods, FREE_SHIPPING_THRESHOLD, calculateDeliveryEstimate } from "@/services/shipping";
import { ShippingMethod } from "@/types/shipping";

import { validateCoupon } from "@/services/coupon";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buynow";
  
  const { 
    items: cartItems, clearCart, buyNowItem, clearBuyNowItem,
    availableShippingMethods, setAvailableShippingMethods,
    selectedShippingMethod, setSelectedShippingMethod,
    appliedCoupon, setAppliedCoupon
  } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  // Resolve data based on mode
  const items = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems;
  const { subtotal, itemCount, shippingCost, newSubtotal, discountAmount } = calculateCartTotals(items, selectedShippingMethod, appliedCoupon);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Auto-fill from user
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
      }));
    }
  }, [isAuthenticated, user]);

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  
  // New Features State
  const [orderNotes, setOrderNotes] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Pincode validation effect
  useEffect(() => {
    if (formData.pincode.length === 6) {
      // Mock India Post API / Pincode resolution
      const prefix = formData.pincode.substring(0, 2);
      let resolvedState = "Maharashtra";
      let resolvedCity = "Mumbai";

      if (prefix === "11") { resolvedState = "Delhi"; resolvedCity = "New Delhi"; }
      else if (prefix === "56") { resolvedState = "Karnataka"; resolvedCity = "Bengaluru"; }
      else if (prefix === "60") { resolvedState = "Tamil Nadu"; resolvedCity = "Chennai"; }
      else if (prefix === "70") { resolvedState = "West Bengal"; resolvedCity = "Kolkata"; }
      
      setFormData(prev => ({
        ...prev,
        city: prev.city || resolvedCity,
        state: prev.state || resolvedState,
      }));

      // Fetch Shipping Methods
      getAvailableShippingMethods(formData.pincode).then(methods => {
        setAvailableShippingMethods(methods);
        if (methods.length > 0) {
          if (!selectedShippingMethod || !methods.find(m => m.id === selectedShippingMethod.id)) {
            setSelectedShippingMethod(methods[0]);
          }
        } else {
          setSelectedShippingMethod(null);
        }
      });
    }
  }, [formData.pincode, selectedShippingMethod, setAvailableShippingMethods, setSelectedShippingMethod]);

  // Derived Values
  const giftWrapFee = giftWrap ? 100 : 0;
  
  // Shipping cost is now determined by calculateCartTotals
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - newSubtotal;
  
  const total = newSubtotal + shippingCost + giftWrapFee;

  // Simple Validation
  const isValid = 
    formData.email.includes("@") &&
    formData.phone.length >= 10 &&
    formData.firstName.length > 0 &&
    formData.lastName.length > 0 &&
    formData.address.length > 0 &&
    formData.city.length > 0 &&
    formData.state.length > 0 &&
    formData.pincode.length >= 6 &&
    selectedShippingMethod !== null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyCoupon = async () => {
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

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleExpressPay = (method: string) => {
    // Simulate express payment filling out form and submitting
    setFormData({
      email: "express@example.com",
      phone: "9876543210",
      firstName: "Express",
      lastName: "User",
      address: "123 Express Lane",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    });
    setPaymentMethod("card");
    alert(`Simulating ${method} authentication... Form filled securely via wallet.`);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    
    // Meta data for order
    const meta_data = [];
    if (giftWrap) meta_data.push({ key: 'gift_wrap', value: 'yes' });
    if (giftMessage) meta_data.push({ key: 'gift_message', value: giftMessage });

    const payload: WooCommerceOrderPayload = {
      payment_method: paymentMethod,
      payment_method_title: paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Card' : 'Cash on Delivery',
      set_paid: paymentMethod !== 'cod',
      customer_note: orderNotes,
      meta_data,
      billing: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.pincode,
        country: "IN",
        email: formData.email,
        phone: formData.phone
      },
      shipping: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.pincode,
        country: "IN",
      },
      line_items: items.map(i => ({
        product_id: parseInt(i.product.id),
        quantity: i.quantity,
        ...(i.variationId && { variation_id: parseInt(i.variationId) })
      })),
      shipping_lines: selectedShippingMethod ? [{
        method_id: selectedShippingMethod.methodId,
        method_title: selectedShippingMethod.title,
        total: shippingCost.toString()
      }] : []
    };

    if (appliedCoupon) {
      (payload as any).coupon_lines = [{ code: appliedCoupon.code }];
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Order failed");
      
      const generatedOrderId = `AG${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Fire tracking event before clearing items
      trackPurchase(generatedOrderId, total, items);

      if (isBuyNow) {
        clearBuyNowItem();
      } else {
        clearCart();
      }
      router.push(`/order-success?orderId=${generatedOrderId}&email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      console.error(error);
      alert("Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common Input Class
  const inputClass = "w-full bg-transparent border border-outline-variant focus:border-primary focus:ring-0 px-4 py-3 rounded outline-none transition-colors font-body-md text-charcoal-navy placeholder:text-on-surface-variant/60";

  const OrderSummaryContent = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 items-center">
            <div className="relative w-16 h-16 bg-surface-dim rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
              {(item.image || item.product.images?.[0]?.url) && (
                <Image fill sizes="64px" src={item.image || item.product.images[0].url} alt={item.product.name} className="object-cover" />
              )}
              <div className="absolute -top-2 -right-2 bg-charcoal-navy text-pearl-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full z-10">
                {item.quantity}
              </div>
            </div>
            <div className="flex-grow">
              <h4 className="font-body-md font-medium text-charcoal-navy line-clamp-1">{item.title || item.product.name}</h4>
              <p className="font-label-sm text-on-surface-variant uppercase tracking-widest">{item.product.categories?.[0]?.name || "Jewelry"}</p>
              {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                <p className="font-sans text-on-surface-variant text-[11px] mt-0.5 capitalize">
                  {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                </p>
              )}
              <div className="flex gap-4 mt-1 font-sans text-[12px] text-on-surface-variant">
                <span>Qty: {item.quantity}</span>
                <span>@ ₹{(item.price ?? (item.product.price || 0)).toLocaleString('en-IN')} each</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <PriceDisplay regularPrice={(item.price ?? (item.product.price || 0)) * item.quantity} salePrice={item.product.salePrice ? item.product.salePrice * item.quantity : undefined} />
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-on-surface-variant text-sm py-4">Your cart is empty.</p>
        )}
      </div>

      {/* Coupon Section */}
      <div className="flex flex-col gap-2">
        {appliedCoupon ? (
          <div className="flex justify-between items-center bg-green-50 p-3 rounded border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <span className="material-symbols-outlined text-[18px]">local_offer</span>
              <span className="font-semibold">{appliedCoupon.code}</span> applied
            </div>
            <button onClick={removeCoupon} className="text-on-surface-variant hover:text-charcoal-navy text-sm font-semibold">Remove</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Discount code (try WELCOME10)" 
              className={inputClass} 
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
            />
            <Button disabled={isApplyingCoupon || !couponCodeInput.trim()} onClick={applyCoupon} type="button" variant="outline" className="border-outline-variant text-charcoal-navy hover:bg-surface-variant h-auto px-6">
              {isApplyingCoupon ? '...' : 'Apply'}
            </Button>
          </div>
        )}
        {couponError && <p className="text-red-500 text-xs font-semibold">{couponError}</p>}
      </div>

      <div className="flex flex-col gap-3 font-body-md text-charcoal-navy border-t border-outline-variant/30 pt-6">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Subtotal</span>
          <span className={appliedCoupon ? "line-through text-on-surface-variant/60" : ""}>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        {appliedCoupon && discountAmount > 0 && (
          <div className="flex justify-between text-ag-purple font-semibold">
            <span>Discount ({appliedCoupon.code})</span>
            <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
          </div>
        )}
        
        {/* Shipping Methods Selection */}
        {formData.pincode.length >= 6 && availableShippingMethods.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <p className="font-label-sm font-semibold uppercase tracking-widest text-on-surface-variant mb-1 border-b border-outline-variant/30 pb-2">Shipping Method</p>
            {availableShippingMethods.map(method => (
              <label key={method.id} className="flex items-center gap-3 cursor-pointer p-2 border border-outline-variant/30 rounded hover:bg-surface-variant/30">
                <input 
                  type="radio" 
                  name="checkoutShippingMethod" 
                  className="accent-brand-amethyst w-4 h-4"
                  checked={selectedShippingMethod?.id === method.id}
                  onChange={() => setSelectedShippingMethod(method)}
                />
                <div className="flex-1 flex justify-between items-center">
                  <span className="font-body-sm text-charcoal-navy">{method.title}</span>
                  <span className="font-label-sm font-bold uppercase tracking-widest text-ag-purple">
                    {appliedCoupon?.free_shipping || newSubtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : (method.price === 0 ? 'FREE' : `₹${method.price}`)}
                  </span>
                </div>
              </label>
            ))}
            {selectedShippingMethod && (
              <div className="mt-1 flex gap-2 items-start bg-surface-lavender p-3 rounded text-xs text-brand-amethyst">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <p>Delivery: <span className="font-bold">{calculateDeliveryEstimate(selectedShippingMethod).estimatedDateRange}</span></p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-4">
          <span className="text-on-surface-variant">Shipping</span>
          <div className="text-right">
            <span>
              {!selectedShippingMethod ? 'Enter address' : (shippingCost === 0 ? 'Free' : `₹${shippingCost.toLocaleString('en-IN')}`)}
            </span>
          </div>
        </div>
        
        {/* Shipping Calculator UI */}
        {shippingCost > 0 && (
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-grow h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-ag-purple rounded-full" 
                style={{ width: `${Math.min(100, (newSubtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-ag-purple whitespace-nowrap">Add ₹{amountToFreeShipping.toLocaleString('en-IN')} for Free Shipping</span>
          </div>
        )}

        {giftWrap && (
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Gift Wrap</span>
            <span>₹{giftWrapFee}</span>
          </div>
        )}
        <div className="flex justify-between font-headline-sm text-[20px] font-semibold pt-4 border-t border-outline-variant/30">
          <span>Total</span>
          <div className="flex items-baseline gap-2">
            <span className="text-on-surface-variant text-[12px] uppercase font-normal tracking-widest">INR</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return <div className="min-h-screen bg-pearl-white" />;

  return (
    <div className="min-h-screen bg-pearl-white">
      {/* Checkout Header */}
      <header className="border-b border-outline-variant/30 bg-pearl-white py-6">
        <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop flex justify-center tablet:justify-start">
          <Link href="/">
            <Image src="/brand/logo.png" alt="AG Elements" width={160} height={40} className="h-8 w-auto object-contain" />
          </Link>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop py-8 tablet:py-12">
        <div className="flex flex-col-reverse tablet:grid tablet:grid-cols-12 gap-8 tablet:gap-16">
          
          {/* Left Column: Forms */}
          <div className="tablet:col-span-7">
            
            {/* Express Checkout */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-outline-variant/30 flex-grow" />
                <span className="font-label-sm uppercase tracking-widest text-on-surface-variant">Express Checkout</span>
                <div className="h-px bg-outline-variant/30 flex-grow" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => handleExpressPay('Shop Pay')} className="h-12 bg-[#5A31F4] hover:bg-[#4d2ad1] rounded flex items-center justify-center transition-colors">
                  <span className="text-white font-bold text-lg tracking-tight">shop<span className="font-normal text-white/80">Pay</span></span>
                </button>
                <button onClick={() => handleExpressPay('Google Pay')} className="h-12 bg-black hover:bg-black/80 rounded flex items-center justify-center transition-colors">
                  <span className="text-white font-semibold">GPay</span>
                </button>
                <button onClick={() => handleExpressPay('Apple Pay')} className="h-12 bg-black hover:bg-black/80 rounded flex items-center justify-center transition-colors">
                  <span className="text-white font-semibold">Pay</span>
                </button>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="h-px bg-outline-variant/30 flex-grow" />
                <span className="font-label-sm uppercase tracking-widest text-on-surface-variant">Or continue below</span>
                <div className="h-px bg-outline-variant/30 flex-grow" />
              </div>
            </div>

            {/* Mobile Summary Accordion (hidden on desktop) */}
            <div className="block tablet:hidden mb-8 border border-outline-variant rounded-lg bg-surface-container-low overflow-hidden">
              <Accordion>
                <AccordionItem value="summary" className="border-0">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline flex justify-between bg-surface-container-low">
                    <span className="font-label-md text-primary font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                      Show order summary ({itemCount})
                    </span>
                    <span className="font-headline-sm text-charcoal-navy font-semibold">₹{total.toLocaleString('en-IN')}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-6 bg-surface-container-low border-t border-outline-variant/30 pt-6">
                    <OrderSummaryContent />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              
              {/* Contact Information & Guest Checkout */}
              <section className="flex flex-col gap-4">
                <div className="flex justify-between items-baseline">
                  <h2 className="font-headline-sm text-[24px] font-medium text-charcoal-navy">Contact Information</h2>
                  {!isAuthenticated && (
                    <Link href="/account/login?redirect=/checkout" className="text-sm font-semibold text-ag-purple hover:underline">
                      Log in for faster checkout
                    </Link>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <input required name="email" type="email" placeholder="Email address" value={formData.email} onChange={handleInputChange} className={inputClass} />
                  <input required name="phone" type="tel" placeholder="Phone number (for shipping updates)" value={formData.phone} onChange={handleInputChange} className={inputClass} />
                </div>
              </section>

              {/* Shipping Address */}
              <section className="flex flex-col gap-4">
                <h2 className="font-headline-sm text-[24px] font-medium text-charcoal-navy">Shipping Address</h2>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input required name="firstName" type="text" placeholder="First name" value={formData.firstName} onChange={handleInputChange} className={inputClass} />
                    <input required name="lastName" type="text" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <input required name="address" type="text" placeholder="Address" value={formData.address} onChange={handleInputChange} className={inputClass} />
                  <div className="grid grid-cols-2 tablet:grid-cols-3 gap-3">
                    <input required name="pincode" type="text" maxLength={6} placeholder="PIN code" value={formData.pincode} onChange={handleInputChange} className={`${inputClass} col-span-2 tablet:col-span-1 border-ag-purple focus:ring-1 focus:ring-ag-purple`} />
                    <input required name="city" type="text" placeholder="City" value={formData.city} onChange={handleInputChange} className={inputClass} />
                    <input required name="state" type="text" placeholder="State" value={formData.state} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <input disabled value="India" className={`${inputClass} bg-surface-variant/30 text-on-surface-variant`} />
                </div>
              </section>

              {/* Gifting & Order Notes */}
              <section className="flex flex-col gap-4">
                <h2 className="font-headline-sm text-[24px] font-medium text-charcoal-navy">Gifting & Notes</h2>
                <div className="border border-outline-variant rounded overflow-hidden">
                  <label className="flex items-center gap-3 p-4 cursor-pointer bg-surface-container-low hover:bg-surface-variant/50 transition-colors">
                    <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="w-4 h-4 accent-primary" />
                    <div className="flex flex-col">
                      <span className="font-body-md text-charcoal-navy font-semibold">Add Gift Wrap (+₹100)</span>
                      <span className="font-body-sm text-on-surface-variant">Beautiful premium packaging.</span>
                    </div>
                  </label>
                  
                  {giftWrap && (
                    <div className="p-4 border-t border-outline-variant bg-pearl-white">
                      <textarea 
                        placeholder="Gift Message (Optional)" 
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        className={`${inputClass} min-h-[80px] resize-none`}
                        maxLength={150}
                      />
                      <p className="text-right text-xs text-on-surface-variant mt-1">{giftMessage.length}/150</p>
                    </div>
                  )}
                  
                  <div className="p-4 border-t border-outline-variant bg-pearl-white">
                    <textarea 
                      name="orderNotes"
                      placeholder="Special instructions for delivery or order notes..." 
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className={`${inputClass} min-h-[80px] resize-none`}
                    />
                  </div>
                </div>
              </section>

              {/* Billing Address */}
              <section className="flex flex-col gap-4">
                <h2 className="font-headline-sm text-[24px] font-medium text-charcoal-navy">Billing Address</h2>
                <div className="border border-outline-variant rounded overflow-hidden">
                  <label className="flex items-center gap-3 p-4 cursor-pointer bg-surface-container-low border-b border-outline-variant">
                    <input type="checkbox" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} className="w-4 h-4 accent-primary" />
                    <span className="font-body-md text-charcoal-navy">Same as shipping address</span>
                  </label>
                  {!sameAsShipping && (
                    <div className="p-4 bg-surface-container-low/50 text-on-surface-variant font-body-sm italic">
                      Billing address fields would expand here.
                    </div>
                  )}
                </div>
              </section>

              {/* Payment */}
              <section className="flex flex-col gap-4">
                <h2 className="font-headline-sm text-[24px] font-medium text-charcoal-navy">Payment</h2>
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest -mt-2">All transactions are secure and encrypted.</p>
                <div className="border border-outline-variant rounded overflow-hidden flex flex-col">
                  {['upi', 'card', 'cod'].map((method, i, arr) => (
                    <label key={method} className={`flex flex-col p-4 cursor-pointer transition-colors ${paymentMethod === method ? 'bg-primary/5' : 'bg-surface-container-low'} ${i !== arr.length - 1 ? 'border-b border-outline-variant' : ''}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="payment" 
                          value={method} 
                          checked={paymentMethod === method} 
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 accent-primary" 
                        />
                        <span className="font-body-md text-charcoal-navy font-medium">
                          {method === 'upi' ? 'UPI (Google Pay, PhonePe, Paytm)' : method === 'card' ? 'Credit / Debit Card' : 'Cash on Delivery (COD)'}
                        </span>
                      </div>
                      {paymentMethod === method && method !== 'cod' && (
                        <div className="mt-4 ml-7 font-body-sm text-on-surface-variant border border-outline-variant/50 p-4 rounded bg-pearl-white">
                          <p>You will be redirected securely to complete your payment.</p>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </section>

              {/* Submit */}
              <div className="pt-4 pb-12 tablet:pb-0">
                <Button 
                  type="submit" 
                  disabled={!isValid || isSubmitting || items.length === 0} 
                  className="w-full h-14 font-label-lg text-[16px] tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')}`}
                </Button>
                {!isValid && items.length > 0 && (
                  <p className="text-center font-label-sm text-charcoal-navy/60 mt-4">Please fill in all required fields to continue.</p>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Desktop Summary */}
          <div className="hidden tablet:block tablet:col-span-5 relative">
            <div className="sticky top-24 bg-surface-container-low p-8 border border-outline-variant/50 rounded-xl">
              <h2 className="font-headline-sm text-[24px] font-medium text-charcoal-navy mb-6">Order Summary</h2>
              <OrderSummaryContent />
              
              <div className="mt-8 border-t border-outline-variant/30 pt-4">
                <TrustBadges />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pearl-white flex items-center justify-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
