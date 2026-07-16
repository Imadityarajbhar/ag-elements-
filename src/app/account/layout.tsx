"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen" />;

  // Don't show sidebar on login/register/forgot-password pages
  if (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/forgot-password')) {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/account', icon: 'dashboard' },
    { name: 'Order History', href: '/account/orders', icon: 'receipt_long' },
    { name: 'Addresses', href: '/account/addresses', icon: 'location_on' },
    { name: 'Profile', href: '/account/profile', icon: 'person' },
    { name: 'Wishlist', href: '/wishlist', icon: 'favorite' },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/account/login');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop py-8 md:py-16 min-h-[70vh]">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-surface-lavender p-6 rounded-2xl">
            <div className="mb-6">
              <h2 className="font-headline-sm text-xl font-semibold text-charcoal-navy">
                Hello, {user?.firstName}
              </h2>
            </div>
            
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg font-label-md tracking-wider transition-colors",
                      isActive 
                        ? "bg-ag-purple text-pearl-white" 
                        : "text-on-surface-variant hover:bg-surface-container hover:text-charcoal-navy"
                    )}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-label-md tracking-wider text-red-500 hover:bg-red-50 transition-colors mt-4 text-left w-full"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>
        
      </div>
    </div>
  );
}
