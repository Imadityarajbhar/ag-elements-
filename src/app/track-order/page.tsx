import { Truck } from 'lucide-react';
import { generateMetadata } from "@/lib/seo/generateMetadata";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = generateMetadata({
  title: "Track Order | AG Elements",
  description: "Track your AG Elements order status.",
});

export default function TrackOrderPage() {
  return (
    <main className="max-w-[1024px] mx-auto overflow-hidden min-h-[60vh] flex flex-col items-center justify-center">
      <section className="px-margin-mobile tablet:px-margin-desktop py-16 tablet:py-section-v-padding text-center max-w-2xl mx-auto">
        <Truck className="text-primary text-[48px] mb-6" />
        <h1 className="font-headline-lg text-[48px] text-charcoal-navy mb-6">Track Your Order</h1>
        <p className="font-body-lg text-[18px] text-on-surface-variant leading-relaxed mb-8">
          Order tracking will be available once your order ships. You will receive an email and SMS with the courier tracking details.
        </p>
        
        <div className="bg-surface-lavender p-8 rounded-xl text-center mb-8">
          <p className="font-body-md text-charcoal-navy mb-4">
            If you have an order number and want an immediate update, please reach out to our concierge team.
          </p>
          <Link href="/contact">
            <Button className="uppercase tracking-widest font-label-md">
              Contact Concierge
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
