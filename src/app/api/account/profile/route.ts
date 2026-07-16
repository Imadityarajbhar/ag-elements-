import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { wcClient } from '@/services/woocommerce/client';
import { getWpUserIdFromToken, mapWooCommerceCustomer } from '@/lib/auth-helpers';

export async function GET() {
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

    let customer;
    try {
      customer = await wcClient.fetch(`/customers/${userId}`) as any;
    } catch (err: any) {
      console.warn(`WooCommerce customer record missing for WP user ${userId}. Falling back to WP data.`);
      const wpRes = await fetch(`${baseUrl}/wp-json/wp/v2/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const wpUser = await wpRes.json();
      
      customer = {
        id: wpUser.id,
        email: wpUser.email || '',
        first_name: wpUser.first_name || wpUser.name || '',
        last_name: wpUser.last_name || '',
        billing: {},
        shipping: {}
      };
    }

    return NextResponse.json({
      user: mapWooCommerceCustomer(customer)
    });
  } catch (error: any) {
    if (error.message === 'Session expired') {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('ag_auth_token');
      return response;
    }
    console.error('Profile route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
    const body = await request.json();

    const updatePayload: Record<string, any> = {};

    if (body.firstName !== undefined) updatePayload.first_name = body.firstName;
    if (body.lastName !== undefined) updatePayload.last_name = body.lastName;
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.password) updatePayload.password = body.password;
    if (body.phone !== undefined) {
      updatePayload.billing = { phone: body.phone };
    }

    const customer = await wcClient.fetch(`/customers/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    }) as any;

    return NextResponse.json({
      user: mapWooCommerceCustomer(customer)
    });
  } catch (error: any) {
    if (error.message === 'Session expired') {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('ag_auth_token');
      return response;
    }
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
