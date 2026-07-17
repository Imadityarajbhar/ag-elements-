"use client";
import { BellRing } from 'lucide-react';

import Link from 'next/link';

export default function NotificationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-headline-md text-[28px] sm:text-[32px] font-medium text-charcoal-navy">Notifications</h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          Stay updated on your orders, special offers, and account activity.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center shadow-sm">
        <BellRing className="text-5xl text-outline-variant mb-4" />
        <h2 className="font-headline-sm text-xl text-charcoal-navy mb-2">No new notifications</h2>
        <p className="font-body-sm text-on-surface-variant mb-6">
          You're all caught up! We'll notify you when there's an update on your orders or new exclusive offers.
        </p>
        <Link 
          href="/shop" 
          className="inline-block bg-ag-purple text-pearl-white px-6 py-3 rounded uppercase font-label-sm tracking-widest font-semibold hover:bg-ag-purple/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
