import { Phone, MessageCircle, Mail, MapPin, Clock, Camera, ThumbsUp, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { siteConfig } from "@/lib/seo/site";
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
          
          {/* Col 1: Logo & Contact Info */}
          <div className="flex flex-col items-center tablet:items-start gap-4 mb-12 tablet:mb-0">
            <Image src="/brand/logo.png" alt="AG Elements" width={160} height={40} className="h-10 w-auto object-contain" />
            <p className="font-body-md text-[14px] leading-[24px] text-on-surface-variant text-center tablet:text-left">Premium Silver Jewellery</p>
            
            <div className="flex flex-col gap-3 font-body-sm text-on-surface-variant mt-2 text-center tablet:text-left">
              <a href="tel:+91XXXXXXXXXX" className="flex items-center justify-center tablet:justify-start gap-2 hover:text-ag-purple transition-colors">
                <Phone className="text-[18px]" />
                +91 XXXXX XXXXX
              </a>
              <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center tablet:justify-start gap-2 hover:text-ag-purple transition-colors">
                <MessageCircle className="text-[18px]" />
                WhatsApp Us
              </a>
              <a href="mailto:hello@agelements.in" className="flex items-center justify-center tablet:justify-start gap-2 hover:text-ag-purple transition-colors">
                <Mail className="text-[18px]" />
                hello@agelements.in
              </a>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="flex items-start justify-center tablet:justify-start gap-2 hover:text-ag-purple transition-colors mt-2">
                <MapPin className="text-[18px] mt-1" />
                <span>(Complete business address)</span>
              </a>
              <div className="flex items-start justify-center tablet:justify-start gap-2 mt-2 text-[13px]">
                <Clock className="text-[18px] mt-0.5" />
                <span>Mon–Sat: 10 AM – 7 PM</span>
              </div>
            </div>
          </div>

          {/* Col 2: Collections (Desktop) */}
          <div className="hidden tablet:flex flex-col gap-4">
            <span className="font-label-md text-[14px] uppercase tracking-widest text-primary">Collections</span>
            <div className="flex flex-col gap-3 font-body-md">
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/collections/necklaces">Necklaces</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/collections/bracelets">Bracelets</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/collections/earrings">Earrings</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/collections/rings">Rings</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/collections/mens-bracelet">Men's Edit</Link>
            </div>
          </div>

          {/* Col 3: Customer Care & Policies (Desktop) */}
          <div className="hidden tablet:flex flex-col gap-4">
            <span className="font-label-md text-[14px] uppercase tracking-widest text-primary">Customer Care</span>
            <div className="flex flex-col gap-3 font-body-md mb-4">
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/contact">Contact Us</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/track-order">Track Order</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/faq">FAQs</Link>
            </div>
            
            <span className="font-label-md text-[14px] uppercase tracking-widest text-primary mt-2">Policies</span>
            <div className="flex flex-col gap-3 font-body-md">
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/shipping-returns">Shipping & Returns</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/privacy-policy">Privacy Policy</Link>
              <Link className="text-on-surface-variant hover:text-primary transition-all underline underline-offset-4" href="/terms">Terms of Service</Link>
            </div>
          </div>

          {/* Mobile Accordion for Links */}
          <div className="tablet:hidden w-full mb-12">
            <Accordion>
              <AccordionItem value="collections">
                <AccordionTrigger>Collections</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 py-2">
                  <Link className="block text-on-surface-variant text-body-md" href="/collections/necklaces">Necklaces</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/collections/bracelets">Bracelets</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/collections/earrings">Earrings</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/collections/rings">Rings</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/collections/mens-bracelet">Men's Edit</Link>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="support">
                <AccordionTrigger>Customer Care & Policies</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 py-2">
                  <Link className="block text-on-surface-variant text-body-md" href="/contact">Contact Us</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/track-order">Track Order</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/faq">FAQs</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/shipping-returns">Shipping & Returns</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/privacy-policy">Privacy Policy</Link>
                  <Link className="block text-on-surface-variant text-body-md" href="/terms">Terms of Service</Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Col 4: Newsletter & Social (Desktop only) */}
          <div className="hidden tablet:flex flex-col gap-4">
            <span className="font-label-md text-[14px] uppercase tracking-widest text-primary">Stay Connected</span>
            <p className="font-body-md text-on-surface-variant">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <NewsletterForm variant="desktop" />
            
            <div className="mt-8">
              <span className="font-label-md text-[14px] uppercase tracking-widest text-primary mb-4 block">Follow Us</span>
              <div className="flex gap-4 text-on-surface-variant">
                <a href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer" className="hover:text-ag-purple transition-colors">
                  <Camera className="text-[24px]" />
                </a>
                <a href={siteConfig.social.facebook} aria-label="Facebook" target="_blank" rel="noreferrer" className="hover:text-ag-purple transition-colors">
                  <ThumbsUp className="text-[24px]" />
                </a>
                <a href="#" aria-label="Share" target="_blank" rel="noreferrer" className="hover:text-ag-purple transition-colors">
                  <Share2 className="text-[24px]" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Copyright & Trust Badges Section */}
          <div className="col-span-1 tablet:col-span-4 mt-4 tablet:mt-8 pt-8 tablet:border-t tablet:border-outline-variant/30 text-center flex flex-col tablet:flex-row justify-between items-center gap-6">
            <div className="flex gap-4 items-center">
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest px-3 py-1 border border-outline-variant/30 rounded-full">GSTIN: XXXXXXXXXXXXXXX</span>
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest px-3 py-1 border border-outline-variant/30 rounded-full">MSME Certified</span>
            </div>
            <span className="font-body-sm text-[13px] text-on-surface-variant">
              © {new Date().getFullYear()} AG Elements. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
