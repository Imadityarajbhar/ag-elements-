"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion/variants";
import { StarRating } from "@/components/shared/StarRating";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  rating: number;
}

// Real, existing customer testimonials only — kept to the three already live
// on the site rather than padding the count with invented reviews.
const TESTIMONIALS: Testimonial[] = [
  {
    id: "priya",
    quote: "Absolutely stunning! It feels substantial but looks so delicate on the wrist. I haven't taken it off since it arrived.",
    name: "Priya S.",
    rating: 5,
  },
  {
    id: "rohan",
    quote: "Perfect gift. The premium packaging made the unboxing experience feel so luxurious and special.",
    name: "Rohan M.",
    rating: 5,
  },
  {
    id: "anita",
    quote: "Elegant and versatile. The silver has a lovely shine that doesn't tarnish with everyday wear.",
    name: "Anita D.",
    rating: 5,
  },
];

function Monogram({ name }: { name: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-lavender-blush to-surface-variant border border-ag-purple/20 shrink-0"
    >
      <span className="font-headline-sm text-[18px] text-ag-purple">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex flex-col gap-6 h-full rounded-2xl border border-outline-variant/40 bg-pearl-white p-8 tablet:p-10 shadow-[0_20px_45px_-25px_rgba(35,33,58,0.25)] hover:shadow-[0_30px_60px_-20px_rgba(35,33,58,0.35)] transition-shadow duration-500 overflow-hidden"
    >
      <span
        aria-hidden="true"
        className="absolute -top-2 right-6 font-headline-lg text-[100px] leading-none text-ag-purple/[0.08] select-none"
      >
        &rdquo;
      </span>

      <StarRating rating={testimonial.rating} className="relative" />

      <p className="relative font-headline-sm text-[19px] leading-[1.6] text-charcoal-navy font-normal italic flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      <div className="relative flex items-center gap-3 pt-6 border-t border-outline-variant/30">
        <Monogram name={testimonial.name} />
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-[13px] font-semibold text-charcoal-navy">{testimonial.name}</span>
          <span className="inline-flex items-center gap-1 font-label-sm text-[10px] uppercase tracking-widest text-ag-purple font-semibold">
            <BadgeCheck className="w-3 h-3" />
            Verified Purchase
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function CarouselControls({ count }: { count: number }) {
  const { api, scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="flex items-center justify-center gap-6 mt-10">
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Previous testimonial"
        className="flex items-center justify-center w-10 h-10 rounded-full border border-ag-purple/30 text-ag-purple disabled:opacity-30 hover:bg-ag-purple hover:text-pearl-white transition-colors duration-300"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === selectedIndex ? "w-6 bg-ag-purple" : "w-1.5 bg-outline-variant"
            )}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label="Next testimonial"
        className="flex items-center justify-center w-10 h-10 rounded-full border border-ag-purple/30 text-ag-purple disabled:opacity-30 hover:bg-ag-purple hover:text-pearl-white transition-colors duration-300"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-section-v-padding-mobile tablet:py-section-v-padding bg-surface-container w-full overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 tablet:mb-20"
        >
          <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em] mb-4 block">Testimonials</span>
          <h2 className="font-headline-lg text-[36px] tablet:text-[48px] leading-tight font-medium text-charcoal-navy">What Our Customers Say</h2>
        </motion.div>

        {/* Desktop only: editorial staggered grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="hidden laptop:grid grid-cols-3 gap-8"
        >
          {TESTIMONIALS.map((testimonial, i) => (
            <div key={testimonial.id} className={i === 1 ? "laptop:translate-y-8" : undefined}>
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </motion.div>

        {/* Mobile + tablet: swipeable carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="laptop:hidden"
        >
          <Carousel opts={{ align: "center", loop: true }}>
            <CarouselContent>
              {TESTIMONIALS.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 basis-[85%] tablet:basis-[45%]">
                  <TestimonialCard testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselControls count={TESTIMONIALS.length} />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
