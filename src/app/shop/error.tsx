"use client";
import { AlertCircle } from 'lucide-react';

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center min-h-[50vh]">
      <AlertCircle className="text-[64px] text-red-500/80 mb-6" />
      <h2 className="font-heading-md text-charcoal-navy mb-4">
        Something went wrong!
      </h2>
      <p className="text-on-surface-variant font-body-md max-w-md mx-auto mb-8">
        We encountered an error while fetching the products. This might be a temporary network issue.
      </p>
      <Button 
        onClick={() => reset()}
        className="min-w-[160px]"
      >
        Try Again
      </Button>
    </div>
  );
}
