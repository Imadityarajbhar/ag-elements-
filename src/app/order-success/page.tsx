"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "AG123456";
  const email = searchParams.get("email") || "your email";

  return (
    <div className="min-h-screen bg-pearl-white flex flex-col items-center pt-16 tablet:pt-24 pb-32">
      <Link href="/" className="mb-12">
        <Image src="/brand/logo.png" alt="AG Elements" width={160} height={40} className="h-10 w-auto object-contain" />
      </Link>
      
      <div className="max-w-2xl w-full mx-auto px-margin-mobile tablet:px-margin-desktop text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-[40px] text-primary">check_circle</span>
        </div>
        
        <h1 className="font-headline-lg text-[40px] tablet:text-[48px] leading-[48px] tablet:leading-[56px] font-medium text-charcoal-navy mb-4">
          Thank you for your order!
        </h1>
        
        <p className="font-body-lg text-[18px] text-on-surface-variant mb-12">
          We've received your order and are getting it ready to be shipped. We will send an email confirmation to <span className="font-medium text-charcoal-navy">{email}</span> shortly.
        </p>

        <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-8 mb-12 text-left">
          <h2 className="font-headline-sm text-[24px] font-medium text-charcoal-navy mb-6">Order Details</h2>
          <div className="grid grid-cols-2 gap-6 font-body-md">
            <div>
              <p className="text-on-surface-variant mb-1">Order Number</p>
              <p className="text-charcoal-navy font-medium">{orderId}</p>
            </div>
            <div>
              <p className="text-on-surface-variant mb-1">Estimated Delivery</p>
              <p className="text-charcoal-navy font-medium">3 - 5 Business Days</p>
            </div>
            <div>
              <p className="text-on-surface-variant mb-1">Payment Method</p>
              <p className="text-charcoal-navy font-medium">Online Payment</p>
            </div>
            <div>
              <p className="text-on-surface-variant mb-1">Shipping Options</p>
              <p className="text-charcoal-navy font-medium">Standard Delivery</p>
            </div>
          </div>
        </div>

        <Link href="/">
          <Button className="h-14 px-12 font-label-lg tracking-wider uppercase">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-pearl-white">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
