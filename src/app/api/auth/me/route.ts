import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock successful fetch of user data + orders + addresses
    return NextResponse.json({
      user: {
        id: 'mock-user-demo',
        email: 'user@example.com',
        firstName: 'Guest',
        lastName: 'User',
      },
      orders: [
        {
          id: 'ORD-10023',
          date: '2023-11-20T10:00:00Z',
          status: 'completed',
          total: 4500,
          itemCount: 2,
        },
        {
          id: 'ORD-10024',
          date: '2023-12-05T14:30:00Z',
          status: 'processing',
          total: 1250,
          itemCount: 1,
        }
      ],
      billingAddress: {
        firstName: 'Guest',
        lastName: 'User',
        address1: '123 Silver Street',
        city: 'Mumbai',
        state: 'MH',
        postcode: '400001',
        country: 'IN',
        phone: '9876543210'
      },
      shippingAddress: {
        firstName: 'Guest',
        lastName: 'User',
        address1: '123 Silver Street',
        city: 'Mumbai',
        state: 'MH',
        postcode: '400001',
        country: 'IN'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
