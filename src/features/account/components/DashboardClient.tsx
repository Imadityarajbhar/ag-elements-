"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import Image from 'next/image';

interface DashboardProps {
  initialData: any;
}

export default function DashboardClient({ initialData }: DashboardProps) {
  const { logout } = useAuthStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    // Load recently viewed from local storage
    const viewed = JSON.parse(localStorage.getItem('ag-viewed-storage') || '{}');
    if (viewed.state?.items) {
      setRecentlyViewed(viewed.state.items.slice(0, 4));
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    window.location.href = '/account/login';
  };

  const { user, orders, shippingAddress, recommended } = initialData;
  const recentOrder = orders?.[0];

  // Account Completion Calc (Placeholder logic)
  let completionScore = 0;
  if (user?.email) completionScore += 25;
  if (user?.firstName) completionScore += 25;
  if (shippingAddress?.address1) completionScore += 25;
  if (user?.phone) completionScore += 25;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Welcome Message */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="font-headline-md text-[28px] sm:text-[32px] font-medium text-charcoal-navy">
            Welcome back, {user?.firstName}
          </h1>
          <p className="font-body-md text-on-surface-variant mt-2">
            Manage your orders, addresses, and premium preferences from your Customer Hub.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="border-ag-purple text-ag-purple shrink-0">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2. Recent Orders */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal-navy flex items-center gap-2">
                <span className="material-symbols-outlined text-ag-purple">receipt_long</span>
                Recent Order
              </h2>
              <Link href="/account/orders" className="text-ag-purple text-sm font-semibold hover:underline">View All</Link>
            </div>
            
            {recentOrder ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-body-sm text-on-surface-variant">Order <span className="font-semibold text-charcoal-navy">#{recentOrder.number}</span></p>
                    <p className="font-body-sm text-on-surface-variant">Placed on: {new Date(recentOrder.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded uppercase tracking-wider bg-gray-100 text-gray-700">
                    {recentOrder.status}
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant">Total: <span className="font-semibold text-charcoal-navy">₹{parseFloat(recentOrder.total).toLocaleString('en-IN')}</span></p>
                <Link href={`/account/orders/${recentOrder.id}`} className="block w-full mt-4">
                  <Button variant="outline" className="w-full border-ag-purple text-ag-purple">
                    View Details
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="font-body-sm text-on-surface-variant">No recent orders found.</p>
                <Link href="/shop" className="text-ag-purple text-sm font-semibold hover:underline mt-2 inline-block">Start Shopping</Link>
              </div>
            )}
          </div>

          {/* 3. Wishlist Preview */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal-navy flex items-center gap-2">
                <span className="material-symbols-outlined text-ag-purple">favorite</span>
                Wishlist Preview
              </h2>
              <Link href="/wishlist" className="text-ag-purple text-sm font-semibold hover:underline">View All ({wishlistItems.length})</Link>
            </div>
            {wishlistItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {wishlistItems.slice(0, 4).map((item) => (
                  <Link href={`/product/${item.slug}`} key={item.id} className="block group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-lavender mb-2">
                      {item.images?.[0]?.src && (
                        <Image src={item.images[0].src} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      )}
                    </div>
                    <p className="font-body-sm text-xs truncate text-charcoal-navy">{item.name}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="font-body-sm text-on-surface-variant">Your wishlist is empty.</p>
            )}
          </div>

          {/* 5. Recently Viewed */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal-navy mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-ag-purple">history</span>
              Recently Viewed
            </h2>
            {recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recentlyViewed.map((item) => (
                  <Link href={`/product/${item.slug}`} key={item.id} className="block group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-lavender mb-2">
                      {item.images?.[0]?.src && (
                        <Image src={item.images[0].src} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      )}
                    </div>
                    <p className="font-body-sm text-xs truncate text-charcoal-navy">{item.name}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="font-body-sm text-on-surface-variant">You haven't viewed any products recently.</p>
            )}
          </div>

          {/* 6. Recommended Products */}
          {recommended?.length > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal-navy mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-ag-purple">star</span>
                Recommended For You
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommended.map((item: any) => (
                  <Link href={`/product/${item.slug}`} key={item.id} className="block group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-lavender mb-2">
                      {item.images?.[0]?.src && (
                        <Image src={item.images[0].src} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                      )}
                    </div>
                    <p className="font-body-sm text-xs truncate text-charcoal-navy">{item.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* 7. Account Completion */}
          <div className="bg-surface-lavender rounded-xl p-6">
            <h2 className="font-headline-sm text-[18px] font-semibold text-charcoal-navy mb-2">Account Completion</h2>
            <div className="w-full bg-outline-variant/20 rounded-full h-2 mb-2">
              <div className="bg-ag-purple h-2 rounded-full transition-all duration-1000" style={{ width: `${completionScore}%` }}></div>
            </div>
            <p className="font-body-sm text-on-surface-variant text-sm">{completionScore}% Complete</p>
            {completionScore < 100 && (
              <Link href="/account/profile" className="text-ag-purple text-xs font-semibold hover:underline mt-2 inline-block">Complete Profile</Link>
            )}
          </div>

          {/* 4. Saved Addresses */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-headline-sm text-[18px] font-semibold text-charcoal-navy flex items-center gap-2">
                <span className="material-symbols-outlined text-ag-purple">location_on</span>
                Default Address
              </h2>
              <Link href="/account/addresses" className="text-ag-purple text-xs font-semibold hover:underline">Manage</Link>
            </div>
            {shippingAddress?.address1 ? (
              <div className="space-y-1 font-body-sm text-sm text-on-surface-variant">
                <p className="font-semibold text-charcoal-navy">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                <p>{shippingAddress.address1}</p>
                <p>{shippingAddress.city}, {shippingAddress.state}</p>
                <p>{shippingAddress.postcode}</p>
              </div>
            ) : (
              <div className="text-sm">
                <p className="font-body-sm text-on-surface-variant mb-2">No default address set.</p>
                <Link href="/account/addresses" className="text-ag-purple font-semibold hover:underline">Add Address</Link>
              </div>
            )}
          </div>

          {/* 8. Newsletter */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h2 className="font-headline-sm text-[18px] font-semibold text-charcoal-navy flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-ag-purple">mail</span>
              Newsletter
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mb-4">Stay updated with our latest collections and exclusive offers.</p>
            <Link href="/account/profile" className="text-ag-purple text-xs font-semibold hover:underline">Manage Preferences</Link>
          </div>

          {/* 9. Support */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h2 className="font-headline-sm text-[18px] font-semibold text-charcoal-navy flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-ag-purple">help</span>
              Support
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mb-4">Need help with an order or have a question?</p>
            <Link href="/contact" className="text-ag-purple text-xs font-semibold hover:underline">Contact Us</Link>
          </div>

          {/* Placeholders */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 text-center opacity-60">
              <span className="material-symbols-outlined text-outline-variant mb-1">loyalty</span>
              <p className="font-label-sm text-[10px] uppercase tracking-widest text-on-surface-variant">Reward Points</p>
              <p className="font-semibold text-charcoal-navy text-lg">0</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 text-center opacity-60">
              <span className="material-symbols-outlined text-outline-variant mb-1">redeem</span>
              <p className="font-label-sm text-[10px] uppercase tracking-widest text-on-surface-variant">Store Credit</p>
              <p className="font-semibold text-charcoal-navy text-lg">₹0</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
