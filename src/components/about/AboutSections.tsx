"use client";

import Image from "next/image";
import Link from "next/link";
import { Diamond, PenTool, Handshake, BadgeCheck, History, Truck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion/variants";

const EASE = [0.22, 1, 0.36, 1] as const;

export function AboutHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="px-margin-mobile tablet:px-margin-desktop pt-20 tablet:pt-32 pb-16 tablet:pb-20 text-center max-w-4xl mx-auto"
    >
      <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em] mb-4 block">Est. 1954</span>
      <h1 className="font-headline-lg text-[40px] tablet:text-[56px] leading-[1.1] font-medium text-charcoal-navy mb-6">About AG Elements</h1>
      <p className="font-body-lg text-[18px] leading-relaxed text-on-surface-variant">
        Rooted in a legacy dating back to 1954, AG Elements redefines sterling silver jewelry for the modern world. We blend heritage craftsmanship with contemporary editorial aesthetics to create pieces that are as timeless as they are everyday.
      </p>
    </motion.section>
  );
}

export function OurStory() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      className="py-section-v-padding-mobile tablet:py-section-v-padding px-margin-mobile tablet:px-margin-desktop max-w-3xl mx-auto w-full text-center"
    >
      <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em] mb-4 block">Our Story</span>
      <h2 className="font-headline-lg text-[36px] tablet:text-[48px] leading-tight font-medium text-charcoal-navy mb-8">Rooted in Heritage, Designed for Today</h2>
      <div className="font-body-lg text-[18px] leading-[1.8] text-on-surface-variant flex flex-col gap-6">
        <p>AG Elements began in 1954 as a family silversmithing practice, long before &ldquo;sterling silver&rdquo; was a phrase modern shoppers searched for. For generations, that craft stayed close to home, passed down hand to hand rather than written in a manual.</p>
        <p>It found its next chapter when Kuntal Kaustubh Kathane, raised inside that same workshop, returned from her MBA in the UK and turned a family trade into Wardha&apos;s first certified silver brand — keeping the technique, but building the quality guarantees a modern customer actually expects.</p>
      </div>
    </motion.section>
  );
}

export function BrandPhilosophy() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="py-section-v-padding-mobile tablet:py-section-v-padding bg-surface-lavender w-full"
    >
      <div className="max-w-4xl mx-auto px-margin-mobile tablet:px-margin-desktop text-center">
        <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em] mb-6 block">Brand Philosophy</span>
        <p className="font-display-lg text-[28px] tablet:text-[44px] leading-[1.3] text-primary italic font-medium">
          &ldquo;To empower individuals with timeless elegance, crafting silver jewelry that tells a story of heritage, quality, and everyday luxury.&rdquo;
        </p>
      </div>
    </motion.section>
  );
}

export function Craftsmanship() {
  return (
    <section className="py-section-v-padding-mobile tablet:py-section-v-padding bg-surface-container w-full overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop flex flex-col tablet:flex-row items-center gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: EASE }}
          className="flex-1 aspect-[4/3] relative rounded-xl overflow-hidden shadow-[0px_20px_45px_-25px_rgba(35,33,58,0.35)]"
        >
          <Image
            alt="AG Elements artisans hand-finishing sterling silver jewellery"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPPmdoIQY2dETKqp7gluGbmwPtyZS53-eQzFIoxDSeP1q85Dvcad4wjxKdr-gx6ECF2EKloDg3EF5RCnLD_iuqGIZFp6BbCDmKUy8Wh2cqeJ_qpFZGTS6M7uePf76pYT2HzIfM3srVgganSFtYqBn2EI4eafaR2bMfmLWIZlz_QJoK9DNtfgyll3TzG6jztpTXiGbIt92nmH0F4UQHG1L0cs3KRYhMcGWcnX8tGjcjLErESEEWo6qeHQ"
          />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="flex-1 flex flex-col gap-6"
        >
          <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em]">Craftsmanship</span>
          <h2 className="font-headline-lg text-[36px] tablet:text-[48px] leading-tight font-medium text-charcoal-navy">Made By Hand, Made To Last</h2>
          <p className="font-body-lg text-[18px] leading-[1.8] text-on-surface-variant">Every piece begins with 925 sterling silver, shaped using techniques our artisans learned the same way their teachers did — by hand, over years, not weeks.</p>
          <p className="font-body-lg text-[18px] leading-[1.8] text-on-surface-variant">Where tradition ends, modern finishing begins: precision polishing, hallmark certification, and a final quality check before anything leaves the studio.</p>
        </motion.div>
      </div>
    </section>
  );
}

