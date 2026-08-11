"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children, hasSession }: { children: React.ReactNode; hasSession: boolean }) {
  const { login, logout, setLoading } = useAuthStore();

  useEffect(() => {
    // `ag_auth_token` is httpOnly, so client JS can't inspect it directly.
    // `hasSession` is computed server-side (see layout.tsx, via next/headers
    // cookies()) from that same cookie. Anonymous visitors (no cookie) skip
    // the network round trip entirely instead of firing it on every page
    // load for every visitor.
    if (!hasSession) {
      // The persisted store (localStorage) can still say isAuthenticated
      // from a prior session whose cookie has since expired server-side —
      // clear that stale local state exactly like the failed-fetch path
      // below used to, just without the now-pointless network round trip
      // (there's no server session left to invalidate).
      if (useAuthStore.getState().isAuthenticated) {
        logout();
      } else {
        setLoading(false);
      }
      return;
    }

    // Validate session on mount
    fetch('/api/account/profile')
      .then(res => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        if (data.user) {
          login(data.user);
        } else {
          setLoading(false);
        }
      })
      .catch(async () => {
        // Only clear state if we previously thought we were authenticated
        const wasAuthenticated = useAuthStore.getState().isAuthenticated;
        if (wasAuthenticated) {
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch {
            // Ignore logout errors
          }
          logout();
        } else {
          setLoading(false);
        }
      });
  }, [hasSession, login, logout, setLoading]);

  return <>{children}</>;
}
