"use client";
import { Phone, Mail, MapPin, Camera, PlayCircle, BadgeCheck, History, Truck } from 'lucide-react';

import { SectionHeading } from "@/components/shared/SectionHeading";
import { siteConfig } from "@/lib/seo/site";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function ContactPage() {
  const inputClass = "w-full bg-transparent border-b border-charcoal-navy/20 focus:border-primary py-2 px-0 text-body-md font-body-md outline-none transition-colors placeholder:text-outline-variant";

  return (
    <main className="max-w-[1440px] mx-auto overflow-hidden">
      {/* Page Header */}
      <section className="px-margin-mobile tablet:px-margin-desktop pt-16 tablet:pt-section-v-padding pb-16 text-center max-w-4xl mx-auto">
        <h1 className="font-headline-lg text-[48px] text-charcoal-navy mb-6">Get in Touch</h1>
        <p className="font-body-lg text-[18px] text-on-surface-variant leading-relaxed">
          Whether you seek a bespoke creation or have questions about our heritage collections, our silver specialists are here to guide you. Every conversation at AG Elements is handled with the same precision we apply to our craft since 1954.
        </p>
      </section>

      {/* Two-Column Contact Layout */}
      <section className="px-margin-mobile tablet:px-margin-desktop pb-section-v-padding-mobile tablet:pb-section-v-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
          
          {/* Contact Form */}
          <div className="bg-pearl-white p-6 tablet:p-12">
            <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm uppercase text-on-surface-variant tracking-widest text-[12px]">Full Name</label>
                  <input className={inputClass} placeholder="E.g. Julianne Moore" type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm uppercase text-on-surface-variant tracking-widest text-[12px]">Email Address</label>
                  <input className={inputClass} placeholder="julianne@example.com" type="email" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm uppercase text-on-surface-variant tracking-widest text-[12px]">Phone Number</label>
                  <input className={inputClass} placeholder="+91 00000 00000" type="tel" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm uppercase text-on-surface-variant tracking-widest text-[12px]">Subject</label>
                  <select className={`${inputClass} appearance-none bg-transparent`}>
                    <option>Bespoke Inquiry</option>
                    <option>Order Status</option>
                    <option>Product Care</option>
                    <option>Wholesale</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm uppercase text-on-surface-variant tracking-widest text-[12px]">Your Message</label>
                <textarea className={`${inputClass} resize-none`} placeholder="How can we assist you today?" rows={4}></textarea>
              </div>
              <Button type="submit" className="px-10 py-6 w-full tablet:w-auto font-label-md uppercase tracking-widest">
                Submit Inquiry
              </Button>
            </form>
          </div>

          {/* Business Info Panel */}
          <div className="bg-surface-lavender p-8 tablet:p-16 rounded-xl space-y-12 h-full">
            <div>
              <h3 className="font-headline-sm text-[24px] text-charcoal-navy mb-8 border-b border-primary/10 pb-4">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Phone className="text-primary mt-1" />
                  <div>
                    <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-1 text-[12px]">Call Us</p>
                    <p className="font-body-lg text-charcoal-navy">+91 7152 245000</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="text-primary mt-1" />
                  <div>
                    <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-1 text-[12px]">Email Us</p>
                    <p className="font-body-lg text-charcoal-navy">concierge@agelements.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="text-primary mt-1" />
                  <div>
                    <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-1 text-[12px]">Visit Studio</p>
                    <p className="font-body-lg text-charcoal-navy">Shriram Govind Kathane Jewellers,<br />c/o Sarafa Line, opp. Balaji Mandir,<br />Kapada Line, Mahadevpura, Nagpur,<br />Wardha, Maharashtra 442001</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-label-sm text-on-surface-variant uppercase mb-4 tracking-widest text-[12px]">Business Hours</h4>
              <div className="space-y-2 font-body-md text-charcoal-navy">
                <p className="flex justify-between"><span>Mon - Sat</span> <span>10:30 AM - 7:30 PM</span></p>
                <p className="flex justify-between border-t border-primary/5 pt-2"><span>Sunday</span> <span>Closed</span></p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-primary/10">
              <p className="font-label-sm text-on-surface-variant uppercase mb-4 tracking-widest text-[12px]">Follow Our Journey</p>
              <div className="flex gap-6 text-primary">
                <a className="hover:opacity-70 transition-all" href={siteConfig.social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Camera  /></a>
                <a className="hover:opacity-70 transition-all" href="#" aria-label="YouTube"><PlayCircle  /></a>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Google Maps Placeholder */}
      <section className="px-margin-mobile tablet:px-margin-desktop mb-section-v-padding-mobile tablet:mb-section-v-padding">
        <div className="w-full h-[300px] tablet:h-[450px] bg-surface-container-low rounded-xl overflow-hidden relative group">
          <div className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvtKe6CQsdEM3k1Rtzid-EK0982WhejlQDGgVewgYY8D3k3m0gAr8X7z_pO5JwHMfn3Zl0o5b-6X-2w3EcTuhGoAaz4yTPKmGOPfRvYxZlqXN5twI9GxMTrMJ7YfSpIlYHPIA9PXgTyWS4UIx7_MUQru8zz82AdWw3EHuGPLUFciP4jgG50sjtrFg0U9gA-Jv1vXbKXIHVR_ybdLXAsYpuwfqtaLN5gxyX_-o_wS1PsXJICRwLispPTQ')" }}></div>
          <div className="absolute inset-0 bg-charcoal-navy/10 pointer-events-none"></div>
          <div className="absolute top-4 left-4 tablet:top-8 tablet:left-8 bg-pearl-white p-6 shadow-xl rounded-lg max-w-[280px] tablet:max-w-xs">
            <p className="font-headline-sm text-[18px] mb-2 text-charcoal-navy">Our Flagship Store</p>
            <p className="font-body-md text-[14px] text-on-surface-variant">Located in the heart of the historic Sarafa market, our studio is a sanctuary for fine silver craftsmanship.</p>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="bg-surface-lavender py-section-v-padding-mobile tablet:py-section-v-padding px-margin-mobile tablet:px-margin-desktop">
        <div className="max-w-4xl mx-auto">
          <SectionHeading title="Frequently Asked Questions" subtitle="Quick Answers" align="center" />
          <Accordion>
            <AccordionItem value="q1">
              <AccordionTrigger>How long does shipping take?</AccordionTrigger>
              <AccordionContent>
                We offer complimentary express shipping across India. Standard delivery takes 3-5 business days, while bespoke or personalized items may require 10-14 days for crafting and shipment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>What is your return policy?</AccordionTrigger>
              <AccordionContent>
                Due to the precious nature of our materials, we offer a 7-day exchange window for non-personalized items in their original packaging. All returns must be accompanied by their 925 authenticity certificate.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger>How should I care for my silver?</AccordionTrigger>
              <AccordionContent>
                Sterling silver naturally oxidizes over time. We recommend storing your jewelry in the provided anti-tarnish pouch. Clean gently with a soft micro-fiber cloth and avoid contact with harsh chemicals or perfumes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      
      {/* Trust Strip */}
      <section className="py-16 border-t border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <BadgeCheck className="text-primary scale-125" />
            <div>
              <h5 className="font-label-md text-charcoal-navy uppercase tracking-widest">925 Certified</h5>
              <p className="font-label-sm text-on-surface-variant mt-1">Guaranteed purity in every piece</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 border-y md:border-y-0 md:border-x border-outline-variant/30 py-8 md:py-0">
            <History className="text-primary scale-125" />
            <div>
              <h5 className="font-label-md text-charcoal-navy uppercase tracking-widest">Since 1954</h5>
              <p className="font-label-sm text-on-surface-variant mt-1">Decades of heritage & expertise</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Truck className="text-primary scale-125" />
            <div>
              <h5 className="font-label-md text-charcoal-navy uppercase tracking-widest">Free Delivery</h5>
              <p className="font-label-sm text-on-surface-variant mt-1">Insured shipping on all orders</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
