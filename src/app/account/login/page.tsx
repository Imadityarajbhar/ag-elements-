"use client";
import { AlertCircle, Loader2 } from 'lucide-react';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { wishlistService } from '@/services/wishlist/WishlistService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      login(data.user);
      
      // Merge guest wishlist
      await wishlistService.mergeGuestWishlist();

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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center font-body-sm text-on-surface-variant">
            Or{' '}
            <Link href="/account/register" className="font-medium text-ag-purple hover:text-ag-purple/80">
              create a new account
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
            <div className="space-y-2">
              <label htmlFor="login-email" className="font-label-md text-charcoal-navy">Email Address</label>
              <Input
                id="login-email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="login-password" className="font-label-md text-charcoal-navy">Password</label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-12"
                  autoComplete="current-password"
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
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-ag-purple focus:ring-ag-purple border-outline-variant rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-on-surface-variant">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/account/forgot-password" className="font-medium text-ag-purple hover:text-ag-purple/80">
                Forgot your password?
              </Link>
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
                  Signing in...
                </span>
              ) : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center bg-surface-lavender">
        <Loader2 className="animate-spin text-3xl text-ag-purple" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
