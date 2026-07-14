"use client";

import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';

export function BuyNowButton({ product }: { product: Product }) {
  const { setBuyNowItem } = useCartStore();
  const router = useRouter();

  const handleBuyNow = () => {
    setBuyNowItem({
      id: crypto.randomUUID(),
      productId: product.id,
      product,
      quantity: 1,
    });
    router.push('/checkout?mode=buynow');
  };

  return (
    <Button 
      onClick={handleBuyNow} 
      variant="outline"
      className="w-full border-ag-purple text-ag-purple font-label-md text-[14px] font-semibold py-6 rounded hover:bg-ag-purple/5 transition-all flex justify-center items-center gap-2"
    >
      <span>Buy Now</span>
      <span className="material-symbols-outlined text-[18px]">bolt</span>
    </Button>
  );
}
