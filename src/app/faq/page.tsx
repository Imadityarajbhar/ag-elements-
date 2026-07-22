import { generateMetadata } from "@/lib/seo/generateMetadata";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = generateMetadata({
  title: "Frequently Asked Questions | AG Elements",
  description: "Find answers to common questions about AG Elements' shipping, returns, silver care, and more.",
  path: "/faq",
});

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long does shipping take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer complimentary express shipping across India. Standard delivery takes 3-5 business days, while bespoke or personalized items may require 10-14 days for crafting and shipment."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer international shipping?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Currently, we ship exclusively within India. We are working on expanding our delivery network to bring AG Elements to our international patrons soon."
        }
      },
      {
        "@type": "Question",
        "name": "How can I track my order?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Once your order is dispatched, you will receive an email and SMS with the courier tracking details. You can also visit our Track Order page."
        }
      },
      {
        "@type": "Question",
        "name": "What is your return policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Due to the precious nature of our materials, we offer a 7-day exchange window for non-personalized items in their original packaging. All returns must be accompanied by their 925 authenticity certificate."
        }
      },
      {
        "@type": "Question",
        "name": "How do I initiate a return?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To initiate a return, please contact our concierge team via email at concierge@agelements.com or call us at +91 7152 245000 with your order number."
        }
      },
      {
        "@type": "Question",
        "name": "Can I return a bespoke or personalized item?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unfortunately, bespoke, personalized, or engraved items are crafted specifically for you and cannot be returned or exchanged unless there is a manufacturing defect."
        }
      },
      {
        "@type": "Question",
        "name": "Is AG Elements silver certified 925?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, every piece of AG Elements jewelry is crafted from authentic 925 Sterling Silver. Each purchase comes with a physical certificate of authenticity."
        }
      },
      {
        "@type": "Question",
        "name": "How should I care for my silver jewelry?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sterling silver naturally oxidizes over time when exposed to air and moisture. We recommend storing your jewelry in the provided anti-tarnish pouch. Clean gently with a soft micro-fiber cloth and avoid contact with harsh chemicals, perfumes, or water."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer a warranty on your jewelry?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We stand behind the quality of our craftsmanship. We offer a 6-month warranty against manufacturing defects. Normal wear and tear, or damage caused by improper care, is not covered."
        }
      }
    ]
  };

  return (
    <main className="max-w-[1440px] mx-auto overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Page Header */}
      <section className="px-margin-mobile tablet:px-margin-desktop pt-16 tablet:pt-section-v-padding pb-12 text-center max-w-4xl mx-auto">
        <h1 className="font-headline-lg text-[48px] text-charcoal-navy mb-6">Frequently Asked Questions</h1>
        <p className="font-body-lg text-[18px] text-on-surface-variant leading-relaxed">
          Find answers to our most common inquiries below. If you need further assistance, our concierge team is always ready to help.
        </p>
      </section>

      <section className="px-margin-mobile tablet:px-margin-desktop pb-section-v-padding-mobile tablet:pb-section-v-padding max-w-4xl mx-auto w-full flex flex-col gap-12">
        
        {/* Category: Orders & Shipping */}
        <div>
          <h2 className="font-headline-sm text-[24px] text-charcoal-navy mb-6 pb-2 border-b border-outline-variant/30">Orders & Shipping</h2>
          <Accordion>
            <AccordionItem value="shipping-1">
              <AccordionTrigger>How long does shipping take?</AccordionTrigger>
              <AccordionContent>
                We offer complimentary express shipping across India. Standard delivery takes 3-5 business days, while bespoke or personalized items may require 10-14 days for crafting and shipment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping-2">
              <AccordionTrigger>Do you offer international shipping?</AccordionTrigger>
              <AccordionContent>
                Currently, we ship exclusively within India. We are working on expanding our delivery network to bring AG Elements to our international patrons soon.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping-3">
              <AccordionTrigger>How can I track my order?</AccordionTrigger>
              <AccordionContent>
                Once your order is dispatched, you will receive an email and SMS with the courier tracking details. You can also visit our <Link href="/track-order" className="text-primary underline">Track Order</Link> page.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Category: Returns */}
        <div>
          <h2 className="font-headline-sm text-[24px] text-charcoal-navy mb-6 pb-2 border-b border-outline-variant/30">Returns & Exchanges</h2>
          <Accordion>
            <AccordionItem value="returns-1">
              <AccordionTrigger>What is your return policy?</AccordionTrigger>
              <AccordionContent>
                Due to the precious nature of our materials, we offer a 7-day exchange window for non-personalized items in their original packaging. All returns must be accompanied by their 925 authenticity certificate.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns-2">
              <AccordionTrigger>How do I initiate a return?</AccordionTrigger>
              <AccordionContent>
                To initiate a return, please contact our concierge team via email at concierge@agelements.com or call us at +91 7152 245000 with your order number.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns-3">
              <AccordionTrigger>Can I return a bespoke or personalized item?</AccordionTrigger>
              <AccordionContent>
                Unfortunately, bespoke, personalized, or engraved items are crafted specifically for you and cannot be returned or exchanged unless there is a manufacturing defect.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Category: Silver Care */}
        <div>
          <h2 className="font-headline-sm text-[24px] text-charcoal-navy mb-6 pb-2 border-b border-outline-variant/30">Silver Care & Quality</h2>
          <Accordion>
            <AccordionItem value="care-1">
              <AccordionTrigger>Is AG Elements silver certified 925?</AccordionTrigger>
              <AccordionContent>
                Yes, every piece of AG Elements jewelry is crafted from authentic 925 Sterling Silver. Each purchase comes with a physical certificate of authenticity.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care-2">
              <AccordionTrigger>How should I care for my silver jewelry?</AccordionTrigger>
              <AccordionContent>
                Sterling silver naturally oxidizes over time when exposed to air and moisture. We recommend storing your jewelry in the provided anti-tarnish pouch. Clean gently with a soft micro-fiber cloth and avoid contact with harsh chemicals, perfumes, or water.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care-3">
              <AccordionTrigger>Do you offer a warranty on your jewelry?</AccordionTrigger>
              <AccordionContent>
                We stand behind the quality of our craftsmanship. We offer a 6-month warranty against manufacturing defects. Normal wear and tear, or damage caused by improper care, is not covered.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

      </section>

      {/* Still Need Help? */}
      <section className="bg-surface-lavender py-section-v-padding-mobile tablet:py-section-v-padding text-center">
        <div className="max-w-xl mx-auto px-margin-mobile">
          <SectionHeading title="Still Have Questions?" subtitle="We're Here to Help" />
          <p className="font-body-md text-on-surface-variant mb-8">
            Can't find the answer you're looking for? Our concierge team is available to assist you with any inquiries.
          </p>
          <Link href="/contact">
            <Button className="px-10 py-6 font-label-md uppercase tracking-widest">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
