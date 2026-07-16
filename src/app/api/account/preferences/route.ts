import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { wcClient } from '@/services/woocommerce/client';
import { getWpUserIdFromToken } from '@/lib/auth-helpers';

// Helper to extract preferences from meta_data
function extractPreferences(metaData: any[] = []) {
  const prefs = {
    newsletter: false,
    orderUpdates: true,
    offers: false,
    backInStock: true,
    priceDrop: false,
    whatsapp: false,
  };

  metaData.forEach(meta => {
    if (meta.key === 'ag_pref_newsletter') prefs.newsletter = meta.value === 'yes';
    if (meta.key === 'ag_pref_orderUpdates') prefs.orderUpdates = meta.value === 'yes';
    if (meta.key === 'ag_pref_offers') prefs.offers = meta.value === 'yes';
    if (meta.key === 'ag_pref_backInStock') prefs.backInStock = meta.value === 'yes';
    if (meta.key === 'ag_pref_priceDrop') prefs.priceDrop = meta.value === 'yes';
    if (meta.key === 'ag_pref_whatsapp') prefs.whatsapp = meta.value === 'yes';
  });

  return prefs;
}

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
    const preferences = extractPreferences(customer.meta_data);

    return NextResponse.json({ preferences });
  } catch (error: any) {
    if (error.message === 'Session expired') {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('ag_auth_token');
      return response;
    }
    console.error('Preferences GET error:', error);
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
    
    // Map boolean preferences to 'yes'/'no' for WooCommerce meta_data
    const metaDataUpdates = Object.keys(body).map(key => ({
      key: `ag_pref_${key}`,
      value: body[key] ? 'yes' : 'no'
    }));

    const updatePayload = {
      meta_data: metaDataUpdates
    };

    const customer = await wcClient.fetch(`/customers/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    }) as any;

    return NextResponse.json({
      preferences: extractPreferences(customer.meta_data)
    });
  } catch (error: any) {
    if (error.message === 'Session expired') {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('ag_auth_token');
      return response;
    }
    console.error('Preferences PUT error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
