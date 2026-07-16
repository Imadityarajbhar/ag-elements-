import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { wcClient } from '@/services/woocommerce/client';
import { getWpUserIdFromToken, mapWooCommerceAddress } from '@/lib/auth-helpers';

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
    const customer = await wcClient.fetch(`/customers/${userId}`) as any;

    return NextResponse.json({
      billingAddress: mapWooCommerceAddress(customer.billing),
      shippingAddress: mapWooCommerceAddress(customer.shipping),
    });
  } catch (error: any) {
    if (error.message === 'Session expired') {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('ag_auth_token');
      return response;
    }
    console.error('Addresses GET error:', error);
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

    if (body.billing) {
      updatePayload.billing = {
        first_name: body.billing.firstName ?? '',
        last_name: body.billing.lastName ?? '',
        company: body.billing.company ?? '',
        address_1: body.billing.address1 ?? '',
        address_2: body.billing.address2 ?? '',
        city: body.billing.city ?? '',
        state: body.billing.state ?? '',
        postcode: body.billing.postcode ?? '',
        country: body.billing.country ?? '',
        email: body.billing.email ?? '',
        phone: body.billing.phone ?? '',
      };
    }

    if (body.shipping) {
      updatePayload.shipping = {
        first_name: body.shipping.firstName ?? '',
        last_name: body.shipping.lastName ?? '',
        company: body.shipping.company ?? '',
        address_1: body.shipping.address1 ?? '',
        address_2: body.shipping.address2 ?? '',
        city: body.shipping.city ?? '',
        state: body.shipping.state ?? '',
        postcode: body.shipping.postcode ?? '',
        country: body.shipping.country ?? '',
      };
    }

    const customer = await wcClient.fetch(`/customers/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    }) as any;

    return NextResponse.json({
      billingAddress: mapWooCommerceAddress(customer.billing),
      shippingAddress: mapWooCommerceAddress(customer.shipping),
    });
  } catch (error: any) {
    if (error.message === 'Session expired') {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('ag_auth_token');
      return response;
    }
    console.error('Addresses PUT error:', error);
    return NextResponse.json({ error: 'Failed to update addresses' }, { status: 500 });
  }
}
