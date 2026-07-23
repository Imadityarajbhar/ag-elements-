import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('ag_auth_token')?.value;
  const { pathname, search } = request.nextUrl;

  // Paths that require authentication
  const isProtectedPath = pathname.startsWith('/account') || pathname.startsWith('/wishlist');
  
  // Paths that should not be accessed if already authenticated
  const isAuthPath =
    pathname.startsWith('/account/login') ||
    pathname.startsWith('/account/register') ||
    pathname.startsWith('/account/forgot-password') ||
    // Whoever needs this page is, by definition, signed out (they forgot their
    // password) — without this it falls through to isProtectedPath below and an
    // unauthenticated visitor gets redirected straight to /account/login, which
    // silently breaks the reset-password link before the page ever renders.
    pathname.startsWith('/account/reset-password');

  if (isProtectedPath) {
    if (isAuthPath) {
      if (token) {
        return NextResponse.redirect(new URL('/account', request.url));
      }
      return NextResponse.next();
    }

    if (!token) {
      const loginUrl = new URL('/account/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Auth] Middleware intercepted protected path ${pathname} and validated cookie presence.`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/wishlist'],
};
