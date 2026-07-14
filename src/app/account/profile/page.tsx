"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    // Mock save to backend
    setTimeout(() => {
      updateUser({ firstName, lastName, email });
      setIsSaving(false);
      setMessage('Profile updated successfully.');
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-headline-md text-[32px] font-medium text-charcoal-navy">Account Details</h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          Update your personal information and password here.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 shadow-sm">
        {message && (
          <div className="mb-6 bg-green-50 text-green-700 p-3 rounded font-body-sm text-center">
            {message}
          </div>
        )}
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label-md text-charcoal-navy">First Name *</label>
              <Input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-charcoal-navy">Last Name</label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="font-label-md text-charcoal-navy">Email Address *</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="pt-6 border-t border-outline-variant/30 mt-8">
            <h3 className="font-headline-sm text-xl font-semibold text-charcoal-navy mb-4">Password Change</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-label-md text-charcoal-navy">Current Password (leave blank to leave unchanged)</label>
                <Input type="password" placeholder="Current password" />
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-charcoal-navy">New Password</label>
                <Input type="password" placeholder="New password" />
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-charcoal-navy">Confirm New Password</label>
                <Input type="password" placeholder="Confirm new password" />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto font-label-md uppercase tracking-widest px-8"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
