"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        per_page: '10',
      });
      if (status !== 'all') query.append('status', status);
      if (debouncedSearch) query.append('search', debouncedSearch);

      const res = await fetch(`/api/account/orders?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      
      const data = await res.json();
      setOrders(data.orders || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset page to 1 when search or status changes
  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-headline-md text-[32px] font-medium text-charcoal-navy">Order History</h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          View your past orders, track current shipments, and reorder your favorite pieces.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/30">
        <div className="flex gap-2 items-center">
          <label className="font-label-md text-charcoal-navy">Status:</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="border-outline-variant/50 rounded-lg p-2 font-body-sm text-charcoal-navy focus:ring-ag-purple"
          >
            <option value="all">All Orders</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
          <Input 
            placeholder="Search order number..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-3xl text-ag-purple">progress_activity</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">receipt_long</span>
          <h2 className="font-headline-sm text-xl text-charcoal-navy mb-2">No orders found</h2>
          <p className="font-body-sm text-on-surface-variant mb-6">We couldn't find any orders matching your criteria.</p>
          {(status !== 'all' || search) ? (
            <Button onClick={() => { setStatus('all'); setSearch(''); }} variant="outline" className="border-ag-purple text-ag-purple">
              Clear Filters
            </Button>
          ) : (
            <Link href="/shop" className="inline-block bg-ag-purple text-pearl-white px-6 py-3 rounded uppercase font-label-sm tracking-widest font-semibold hover:bg-ag-purple/90 transition-colors">
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant font-label-md uppercase tracking-wider text-sm">
                  <th className="pb-4 font-semibold">Order</th>
                  <th className="pb-4 font-semibold">Date</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Total</th>
                  <th className="pb-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {orders.map((order) => (
                  <tr key={order.id} className="font-body-md text-charcoal-navy group hover:bg-surface-container-lowest transition-colors">
                    <td className="py-4 font-semibold">#{order.number}</td>
                    <td className="py-4 text-on-surface-variant">{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded uppercase tracking-wider ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 font-semibold">
                      {order.currency === 'INR' ? '₹' : order.currency}{parseFloat(order.total).toLocaleString('en-IN')} 
                      <span className="text-on-surface-variant text-sm font-normal ml-1">
                        for {order.itemCount} item{order.itemCount > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link href={`/account/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="border-ag-purple text-ag-purple text-xs h-8">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/30">
              <p className="font-body-sm text-on-surface-variant">
                Showing page <span className="font-semibold text-charcoal-navy">{pagination.page}</span> of <span className="font-semibold text-charcoal-navy">{pagination.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  disabled={pagination.page <= 1} 
                  onClick={() => setPage(p => p - 1)}
                  className="h-8 px-3 border-outline-variant/50 text-charcoal-navy"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  disabled={pagination.page >= pagination.totalPages} 
                  onClick={() => setPage(p => p + 1)}
                  className="h-8 px-3 border-outline-variant/50 text-charcoal-navy"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
