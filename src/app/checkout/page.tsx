"use client";

import { useState, FormEvent, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { mapWooCommerceError } from "@/lib/error-mapper";
import { PAYMENT_METHODS } from "@/config/payment-methods";

function CheckoutContent() {
  const router = useRouter();
  const { fetchCart, cart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const initCheckout = async () => {
      try {
        const res = await fetch('/api/checkout');
        if (res.ok) {
          const data = await res.json();
          setCheckoutData(data);
          const availableMethods = data.payment_methods || [];
          if (availableMethods.length > 0) {
            setPaymentMethod(availableMethods[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to initialize checkout", error);
      } finally {
        setIsLoading(false);
      }
    };
    initCheckout();
  }, []);

  useEffect(() => {
    if (!cart) {
      fetchCart();
    }
  }, [cart, fetchCart]);

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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  
  // New Features State
  const [orderNotes, setOrderNotes] = useState("");
  
  // Use cart from store for items and totals
  const items = cart?.items || [];
  const totals: any = cart?.totals || {};
  // Hybrid Payment Gateway Architecture:
  // 1. The frontend registry (PAYMENT_METHODS) defines which gateways are supported and enabled in the headless UI.
  // 2. We use this as the base, because the WooCommerce Store API often omits gateways (like Razorpay) due to plugin incompatibilities or pending shipping calculations.
  // 3. We merge any *additional* gateways provided by WooCommerce, unless explicitly disabled in the frontend config.
  const backendMethods = checkoutData?.payment_methods || [];
  const paymentMethods = PAYMENT_METHODS.filter(m => m.enabled);
  
  for (const bm of backendMethods) {
    const existing = paymentMethods.find(pm => pm.id === bm.id);
    const explicitlyDisabled = PAYMENT_METHODS.find(pm => pm.id === bm.id && pm.enabled === false);
    
    if (!existing && !explicitlyDisabled) {
      paymentMethods.push(bm);
    }
  }

  const totalRaw = parseInt(totals?.total_price || '0', 10) / (10 ** (totals?.currency_minor_unit || 2));
  const subtotalRaw = parseInt(totals?.total_items || '0', 10) / (10 ** (totals?.currency_minor_unit || 2));
  const shippingRaw = parseInt(totals?.total_shipping || '0', 10) / (10 ** (totals?.currency_minor_unit || 2));
  const discountRaw = parseInt(totals?.total_discount || '0', 10) / (10 ** (totals?.currency_minor_unit || 2));

  // Simple Validation
  const isValid = 
    formData.email.includes("@") &&
    formData.phone.length >= 10 &&
    formData.firstName.length > 0 &&
    formData.lastName.length > 0 &&
    formData.address.length > 0 &&
    formData.city.length > 0 &&
    formData.state.length > 0 &&
    formData.pincode.length >= 6;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setCheckoutError(null);
    setIsSubmitting(true);
    
    const payload = {
      billing_address: {
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
      shipping_address: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.pincode,
        country: "IN",
        phone: formData.phone
      },
      customer_note: orderNotes,
      payment_method: paymentMethod,
      payment_data: [],
      create_account: createAccount
    };

    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setCheckoutError(mapWooCommerceError(data.code || '', data.message || data.error || "Order failed"));
        setIsSubmitting(false);
        return;
      }
      
      if (data.razorpay_order_id && data.key_id) {
        // Open Razorpay Modal
        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: "AG Elements",
          description: `Order #${data.wc_order_id}`,
          order_id: data.razorpay_order_id,
          handler: async function (response: any) {
             try {
               const verifyRes = await fetch('/api/payment/verify', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   razorpay_order_id: response.razorpay_order_id,
                   razorpay_payment_id: response.razorpay_payment_id,
                   razorpay_signature: response.razorpay_signature,
                   wc_order_id: data.wc_order_id
                 })
               });
               
               if (verifyRes.ok) {
                 fetchCart();
                 router.push(`/payment-processing?orderId=${data.wc_order_id}&email=${encodeURIComponent(formData.email)}`);
               } else {
                 setCheckoutError("Payment verification failed. Please contact support.");
                 setIsSubmitting(false);
               }
             } catch (err) {
                 setCheckoutError("Payment verification failed. Please contact support.");
                 setIsSubmitting(false);
             }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: "#6B5B95" // ag-purple
          },
          modal: {
            ondismiss: function() {
              setIsSubmitting(false);
              setCheckoutError("Payment cancelled. You can retry the payment from your Account dashboard, or try again here.");
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any){
           setCheckoutError(`Payment failed: ${response.error.description}`);
           setIsSubmitting(false);
        });
        rzp.open();
      } else {
        // Fallback for non-razorpay/COD methods
        const orderId = data.order_id || data.wc_order_id || `AG${Math.floor(100000 + Math.random() * 900000)}`;
        fetchCart();
        router.push(`/order-success?orderId=${orderId}&email=${encodeURIComponent(formData.email)}`);
      }
    } catch (error: any) {
      console.error(error);
      setCheckoutError(mapWooCommerceError('', error.message || "An unexpected error occurred."));
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-transparent border border-outline-variant focus:border-primary focus:ring-0 px-4 py-3 rounded outline-none transition-colors font-body-md text-charcoal-navy placeholder:text-on-surface-variant/60";

  const OrderSummaryContent = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item: any) => {
          const unitPriceRaw = parseInt(item.prices.price, 10) / (10 ** totals!.currency_minor_unit);
          return (
            <div key={item.key} className="flex gap-4 items-center">
              <div className="relative w-16 h-16 bg-surface-dim rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                {item.images?.[0]?.src && (
                  <Image fill sizes="64px" src={item.images[0].src} alt={item.name} className="object-cover" />
                )}
                <div className="absolute -top-2 -right-2 bg-charcoal-navy text-pearl-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full z-10">
                  {item.quantity}
                </div>
              </div>
              <div className="flex-grow">
                <h4 className="font-body-md font-medium text-charcoal-navy line-clamp-1" dangerouslySetInnerHTML={{ __html: item.name }} />
                {item.variation && item.variation.length > 0 && (
                  <p className="font-sans text-on-surface-variant text-[11px] mt-0.5 capitalize">
                    {item.variation.map((v: any) => `${v.attribute.replace('pa_', '')}: ${v.value}`).join(' | ')}
                  </p>
                )}
                <div className="flex gap-4 mt-1 font-sans text-[12px] text-on-surface-variant">
                  <span>Qty: {item.quantity}</span>
                  <span>@ ₹{unitPriceRaw.toLocaleString('en-IN')} each</span>
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-on-surface-variant text-sm py-4">Your cart is empty.</p>
        )}
      </div>

      <div className="flex flex-col gap-3 font-body-md text-charcoal-navy border-t border-outline-variant/30 pt-6">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Subtotal</span>
          <span>₹{subtotalRaw.toLocaleString('en-IN')}</span>
        </div>
        
        {discountRaw > 0 && (
          <div className="flex justify-between text-ag-purple font-semibold">
            <span>Discount</span>
            <span>-₹{discountRaw.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <span className="text-on-surface-variant">Shipping</span>
          <div className="text-right">
            <span>
              {shippingRaw === 0 ? 'Calculated at checkout' : `₹${shippingRaw.toLocaleString('en-IN')}`}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between font-headline-sm text-[20px] font-semibold pt-4 border-t border-outline-variant/30">
          <span>Total</span>
          <div className="flex items-baseline gap-2">
            <span className="text-on-surface-variant text-[12px] uppercase font-normal tracking-widest">INR</span>
            <span>₹{totalRaw.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading || (!checkoutData && !cart)) return <div className="min-h-screen bg-pearl-white flex justify-center items-center font-heading text-lg text-ag-purple">Loading checkout...</div>;
  if (items.length === 0) return <div className="min-h-screen bg-pearl-white flex justify-center items-center font-heading text-lg text-charcoal-navy">Your cart is empty.</div>;

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

            <div className="block tablet:hidden mb-8 border border-outline-variant rounded-lg bg-surface-container-low overflow-hidden">
              <Accordion>
                <AccordionItem value="summary" className="border-0">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline flex justify-between bg-surface-container-low">
                    <span className="font-label-md text-primary font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                      Show order summary
                    </span>
                    <span className="font-headline-sm text-charcoal-navy font-semibold">₹{totalRaw.toLocaleString('en-IN')}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-6 bg-surface-container-low border-t border-outline-variant/30 pt-6">
                    <OrderSummaryContent />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
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
                  
                  {!isAuthenticated && (
                    <label className="flex items-center gap-3 cursor-pointer mt-1 w-fit">
                      <input 
                        type="checkbox" 
                        checked={createAccount} 
                        onChange={(e) => setCreateAccount(e.target.checked)} 
                        className="w-4 h-4 accent-primary rounded" 
                      />
                      <span className="font-body-sm text-charcoal-navy">Create an account for faster checkout next time</span>
                    </label>
                  )}
                </div>
              </section>

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

              <section className="flex flex-col gap-4">
                <h2 className="font-headline-sm text-[24px] font-medium text-charcoal-navy">Payment Method</h2>
                <div className="flex flex-col gap-3">
                  {paymentMethods.length > 0 ? paymentMethods.map((method: any) => (
                    <label key={method.id} className={`flex flex-col p-4 border rounded cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-primary bg-surface-container-low' : 'border-outline-variant hover:border-primary/50'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          checked={paymentMethod === method.id} 
                          onChange={() => setPaymentMethod(method.id)} 
                          className="w-4 h-4 accent-primary" 
                        />
                        <span className="font-body-md font-semibold text-charcoal-navy">{method.title}</span>
                      </div>
                      {paymentMethod === method.id && method.description && (
                        <div className="mt-2 pl-7 font-sans text-sm text-on-surface-variant">
                          <p dangerouslySetInnerHTML={{ __html: method.description }} />
                        </div>
                      )}
                    </label>
                  )) : (
                    <div className="p-4 bg-surface-variant/30 text-on-surface-variant rounded text-sm italic">
                      No payment methods available.
                    </div>
                  )}
                </div>
              </section>

              <div className="pt-4 pb-12 tablet:pb-0">
                {checkoutError && (
                  <div className="mb-6 p-4 rounded bg-red-50 border border-red-200 flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                    <p className="font-sans text-sm text-red-700">{checkoutError}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  disabled={!isValid || isSubmitting || items.length === 0 || !paymentMethod} 
                  className="w-full h-14 font-label-lg text-[16px] tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : `Pay ₹${totalRaw.toLocaleString('en-IN')}`}
                </Button>
                {!isValid && items.length > 0 && (
                  <p className="text-center font-label-sm text-charcoal-navy/60 mt-4">Please fill in all required fields to continue.</p>
                )}
              </div>
            </form>
          </div>

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
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <CheckoutContent />
    </Suspense>
  );
}
