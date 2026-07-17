"use client";
import { SearchX } from 'lucide-react';

import { ShopLayout } from "@/components/shop/ShopLayout";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { ShopPagination } from "@/components/shop/ShopPagination";
import { ProductCard } from "@/components/shared/ProductCard";
import { Product } from "@/types/product";
import { useUIStore } from "@/store/uiStore";

interface ShopArchiveProps {
  products: Product[];
  total: number;
  totalPages: number;
  baseCategorySlug?: string;
}

export function ShopArchive({ products, total, totalPages, baseCategorySlug }: ShopArchiveProps) {
  const isFiltering = useUIStore((state) => state.isFiltering);

  return (
    <ShopLayout baseCategorySlug={baseCategorySlug}>
      <ShopToolbar totalCount={total} />
      
      {products.length > 0 ? (
        <>
          <div className={`grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-x-4 gap-y-10 transition-opacity duration-300 ${isFiltering ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <ShopPagination totalPages={totalPages} />
        </>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-surface-dim/30 rounded-lg border border-outline-variant/30">
          <SearchX className="text-[64px] text-on-surface-variant/50 mb-4" />
          <h3 className="font-heading-md text-charcoal-navy mb-2">No products match your filters</h3>
          <p className="text-on-surface-variant font-body-md max-w-md mx-auto mb-6">
            We couldn't find any products matching your current selection. Try adjusting or removing some filters.
          </p>
        </div>
      )}
    </ShopLayout>
  );
}
