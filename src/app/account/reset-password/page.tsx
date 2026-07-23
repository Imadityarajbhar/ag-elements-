"use client";
import { CheckCircle2, AlertCircle, Loader2, XCircle } from 'lucide-react';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type VerifyState = 'checking' | 'valid' | 'invalid';

// useSearchParams() requires a Suspense boundary during static generation.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center bg-surface-lavender" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const login = searchParams.get('login') || '';
  const key = searchParams.get('key') || '';

  const [verifyState, setVerifyState] = useState<VerifyState>('checking');
  const [verifyError, setVerifyError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!login || !key) {
      setVerifyState('invalid');
      setVerifyError('This password reset link is missing required information.');
      return;
    }

    fetch(`/api/auth/reset-password?login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.valid) {
          setVerifyState('valid');
        } else {
          setVerifyState('invalid');
          setVerifyError(data.error || 'This reset link is invalid or has expired.');
        }
      })
      .catch(() => {
        setVerifyState('invalid');
        setVerifyError('Unable to verify this reset link right now. Please try again.');
      });
  }, [login, key]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, key, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setSuccess(true);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-lavender">
      <div className="max-w-md w-full space-y-8 bg-pearl-white p-8 rounded-2xl shadow-[0px_4px_20px_rgba(35,33,58,0.05)]">
        {verifyState === 'checking' && (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="animate-spin text-ag-purple text-[32px] mx-auto" />
            <p className="font-body-sm text-on-surface-variant">Verifying your reset link…</p>
          </div>
        )}

        {verifyState === 'invalid' && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="text-red-500 text-[32px]" />
            </div>
            <div>
              <h2 className="font-headline-md text-2xl font-medium text-charcoal-navy">Link expired or invalid</h2>
              <p className="mt-3 font-body-sm text-on-surface-variant">{verifyError}</p>
            </div>
            <Link href="/account/forgot-password" className="block">
              <Button className="w-full font-label-md uppercase tracking-widest h-12">Request a new link</Button>
            </Link>
          </div>
        )}

        {verifyState === 'valid' && !success && (
          <>
            <div>
              <h2 className="mt-6 text-center font-headline-md text-3xl font-medium text-charcoal-navy">
                Set a new password
              </h2>
              <p className="mt-2 text-center font-body-sm text-on-surface-variant">
                Choose a new password for your AG Elements account.
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {submitError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg font-body-sm text-center flex items-center justify-center gap-2">
                  <AlertCircle className="text-[16px]" />
                  {submitError}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="new-password" className="font-label-md text-charcoal-navy">New Password</label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="font-label-md text-charcoal-navy">Confirm Password</label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full font-label-md uppercase tracking-widest h-12">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin text-[18px]" />
                    Updating...
                  </span>
                ) : 'Reset Password'}
              </Button>
            </form>
          </>
        )}

        {success && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-green-600 text-[32px]" />
            </div>
            <div>
              <h2 className="font-headline-md text-2xl font-medium text-charcoal-navy">Password updated</h2>
              <p className="mt-3 font-body-sm text-on-surface-variant">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
            </div>
            <Button onClick={() => router.push('/account/login')} className="w-full font-label-md uppercase tracking-widest h-12">
              Continue to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
