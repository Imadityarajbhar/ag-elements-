import React from 'react';
import { cn } from '@/lib/utils';

export interface PriceDisplayProps {
  regularPrice: number;
  salePrice?: number;
  className?: string;
  size?: 'md' | 'lg';
}

export function PriceDisplay({ regularPrice, salePrice, className, size = 'md' }: PriceDisplayProps) {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasSale = salePrice !== undefined && salePrice < regularPrice;
  
  const activeClass = size === 'lg' ? 'font-headline-md text-[32px] text-primary' : 'font-body-md text-charcoal-navy font-semibold';
  const strikeClass = size === 'lg' ? 'font-body-lg text-[18px] text-outline-variant line-through' : 'font-body-md line-through text-outline';
  const badgeClass = size === 'lg' 
    ? 'font-label-sm text-green-700 bg-green-50 px-2 py-1 rounded text-[13px] font-bold tracking-wider border border-green-200' 
    : 'font-label-sm text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-[11px] font-bold tracking-wider border border-green-200';

  if (hasSale) {
    const discount = Math.round(((regularPrice - salePrice!) / regularPrice) * 100);
    return (
      <div className={cn("flex items-center gap-2", size === 'lg' ? 'gap-4' : '', className)}>
        <span className={activeClass}>
          {formatINR(salePrice!)}
        </span>
        <span className={strikeClass}>
          {formatINR(regularPrice)}
        </span>
        <span className={badgeClass}>
          {discount}% OFF
        </span>
      </div>
    );
  }

  return (
    <div className={cn(activeClass, className)}>
      {formatINR(regularPrice)}
    </div>
  );
}
