"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, logout } = useAuthStore();

  useEffect(() => {
    // Check if we are still authenticated on mount
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        if (data.user) {
          login(data.user);
        }
      })
      .catch(() => {
        // If unauthorized, silently logout to clear state
        logout();
      });
  }, [login, logout]);

  return <>{children}</>;
}
