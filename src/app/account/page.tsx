"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export default function AccountDashboardPage() {
  const { user, token } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="material-symbols-outlined animate-spin text-3xl text-ag-purple">progress_activity</span>
      </div>
    );
  }

  const recentOrder = data?.orders?.[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline-md text-[32px] font-medium text-charcoal-navy">My Dashboard</h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Order Snippet */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal-navy">Recent Order</h2>
            <Link href="/account/orders" className="text-ag-purple text-sm font-semibold hover:underline">View All</Link>
          </div>
          
          {recentOrder ? (
            <div className="space-y-3">
              <p className="font-body-sm text-on-surface-variant">Order <span className="font-semibold text-charcoal-navy">#{recentOrder.id}</span></p>
              <p className="font-body-sm text-on-surface-variant">Date: {new Date(recentOrder.date).toLocaleDateString()}</p>
              <div className="flex items-center gap-2">
                <span className="font-body-sm text-on-surface-variant">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded uppercase tracking-wider ${
                  recentOrder.status === 'completed' ? 'bg-green-100 text-green-700' :
                  recentOrder.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {recentOrder.status}
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant">Total: <span className="font-semibold text-charcoal-navy">₹{recentOrder.total.toLocaleString('en-IN')}</span></p>
              
              <Link href="/account/orders" className="block w-full mt-4">
                <Button variant="outline" className="w-full border-ag-purple text-ag-purple">
                  Track Order
                </Button>
              </Link>
            </div>
          ) : (
            <p className="font-body-sm text-on-surface-variant">No recent orders found.</p>
          )}
        </div>

        {/* Addresses Snippet */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline-sm text-[20px] font-semibold text-charcoal-navy">Default Address</h2>
            <Link href="/account/addresses" className="text-ag-purple text-sm font-semibold hover:underline">Manage</Link>
          </div>
          
          {data?.shippingAddress ? (
            <div className="space-y-1">
              <p className="font-body-sm font-semibold text-charcoal-navy">{data.shippingAddress.firstName} {data.shippingAddress.lastName}</p>
              <p className="font-body-sm text-on-surface-variant">{data.shippingAddress.address1}</p>
              <p className="font-body-sm text-on-surface-variant">{data.shippingAddress.city}, {data.shippingAddress.state} {data.shippingAddress.postcode}</p>
              <p className="font-body-sm text-on-surface-variant">{data.shippingAddress.country}</p>
            </div>
          ) : (
            <p className="font-body-sm text-on-surface-variant">You have not set up this type of address yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
