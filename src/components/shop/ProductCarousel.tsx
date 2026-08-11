"use client";

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { ProductImage } from '@/components/shared/ProductImage';
import { trackRecommendationClick } from '@/lib/analytics';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  /** Identifies which recommendation rail this is, for analytics (e.g. "related-products", "trending"). */
  analyticsSource?: string;
}

export function ProductCarousel({ title, products, analyticsSource }: ProductCarouselProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mt-section-v-padding pt-16 border-t border-outline-variant/30">
      <h2 className="font-headline-md text-[32px] font-medium text-center text-charcoal-navy mb-12">{title}</h2>
      <div className="flex gap-6 overflow-x-auto hide-scrollbar snap-x pb-8 px-4 md:px-0">
        {products.map((product) => (
          <div key={product.id} className="snap-start min-w-[260px] md:min-w-[280px] flex-shrink-0 group cursor-pointer flex flex-col">
            <Link
              href={`/product/${product.slug}`}
              onClick={() => analyticsSource && trackRecommendationClick(analyticsSource, product)}
            >
              <div className="aspect-[4/5] bg-surface-lavender rounded-xl overflow-hidden mb-4 relative shadow-[0px_4px_20px_rgba(35,33,58,0.05)]">
                {/* This is a horizontally-scrolling carousel with a fixed
                    card width (min-w-[260px] md:min-w-[280px] on the parent),
                    not a responsive grid — the card never gets wider than
                    280px no matter the viewport, so a vw-based `sizes` (the
                    prior value here) over-fetches on any viewport beyond
                    ~1120px (25vw already exceeds 280px past that width). */}
                <ProductImage
                  fill
                  sizes="(max-width: 767px) 260px, 280px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={product.name}
                  src={product.images?.[0]?.src}
                />
                {product.salePrice && <div className="absolute top-2 left-2 bg-primary text-pearl-white px-2 py-1 rounded font-label-sm text-[12px] font-semibold uppercase tracking-widest">Sale</div>}
                {product.isNewArrival && !product.salePrice && <div className="absolute top-2 left-2 bg-surface-lavender text-primary px-2 py-1 rounded font-label-sm text-[12px] font-semibold uppercase tracking-widest">New</div>}
              </div>
              <h3 className="font-headline-sm text-[20px] font-semibold leading-[28px] text-charcoal-navy mb-1">{product.name}</h3>
              <div className="flex gap-3 items-center">
                <p className="font-body-md text-[16px] text-primary font-semibold">₹ {product.price.toLocaleString('en-IN')}</p>
                {product.regularPrice && product.salePrice && (
                  <p className="font-body-sm text-[14px] text-on-surface-variant line-through">₹ {product.regularPrice.toLocaleString('en-IN')}</p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
