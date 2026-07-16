import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { wcClient } from '@/services/woocommerce/client';
import { getWpUserIdFromToken } from '@/lib/auth-helpers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ag_auth_token')?.value;

    if (!token) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.cookies.delete('ag_auth_token');
      return response;
    }

    const baseUrl = (process.env.NEXT_PUBLIC_WP_URL || '').replace(/\/$/, '');
    const userId = await getWpUserIdFromToken(token, baseUrl);

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '10';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    // Build WooCommerce query string
    const query = new URLSearchParams({
      customer: userId.toString(),
      page,
      per_page: perPage,
    });

    if (status && status !== 'all') {
      query.append('status', status);
    }
    if (search) {
      query.append('search', search);
    }

    const ordersRes = await wcClient.fetchWithHeaders(`/orders?${query.toString()}`);
    
    const headers = ordersRes.headers;
    const totalPages = headers.get('x-wp-totalpages') || '1';
    const totalItems = headers.get('x-wp-total') || '0';

    const orders: any = ordersRes.data;

    // If search by product name is requested, WooCommerce REST API "search" parameter only searches billing/shipping info and order ID.
    // Searching by product name in WC requires a custom endpoint or filtering line_items, which isn't natively supported.
    // We pass it directly to WC for now.

    const formattedOrders = Array.isArray(orders) ? orders.map((order: any) => ({
      id: order.id,
      number: order.number,
      status: order.status,
      date: order.date_created,
      total: order.total,
      currency: order.currency,
      itemCount: order.line_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0,
      paymentMethod: order.payment_method_title || '',
      items: order.line_items?.slice(0, 3).map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
      })) || [],
    })) : [];

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page: parseInt(page, 10),
        perPage: parseInt(perPage, 10),
        totalPages: parseInt(totalPages, 10),
        totalItems: parseInt(totalItems, 10),
      }
    });
  } catch (error: any) {
    if (error.message === 'Session expired') {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('ag_auth_token');
      return response;
    }
    console.error('Orders route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
