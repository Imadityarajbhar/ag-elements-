"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Product Detail Error Boundary caught an error:", error);
  }, [error]);

  return (
    <main className="w-full min-h-[60vh] flex flex-col items-center justify-center px-margin-mobile tablet:px-margin-desktop py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-lavender flex items-center justify-center text-primary mb-6">
        <span className="material-symbols-outlined text-[32px]">diamond</span>
      </div>
      <h1 className="font-headline-lg text-[40px] tablet:text-[48px] text-charcoal-navy mb-4">
        We couldn't load this product
      </h1>
      <p className="font-body-lg text-[18px] text-on-surface-variant max-w-lg mb-8">
        There was an issue fetching the product details. You can try again or explore our collections.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Button 
          onClick={reset} 
          className="uppercase tracking-widest font-label-md px-8 py-4 w-full sm:w-auto"
        >
          Try Again
        </Button>
        <Link 
          href="/collections" 
          className="font-label-md uppercase tracking-widest text-primary underline underline-offset-4 hover:brightness-90 transition-all py-4 px-4"
        >
          Shop All Jewelry
        </Link>
      </div>
    </main>
  );
}
