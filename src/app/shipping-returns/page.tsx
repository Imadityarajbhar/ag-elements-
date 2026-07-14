import { generateMetadata } from "@/lib/seo/generateMetadata";

export const metadata = generateMetadata({
  title: "Shipping & Returns | AG Elements",
  description: "Read about AG Elements' shipping and return policies.",
});

export default function ShippingReturnsPage() {
  return (
    <main className="max-w-[1024px] mx-auto px-margin-mobile tablet:px-margin-desktop py-16 tablet:py-section-v-padding w-full">
      <div className="text-center mb-16">
        <h1 className="font-headline-lg text-[48px] text-charcoal-navy mb-6">Shipping & Returns</h1>
        <p className="font-body-lg text-[18px] text-on-surface-variant max-w-2xl mx-auto">
          Everything you need to know about delivery times, shipping costs, and our return procedures.
        </p>
      </div>

      <article className="prose prose-p:font-body-md prose-p:text-[16px] prose-p:text-on-surface-variant prose-headings:font-headline-sm prose-headings:text-charcoal-navy max-w-none space-y-8">
        
        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">1. Shipping Options & Timelines</h2>
          <p>
            [PLACEHOLDER — confirm with AG Elements team: Standard delivery takes 3-5 business days across India. Express shipping is available for select pin codes.]
          </p>
          <p>
            [PLACEHOLDER: Bespoke or personalized items require an additional 10-14 days for crafting before shipment.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">2. Shipping Charges</h2>
          <p>
            [PLACEHOLDER: We offer complimentary standard shipping on all orders above ₹2000 within India. Orders below this value will incur a flat shipping fee of ₹150.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">3. Returns & Exchanges</h2>
          <p>
            [PLACEHOLDER: Due to the precious nature of our materials, we offer a 7-day exchange window from the date of delivery. Items must be unused, in their original packaging, and accompanied by the 925 authenticity certificate.]
          </p>
          <p>
            [PLACEHOLDER: Personalized, engraved, or bespoke items cannot be returned or exchanged unless there is a manufacturing defect.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">4. How to Initiate a Return</h2>
          <p>
            [PLACEHOLDER: To initiate a return, please email our concierge team at concierge@agelements.com with your order number and unboxing video (if applicable). Our team will arrange a reverse pickup within 2-3 business days.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">5. Refunds</h2>
          <p>
            [PLACEHOLDER: Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds will be processed to the original method of payment within 5-7 business days.]
          </p>
        </section>

      </article>
    </main>
  );
}
