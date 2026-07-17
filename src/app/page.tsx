import { BadgeCheck, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { getProducts } from "@/services/products";
import { generateMetadata } from "@/lib/seo/generateMetadata";
import { HOMEPAGE_LINKS } from "@/config/homepage-links";

const ProductCarousel = dynamic(() => import("@/components/shared/ProductCarousel").then(m => m.ProductCarousel));
const RecentlyViewed = dynamic(() => import("@/components/shop/RecentlyViewed").then(m => m.RecentlyViewed));
const InstagramFeed = dynamic(() => import("@/components/home/InstagramFeed").then(m => m.InstagramFeed));

export const metadata = generateMetadata({
  title: "AG Elements | Timeless Elegance",
  description: "Discover our new collection of modern heritage sterling silver jewellery. Designed to be layered, stacked, and worn every day.",
});

export default async function Home() {
  // Parallelize the data fetching to avoid waterfalls and fetch-all anti-patterns
  const [bestSellers, trendingInitial, customerFavorites] = await Promise.all([
    getProducts('per_page=4&page=2'), // Mock curation: Page 2
    getProducts('per_page=4&featured=true'), // Trending
    getProducts('per_page=4&page=3'), // Mock curation: Page 3
  ]);

  let finalTrending = trendingInitial;
  if (finalTrending.length < 4) {
    finalTrending = await getProducts('per_page=4');
  }

  return (
    <div className="flex flex-col w-full bg-pearl-white">
      {/* 1. Cinematic Video Hero Banner */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center tablet:justify-start overflow-hidden bg-surface-variant">
        {/* LCP Optimized Poster Image */}
        <div className="absolute inset-0 w-full h-full z-0 bg-surface-variant">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ1bPW5lb8cWYkCstsu-pp4Ik_9gj7tZv11n0CdJUf2jLWXzbzS8J12xqSiIknx2jnzhV7Lzn2gy22xJ4HQzp3-Cqo4HgQvaPbD21GiZEiLC_9rgRDhXxlRhQq23crWrByAYZ-Ec8ZIN6QQPl-4IF41iEi6AtKTxM49mtykHFmucgBZm5DAqfElBwNVejzazMU4kDHGlyZMqtYcGVhI6HROyvbSgXktmauXu27vLd87uS0OJrnbV7ZuQ=s0"
            alt="New Collection Banner"
            fill
            priority
            fetchPriority="high"
            className="object-cover"
          />
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover mix-blend-normal"
          >
            <source src="https://cdn.pixabay.com/video/2016/09/21/5361-183787508_large.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Elegant Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-charcoal-navy/90 via-charcoal-navy/30 to-charcoal-navy/10"></div>
        
        <div className="relative z-20 w-full max-w-[1440px] mx-auto text-center px-margin-mobile tablet:px-margin-desktop flex flex-col items-center mt-auto mb-24 tablet:mb-0 tablet:mt-0">
          <span className="font-label-md text-[14px] uppercase tracking-[0.2em] text-pearl-white/80 font-semibold mb-6 drop-shadow-md">
            The New Collection
          </span>
          <h1 className="font-display-lg text-[48px] tablet:text-[72px] leading-[1.1] text-pearl-white max-w-3xl mb-6 drop-shadow-2xl tracking-tight font-medium">
            Everyday Elegance, <br className="hidden tablet:block" /> Crafted for You.
          </h1>
          <p className="font-body-lg text-[16px] tablet:text-[20px] leading-[1.6] text-pearl-white/90 max-w-xl mb-10 drop-shadow-md font-light">
            Discover modern heritage sterling silver jewellery. Designed to be layered, stacked, and worn every day.
          </p>
          <div className="flex flex-col tablet:flex-row gap-6 w-full tablet:w-auto">
            <Link href={HOMEPAGE_LINKS.hero.shopCollection} className="w-full tablet:w-auto text-center bg-pearl-white text-charcoal-navy font-label-md text-[13px] px-12 py-4 rounded-full hover:bg-surface-variant transition-colors uppercase tracking-[0.15em] font-bold shadow-xl">
              Shop The Collection
            </Link>
            <Link href={HOMEPAGE_LINKS.hero.exploreBridal} className="w-full tablet:w-auto text-center bg-transparent border border-pearl-white text-pearl-white font-label-md text-[13px] px-12 py-4 rounded-full hover:bg-pearl-white/10 transition-colors uppercase tracking-[0.15em] font-bold shadow-xl">
              Bridal Collection
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Trust Strip */}
      <div className="bg-surface-container-low w-full py-8 border-b border-outline-variant/30 relative z-30 -mt-2">
        <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop">
          <div className="grid grid-cols-2 tablet:grid-cols-4 gap-8 text-center text-charcoal-navy">
            <div className="flex flex-col items-center gap-3">
              <BadgeCheck className="text-[32px] text-ag-purple font-light" />
              <span className="font-label-sm uppercase tracking-widest text-[11px] font-semibold">925 Certified Silver</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <ShieldCheck className="text-[32px] text-ag-purple font-light" />
              <span className="font-label-sm uppercase tracking-widest text-[11px] font-semibold">100% Secure Payments</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Truck className="text-[32px] text-ag-purple font-light" />
              <span className="font-label-sm uppercase tracking-widest text-[11px] font-semibold">Free Delivery Above ₹2000</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="text-[32px] text-ag-purple font-light" />
              <span className="font-label-sm uppercase tracking-widest text-[11px] font-semibold">7-Day Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Shop by Category (Refined) */}
      <section className="py-24 px-margin-mobile tablet:px-margin-desktop max-w-[1440px] mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-[36px] tablet:text-[48px] leading-tight font-medium text-charcoal-navy mb-4">Shop by Category</h2>
          <div className="w-16 h-[1px] bg-charcoal-navy mx-auto mb-6"></div>
          <p className="font-body-md text-[16px] text-on-surface-variant max-w-2xl mx-auto">Curated collections for every style and occasion.</p>
        </div>
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-x-6 gap-y-12">
          {/* Categories Mapping */}
          {[
            { name: "Necklaces", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAViqDQIVVy8z4CPXgOfyAooGfLdxYJh3Wr6bnqxAiAPpCTqjQ8E4OcpIgNuTIknTrZ8gXwsspLree11mtO5Gt_am_yQzE9flYPE4XMtqmDnSqBasV_GCzHDlxiczPLuuQAkmaYY_6I8AJxIy7W1hjsob9UPCRwln7XOxMPi1h9PR9BHW9Gr0ITQN26erNyPwifn3kk0AGKUYlAdoQlYSWWxSFio65BuWDQ5KZkvempRsV5EJze4T29zA" },
            { name: "Bracelets", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbgh3H-hSJ9jP5dEIraPESMpSZe-khIlIE0aMQergyEF_Vev3TfKeu5thuhX3uwFaN0ziIjCLqKnPBPXPAzgPR-_HNHFvr3_yClZzJo15pFfUi8xGPbGVhaYygARQWZTotpUb9YWtyTYNCvHRjdY1Gq982TfcByBgjXd7y8fRqxBW8-N18l9NuCqJGNvmOWFz8d3LnYJHFKBG3Ft3u0F4V-Iwz-V60HolpHJ35jN5iDeVy7la55ZtugQ" },
            { name: "Earrings", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgYShAiK_WIPmW8XzCj504v1jLWuG1cfWTnZsg933i2ucADqVunBR1qG5SLt6vnry3FMYd5IjpuhbkkvpxbiBxVKdw1xPl-_cypjd1BUkgfnLWl5Z2bOp_Ch46lWO9hlVuedtU4st5dLRYuHi67StD9Fie2aQXNqIQLW4Bo1gwfo8_dl16zt-SlIi0eD1QdfaWRkmCg9NsIJWLg6avXY2r9HuoLEivcUOSNR8r0dkjK-reWSX-Jr0odA" },
            { name: "Rings", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-sh3tO5RAyWg2MmHjF_iJZsB33tZzzZ3dYnBUDIGke_7G2QryEp28ofzfcgQHvXdVSVMcHr5D7QLy8rKpe39oeTPl5PyRA84DMJxRDeL2PqHbuf6FTIXRGEJYsy6OxtazyCDKjrBVKl2YVsyZZsNYIltKW2RVWVIdDYXRIxR7WuboAV2JavY2JLYQ7LH_0I548FyzpLYZYVUHSoY1hq43QkdJqz3kgNWO9duwPijX67GiLGbqwesnbA" }
          ].map((cat) => {
            const slug = cat.name.toLowerCase().replace(/'/g, '').replace(/ /g, '-');
            return (
              <Link key={cat.name} href={`/collections/${slug}`} className="group flex flex-col items-center text-center">
                <div className="w-full aspect-square rounded-full overflow-hidden mb-6 shadow-sm relative bg-surface-dim p-2 border border-outline-variant/30">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <Image fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-1000 group-hover:scale-110" alt={`${cat.name} category`} src={cat.image} />
                    <div className="absolute inset-0 bg-charcoal-navy/5 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                </div>
                <span className="font-label-md text-[14px] font-semibold text-charcoal-navy uppercase tracking-[0.2em] group-hover:text-ag-purple transition-colors">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Best Sellers & Trending */}
      <div className="bg-surface-container-lowest w-full pb-12">
        <ProductCarousel title="Best Sellers" products={bestSellers} viewAllLink={HOMEPAGE_LINKS.carousels.bestSellers} />
        <div className="h-12"></div>
        <ProductCarousel title="Trending Now" products={finalTrending} viewAllLink={HOMEPAGE_LINKS.carousels.trending} />
      </div>

      {/* 5. Luxury Storytelling: The Art of Craftsmanship */}
      <section className="py-24 bg-surface-container-low w-full overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop">
          <div className="flex flex-col tablet:flex-row items-center gap-16 tablet:gap-24">
            <div className="flex-1 relative group w-full">
              <div className="absolute -inset-4 bg-pearl-white/50 rounded-2xl transform rotate-3 transition-transform duration-700 group-hover:rotate-6"></div>
              <div className="absolute -inset-4 bg-ag-purple/5 rounded-2xl transform -rotate-2 transition-transform duration-700 group-hover:-rotate-4"></div>
              <Image width={800} height={1000} className="relative z-10 rounded-xl shadow-2xl w-full object-cover aspect-[4/5] tablet:aspect-square" alt="The Art of Craftsmanship" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPPmdoIQY2dETKqp7gluGbmwPtyZS53-eQzFIoxDSeP1q85Dvcad4wjxKdr-gx6ECF2EKloDg3EF5RCnLD_iuqGIZFp6BbCDmKUy8Wh2cqeJ_qpFZGTS6M7uePf76pYT2HzIfM3srVgganSFtYqBn2EI4eafaR2bMfmLWIZlz_QJoK9DNtfgyll3TzG6jztpTXiGbIt92nmH0F4UQHG1L0cs3KRYhMcGWcnX8tGjcjLErESEEWo6qeHQ" />
            </div>
            <div className="flex-1 flex flex-col gap-8 text-center tablet:text-left z-20">
              <div className="flex flex-col gap-2">
                <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em]">Heritage Since 1954</span>
                <h2 className="font-headline-lg text-[40px] tablet:text-[56px] leading-[1.1] font-medium text-charcoal-navy">The Art of Craftsmanship</h2>
              </div>
              <p className="font-body-lg text-[18px] leading-[1.8] text-on-surface-variant font-light">
                Founded in 1954, AG Elements has been at the forefront of artisanal silversmithing. Our journey began with a simple mission: to create timeless pieces that celebrate the beauty of 925 sterling silver, ensuring that every necklace, ring, and bracelet feels like a modern heirloom.
              </p>
              <div>
                <Link href="/about" className="inline-block border-b-2 border-charcoal-navy pb-1 text-charcoal-navy font-label-md text-[13px] font-bold uppercase tracking-[0.15em] hover:text-ag-purple hover:border-ag-purple transition-colors">
                  Discover Our Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Editorial Split (Luxury Grid) */}
      <section className="py-24 px-margin-mobile tablet:px-margin-desktop max-w-[1440px] mx-auto grid grid-cols-1 tablet:grid-cols-2 gap-8 w-full">
        <div className="relative group overflow-hidden rounded-2xl aspect-[4/5] tablet:aspect-[3/4] shadow-lg">
          <Image fill sizes="(max-width: 768px) 100vw, 50vw" alt="Bridal Collection" className="object-cover transition-transform duration-1000 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUJGvMSZgwIlLwahFRrdxRLmFixcgBdkuNq3df9UHJ-K8OUa4HoheieBXDpqxPjerp-dQPGsKjSf_agZAUvvC4MUShS8orWlerj4ZLkEcfstV4yii_FfGR2mMq_vHCdAF9Rw_CLrXow-CxkgL031EdkyyO1_53j78G2TEOBk7Cx0P7vSpDYY7aHY-zbcyrV0_bEccY9eRDJToErv7tsejp21p2y-pYcuRYJUGlpe-5ltfcYvCHjNoofA" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-navy/80 via-charcoal-navy/20 to-transparent flex flex-col items-center justify-end pb-16 text-pearl-white opacity-90 group-hover:opacity-100 transition-opacity">
            <h3 className="font-headline-md text-[36px] font-medium mb-4 drop-shadow-md tracking-tight">Bridal Collection</h3>
            <p className="font-body-sm max-w-xs text-center mb-6 text-pearl-white/80">Elegance designed for your most unforgettable moments.</p>
            <Link className="bg-pearl-white text-charcoal-navy font-label-md text-[12px] px-8 py-3 rounded-full uppercase tracking-[0.15em] font-bold hover:bg-surface-variant transition-colors" href={HOMEPAGE_LINKS.editorial.bridalEdit}>
              Shop The Edit
            </Link>
          </div>
        </div>
        <div className="relative group overflow-hidden rounded-2xl aspect-[4/5] tablet:aspect-[3/4] shadow-lg tablet:translate-y-12">
          <Image fill sizes="(max-width: 768px) 100vw, 50vw" alt="Everyday Stacking" className="object-cover transition-transform duration-1000 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYiRCc0SOXT-IyTldErTn73a7AMNwjKtfeA6qAjlNRKkflCEuJCYmv5G7MPkJOcEixO3y_InfY4EdHbRCSYjEmHnnLAIXVWP4fr35ncMCdzByzS2gbo4cva11sGetzCwvrIkkJihh-Ee0CFX-V0wak_hUweISm4jzCboLIGFMtX42uwgFxMeKHr5nnkLZ5hqABidyQMU1mt_g97E6wbxFQezC7ls_V8aXsczxyMxzKW5Wxbb5KY0xkNw" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-navy/80 via-charcoal-navy/20 to-transparent flex flex-col items-center justify-end pb-16 text-pearl-white opacity-90 group-hover:opacity-100 transition-opacity">
            <h3 className="font-headline-md text-[36px] font-medium mb-4 drop-shadow-md tracking-tight">Everyday Stacking</h3>
            <p className="font-body-sm max-w-xs text-center mb-6 text-pearl-white/80">Minimalist pieces crafted for your daily rotation.</p>
            <Link className="bg-pearl-white text-charcoal-navy font-label-md text-[12px] px-8 py-3 rounded-full uppercase tracking-[0.15em] font-bold hover:bg-surface-variant transition-colors" href={HOMEPAGE_LINKS.editorial.everydayStacking}>
              Shop The Edit
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Customer Favorites */}
      <div className="bg-pearl-white w-full py-12 tablet:mt-12">
        <ProductCarousel title="Customer Favorites" products={customerFavorites} viewAllLink={HOMEPAGE_LINKS.carousels.customerFavorites} />
      </div>

      {/* 8. Recently Viewed */}
      <div className="w-full bg-surface-container-lowest">
        <RecentlyViewed currentProductId={0} />
      </div>

      {/* 9. Instagram Feed */}
      <div className="w-full bg-pearl-white border-t border-outline-variant/30">
        <InstagramFeed />
      </div>

      {/* 10. Testimonials */}
      <section className="py-24 bg-surface-container w-full border-t border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop">
          <div className="text-center mb-16">
            <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em] mb-4 block">Testimonials</span>
            <h2 className="font-headline-lg text-[36px] tablet:text-[48px] leading-tight font-medium text-charcoal-navy">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-8">
            <div className="bg-pearl-white p-10 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col gap-6 relative">
              <span className="absolute top-6 right-8 text-6xl text-outline-variant/20 font-serif leading-none">"</span>
              <div className="flex text-ag-purple">
                {Array(5).fill(0).map((_, i) => <Star key={i} />)}
              </div>
              <p className="font-body-md text-[16px] text-on-surface-variant leading-relaxed">"Absolutely stunning! The detailing on the stars is incredible. It feels substantial but looks so delicate on the wrist. I haven't taken it off since it arrived."</p>
              <div className="mt-auto pt-4 border-t border-outline-variant/30">
                <span className="font-label-md text-[13px] font-bold uppercase tracking-widest text-charcoal-navy">Priya S.</span>
              </div>
            </div>
            <div className="bg-pearl-white p-10 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col gap-6 relative">
              <span className="absolute top-6 right-8 text-6xl text-outline-variant/20 font-serif leading-none">"</span>
              <div className="flex text-ag-purple">
                {Array(5).fill(0).map((_, i) => <Star key={i} />)}
              </div>
              <p className="font-body-md text-[16px] text-on-surface-variant leading-relaxed">"Perfect gift. Bought this for my sister's birthday and she loves it. The premium packaging made the unboxing experience feel so luxurious and special."</p>
              <div className="mt-auto pt-4 border-t border-outline-variant/30">
                <span className="font-label-md text-[13px] font-bold uppercase tracking-widest text-charcoal-navy">Rohan M.</span>
              </div>
            </div>
            <div className="bg-pearl-white p-10 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col gap-6 relative">
              <span className="absolute top-6 right-8 text-6xl text-outline-variant/20 font-serif leading-none">"</span>
              <div className="flex text-ag-purple">
                {Array(5).fill(0).map((_, i) => <Star key={i} />)}
              </div>
              <p className="font-body-md text-[16px] text-on-surface-variant leading-relaxed">"Elegant and versatile. It pairs beautifully with my watch and other bracelets. The silver has a lovely shine that doesn't tarnish with everyday wear."</p>
              <div className="mt-auto pt-4 border-t border-outline-variant/30">
                <span className="font-label-md text-[13px] font-bold uppercase tracking-widest text-charcoal-navy">Anita D.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-24 px-margin-mobile tablet:px-margin-desktop max-w-3xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em] mb-4 block">Help Center</span>
          <h2 className="font-headline-lg text-[36px] tablet:text-[48px] font-medium text-charcoal-navy">Frequently Asked Questions</h2>
        </div>
        <Accordion className="w-full border-t border-outline-variant/30">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy py-6 text-left">Is the jewellery 925 silver?</AccordionTrigger>
            <AccordionContent className="font-body-md text-[16px] text-on-surface-variant pb-6 leading-relaxed">
              Yes, every piece of AG Elements jewelry is crafted from authentic 925 Sterling Silver. Each piece is hallmarked to guarantee its purity and comes with a certificate of authenticity.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy py-6 text-left">How long does shipping take?</AccordionTrigger>
            <AccordionContent className="font-body-md text-[16px] text-on-surface-variant pb-6 leading-relaxed">
              We process all orders within 24 hours. Standard delivery takes 3-5 business days across most of India. Express shipping is available at checkout for 1-2 day delivery in metro cities.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy py-6 text-left">Can I return products?</AccordionTrigger>
            <AccordionContent className="font-body-md text-[16px] text-on-surface-variant pb-6 leading-relaxed">
              Yes, we offer a hassle-free 7-day return policy. If you're not completely satisfied, you can return unused items in their original packaging for a full refund or exchange.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy py-6 text-left">Is Cash on Delivery (COD) available?</AccordionTrigger>
            <AccordionContent className="font-body-md text-[16px] text-on-surface-variant pb-6 leading-relaxed">
              Yes, we offer Cash on Delivery across 15,000+ pin codes in India. We also accept all major credit/debit cards, UPI, and net banking for prepaid orders.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy py-6 text-left">Do products tarnish?</AccordionTrigger>
            <AccordionContent className="font-body-md text-[16px] text-on-surface-variant pb-6 leading-relaxed">
              All sterling silver naturally oxidizes over time when exposed to air and moisture. However, our jewelry is rhodium-plated to provide an extra layer of protection, significantly delaying the tarnishing process.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy py-6 text-left">How do I care for my silver jewellery?</AccordionTrigger>
            <AccordionContent className="font-body-md text-[16px] text-on-surface-variant pb-6 leading-relaxed">
              Store your silver in the provided airtight AG Elements pouch when not in use. Avoid direct contact with perfumes, lotions, and harsh chemicals. Gently wipe with a soft polishing cloth to maintain its brilliant shine.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
