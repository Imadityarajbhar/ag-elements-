import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Please enter your email address.' }, { status: 400 });
    }

    const wpUrl = process.env.NEXT_PUBLIC_WP_URL || process.env.NEXT_PUBLIC_WC_API_URL || '';
    // Strip /wp-json/wc/v3 if present to get base WP URL
    const baseWpUrl = wpUrl.replace(/\/wp-json\/wc\/v3\/?$/, '');

    // Use WordPress REST API to trigger password reset
    // WordPress doesn't have a native REST endpoint for password reset,
    // so we call the wp-login.php action directly
    const formData = new URLSearchParams();
    formData.append('user_login', email);
    formData.append('redirect_to', '');
    formData.append('wp-submit', 'Get New Password');

    const res = await fetch(`${baseWpUrl}/wp-login.php?action=lostpassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      redirect: 'manual', // Don't follow redirects
    });

    // WordPress returns a 302 redirect on success or failure
    // We always return success to prevent email enumeration attacks
    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link shortly.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link shortly.',
    });
  }
}
