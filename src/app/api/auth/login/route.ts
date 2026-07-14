import { NextResponse } from 'next/server';

// Mock authentication logic since WooCommerce default REST doesn't support JWT generation natively
// In a real production headless app, this would hit /wp-json/jwt-auth/v1/token
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Mock successful authentication
    if (password === 'password123') { // Simple mock condition
      return NextResponse.json({
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'mock-user-123',
          email,
          firstName: 'Guest',
          lastName: 'User',
        }
      });
    }

    // Default mock success (accept any for demo purposes, you can restrict this later)
    return NextResponse.json({
      token: 'mock-jwt-token-demo',
      user: {
        id: 'mock-user-demo',
        email,
        firstName: email.split('@')[0],
        lastName: '',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
