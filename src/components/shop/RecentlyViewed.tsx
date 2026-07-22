"use client";

import React, { useEffect, useState } from 'react';
import { useViewedStore, getActiveViewedIds } from '@/store/viewedStore';
import { Product } from '@/types/product';
import { ProductCarousel } from './ProductCarousel';

export function RecentlyViewed({ currentProductId }: { currentProductId: number }) {
  const { viewed, addProductView } = useViewedStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Track current product view
    if (currentProductId) {
      addProductView(currentProductId);
    }
  }, [currentProductId, addProductView]);

  useEffect(() => {
    if (!isMounted) return;

    // Fetch the actual product data for the viewed IDs (expired entries already excluded)
    async function fetchViewedProducts() {
      // Exclude current product from the display
      const idsToFetch = getActiveViewedIds(viewed).filter(id => id !== currentProductId);

      if (idsToFetch.length === 0) {
        setProducts([]);
        return;
      }

      try {
        const res = await fetch(`/api/products?include=${idsToFetch.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          // Sort to match the order in viewedIds
          const sorted = idsToFetch
            .map(id => data.find((p: Product) => parseInt(p.id) === id))
            .filter(Boolean);
            
          setProducts(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch recently viewed products", err);
      }
    }

    fetchViewedProducts();
  }, [viewed, currentProductId, isMounted]);

  if (!isMounted || products.length === 0) return null;

  return <ProductCarousel title="Recently Viewed" products={products} analyticsSource="recently-viewed" />;
}
