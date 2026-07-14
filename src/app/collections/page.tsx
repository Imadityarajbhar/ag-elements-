import Link from 'next/link';
import Image from 'next/image';

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
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmh4OpW1r7YzPjIfEdT1BO462detMA30qQ0ovpjJfRDdtLMzGz0vN6vYMyfvModHfmrwOuISlk6GHMJWEP214J4fsUtXxAtq3CGo4Y1Vv7pVvvRgyLgguGevDNJJ2XAGo9CNoo3uVTfkkNFhclK8cE1qUiGst7G-KI7Yrs5sbWH_NnEJjjta0Gs5VyLC2U0N8dFG8rMCpkVXPkC6RalzvK4vl_qicNS64ZEyYRMhG3NeVioGHtoU5meg" 
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
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0wcqyhzKQg8UKFgDNhQnhCGQQnqNfSkF_4zhDOR9UcsUmrNGiaw9mCcIgKnVxTFQosbP34xsurfREUDxurC5kuAKqY3rsImOX_bqSHf-kVG78Dw2_OETX75uMSN-nXWvXLkJ4AOujr5CCeNaI6B_6Xa1o4HlZjxJi0OTuKeenrflWUb742c7sgVMAMIrcFpJrWFi5tdHXuigNYtYwrSfrRWCh3NEP6miVeIddCujoeCFBmqKTbNgg2A" 
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
