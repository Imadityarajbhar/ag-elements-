"use client";
import { Loader2, MapPin } from 'lucide-react';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddressData {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

const EMPTY_ADDRESS: AddressData = {
  firstName: '', lastName: '', company: '', address1: '', address2: '',
  city: '', state: '', postcode: '', country: 'IN', email: '', phone: '',
};

function AddressForm({
  address,
  onSave,
  onCancel,
  isSaving,
  showPhone,
  showEmail,
}: {
  address: AddressData;
  onSave: (data: AddressData) => void;
  onCancel: () => void;
  isSaving: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
}) {
  const [form, setForm] = useState<AddressData>(address);

  const update = (field: keyof AddressData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-label-md text-charcoal-navy text-xs">First Name *</label>
          <Input required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} autoComplete="given-name" />
        </div>
        <div className="space-y-1.5">
          <label className="font-label-md text-charcoal-navy text-xs">Last Name *</label>
          <Input required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} autoComplete="family-name" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="font-label-md text-charcoal-navy text-xs">Company</label>
        <Input value={form.company} onChange={(e) => update('company', e.target.value)} autoComplete="organization" />
      </div>
      <div className="space-y-1.5">
        <label className="font-label-md text-charcoal-navy text-xs">Address Line 1 *</label>
        <Input required value={form.address1} onChange={(e) => update('address1', e.target.value)} placeholder="House number and street" autoComplete="address-line1" />
      </div>
      <div className="space-y-1.5">
        <label className="font-label-md text-charcoal-navy text-xs">Address Line 2</label>
        <Input value={form.address2} onChange={(e) => update('address2', e.target.value)} placeholder="Apartment, suite, etc." autoComplete="address-line2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-label-md text-charcoal-navy text-xs">City *</label>
          <Input required value={form.city} onChange={(e) => update('city', e.target.value)} autoComplete="address-level2" />
        </div>
        <div className="space-y-1.5">
          <label className="font-label-md text-charcoal-navy text-xs">State *</label>
          <Input required value={form.state} onChange={(e) => update('state', e.target.value)} autoComplete="address-level1" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-label-md text-charcoal-navy text-xs">Postcode *</label>
          <Input required value={form.postcode} onChange={(e) => update('postcode', e.target.value)} maxLength={6} autoComplete="postal-code" />
        </div>
        <div className="space-y-1.5">
          <label className="font-label-md text-charcoal-navy text-xs">Country</label>
          <Input value={form.country} onChange={(e) => update('country', e.target.value)} autoComplete="country-name" />
        </div>
      </div>
      {showPhone && (
        <div className="space-y-1.5">
          <label className="font-label-md text-charcoal-navy text-xs">Phone</label>
          <Input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 9876543210" autoComplete="tel" />
        </div>
      )}
      {showEmail && (
        <div className="space-y-1.5">
          <label className="font-label-md text-charcoal-navy text-xs">Email</label>
          <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" />
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSaving} className="font-label-md uppercase tracking-widest">
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin text-[16px]" />
              Saving...
            </span>
          ) : 'Save Address'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="border-outline-variant text-on-surface-variant">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddressDisplay({ address, label }: { address: AddressData | null; label: string }) {
  if (!address || !address.address1) {
    return (
      <div className="text-center py-6">
        <MapPin className="text-[32px] text-outline-variant mb-2" />
        <p className="font-body-sm text-on-surface-variant">You have not set up your {label.toLowerCase()} yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 text-on-surface-variant font-body-md">
      <p className="font-semibold text-charcoal-navy">{address.firstName} {address.lastName}</p>
      {address.company && <p className="text-sm">{address.company}</p>}
      <p>{address.address1}</p>
      {address.address2 && <p>{address.address2}</p>}
      <p>{address.city}, {address.state} {address.postcode}</p>
      <p>{address.country}</p>
      {address.phone && <p className="mt-2 text-sm"><span className="font-semibold text-charcoal-navy">Phone:</span> {address.phone}</p>}
      {address.email && <p className="text-sm"><span className="font-semibold text-charcoal-navy">Email:</span> {address.email}</p>}
    </div>
  );
}

export default function AddressesPage() {
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBilling, setEditingBilling] = useState(false);
  const [editingShipping, setEditingShipping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetch('/api/account/addresses')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [isAuthenticated]);

  const handleSave = async (type: 'billing' | 'shipping', addressData: AddressData) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/account/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type]: addressData }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          await fetch('/api/auth/logout', { method: 'POST' });
          useAuthStore.getState().logout();
          window.location.href = '/account/login';
          return;
        }
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save');
      }

      // Refresh data
      const meRes = await fetch('/api/account/addresses');
      const meData = await meRes.json();
      setData(meData);

      setMessage({ type: 'success', text: `${type === 'billing' ? 'Billing' : 'Shipping'} address saved successfully.` });
      if (type === 'billing') setEditingBilling(false);
      if (type === 'shipping') setEditingShipping(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-3xl text-ag-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-headline-md text-[28px] sm:text-[32px] font-medium text-charcoal-navy">Addresses</h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          The following addresses will be used on the checkout page by default.
        </p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg font-body-sm text-center flex items-center justify-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          <span className="material-symbols-outlined text-[16px]">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Billing Address */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-sm text-xl font-semibold text-charcoal-navy">Billing Address</h2>
            {!editingBilling && (
              <button
                onClick={() => setEditingBilling(true)}
                className="text-ag-purple text-sm font-semibold hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          
          {editingBilling ? (
            <AddressForm
              address={data?.billingAddress || EMPTY_ADDRESS}
              onSave={(addr) => handleSave('billing', addr)}
              onCancel={() => setEditingBilling(false)}
              isSaving={isSaving}
              showPhone
              showEmail
            />
          ) : (
            <AddressDisplay address={data?.billingAddress} label="Billing Address" />
          )}
        </div>

        {/* Shipping Address */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-sm text-xl font-semibold text-charcoal-navy">Shipping Address</h2>
            {!editingShipping && (
              <button
                onClick={() => setEditingShipping(true)}
                className="text-ag-purple text-sm font-semibold hover:underline"
              >
                Edit
              </button>
            )}
          </div>
          
          {editingShipping ? (
            <AddressForm
              address={data?.shippingAddress || EMPTY_ADDRESS}
              onSave={(addr) => handleSave('shipping', addr)}
              onCancel={() => setEditingShipping(false)}
              isSaving={isSaving}
            />
          ) : (
            <AddressDisplay address={data?.shippingAddress} label="Shipping Address" />
          )}
        </div>
      </div>
    </div>
  );
}
