"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, logout, setLoading } = useAuthStore();

  useEffect(() => {
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
  }, [login, logout, setLoading]);

  return <>{children}</>;
}
