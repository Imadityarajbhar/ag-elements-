import Link from 'next/link';
import Image from 'next/image';
import { generateMetadata as getSeoMetadata } from "@/lib/seo/generateMetadata";

export const metadata = getSeoMetadata({
  title: "Shop All Collections | AG Elements",
  description: "Browse every AG Elements collection of premium 925 sterling silver jewellery, from bridal edits to everyday essentials.",
  path: "/collections",
});

export default function CollectionsPage() {
  return (
    <div className="pt-24 pb-32">
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
        <div className="text-center mb-24">
          <span className="font-sans text-[12px] leading-[1.0] tracking-[0.15em] text-brand-amethyst uppercase block mb-4">Curated Edits</span>
          <h1 className="font-heading text-[64px] leading-[1.1] tracking-[-0.02em]">Collections</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <Link href="/shop" className="group block relative aspect-square overflow-hidden bg-surface-container-low">
            <Image
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              src="/collections/bridal-collection.jpg"
              alt="Bridal Collection"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 z-10"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8 z-20">
              <h2 className="font-heading text-[40px] leading-[1.2] mb-4">Bridal</h2>
              <span className="font-sans text-[12px] leading-[1.0] tracking-[0.15em] uppercase border-b border-white pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Shop Collection</span>
            </div>
          </Link>
          <Link href="/shop" className="group block relative aspect-square overflow-hidden bg-surface-container-low">
            <Image
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              src="/collections/everyday-stacking.jpg"
              alt="Everyday Essentials"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 z-10"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8 z-20">
              <h2 className="font-heading text-[40px] leading-[1.2] mb-4">Essentials</h2>
              <span className="font-sans text-[12px] leading-[1.0] tracking-[0.15em] uppercase border-b border-white pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Shop Collection</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
