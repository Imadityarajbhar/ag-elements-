import { SearchX } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateMetadata } from "@/lib/seo/generateMetadata";

export const metadata = generateMetadata({
  title: "Collection Not Found",
  description: "We couldn't find the collection you were looking for.",
  noIndex: true,
});

export default function CollectionNotFound() {
  return (
    <main className="w-full flex flex-col items-center justify-center px-margin-mobile tablet:px-margin-desktop py-24 text-center min-h-[50vh]">
      <div className="w-16 h-16 rounded-full bg-surface-lavender flex items-center justify-center text-primary mb-6">
        <SearchX className="text-[32px]" />
      </div>
      <h1 className="font-headline-lg text-[40px] tablet:text-[48px] text-charcoal-navy mb-4">
        We Couldn't Find That Collection
      </h1>
      <p className="font-body-lg text-[18px] text-on-surface-variant max-w-lg mb-8">
        It may have been renamed or no longer exists. Explore our current collections instead.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link href="/shop">
          <Button className="uppercase tracking-widest font-label-md px-8 py-4 w-full sm:w-auto">
            Shop All Jewelry
          </Button>
        </Link>
        <Link
          href="/"
          className="font-label-md uppercase tracking-widest text-primary underline underline-offset-4 hover:brightness-90 transition-all py-4 px-4"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
