import { generateMetadata } from "@/lib/seo/generateMetadata";

export const metadata = generateMetadata({
  title: "Privacy Policy | AG Elements",
  description: "Read about AG Elements' Privacy Policy and how we protect your data.",
});

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-[1024px] mx-auto px-margin-mobile tablet:px-margin-desktop py-16 tablet:py-section-v-padding w-full">
      <div className="text-center mb-16">
        <h1 className="font-headline-lg text-[48px] text-charcoal-navy mb-6">Privacy Policy</h1>
        <p className="font-body-lg text-[18px] text-on-surface-variant max-w-2xl mx-auto">
          Your privacy is critically important to us. This policy outlines how we collect, use, and protect your information.
        </p>
      </div>

      <article className="prose prose-p:font-body-md prose-p:text-[16px] prose-p:text-on-surface-variant prose-headings:font-headline-sm prose-headings:text-charcoal-navy max-w-none space-y-8">
        
        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">1. Information We Collect</h2>
          <p>
            [PLACEHOLDER — confirm with AG Elements team: We collect information that you provide to us directly, such as when you create an account, make a purchase, subscribe to our newsletter, or contact our customer support. This may include your name, email address, phone number, shipping address, and payment information.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">2. How We Use Your Information</h2>
          <p>
            [PLACEHOLDER: We use the information we collect to fulfill your orders, communicate with you about your purchase, provide customer support, and, if you have opted in, send you marketing communications. We also use data for internal analytics to improve our website and services.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">3. Information Sharing</h2>
          <p>
            [PLACEHOLDER: We do not sell or rent your personal information to third parties. We may share your information with trusted third-party service providers (such as shipping partners and payment processors) strictly for the purpose of fulfilling our services to you.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">4. Data Security</h2>
          <p>
            [PLACEHOLDER: We implement reasonable security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.]
          </p>
        </section>

        <section>
          <h2 className="text-[24px] mb-4 border-b border-outline-variant/30 pb-2">5. Your Rights</h2>
          <p>
            [PLACEHOLDER: You have the right to access, update, or delete your personal information. If you wish to exercise these rights, please contact our privacy officer at privacy@agelements.com.]
          </p>
        </section>

      </article>
    </main>
  );
}
