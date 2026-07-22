import { SearchX } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateMetadata } from "@/lib/seo/generateMetadata";
import Image from "next/image";

export const metadata = generateMetadata({
  title: "Page Not Found | AG Elements",
  description: "We couldn't find the page you were looking for.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <main className="w-full flex flex-col items-center justify-center px-margin-mobile tablet:px-margin-desktop py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-lavender flex items-center justify-center text-primary mb-6">
        <SearchX className="text-[32px]" />
      </div>
      <h1 className="font-headline-lg text-[40px] tablet:text-[48px] text-charcoal-navy mb-4">
        We Couldn't Find That Page
      </h1>
      <p className="font-body-lg text-[18px] text-on-surface-variant max-w-lg mb-8">
        The page you're looking for might have been moved, renamed, or no longer exists. 
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
        <Link href="/">
          <Button className="uppercase tracking-widest font-label-md px-8 py-4 w-full sm:w-auto">
            Return Home
          </Button>
        </Link>
        <Link 
          href="/collections" 
          className="font-label-md uppercase tracking-widest text-primary underline underline-offset-4 hover:brightness-90 transition-all py-4 px-4"
        >
          Shop All Jewelry
        </Link>
      </div>

      {/* Recovery Section */}
      <div className="w-full max-w-4xl border-t border-outline-variant/30 pt-16">
        <h2 className="font-headline-md text-[24px] text-charcoal-navy mb-8">
          In the meantime, explore our collections:
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <Link className="group" href="/collections/necklaces">
            <div className="aspect-square bg-surface-lavender rounded mb-4 overflow-hidden relative shadow-[0px_4px_20px_rgba(35,33,58,0.05)]">
              <Image fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500 grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAViqDQIVVy8z4CPXgOfyAooGfLdxYJh3Wr6bnqxAiAPpCTqjQ8E4OcpIgNuTIknTrZ8gXwsspLree11mtO5Gt_am_yQzE9flYPE4XMtqmDnSqBasV_GCzHDlxiczPLuuQAkmaYY_6I8AJxIy7W1hjsob9UPCRwln7XOxMPi1h9PR9BHW9Gr0ITQN26erNyPwifn3kk0AGKUYlAdoQlYSWWxSFio65BuWDQ5KZkvempRsV5EJze4T29zA" alt="Necklaces" />
            </div>
            <span className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy group-hover:text-primary transition-colors">Necklaces</span>
          </Link>
          <Link className="group" href="/collections/earrings">
            <div className="aspect-square bg-surface-lavender rounded mb-4 overflow-hidden relative shadow-[0px_4px_20px_rgba(35,33,58,0.05)]">
              <Image fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500 grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgYShAiK_WIPmW8XzCj504v1jLWuG1cfWTnZsg933i2ucADqVunBR1qG5SLt6vnry3FMYd5IjpuhbkkvpxbiBxVKdw1xPl-_cypjd1BUkgfnLWl5Z2bOp_Ch46lWO9hlVuedtU4st5dLRYuHi67StD9Fie2aQXNqIQLW4Bo1gwfo8_dl16zt-SlIi0eD1QdfaWRkmCg9NsIJWLg6avXY2r9HuoLEivcUOSNR8r0dkjK-reWSX-Jr0odA" alt="Earrings" />
            </div>
            <span className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy group-hover:text-primary transition-colors">Earrings</span>
          </Link>
          <Link className="group" href="/collections/rings">
            <div className="aspect-square bg-surface-lavender rounded mb-4 overflow-hidden relative shadow-[0px_4px_20px_rgba(35,33,58,0.05)]">
              <Image fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500 grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-sh3tO5RAyWg2MmHjF_iJZsB33tZzzZ3dYnBUDIGke_7G2QryEp28ofzfcgQHvXdVSVMcHr5D7QLy8rKpe39oeTPl5PyRA84DMJxRDeL2PqHbuf6FTIXRGEJYsy6OxtazyCDKjrBVKl2YVsyZZsNYIltKW2RVWVIdDYXRIxR7WuboAV2JavY2JLYQ7LH_0I548FyzpLYZYVUHSoY1hq43QkdJqz3kgNWO9duwPijX67GiLGbqwesnbA" alt="Rings" />
            </div>
            <span className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy group-hover:text-primary transition-colors">Rings</span>
          </Link>
          <Link className="group" href="/collections/bracelets">
            <div className="aspect-square bg-surface-lavender rounded mb-4 overflow-hidden relative shadow-[0px_4px_20px_rgba(35,33,58,0.05)]">
              <Image fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500 grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbgh3H-hSJ9jP5dEIraPESMpSZe-khIlIE0aMQergyEF_Vev3TfKeu5thuhX3uwFaN0ziIjCLqKnPBPXPAzgPR-_HNHFvr3_yClZzJo15pFfUi8xGPbGVhaYygARQWZTotpUb9YWtyTYNCvHRjdY1Gq982TfcByBgjXd7y8fRqxBW8-N18l9NuCqJGNvmOWFz8d3LnYJHFKBG3Ft3u0F4V-Iwz-V60HolpHJ35jN5iDeVy7la55ZtugQ" alt="Bracelets" />
            </div>
            <span className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy group-hover:text-primary transition-colors">Bracelets</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
