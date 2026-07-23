import { generateMetadata } from "@/lib/seo/generateMetadata";
import { siteConfig } from "@/lib/seo/site";

export const metadata = generateMetadata({
  title: "Terms of Service | AG Elements",
  description: "Read about AG Elements' Terms of Service.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main className="max-w-[1024px] mx-auto px-margin-mobile tablet:px-margin-desktop py-16 tablet:py-section-v-padding w-full">
      <div className="text-center mb-16">
        <h1 className="font-headline-lg text-[48px] text-charcoal-navy mb-6">Terms of Service</h1>
        <p className="font-body-lg text-[18px] text-on-surface-variant max-w-2xl mx-auto">
          Please read these terms and conditions carefully before using our website.
        </p>
      </div>

      <article className="prose prose-p:font-body-md prose-p:text-[16px] prose-p:text-on-surface-variant prose-headings:font-headline-sm prose-headings:text-charcoal-navy max-w-none space-y-8">
        
        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">1. General Overview</h2>
          <p>
            [PLACEHOLDER — confirm with AG Elements team: By accessing or using the AG Elements website, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the website or use any services.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">2. Products & Services</h2>
          <p>
            [PLACEHOLDER: We have made every effort to display as accurately as possible the colors and images of our products. However, we cannot guarantee that your computer monitor's display of any color will be accurate. All our jewelry is handcrafted, meaning slight variations may occur, which adds to the uniqueness of each piece.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">3. Pricing & Modifications</h2>
          <p>
            [PLACEHOLDER: Prices for our products are subject to change without notice. We reserve the right to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the Service.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">4. Accuracy of Billing</h2>
          <p>
            [PLACEHOLDER: We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">5. Contact Information</h2>
          <p>
            [PLACEHOLDER: Questions about the Terms of Service should be sent to us at {siteConfig.email}.]
          </p>
        </section>

      </article>
    </main>
  );
}