const VALUES = [
  { Icon: Diamond, title: "Uncompromising Quality", body: "Every piece is crafted from certified 925 sterling silver, ensuring durability, luster, and a standard of excellence that stands the test of time." },
  { Icon: PenTool, title: "Timeless Design", body: "We believe in elegant minimalism. Our jewelry is designed to be versatile—effortlessly elevating your everyday style or adding sophistication to special occasions." },
  { Icon: Handshake, title: "Ethical Craftsmanship", body: "We are committed to responsible sourcing and supporting our artisan communities, preserving traditional skills while prioritizing sustainable practices." },
];

export function WhyChooseUs() {
  return (
    <section className="py-section-v-padding-mobile tablet:py-section-v-padding px-margin-mobile tablet:px-margin-desktop max-w-[1440px] mx-auto w-full text-center">
      <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em] mb-4 block">Why Choose AG Elements</span>
      <h2 className="font-headline-lg text-[36px] tablet:text-[48px] leading-tight font-medium text-charcoal-navy mb-16">The AG Elements Difference</h2>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-12"
      >
        {VALUES.map(({ Icon, title, body }) => (
          <motion.div key={title} variants={fadeUp} className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-lavender flex items-center justify-center text-primary mb-4">
              <Icon className="text-[32px]" />
            </div>
            <h3 className="font-headline-sm text-[24px] text-charcoal-navy">{title}</h3>
            <p className="font-body-md text-on-surface-variant">{body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

const TRUST_BADGES = [
  { Icon: BadgeCheck, title: "925 Certified", body: "Guaranteed purity in every piece" },
  { Icon: History, title: "Since 1954", body: "Decades of heritage & expertise" },
  { Icon: Truck, title: "Free Delivery", body: "Insured shipping on all orders" },
];

export function QualityPromise() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      className="py-16 border-t border-outline-variant/30"
    >
      <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop">
        <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em] mb-10 block text-center">Quality Promise</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {TRUST_BADGES.map(({ Icon, title, body }, i) => (
            <div
              key={title}
              className={i === 1 ? "flex flex-col items-center gap-4 border-y md:border-y-0 md:border-x border-outline-variant/30 py-8 md:py-0" : "flex flex-col items-center gap-4"}
            >
              <Icon className="text-primary scale-125" />
              <div>
                <h5 className="font-label-md text-charcoal-navy uppercase tracking-widest">{title}</h5>
                <p className="font-label-sm text-on-surface-variant mt-1">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export function AboutCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="bg-ag-purple w-full py-16 tablet:py-20 px-margin-mobile tablet:px-margin-desktop"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col tablet:flex-row items-center justify-between gap-8 text-center tablet:text-left">
        <div className="flex flex-col gap-3 max-w-xl">
          <span className="font-label-md text-[13px] font-bold uppercase tracking-[0.2em] text-pearl-white/70">Visit Our Collection</span>
          <h2 className="font-headline-lg text-[32px] tablet:text-[44px] leading-[1.15] font-medium text-pearl-white">Find Your Next Heirloom</h2>
        </div>
        <Link
          href="/shop"
          className="group shrink-0 inline-flex items-center gap-3 bg-pearl-white text-ag-purple font-label-md text-[13px] px-10 py-4 rounded-full uppercase tracking-[0.15em] font-bold hover:bg-surface-variant transition-colors shadow-xl"
        >
          Shop The Collection
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.section>
  );
}
