import Image from "next/image";
import { generateMetadata } from "@/lib/seo/generateMetadata";
import { SectionHeading } from "@/components/shared/SectionHeading";

export const metadata = generateMetadata({
  title: "About AG Elements | Our Heritage & Story",
  description: "Discover the legacy of AG Elements. Crafting timeless 925 sterling silver jewelry since 1954.",
});

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="px-margin-mobile tablet:px-margin-desktop pt-16 tablet:pt-section-v-padding pb-16 text-center max-w-4xl mx-auto">
        <h1 className="font-headline-lg text-[48px] text-charcoal-navy mb-6">About AG Elements</h1>
        <p className="font-body-lg text-[18px] text-on-surface-variant leading-relaxed">
          Rooted in a legacy dating back to 1954, AG Elements redefines sterling silver jewelry for the modern world. We blend heritage craftsmanship with contemporary editorial aesthetics to create pieces that are as timeless as they are everyday.
        </p>
      </section>

      {/* Founder Story */}
      <section className="py-section-v-padding-mobile tablet:py-section-v-padding px-margin-mobile tablet:px-margin-desktop max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-16 items-center">
          <div className="order-2 tablet:order-1 flex flex-col gap-6">
            <span className="text-primary font-label-md text-[14px] font-semibold uppercase tracking-widest">The Visionary</span>
            <h2 className="font-headline-lg text-[48px] leading-[56px] font-medium text-charcoal-navy">Meet Our Founder</h2>
            <div className="font-body-lg text-[18px] leading-[28px] text-on-surface-variant flex flex-col gap-4">
              <p>With an MBA from the UK and a lifelong connection to the jewelry industry, Kuntal Kaustubh Kathane brings a unique blend of global perspective and deep-rooted heritage to AG Elements.</p>
              <p>Growing up within a family legacy of master silversmiths, she recognized a gap in the market for high-quality, certified silver jewelry that modern women could wear every day. Under her leadership, AG Elements became Wardha's first certified silver brand, continuing a legacy that began in 1954.</p>
            </div>
            <div className="mt-4">
              <p className="font-headline-sm text-[24px] font-semibold text-charcoal-navy">Kuntal Kaustubh Kathane</p>
              <p className="font-label-md text-[14px] text-primary font-semibold uppercase tracking-widest">Founder & CEO</p>
            </div>
          </div>
          <div className="order-1 tablet:order-2">
            <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(35,33,58,0.05)] bg-surface-variant relative">
              <Image alt="Kuntal Kaustubh Kathane" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ1bPW5lb8cWYkCstsu-pp4Ik_9gj7tZv11n0CdJUf2jLWXzbzS8J12xqSiIknx2jnzhV7Lzn2gy22xJ4HQzp3-Cqo4HgQvaPbD21GiZEiLC_9rgRDhXxlRhQq23crWrByAYZ-Ec8ZIN6QQPl-4IF41iEi6AtKTxM49mtykHFmucgBZm5DAqfElBwNVejzazMU4kDHGlyZMqtYcGVhI6HROyvbSgXktmauXu27vLd87uS0OJrnbV7ZuQ=s0" />
            </div>
          </div>
        </div>
      </section>

      {/* Heritage / Craft */}
      <section className="py-section-v-padding-mobile tablet:py-section-v-padding bg-surface-container w-full">
        <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop flex flex-col tablet:flex-row items-center gap-16">
          <div className="flex-1 aspect-[4/3] relative">
            <Image alt="Artisans silversmithing since 1954" fill sizes="(max-width: 768px) 100vw, 50vw" className="rounded-xl shadow-[0px_4px_20px_rgba(35,33,58,0.05)] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPPmdoIQY2dETKqp7gluGbmwPtyZS53-eQzFIoxDSeP1q85Dvcad4wjxKdr-gx6ECF2EKloDg3EF5RCnLD_iuqGIZFp6BbCDmKUy8Wh2cqeJ_qpFZGTS6M7uePf76pYT2HzIfM3srVgganSFtYqBn2EI4eafaR2bMfmLWIZlz_QJoK9DNtfgyll3TzG6jztpTXiGbIt92nmH0F4UQHG1L0cs3KRYhMcGWcnX8tGjcjLErESEEWo6qeHQ" />
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <span className="text-primary font-label-md text-[14px] font-semibold uppercase tracking-widest">Heritage Since 1954</span>
            <h2 className="font-headline-lg text-[48px] leading-[56px] font-medium text-charcoal-navy">A Legacy of Craftsmanship</h2>
            <p className="font-body-lg text-[18px] leading-[28px] text-on-surface-variant">Founded in 1954, AG Elements has been at the forefront of artisanal silversmithing. Our journey began with a simple mission: to create timeless pieces that celebrate the beauty of sterling silver.</p>
            <p className="font-body-lg text-[18px] leading-[28px] text-on-surface-variant">From sourcing the finest materials to meticulously finishing every detail, our artisans employ traditional techniques passed down through generations, seamlessly blending them with modern innovation.</p>
          </div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="py-section-v-padding-mobile tablet:py-section-v-padding px-margin-mobile tablet:px-margin-desktop max-w-[1440px] mx-auto w-full text-center">
        <SectionHeading title="Our Core Values" subtitle="What Drives Us" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-lavender flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-[32px]">diamond</span>
            </div>
            <h3 className="font-headline-sm text-[24px] text-charcoal-navy">Uncompromising Quality</h3>
            <p className="font-body-md text-on-surface-variant">Every piece is crafted from certified 925 sterling silver, ensuring durability, luster, and a standard of excellence that stands the test of time.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-lavender flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-[32px]">design_services</span>
            </div>
            <h3 className="font-headline-sm text-[24px] text-charcoal-navy">Timeless Design</h3>
            <p className="font-body-md text-on-surface-variant">We believe in elegant minimalism. Our jewelry is designed to be versatile—effortlessly elevating your everyday style or adding sophistication to special occasions.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-lavender flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-[32px]">handshake</span>
            </div>
            <h3 className="font-headline-sm text-[24px] text-charcoal-navy">Ethical Craftsmanship</h3>
            <p className="font-body-md text-on-surface-variant">We are committed to responsible sourcing and supporting our artisan communities, preserving traditional skills while prioritizing sustainable practices.</p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-section-v-padding-mobile tablet:py-section-v-padding bg-surface-lavender w-full">
        <div className="max-w-4xl mx-auto px-margin-mobile tablet:px-margin-desktop text-center">
          <p className="font-display-lg text-[32px] tablet:text-[48px] leading-[40px] tablet:leading-[56px] text-primary italic font-medium">
            "To empower individuals with timeless elegance, crafting silver jewelry that tells a story of heritage, quality, and everyday luxury."
          </p>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-16 border-t border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-primary scale-125">verified</span>
            <div>
              <h5 className="font-label-md text-charcoal-navy uppercase tracking-widest">925 Certified</h5>
              <p className="font-label-sm text-on-surface-variant mt-1">Guaranteed purity in every piece</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 border-y md:border-y-0 md:border-x border-outline-variant/30 py-8 md:py-0">
            <span className="material-symbols-outlined text-primary scale-125">history</span>
            <div>
              <h5 className="font-label-md text-charcoal-navy uppercase tracking-widest">Since 1954</h5>
              <p className="font-label-sm text-on-surface-variant mt-1">Decades of heritage & expertise</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-primary scale-125">local_shipping</span>
            <div>
              <h5 className="font-label-md text-charcoal-navy uppercase tracking-widest">Free Delivery</h5>
              <p className="font-label-sm text-on-surface-variant mt-1">Insured shipping on all orders</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
