"use client";

import { useEffect } from "react";
import { Product } from "@/types/product";
import { trackViewItem } from "@/lib/analytics";

export function ProductViewTracker({ product }: { product: Product }) {
  useEffect(() => {
    trackViewItem(product);
  }, [product]);

  return null;
}
