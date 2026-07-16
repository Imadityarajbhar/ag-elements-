"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function PaymentProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get("orderId");
  const email = searchParams.get("email") || "";

  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payment/status?order_id=${orderId}`);
        if (!res.ok) {
          throw new Error("Failed to check status");
        }
        
        const data = await res.json();
        
        if (data.status === "processing" || data.status === "completed") {
          router.push(`/order-success?orderId=${orderId}&email=${encodeURIComponent(email)}`);
        } else if (data.status === "failed" || data.status === "cancelled") {
          setError("Your payment failed or was cancelled. Please try again from your orders page.");
        } else {
          // Still pending, increment attempts
          if (attempts >= 12) { // 12 * 5s = 60 seconds timeout
            setError("We are still waiting for confirmation from the payment gateway. Your order status will update in your account once confirmed.");
          } else {
            setAttempts(a => a + 1);
          }
        }
      } catch (err) {
        console.error(err);
        if (attempts >= 12) {
          setError("Failed to fetch payment status. Please check your orders page.");
        } else {
          setAttempts(a => a + 1);
        }
      }
    };

    // Poll every 5 seconds if no error and within attempt limit
    if (!error && attempts < 12) {
      const timer = setTimeout(checkStatus, 5000);
      return () => clearTimeout(timer);
    }
  }, [orderId, email, router, attempts, error]);

  return (
    <div className="min-h-screen bg-pearl-white flex flex-col items-center pt-16 tablet:pt-24 pb-32">
      <Link href="/" className="mb-12">
        <Image src="/brand/logo.png" alt="AG Elements" width={160} height={40} className="h-10 w-auto object-contain" />
      </Link>
      
      <div className="max-w-xl w-full mx-auto px-margin-mobile tablet:px-margin-desktop text-center">
        {!error ? (
          <>
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
            </div>
            
            <h1 className="font-headline-lg text-[32px] tablet:text-[40px] leading-tight font-medium text-charcoal-navy mb-4">
              Processing Payment...
            </h1>
            
            <p className="font-body-lg text-[18px] text-on-surface-variant mb-4">
              Please wait while we confirm your payment with the bank. 
              Do not close this window or click back.
            </p>
            <p className="font-sans text-sm text-on-surface-variant/70">
              Attempt {attempts + 1} of 12
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-[40px] text-red-600">error</span>
            </div>
            <h1 className="font-headline-lg text-[32px] tablet:text-[40px] leading-tight font-medium text-charcoal-navy mb-4">
              Payment Status Unconfirmed
            </h1>
            <p className="font-body-lg text-[18px] text-on-surface-variant mb-8">
              {error}
            </p>
            <Link href="/account/orders" className="inline-block bg-ag-purple text-pearl-white px-8 py-4 rounded font-label-lg tracking-wider uppercase transition-colors hover:bg-ag-purple/90">
              View My Orders
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-pearl-white">
        <span className="material-symbols-outlined animate-spin text-3xl text-ag-purple">progress_activity</span>
      </div>
    }>
      <PaymentProcessingContent />
    </Suspense>
  );
}
