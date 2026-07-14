"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      login(data.user, data.token);
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
            <div className="bg-red-50 text-red-500 p-3 rounded font-body-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="sr-only">First Name</label>
                <Input
                  type="text"
                  required
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="sr-only">Last Name</label>
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
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

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-label-md uppercase tracking-widest"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
