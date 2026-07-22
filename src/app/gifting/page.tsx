import { Gift, CheckCircle2 } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { generateMetadata } from "@/lib/seo/generateMetadata";

export const metadata = generateMetadata({
  title: "The Art of Gifting | AG Elements",
  description: "Find the perfect gift with AG Elements. Explore our interactive gift finder, digital gift cards, and curated occasion recommendations.",
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
            Celebrate life's most precious moments with modern heritage sterling silver. Discover the perfect expression of your love.
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

      {/* 3. Gift Cards CTA */}
      <section className="py-24 bg-surface-container-low w-full">
        <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop">
          <div className="bg-pearl-white rounded-3xl overflow-hidden shadow-lg border border-outline-variant/30 flex flex-col tablet:flex-row">
            <div className="flex-1 bg-surface-variant relative aspect-square tablet:aspect-[4/3] min-h-[300px]">
              <Image fill sizes="(max-width: 768px) 100vw, 50vw" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPPmdoIQY2dETKqp7gluGbmwPtyZS53-eQzFIoxDSeP1q85Dvcad4wjxKdr-gx6ECF2EKloDg3EF5RCnLD_iuqGIZFp6BbCDmKUy8Wh2cqeJ_qpFZGTS6M7uePf76pYT2HzIfM3srVgganSFtYqBn2EI4eafaR2bMfmLWIZlz_QJoK9DNtfgyll3TzG6jztpTXiGbIt92nmH0F4UQHG1L0cs3KRYhMcGWcnX8tGjcjLErESEEWo6qeHQ" className="object-cover" alt="Gift Card" />
            </div>
            <div className="flex-1 p-12 tablet:p-24 flex flex-col justify-center text-center tablet:text-left">
              <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em] mb-4">Digital E-Gift Cards</span>
              <h2 className="font-headline-lg text-[40px] leading-tight font-medium text-charcoal-navy mb-6">The Gift of Choice</h2>
              <p className="font-body-lg text-[18px] text-on-surface-variant font-light leading-[1.8] mb-10">
                Not sure what they'll love the most? Give them the luxury of choosing their own perfect piece with an AG Elements Digital Gift Card, delivered instantly to their inbox.
              </p>
              <div>
                <Link href="/gifting/gift-cards" className="inline-block bg-charcoal-navy text-pearl-white font-label-md text-[13px] px-10 py-4 rounded-full uppercase tracking-[0.15em] font-bold hover:bg-charcoal-navy/90 transition-colors shadow-md">
                  Purchase Gift Card
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Service Highlights (Wrapping & Message) */}
      <section className="py-24 bg-charcoal-navy text-pearl-white text-center w-full">
        <div className="max-w-4xl mx-auto px-margin-mobile tablet:px-margin-desktop flex flex-col items-center">
          <Gift className="text-[48px] text-ag-purple mb-8 font-light" />
          <h2 className="font-headline-lg text-[36px] tablet:text-[48px] font-medium mb-6">Signature Packaging</h2>
          <p className="font-body-lg text-[18px] font-light text-pearl-white/80 leading-[1.8] mb-10">
            Every AG Elements gift arrives in our signature premium packaging, completely free of charge. You can also add a luxurious gift wrap and a personalized handwritten note directly at checkout.
          </p>
          <div className="flex items-center gap-6 text-pearl-white/70 font-label-md uppercase tracking-widest text-[12px] font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[18px]" />
              <span>Premium Box</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[18px]" />
              <span>Authenticity Card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[18px]" />
              <span>Optional Gift Wrap</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
