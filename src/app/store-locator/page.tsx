import { generateMetadata } from "@/lib/seo/generateMetadata";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = generateMetadata({
  title: "Store Locator | AG Elements",
  description: "Find AG Elements stores and studios near you.",
});

export default function StoreLocatorPage() {
  return (
    <main className="max-w-[1440px] mx-auto overflow-hidden">
      <section className="px-margin-mobile tablet:px-margin-desktop py-16 tablet:py-section-v-padding text-center max-w-4xl mx-auto">
        <h1 className="font-headline-lg text-[48px] text-charcoal-navy mb-6">Store Locator</h1>
        <p className="font-body-lg text-[18px] text-on-surface-variant leading-relaxed mb-12">
          Discover our flagship studio where our heritage comes to life.
        </p>

        <div className="bg-surface-lavender p-8 tablet:p-12 rounded-xl text-left shadow-sm max-w-2xl mx-auto flex flex-col tablet:flex-row gap-8 items-center tablet:items-start justify-between">
          <div>
            <h3 className="font-headline-sm text-[24px] text-charcoal-navy mb-4">Wardha Flagship Studio</h3>
            <p className="font-body-md text-on-surface-variant mb-4">
              Shriram Govind Kathane Jewellers,<br />
              c/o Sarafa Line, opp. Balaji Mandir,<br />
              Kapada Line, Mahadevpura, Nagpur,<br />
              Wardha, Maharashtra 442001
            </p>
            <div className="flex flex-col gap-1 mb-6">
              <span className="font-label-sm uppercase tracking-widest text-[12px] text-on-surface-variant">Hours</span>
              <span className="font-body-md text-charcoal-navy">Mon - Sat: 10:30 AM - 7:30 PM</span>
              <span className="font-body-md text-charcoal-navy">Sunday: Closed</span>
            </div>
          </div>
          <div className="w-full tablet:w-auto text-center">
            <Link href="/contact">
              <Button className="w-full tablet:w-auto uppercase tracking-widest font-label-md">
                Get Directions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Google Maps Placeholder */}
      <section className="px-margin-mobile tablet:px-margin-desktop mb-section-v-padding-mobile tablet:mb-section-v-padding">
        <div className="w-full h-[300px] tablet:h-[450px] bg-surface-container-low rounded-xl overflow-hidden relative group">
          <div className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvtKe6CQsdEM3k1Rtzid-EK0982WhejlQDGgVewgYY8D3k3m0gAr8X7z_pO5JwHMfn3Zl0o5b-6X-2w3EcTuhGoAaz4yTPKmGOPfRvYxZlqXN5twI9GxMTrMJ7YfSpIlYHPIA9PXgTyWS4UIx7_MUQru8zz82AdWw3EHuGPLUFciP4jgG50sjtrFg0U9gA-Jv1vXbKXIHVR_ybdLXAsYpuwfqtaLN5gxyX_-o_wS1PsXJICRwLispPTQ')" }}></div>
          <div className="absolute inset-0 bg-charcoal-navy/10 pointer-events-none"></div>
        </div>
      </section>
    </main>
  );
}
