import Link from 'next/link';
import Image from 'next/image';
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function Footer() {
  return (
    <>
      {/* Mobile Newsletter Section (Hidden on Tablet+) */}
      <section className="tablet:hidden bg-charcoal-navy py-section-v-padding-mobile px-margin-mobile text-center">
        <h2 className="font-headline-sm text-pearl-white mb-4">Join Our Inner Circle</h2>
        <p className="text-body-md text-pearl-white/60 mb-8 max-w-sm mx-auto">Subscribe for early access to new launches, exclusive events, and heritage stories.</p>
        <NewsletterForm variant="mobile" />
      </section>

      {/* Main Footer */}
      <footer className="w-full bg-surface-lavender tablet:bg-pearl-white pt-12 tablet:py-section-v-padding px-margin-mobile tablet:px-margin-desktop pb-24 tablet:pb-section-v-padding">
        <div className="max-w-[1440px] mx-auto flex flex-col tablet:grid tablet:grid-cols-4 gap-gutter">
          
          {/* Col 1: Logo & Desc (Mobile: Center, Desktop: Left) */}
          <div className="flex flex-col items-center tablet:items-start gap-4 mb-12 tablet:mb-0">
            <Image src="/brand/logo.png" alt="AG Elements" width={160} height={40} className="h-10 w-auto object-contain" />
            {/* Desktop Description */}
            <p className="hidden tablet:block font-body-md text-[16px] leading-[24px] text-on-surface-variant">Crafting timeless sterling silver jewelry since 1954.</p>
            {/* Mobile Socials */}
            <div className="flex tablet:hidden gap-6 text-primary mt-2">
              <span className="material-symbols-outlined">face_nod</span>
              <span className="material-symbols-outlined">photo_camera</span>
              <span className="material-symbols-outlined">play_circle</span>
            </div>
          </div>

          {/* Col 2 & 3: Links (Desktop) */}
          <div className="hidden tablet:flex flex-col gap-4">
            <span className="font-label-md text-[14px] uppercase tracking-widest text-primary">Explore</span>
            <div className="flex flex-col gap-2 font-body-md">
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/collections/necklaces">Necklaces</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/collections/bracelets">Bracelets</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/collections/earrings">Earrings</Link>
            </div>
          </div>

          <div className="hidden tablet:flex flex-col gap-4">
            <span className="font-label-md text-[14px] uppercase tracking-widest text-primary">Support</span>
            <div className="flex flex-col gap-2 font-body-md">
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/contact">Contact Us</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/shipping-returns">Shipping & Returns</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/privacy-policy">Privacy Policy</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/store-locator">Store Locator</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/track-order">Track Order</Link>
            </div>
          </div>

          {/* Col 2 & 3 Links (Mobile Accordion) */}
          <div className="tablet:hidden w-full mb-12">
            <Accordion>
              <AccordionItem>
                <AccordionTrigger>Explore</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-3">
                  <Link className="block text-on-surface-variant text-body-md" href="/collections/necklaces">Necklaces</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/collections/bracelets">Bracelets</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/collections/earrings">Earrings</Link>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem>
                <AccordionTrigger>Support</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-3">
                  <Link className="block text-on-surface-variant text-body-md" href="/contact">Contact Us</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/shipping-returns">Shipping & Returns</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/privacy-policy">Privacy Policy</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/store-locator">Store Locator</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/track-order">Track Order</Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Col 4: Newsletter (Desktop only) */}
          <div className="hidden tablet:flex flex-col gap-4">
            <span className="font-label-md text-[14px] uppercase tracking-widest text-primary">Stay Connected</span>
            <p className="font-body-md text-on-surface-variant">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <NewsletterForm variant="desktop" />
          </div>
          
          {/* Copyright Section */}
          <div className="col-span-1 tablet:col-span-4 mt-4 tablet:mt-8 pt-8 tablet:border-t tablet:border-outline-variant/30 text-center flex flex-col gap-2 tablet:block">
            <span className="tablet:hidden text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">© {new Date().getFullYear()} AG Elements. Since 1954.</span>
            <div className="tablet:hidden flex justify-center gap-4 text-[10px] text-on-surface-variant uppercase tracking-widest">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <span>|</span>
              <Link href="/terms">Terms of Service</Link>
            </div>
            <span className="hidden tablet:block font-body-md text-on-surface-variant">
              © {new Date().getFullYear()} AG Elements. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
