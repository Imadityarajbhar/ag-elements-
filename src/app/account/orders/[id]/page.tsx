"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Button } from '@/components/ui/button';

interface OrderDetail {
  id: number;
  number: string;
  status: string;
  dateCreated: string;
  datePaid: string | null;
  total: string;
  subtotal: string;
  totalTax: string;
  shippingTotal: string;
  discountTotal: string;
  paymentMethodTitle: string;
  transactionId: string;
  currency: string;
  lineItems: {
    id: number;
    name: string;
    quantity: number;
    price: number;
    subtotal: string;
    total: string;
    sku: string;
    image: string;
    variationId: number;
    metaData: { key: string; value: string }[];
  }[];
  shippingLines: { methodTitle: string; total: string }[];
  couponLines: { code: string; discount: string }[];
  billing: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  customerNote: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700', icon: 'schedule' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: 'sync' },
  'on-hold': { label: 'On Hold', color: 'bg-orange-100 text-orange-700', icon: 'pause_circle' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: 'check_circle' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: 'cancel' },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-700', icon: 'undo' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: 'error' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Payment Retry State
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const handleRetryPayment = async () => {
    if (!order) return;
    setRetryError(null);
    setIsRetrying(true);
    
    try {
      const res = await fetch('/api/payment/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setRetryError(data.error || 'Failed to initialize payment retry.');
        setIsRetrying(false);
        return;
      }
      
      if (data.razorpay_order_id && data.key_id) {
        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: "AG Elements",
          description: `Order #${order.number} Retry`,
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
                   wc_order_id: order.id
                 })
               });
               if (verifyRes.ok) {
                 window.location.reload(); // Reload to fetch updated status
               } else {
                 setRetryError("Payment verification failed. Please contact support.");
                 setIsRetrying(false);
               }
             } catch (err) {
                 setRetryError("Payment verification failed. Please contact support.");
                 setIsRetrying(false);
             }
          },
          prefill: {
            name: `${order.billing.firstName} ${order.billing.lastName}`,
            email: order.billing.email,
            contact: order.billing.phone
          },
          theme: {
            color: "#6B5B95" 
          },
          modal: {
            ondismiss: function() {
              setIsRetrying(false);
              setRetryError("Payment cancelled.");
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any){
           setRetryError(`Payment failed: ${response.error.description}`);
           setIsRetrying(false);
        });
        rzp.open();
      } else {
        setRetryError('Razorpay configuration missing from backend.');
        setIsRetrying(false);
      }
    } catch (err) {
      console.error(err);
      setRetryError("An unexpected error occurred.");
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (!params.id) return;

    fetch(`/api/account/orders/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load order');
        return res.json();
      })
      .then(data => {
        setOrder(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="material-symbols-outlined animate-spin text-3xl text-ag-purple">progress_activity</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12 space-y-4">
        <span className="material-symbols-outlined text-5xl text-outline-variant">error</span>
        <p className="font-body-md text-on-surface-variant">{error || 'Order not found.'}</p>
        <Link href="/account/orders">
          <Button variant="outline" className="border-ag-purple text-ag-purple">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700', icon: 'info' };

  return (
    <div className="space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => router.push('/account/orders')} className="text-on-surface-variant hover:text-charcoal-navy transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="font-headline-md text-[24px] sm:text-[32px] font-medium text-charcoal-navy">
              Order #{order.number}
            </h1>
          </div>
          <p className="font-body-sm text-on-surface-variant">
            Placed on {new Date(order.dateCreated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wider ${statusInfo.color}`}>
          <span className="material-symbols-outlined text-[16px]">{statusInfo.icon}</span>
          {statusInfo.label}
        </span>
      </div>

      {/* Action Buttons & Retry Error */}
      <div className="flex flex-col gap-4">
        {retryError && (
          <div className="p-4 rounded bg-red-50 border border-red-200 flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
            <p className="font-sans text-sm text-red-700">{retryError}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-4 items-center">
          {(order.status === 'pending' || order.status === 'failed') && (
            <Button 
              onClick={handleRetryPayment} 
              disabled={isRetrying}
              className="bg-ag-purple text-pearl-white font-label-md uppercase tracking-widest h-11 px-6"
            >
              {isRetrying ? 'Loading...' : 'Retry Payment'}
            </Button>
          )}
          
          <Button variant="outline" className="border-outline-variant text-charcoal-navy font-label-md uppercase tracking-widest h-11 px-6" onClick={() => alert('Invoice feature coming soon!')}>
            <span className="material-symbols-outlined mr-2 text-[18px]">receipt</span>
            Download Invoice
          </Button>
          
          {['processing', 'completed'].includes(order.status) && (
            <Button variant="outline" className="border-ag-purple text-ag-purple font-label-md uppercase tracking-widest h-11 px-6" onClick={() => alert('Tracking feature coming soon!')}>
              <span className="material-symbols-outlined mr-2 text-[18px]">local_shipping</span>
              Track Order
            </Button>
          )}
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-outline-variant/20">
          <h2 className="font-headline-sm text-lg font-semibold text-charcoal-navy">Items Ordered</h2>
        </div>
        <div className="divide-y divide-outline-variant/20">
          {order.lineItems.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 sm:p-6">
              <div className="relative w-16 h-20 sm:w-20 sm:h-24 bg-surface-lavender rounded-lg overflow-hidden shrink-0">
                {item.image && (
                  <Image fill sizes="80px" src={item.image} alt={item.name} className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-[16px] font-semibold text-charcoal-navy line-clamp-2" dangerouslySetInnerHTML={{ __html: item.name }} />
                {item.sku && <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">SKU: {item.sku}</p>}
                {item.metaData.length > 0 && (
                  <p className="font-body-sm text-on-surface-variant text-xs mt-0.5 capitalize">
                    {item.metaData.map(m => `${m.key}: ${m.value}`).join(' | ')}
                  </p>
                )}
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-2 font-sans text-sm">
                  <span className="text-on-surface-variant">Qty: {item.quantity}</span>
                  <span className="text-on-surface-variant">₹{parseFloat(String(item.price)).toLocaleString('en-IN')} each</span>
                  <span className="font-semibold text-charcoal-navy">₹{parseFloat(item.total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Totals */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 sm:p-6">
          <h2 className="font-headline-sm text-lg font-semibold text-charcoal-navy mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between font-sans text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span>₹{parseFloat(order.subtotal).toLocaleString('en-IN')}</span>
            </div>
            {parseFloat(order.discountTotal) > 0 && (
              <div className="flex justify-between font-sans text-sm text-ag-purple font-semibold">
                <span>Discount</span>
                <span>-₹{parseFloat(order.discountTotal).toLocaleString('en-IN')}</span>
              </div>
            )}
            {order.couponLines.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {order.couponLines.map((c) => (
                  <span key={c.code} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                    <span className="material-symbols-outlined text-[14px]">local_offer</span>
                    {c.code.toUpperCase()} (-₹{parseFloat(c.discount).toLocaleString('en-IN')})
                  </span>
                ))}
              </div>
            )}
            <div className="flex justify-between font-sans text-sm text-on-surface-variant">
              <span>Shipping</span>
              <span>{parseFloat(order.shippingTotal) === 0 ? 'Free' : `₹${parseFloat(order.shippingTotal).toLocaleString('en-IN')}`}</span>
            </div>
            {order.shippingLines.length > 0 && (
              <p className="text-xs text-on-surface-variant pl-2">
                via {order.shippingLines.map(s => s.methodTitle).join(', ')}
              </p>
            )}
            {parseFloat(order.totalTax) > 0 && (
              <div className="flex justify-between font-sans text-sm text-on-surface-variant">
                <span>Tax</span>
                <span>₹{parseFloat(order.totalTax).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-heading text-xl font-medium text-charcoal-navy pt-3 border-t border-outline-variant/20">
              <span>Total</span>
              <span>₹{parseFloat(order.total).toLocaleString('en-IN')}</span>
            </div>
            {order.paymentMethodTitle && (
              <p className="font-sans text-xs text-on-surface-variant pt-1">
                Paid via <span className="font-semibold">{order.paymentMethodTitle}</span>
                {order.datePaid && ` on ${new Date(order.datePaid).toLocaleDateString('en-IN')}`}
              </p>
            )}
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 sm:p-6">
            <h2 className="font-headline-sm text-lg font-semibold text-charcoal-navy mb-3">Billing Address</h2>
            <div className="space-y-1 font-body-sm text-on-surface-variant">
              <p className="font-semibold text-charcoal-navy">{order.billing.firstName} {order.billing.lastName}</p>
              <p>{order.billing.address1}</p>
              <p>{order.billing.city}, {order.billing.state} {order.billing.postcode}</p>
              <p>{order.billing.country}</p>
              {order.billing.phone && <p className="mt-2 text-sm"><span className="font-semibold text-charcoal-navy">Phone:</span> {order.billing.phone}</p>}
              {order.billing.email && <p className="text-sm"><span className="font-semibold text-charcoal-navy">Email:</span> {order.billing.email}</p>}
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 sm:p-6">
            <h2 className="font-headline-sm text-lg font-semibold text-charcoal-navy mb-3">Shipping Address</h2>
            <div className="space-y-1 font-body-sm text-on-surface-variant">
              <p className="font-semibold text-charcoal-navy">{order.shipping.firstName} {order.shipping.lastName}</p>
              <p>{order.shipping.address1}</p>
              <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postcode}</p>
              <p>{order.shipping.country}</p>
            </div>
          </div>
        </div>
      </div>

      {order.customerNote && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 sm:p-6">
          <h2 className="font-headline-sm text-lg font-semibold text-charcoal-navy mb-2">Customer Note</h2>
          <p className="font-body-sm text-on-surface-variant">{order.customerNote}</p>
        </div>
      )}
    </div>
  );
}
