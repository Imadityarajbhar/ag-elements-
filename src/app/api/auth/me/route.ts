import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { wcClient } from '@/services/woocommerce/client';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ag_auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_WC_API_URL || '';
    
    // 1. Get WP User ID from token
    const wpRes = await fetch(`${baseUrl}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!wpRes.ok) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const wpUser = await wpRes.json();
    const userId = wpUser.id;

    // 2. Fetch Customer from WooCommerce
    const customer = await wcClient.fetch(`/customers/${userId}`);

    // 3. Fetch Orders from WooCommerce
    const orders = await wcClient.fetch(`/orders?customer=${userId}`);

    return NextResponse.json({
      user: {
        id: customer.id.toString(),
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
      },
      orders: orders.map((o: any) => ({
        id: o.number,
        date: o.date_created,
        status: o.status,
        total: parseFloat(o.total),
        itemCount: o.line_items.reduce((acc: number, item: any) => acc + item.quantity, 0),
      })),
      billingAddress: customer.billing,
      shippingAddress: customer.shipping,
    });
  } catch (error: any) {
    console.error('Me route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
