import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mock successful registration
    return NextResponse.json({
      token: 'mock-jwt-token-new',
      user: {
        id: `mock-user-${Date.now()}`,
        email,
        firstName,
        lastName: lastName || '',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
