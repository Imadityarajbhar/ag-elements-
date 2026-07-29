import Image from "next/image";
import Link from "next/link";
import { generateMetadata } from "@/lib/seo/generateMetadata";
import { HOMEPAGE_LINKS } from "@/config/homepage-links";

export const metadata = generateMetadata({
  title: "The Art of Gifting | AG Elements",
  description: "Find the perfect gift with AG Elements. Explore our interactive gift finder and curated occasion recommendations.",
  path: "/gifting",
});

export default function GiftingHubPage() {
  return (
    <div className="flex flex-col w-full bg-pearl-white min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-surface-variant">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0B8jnp9RnFqSKJf7RhfDW0RMWRFeKtE6Pro0qHEZ3-OqDgYMdAQFtklxD3iqkM2NvFC4vw8xci53SgwgchVm9OZ46OF6Jy8khtzYLDAPL55tZs2XykE-E_MGUfz3PGcQlTP44Pjr1lataW2LSyANIknycYTeucy2cOa_CZ-o-lyKLpmQJ8dUqXY7YK3kOE5YC_RZuxpoppp8sNHufLfXCSpms7cnyQiqQAqHLY7mi3zv9vf-U2yFu2g')" }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-charcoal-navy/90 via-charcoal-navy/40 to-charcoal-navy/20"></div>
        <div className="relative z-20 text-center flex flex-col items-center px-4 mt-12 max-w-2xl">
          <span className="font-label-md text-[13px] uppercase tracking-[0.2em] text-pearl-white/80 font-semibold mb-4">
            Curated For You
          </span>
          <h1 className="font-display-lg text-[48px] tablet:text-[64px] leading-none font-medium text-pearl-white drop-shadow-lg tracking-tight mb-6">
            The Art of Gifting
          </h1>
          <p className="font-body-lg text-[18px] text-pearl-white/90 font-light mb-8">
            Celebrate life's most precious moments with authentic 925 sterling silver. Discover the perfect expression of your love.
          </p>
          <Link href="/gifting/finder" className="bg-pearl-white text-charcoal-navy px-10 py-4 rounded-full uppercase tracking-[0.15em] font-label-md text-[13px] font-bold hover:bg-surface-variant transition-colors shadow-xl">
            Open Gift Finder
          </Link>
        </div>
      </section>

      {/* 2. Occasion Recommendations */}
      <section className="py-24 px-margin-mobile tablet:px-margin-desktop max-w-[1440px] mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-[36px] tablet:text-[48px] font-medium text-charcoal-navy mb-4">Shop by Occasion</h2>
          <div className="w-16 h-[1px] bg-charcoal-navy mx-auto mb-6"></div>
          <p className="font-body-md text-[16px] text-on-surface-variant max-w-2xl mx-auto">
            Gifts designed to make every moment unforgettable.
          </p>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-3 gap-8">
          <Link href="/shop?pa_occasion=574" className="group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-md hover:shadow-xl transition-shadow">
            <Image fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUJGvMSZgwIlLwahFRrdxRLmFixcgBdkuNq3df9UHJ-K8OUa4HoheieBXDpqxPjerp-dQPGsKjSf_agZAUvvC4MUShS8orWlerj4ZLkEcfstV4yii_FfGR2mMq_vHCdAF9Rw_CLrXow-CxkgL031EdkyyO1_53j78G2TEOBk7Cx0P7vSpDYY7aHY-zbcyrV0_bEccY9eRDJToErv7tsejp21p2y-pYcuRYJUGlpe-5ltfcYvCHjNoofA" alt="Wedding Gifts" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-navy/80 via-transparent to-transparent flex flex-col justify-end p-8 z-10">
              <h3 className="font-headline-md text-pearl-white text-[28px] font-medium mb-2">Wedding & Bridal</h3>
              <span className="font-label-md text-pearl-white/80 uppercase tracking-widest text-[12px] font-semibold group-hover:text-pearl-white transition-colors">Explore Gifts &rarr;</span>
            </div>
          </Link>

          <Link href="/shop?pa_occasion=563" className="group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-md hover:shadow-xl transition-shadow">
            <Image fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgYShAiK_WIPmW8XzCj504v1jLWuG1cfWTnZsg933i2ucADqVunBR1qG5SLt6vnry3FMYd5IjpuhbkkvpxbiBxVKdw1xPl-_cypjd1BUkgfnLWl5Z2bOp_Ch46lWO9hlVuedtU4st5dLRYuHi67StD9Fie2aQXNqIQLW4Bo1gwfo8_dl16zt-SlIi0eD1QdfaWRkmCg9NsIJWLg6avXY2r9HuoLEivcUOSNR8r0dkjK-reWSX-Jr0odA" alt="Festive Gifts" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-navy/80 via-transparent to-transparent flex flex-col justify-end p-8 z-10">
              <h3 className="font-headline-md text-pearl-white text-[28px] font-medium mb-2">Festive Celebrations</h3>
              <span className="font-label-md text-pearl-white/80 uppercase tracking-widest text-[12px] font-semibold group-hover:text-pearl-white transition-colors">Explore Gifts &rarr;</span>
            </div>
          </Link>

          <Link href="/shop?pa_occasion=564" className="group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-md hover:shadow-xl transition-shadow">
            <Image fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYiRCc0SOXT-IyTldErTn73a7AMNwjKtfeA6qAjlNRKkflCEuJCYmv5G7MPkJOcEixO3y_InfY4EdHbRCSYjEmHnnLAIXVWP4fr35ncMCdzByzS2gbo4cva11sGetzCwvrIkkJihh-Ee0CFX-V0wak_hUweISm4jzCboLIGFMtX42uwgFxMeKHr5nnkLZ5hqABidyQMU1mt_g97E6wbxFQezC7ls_V8aXsczxyMxzKW5Wxbb5KY0xkNw" alt="Everyday Gifts" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-navy/80 via-transparent to-transparent flex flex-col justify-end p-8 z-10">
              <h3 className="font-headline-md text-pearl-white text-[28px] font-medium mb-2">Just Because</h3>
              <span className="font-label-md text-pearl-white/80 uppercase tracking-widest text-[12px] font-semibold group-hover:text-pearl-white transition-colors">Explore Gifts &rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Gift Finder CTA — closing beat, reusing the same purple banner
          pattern already established on the homepage, and pointing to the
          Gift Finder that's a real, working feature on this exact page. */}
      <section className="bg-ag-purple w-full py-16 tablet:py-20 px-margin-mobile tablet:px-margin-desktop">
        <div className="max-w-[1440px] mx-auto flex flex-col tablet:flex-row items-center justify-between gap-8 text-center tablet:text-left">
          <div className="flex flex-col gap-3 max-w-xl">
            <span className="font-label-md text-[13px] font-bold uppercase tracking-[0.2em] text-pearl-white/70">Still Deciding?</span>
            <h2 className="font-headline-lg text-[32px] tablet:text-[44px] leading-[1.15] font-medium text-pearl-white">Let Our Gift Finder Help</h2>
          </div>
          <Link href={HOMEPAGE_LINKS.ctaBanner.giftFinder} className="shrink-0 bg-pearl-white text-ag-purple font-label-md text-[13px] px-10 py-4 rounded-full uppercase tracking-[0.15em] font-bold hover:bg-surface-variant transition-colors shadow-xl">
            Open Gift Finder
          </Link>
        </div>
      </section>

    </div>
  );
}
