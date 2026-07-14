"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddressesPage() {
  const { token } = useAuthStore();
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline-md text-[32px] font-medium text-charcoal-navy">Addresses</h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          The following addresses will be used on the checkout page by default.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Billing Address */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-sm text-xl font-semibold text-charcoal-navy">Billing Address</h2>
            <button className="text-ag-purple text-sm font-semibold hover:underline">Edit</button>
          </div>
          
          {data?.billingAddress ? (
            <div className="space-y-2 text-on-surface-variant font-body-md">
              <p className="font-semibold text-charcoal-navy">{data.billingAddress.firstName} {data.billingAddress.lastName}</p>
              <p>{data.billingAddress.address1}</p>
              <p>{data.billingAddress.city}, {data.billingAddress.state} {data.billingAddress.postcode}</p>
              <p>{data.billingAddress.country}</p>
              {data.billingAddress.phone && <p className="mt-2 text-sm"><span className="font-semibold text-charcoal-navy">Phone:</span> {data.billingAddress.phone}</p>}
            </div>
          ) : (
            <p className="font-body-sm text-on-surface-variant">You have not set up this type of address yet.</p>
          )}
        </div>

        {/* Shipping Address */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-sm text-xl font-semibold text-charcoal-navy">Shipping Address</h2>
            <button className="text-ag-purple text-sm font-semibold hover:underline">Edit</button>
          </div>
          
          {data?.shippingAddress ? (
            <div className="space-y-2 text-on-surface-variant font-body-md">
              <p className="font-semibold text-charcoal-navy">{data.shippingAddress.firstName} {data.shippingAddress.lastName}</p>
              <p>{data.shippingAddress.address1}</p>
              <p>{data.shippingAddress.city}, {data.shippingAddress.state} {data.shippingAddress.postcode}</p>
              <p>{data.shippingAddress.country}</p>
            </div>
          ) : (
            <p className="font-body-sm text-on-surface-variant">You have not set up this type of address yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
