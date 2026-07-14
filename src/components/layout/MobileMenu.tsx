"use client";

import { useUIStore } from '@/store/uiStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '/shop', label: 'Shop All' },
  { href: '/collections/necklaces', label: 'Necklaces' },
  { href: '/collections/bracelets', label: 'Bracelets' },
  { href: '/collections/earrings', label: 'Earrings' },
  { href: '/collections/kada', label: 'Kada' },
  { href: '/collections/mangalsutra', label: 'Mangalsutra' },
  { href: '/collections/rings', label: 'Rings' },
  { href: '/gifting', label: 'Gifting' },
];

const SECONDARY_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
];

export function MobileMenu() {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const handleClose = () => setMobileMenuOpen(false);

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="w-full sm:max-w-md bg-pearl-white flex flex-col p-0 z-[100]">
        <SheetHeader className="p-6 pb-4 border-b border-outline-variant/20">
          <SheetTitle className="text-left flex items-center justify-between">
            <Link href="/" onClick={handleClose} className="flex items-center">
              <Image src="/brand/logo.png" alt="AG Elements" width={140} height={35} className="h-8 w-auto object-contain" />
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleClose}
                className="px-6 py-4 text-charcoal-navy hover:bg-surface-container-low hover:text-ag-purple transition-colors font-heading text-[18px] border-b border-outline-variant/10"
              >
                {link.label}
              </Link>
            ))}
            
            <div className="mt-8 flex flex-col">
              {SECONDARY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleClose}
                  className="px-6 py-3 text-on-surface-variant hover:text-ag-purple transition-colors font-sans text-[15px]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
