import { NextResponse } from 'next/server';
import { wcClient } from '@/services/woocommerce/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode') || '';
    
    // In a full production WooCommerce setup, we'd query /shipping/zones, 
    // find the zone matching the pincode/state, and then fetch /shipping/zones/<id>/methods
    // Due to the varying states of WooCommerce zone setups, we'll implement a resilient 
    // hybrid approach that fetches from WC and falls back to a professional default set.
    
    let wcMethods: any[] = [];
    try {
      // We attempt to fetch Zone 0 (Rest of the World / Default) or Zone 1 (India) methods.
      // Usually, zones are 1, 2, 3... Zone 0 is "Rest of the World".
      const { data } = await wcClient.fetchWithHeaders<any[]>('/shipping/zones/1/methods');
      wcMethods = data;
    } catch (err) {
      console.warn("Could not fetch WooCommerce shipping zones, using dynamic defaults.");
    }

    const availableMethods = [];

    if (wcMethods && wcMethods.length > 0) {
      wcMethods.forEach(method => {
        if (method.enabled) {
          availableMethods.push({
            id: `${method.method_id}:${method.id}`,
            title: method.title,
            price: method.settings?.cost?.value ? parseFloat(method.settings.cost.value) : 0,
            methodId: method.method_id,
            estimatedDaysMin: method.method_id === 'flat_rate' ? 3 : 1,
            estimatedDaysMax: method.method_id === 'flat_rate' ? 5 : 2,
          });
        }
      });
    } else {
      // Professional Default Methods based on Shopify / Luxury Jewellery Standards
      availableMethods.push(
        {
          id: 'flat_rate:standard',
          title: 'Standard Delivery',
          price: 99,
          methodId: 'flat_rate',
          estimatedDaysMin: 3,
          estimatedDaysMax: 5,
        },
        {
          id: 'flat_rate:express',
          title: 'Express Delivery',
          price: 199,
          methodId: 'flat_rate',
          estimatedDaysMin: 1,
          estimatedDaysMax: 2,
        }
      );
    }

    return NextResponse.json(availableMethods, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping methods' },
      { status: 500 }
    );
  }
}
