"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function OrdersPage() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || []);
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
        <h1 className="font-headline-md text-[32px] font-medium text-charcoal-navy">Order History</h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          View your past orders, track current shipments, and reorder your favorite pieces.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">receipt_long</span>
          <h2 className="font-headline-sm text-xl text-charcoal-navy mb-2">No orders yet</h2>
          <p className="font-body-sm text-on-surface-variant mb-6">Looks like you haven't placed an order with us yet.</p>
          <Link href="/shop" className="inline-block bg-ag-purple text-pearl-white px-6 py-3 rounded uppercase font-label-sm tracking-widest font-semibold hover:bg-ag-purple/90 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-outline-variant/30 text-on-surface-variant font-label-md uppercase tracking-wider text-sm">
                <th className="pb-4 font-semibold">Order</th>
                <th className="pb-4 font-semibold">Date</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold">Total</th>
                <th className="pb-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {orders.map((order) => (
                <tr key={order.id} className="font-body-md text-charcoal-navy group hover:bg-surface-container-lowest transition-colors">
                  <td className="py-4 font-semibold">#{order.id}</td>
                  <td className="py-4 text-on-surface-variant">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="py-4">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded uppercase tracking-wider ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 font-semibold">₹{order.total.toLocaleString('en-IN')} <span className="text-on-surface-variant text-sm font-normal">for {order.itemCount} item{order.itemCount > 1 ? 's' : ''}</span></td>
                  <td className="py-4">
                    <Link href={`/account/orders/${order.id}`} className="text-ag-purple hover:underline font-semibold text-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
