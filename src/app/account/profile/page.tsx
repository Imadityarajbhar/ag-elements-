"use client";
import { Download, History, CreditCard, Trash2 } from 'lucide-react';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  
  // Profile State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  
  // Preferences State
  const [preferences, setPreferences] = useState({
    newsletter: false,
    orderUpdates: true,
    offers: false,
    backInStock: true,
    priceDrop: false,
    whatsapp: false,
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [prefMessage, setPrefMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isExportingData, setIsExportingData] = useState(false);

  const handleDownloadPersonalData = async () => {
    setIsExportingData(true);
    try {
      const res = await fetch('/api/account/data-export');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate data export');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ag-elements-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Your data export has downloaded.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download your data. Please try again.');
    } finally {
      setIsExportingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    fetch('/api/account/preferences')
      .then(res => res.json())
      .then(data => {
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        setProfileMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
        setIsSavingProfile(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setProfileMessage({ type: 'error', text: 'New passwords do not match.' });
        setIsSavingProfile(false);
        return;
      }
    }

    try {
      const payload: Record<string, any> = { firstName, lastName, email, phone };
      if (newPassword) payload.password = newPassword;

      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      if (data.user) updateUser(data.user);
      
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPreferences(true);
    setPrefMessage(null);

    try {
      const res = await fetch('/api/account/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update preferences');

      if (data.preferences) setPreferences(data.preferences);
      setPrefMessage({ type: 'success', text: 'Preferences updated successfully.' });
    } catch (err: any) {
      setPrefMessage({ type: 'error', text: err.message });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="font-headline-md text-[28px] sm:text-[32px] font-medium text-charcoal-navy">Profile & Preferences</h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          Manage your personal information, communication preferences, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Information */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 sm:p-8 shadow-sm">
            <h2 className="font-headline-sm text-xl font-semibold text-charcoal-navy mb-6">Account Details</h2>
            
            {profileMessage && (
              <div className={`mb-6 p-3 rounded-lg font-body-sm text-center flex items-center justify-center gap-2 ${
                profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
                <span className="material-symbols-outlined text-[16px]">{profileMessage.type === 'success' ? 'check_circle' : 'error'}</span>
                {profileMessage.text}
              </div>
            )}
            
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="profile-first-name" className="font-label-md text-charcoal-navy">First Name *</label>
                  <Input id="profile-first-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="profile-last-name" className="font-label-md text-charcoal-navy">Last Name</label>
                  <Input id="profile-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="profile-email" className="font-label-md text-charcoal-navy">Email Address *</label>
                <Input id="profile-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="space-y-2">
                <label htmlFor="profile-phone" className="font-label-md text-charcoal-navy">Phone Number</label>
                <Input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" autoComplete="tel" />
              </div>

              <div className="pt-6 border-t border-outline-variant/30 mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline-sm text-[18px] font-semibold text-charcoal-navy">Password Change</h3>
                  <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="text-on-surface-variant hover:text-charcoal-navy text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">{showPasswords ? 'visibility_off' : 'visibility'}</span>
                    {showPasswords ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="space-y-4">
                  <Input type={showPasswords ? 'text' : 'password'} placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                  <Input type={showPasswords ? 'text' : 'password'} placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} autoComplete="new-password" />
                  <Input type={showPasswords ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} autoComplete="new-password" />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={isSavingProfile} className="w-full sm:w-auto font-label-md uppercase tracking-widest px-8">
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Communication Preferences */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h2 className="font-headline-sm text-[18px] font-semibold text-charcoal-navy mb-4">Communication</h2>
            
            {prefMessage && (
              <div className={`mb-4 p-2 rounded text-xs text-center flex items-center justify-center gap-1 ${
                prefMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
                {prefMessage.text}
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-4">
              {[
                { key: 'newsletter', label: 'Newsletter', desc: 'Latest collections & exclusive offers.' },
                { key: 'orderUpdates', label: 'Order Updates', desc: 'Shipping and tracking info.' },
                { key: 'offers', label: 'Special Offers', desc: 'Promotions and sales.' },
                { key: 'backInStock', label: 'Back in Stock', desc: 'When your favorites return.' },
                { key: 'priceDrop', label: 'Price Drop', desc: 'Alerts for wishlisted items.' },
                { key: 'whatsapp', label: 'WhatsApp Updates', desc: 'Quick notifications via WhatsApp.' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-start gap-3">
                  <div className="flex h-5 items-center">
                    <input
                      id={`pref-${pref.key}`}
                      type="checkbox"
                      className="h-4 w-4 rounded border-outline-variant text-ag-purple focus:ring-ag-purple"
                      checked={(preferences as any)[pref.key]}
                      onChange={(e) => setPreferences(prev => ({ ...prev, [pref.key]: e.target.checked }))}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor={`pref-${pref.key}`} className="font-label-md text-charcoal-navy text-sm">{pref.label}</label>
                    <p className="text-xs text-on-surface-variant">{pref.desc}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Button type="submit" disabled={isSavingPreferences} variant="outline" className="w-full border-ag-purple text-ag-purple text-xs h-9">
                  {isSavingPreferences ? 'Updating...' : 'Update Preferences'}
                </Button>
              </div>
            </form>
          </div>

          {/* Security & Data */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h2 className="font-headline-sm text-[18px] font-semibold text-charcoal-navy mb-4">Security & Data</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleDownloadPersonalData}
                disabled={isExportingData}
                className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-surface-lavender transition-colors group disabled:opacity-50"
              >
                <Download className="text-outline-variant group-hover:text-ag-purple" />
                <span className="font-label-md text-sm text-charcoal-navy">{isExportingData ? 'Preparing your data…' : 'Download Personal Data'}</span>
              </button>
              <button className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-surface-lavender transition-colors group">
                <History className="text-outline-variant group-hover:text-ag-purple" />
                <span className="font-label-md text-sm text-charcoal-navy">Login History</span>
              </button>
              <button className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-surface-lavender transition-colors group">
                <CreditCard className="text-outline-variant group-hover:text-ag-purple" />
                <span className="font-label-md text-sm text-charcoal-navy">Saved Payment Methods</span>
              </button>
              <button className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-red-50 transition-colors group">
                <Trash2 className="text-red-400 group-hover:text-red-600" />
                <span className="font-label-md text-sm text-red-600">Delete Account</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
