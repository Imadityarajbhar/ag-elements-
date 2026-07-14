import React from 'react';
import { cn } from '@/lib/utils';

export interface PriceDisplayProps {
  regularPrice: number;
  salePrice?: number;
  className?: string;
}

export function PriceDisplay({ regularPrice, salePrice, className }: PriceDisplayProps) {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasSale = salePrice !== undefined && salePrice < regularPrice;

  if (hasSale) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="font-body-md line-through text-ag-purple">
          {formatINR(regularPrice)}
        </span>
        <span className="font-body-md text-charcoal-navy">
          {formatINR(salePrice)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("font-body-md text-charcoal-navy", className)}>
      {formatINR(regularPrice)}
    </div>
  );
}
