import { NextResponse } from 'next/server';

// Completes the password-reset flow entirely on the Next.js side.
//
// WordPress core validates a reset key/login pair and sets the new password inside
// wp-login.php's own request handler (`check_password_reset_key()` + `reset_password()`
// in wp-includes/user.php) — neither WP core's REST API nor the JWT-auth plugin already
// used for login (`/wp-json/jwt-auth/v1/token`) exposes that as a REST route. Making this
// endpoint exist requires a small addition on the WordPress side (see
// PASSWORD_RESET_SETUP.md at the project root for the exact mu-plugin code); this route
// just forwards to it once it's deployed.
const WP_RESET_ENDPOINT = `${(process.env.NEXT_PUBLIC_WP_URL || '').replace(/\/$/, '')}/wp-json/ag/v1/reset-password`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const login = searchParams.get('login');
    const key = searchParams.get('key');

    if (!login || !key) {
      return NextResponse.json({ valid: false, error: 'Missing reset link parameters.' }, { status: 400 });
    }

    const res = await fetch(`${WP_RESET_ENDPOINT}/verify?login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}`, {
      cache: 'no-store',
    });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ valid: false, error: data.message || 'This reset link is invalid or has expired.' }, { status: res.status });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Reset-password verify error:', error);
    return NextResponse.json({ valid: false, error: 'Unable to verify this reset link right now.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { login, key, password } = await request.json();

    if (!login || !key || !password) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const res = await fetch(WP_RESET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, key, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'This reset link is invalid or has expired.' }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset-password error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
