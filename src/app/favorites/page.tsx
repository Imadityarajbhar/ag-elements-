import { Heart } from 'lucide-react';
import { generateMetadata } from "@/lib/seo/generateMetadata";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = generateMetadata({
  title: "Wishlist | AG Elements",
  description: "Save your favorite AG Elements jewelry.",
  path: "/favorites",
  noIndex: true,
});

export default function FavoritesPlaceholderPage() {
  return (
    <main className="max-w-[1024px] mx-auto overflow-hidden min-h-[60vh] flex flex-col items-center justify-center">
      <section className="px-margin-mobile tablet:px-margin-desktop py-16 tablet:py-section-v-padding text-center max-w-2xl mx-auto">
        <Heart className="text-primary text-[48px] mb-6" />
        <h1 className="font-headline-lg text-[48px] text-charcoal-navy mb-6">Wishlist</h1>
        <p className="font-body-lg text-[18px] text-on-surface-variant leading-relaxed mb-8">
          The ability to save your favorite pieces is coming soon.
        </p>
        
        <div className="bg-surface-lavender p-8 rounded-xl text-center mb-8">
          <p className="font-body-md text-charcoal-navy mb-4">
            In the meantime, explore our curated collections to find your next heirloom.
          </p>
          <Link href="/">
            <Button className="uppercase tracking-widest font-label-md">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
