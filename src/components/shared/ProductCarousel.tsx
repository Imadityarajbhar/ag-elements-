"use client";

import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import Link from 'next/link';
import { trackRecommendationClick } from '@/lib/analytics';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
  /** Identifies which recommendation rail this is, for analytics (e.g. "trending-now"). */
  analyticsSource?: string;
}

export function ProductCarousel({ title, products, viewAllLink, analyticsSource }: ProductCarouselProps) {
  return (
    <section className="py-section-v-padding-mobile tablet:py-section-v-padding overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop mb-8 flex justify-between items-end">
        <h2 className="font-headline-lg text-charcoal-navy">{title}</h2>
        {viewAllLink && (
          <Link className="font-label-md text-primary underline underline-offset-4 hover:brightness-90 transition-all" href={viewAllLink}>
            View All
          </Link>
        )}
      </div>
      <div className="flex overflow-x-auto gap-4 tablet:gap-6 px-margin-mobile tablet:px-margin-desktop pb-8 hide-scrollbar snap-x snap-mandatory">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-none w-[65vw] tablet:w-[280px] snap-start"
            onClick={() => analyticsSource && trackRecommendationClick(analyticsSource, product)}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
