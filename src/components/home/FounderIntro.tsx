"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { HOMEPAGE_LINKS } from "@/config/homepage-links";

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export function FounderIntro() {
  return (
    <section className="py-section-v-padding-mobile tablet:py-section-v-padding bg-surface-container-low w-full overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop">
        <div className="flex flex-col tablet:flex-row items-center gap-16 tablet:gap-24">
          {/* Founder Portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="flex-1 relative w-full max-w-[420px] tablet:max-w-none mx-auto"
          >
            <div
              className="absolute -inset-4 bg-gradient-to-br from-ag-purple/10 via-lavender-blush/60 to-transparent rounded-[2rem] -rotate-2"
              aria-hidden="true"
            />
            <div className="relative rounded-[1.75rem] overflow-hidden shadow-[0_35px_70px_-20px_rgba(35,33,58,0.35)] aspect-[4/5]">
              <Image
                src="/brand/founder-kuntal.jpg"
                alt="Kuntal Kaustubh Kathane, founder of AG Elements, in the AG Elements jewellery studio"
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-charcoal-navy/30 via-transparent to-transparent"
                aria-hidden="true"
              />
            </div>
            <div
              className="hidden tablet:block absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-ag-purple/40 rounded-br-[1.75rem]"
              aria-hidden="true"
            />
          </motion.div>

          {/* Founder's Note */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="flex-1 flex flex-col gap-8 text-center tablet:text-left"
          >
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em]">
                Founder&apos;s Note
              </span>
              <h2 className="font-headline-lg text-[40px] tablet:text-[56px] leading-[1.1] font-medium text-charcoal-navy">
                The Woman Behind Every Piece
              </h2>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="font-body-lg text-[18px] leading-[1.8] text-on-surface-variant font-light max-w-xl mx-auto tablet:mx-0"
            >
              Kuntal Kaustubh Kathane grew up around silver — quite literally. Her family has worked as master silversmiths for generations, and by the time she returned home from her MBA in the UK, the craft was already part of how she saw the world. What she didn&apos;t see enough of was silver jewellery she could actually trust: pieces that held their shine, their shape, their promise of purity. So she built AG Elements around that gap, turning Wardha&apos;s first certified silver brand into a modern studio where heritage technique meets a design sensibility made for everyday life. She still reviews new pieces personally before they leave the studio — a habit less about control, more about care. Behind every necklace and ring is a woman who never stopped thinking like a craftsman, even after she became a founder.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col gap-1">
              <p className="font-headline-sm text-[20px] font-medium text-charcoal-navy">
                Kuntal Kaustubh Kathane
              </p>
              <p className="font-label-md text-[12px] text-ag-purple font-semibold uppercase tracking-[0.15em]">
                Founder &amp; CEO, AG Elements
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                href={HOMEPAGE_LINKS.editorial.aboutStory}
                className="group inline-flex items-center gap-3 border-b-2 border-charcoal-navy pb-1 text-charcoal-navy font-label-md text-[13px] font-bold uppercase tracking-[0.15em] hover:text-ag-purple hover:border-ag-purple transition-colors"
              >
                Meet The Founder
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
