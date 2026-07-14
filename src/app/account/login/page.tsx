"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      router.push('/account');
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
            <div className="bg-red-50 text-red-500 p-3 rounded font-body-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="sr-only">Email address</label>
              <Input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="sr-only">Password</label>
              <Input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
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
              <a href="#" className="font-medium text-ag-purple hover:text-ag-purple/80">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-label-md uppercase tracking-widest"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
