"use client";
import { AlertCircle, Loader2 } from 'lucide-react';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { wishlistService } from '@/services/wishlist/WishlistService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-400' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-400' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-400' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-green-400' };
  return { score, label: 'Very Strong', color: 'bg-green-600' };
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 201) {
        throw new Error(data.error || 'Failed to register');
      }

      if (data.user) {
        login(data.user);
        
        // Merge guest wishlist
        await wishlistService.mergeGuestWishlist();
      }
      
      const redirectUrl = searchParams.get('redirect') || '/account';
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-lavender">
      <div className="max-w-md w-full space-y-8 bg-pearl-white p-8 rounded-2xl shadow-[0px_4px_20px_rgba(35,33,58,0.05)]">
        <div>
          <h2 className="mt-6 text-center font-headline-md text-3xl font-medium text-charcoal-navy">
            Create an account
          </h2>
          <p className="mt-2 text-center font-body-sm text-on-surface-variant">
            Or{' '}
            <Link href="/account/login" className="font-medium text-ag-purple hover:text-ag-purple/80">
              sign in to existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg font-body-sm text-center flex items-center justify-center gap-2">
              <AlertCircle className="text-[16px]" />
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label htmlFor="reg-first-name" className="font-label-md text-charcoal-navy">First Name *</label>
                <Input
                  id="reg-first-name"
                  type="text"
                  required
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full"
                  autoComplete="given-name"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label htmlFor="reg-last-name" className="font-label-md text-charcoal-navy">Last Name</label>
                <Input
                  id="reg-last-name"
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full"
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-email" className="font-label-md text-charcoal-navy">Email Address *</label>
              <Input
                id="reg-email"
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-phone" className="font-label-md text-charcoal-navy">Phone Number</label>
              <Input
                id="reg-phone"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-password" className="font-label-md text-charcoal-navy">Password *</label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-12"
                  autoComplete="new-password"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-charcoal-navy transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength.score ? strength.color : 'bg-outline-variant/30'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[12px] text-on-surface-variant">{strength.label}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-confirm-password" className="font-label-md text-charcoal-navy">Confirm Password *</label>
              <Input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
                autoComplete="new-password"
                minLength={8}
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-red-500 text-[12px]">Passwords do not match.</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-label-md uppercase tracking-widest h-12"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin text-[18px]" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center bg-surface-lavender">
        <Loader2 className="animate-spin text-3xl text-ag-purple" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
