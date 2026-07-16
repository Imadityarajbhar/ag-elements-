"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-lavender">
      <div className="max-w-md w-full space-y-8 bg-pearl-white p-8 rounded-2xl shadow-[0px_4px_20px_rgba(35,33,58,0.05)]">
        {submitted ? (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 text-[32px]">mark_email_read</span>
            </div>
            <div>
              <h2 className="font-headline-md text-2xl font-medium text-charcoal-navy">
                Check your email
              </h2>
              <p className="mt-3 font-body-sm text-on-surface-variant">
                If an account exists with <span className="font-semibold text-charcoal-navy">{email}</span>, you will receive a password reset link shortly.
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/account/login" className="block">
                <Button variant="outline" className="w-full border-ag-purple text-ag-purple font-label-md uppercase tracking-widest h-12">
                  Back to Sign In
                </Button>
              </Link>
              <button
                onClick={() => { setSubmitted(false); setEmail(''); }}
                className="text-sm text-on-surface-variant hover:text-ag-purple transition-colors"
              >
                Try a different email
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h2 className="mt-6 text-center font-headline-md text-3xl font-medium text-charcoal-navy">
                Forgot your password?
              </h2>
              <p className="mt-2 text-center font-body-sm text-on-surface-variant">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg font-body-sm text-center flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="forgot-email" className="font-label-md text-charcoal-navy">Email Address</label>
                <Input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  autoComplete="email"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-label-md uppercase tracking-widest h-12"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </Button>
              </div>

              <div className="text-center">
                <Link href="/account/login" className="text-sm font-medium text-ag-purple hover:text-ag-purple/80">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
