import { NextResponse } from 'next/server';
import { storeApiRequest, persistCartSession } from '@/services/woocommerce/storeApiClient';

// Update Shipping Address
export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const response = await storeApiRequest('/cart/update-customer', 'POST', {
      shipping_address: address,
      billing_address: address, // Usually keep them in sync for estimation
    });
    await persistCartSession(response);

    if (!response.ok) {
      return NextResponse.json(response.data, { status: response.status });
    }

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

// Select Shipping Rate
export async function PUT(request: Request) {
  try {
    const { packageId, rateId } = await request.json();
    if (packageId === undefined || !rateId) {
      return NextResponse.json({ error: 'Package ID and Rate ID required' }, { status: 400 });
    }

    const response = await storeApiRequest('/cart/select-shipping-rate', 'POST', {
      package_id: packageId,
      rate_id: rateId
    });
    await persistCartSession(response);

    if (!response.ok) {
      return NextResponse.json(response.data, { status: response.status });
    }

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to select shipping rate' }, { status: 500 });
  }
}
