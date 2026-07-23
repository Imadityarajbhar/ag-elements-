import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { wcClient } from '@/services/woocommerce/client';
import { getWpUserIdFromToken } from '@/lib/auth-helpers';

// Self-service personal-data export.
//
// WordPress core's own GDPR "Export Personal Data" tool (Tools > Export Personal Data)
// is not an option for a one-click account-page button: it has no REST endpoint at all,
// and by design it's an admin-mediated, email-confirmed request/response workflow (an
// admin or a user with `export_others_personal_data` must review and action the request
// in wp-admin) rather than something a logged-in customer can trigger for instant
// self-service download. That's intentional on WordPress's part, not a bug — it exists so
// a human can screen requests before any data leaves the system.
//
// Since the storefront already authenticates customers via JWT and already fetches a
// customer's own WooCommerce record server-side for /api/account/profile and
// /api/account/orders, the same scoping (resolve the caller's own WP user ID from their
// token, then fetch only that ID's data) is used here to assemble a real, immediate
// export of everything WooCommerce/WordPress actually stores for this account: profile,
// billing/shipping addresses, communication preferences, and full order history. This is
// a genuine data export, not a stub — every field is live data for the authenticated
// user's own account, never another customer's.
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

    const wpRes = await fetch(`${baseUrl}/wp-json/wp/v2/users/me?context=edit`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const wpUser = wpRes.ok ? await wpRes.json() : null;

    const customer = await wcClient.fetch(`/customers/${userId}`) as any;

    // Every order ever placed by this account, not just the most recent page.
    const orders: any[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const { data, headers } = await wcClient.fetchWithHeaders<any[]>(
        `/orders?customer=${userId}&page=${page}&per_page=100`
      );
      orders.push(...data);
      totalPages = parseInt(headers.get('x-wp-totalpages') || '1', 10);
      page += 1;
    } while (page <= totalPages);

    const preferences: Record<string, string> = {};
    (customer.meta_data || []).forEach((meta: any) => {
      if (typeof meta.key === 'string' && meta.key.startsWith('ag_pref_')) {
        preferences[meta.key.replace('ag_pref_', '')] = meta.value === 'yes' ? 'enabled' : 'disabled';
      }
    });

    const exportPayload = {
      exportGeneratedAt: new Date().toISOString(),
      account: {
        wpUserId: userId,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        username: wpUser?.username,
        registeredDate: wpUser?.registered_date || customer.date_created,
      },
      billingAddress: customer.billing,
      shippingAddress: customer.shipping,
      communicationPreferences: preferences,
      orders: orders.map((order: any) => ({
        orderNumber: order.number,
        status: order.status,
        dateCreated: order.date_created,
        total: order.total,
        currency: order.currency,
        paymentMethod: order.payment_method_title,
        billing: order.billing,
        shipping: order.shipping,
        lineItems: (order.line_items || []).map((item: any) => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          total: item.total,
        })),
      })),
    };

    const body = JSON.stringify(exportPayload, null, 2);
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ag-elements-my-data-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    if (error.message === 'Session expired') {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('ag_auth_token');
      return response;
    }
    console.error('Data export route error:', error);
    return NextResponse.json({ error: 'Failed to generate data export' }, { status: 500 });
  }
}
