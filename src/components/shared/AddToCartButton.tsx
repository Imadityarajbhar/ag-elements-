"use client";

import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { trackAddToCart } from '@/lib/analytics';

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem, setIsOpen } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      product,
      quantity: 1,
    });
    trackAddToCart(product, 1);
    setIsOpen(true);
  };

  return (
    <Button onClick={handleAddToCart} className="w-full bg-primary text-primary-foreground font-label-md text-[14px] font-semibold py-6 rounded hover:brightness-90 transition-all flex justify-center items-center gap-2">
      <span>Add to Cart — ₹{product.price.toLocaleString('en-IN')}</span>
      <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
    </Button>
  );
}
