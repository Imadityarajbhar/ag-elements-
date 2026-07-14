import { NextResponse } from 'next/server';
import { WooCommerceCoupon } from '@/types/coupon';

const WC_URL = process.env.NEXT_PUBLIC_WC_STORE_URL || '';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || '';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    if (!WC_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      // Mock mode for local dev if credentials aren't fully configured
      console.warn("WooCommerce credentials not found, falling back to mock coupons.");
      return handleMockCoupons(code);
    }

    const authHeader = `Basic ${Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64')}`;
    
    // Fetch coupon from WooCommerce
    const response = await fetch(`${WC_URL}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      // Cache settings could go here, but cart contents change, so we usually just want to know if it's valid right now
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API Error: ${response.statusText}`);
    }

    const coupons: WooCommerceCoupon[] = await response.json();

    if (coupons.length === 0) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    // We take the first matched coupon
    return NextResponse.json(coupons[0]);

  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
  }
}

// Fallback logic for when WC isn't fully configured
function handleMockCoupons(code: string) {
  const upperCode = code.toUpperCase();
  
  if (upperCode === 'WELCOME10') {
    return NextResponse.json({
      id: 1,
      code: 'WELCOME10',
      amount: '10',
      discount_type: 'percent',
      description: '10% off for new customers',
      date_expires: null,
      usage_count: 0,
      individual_use: false,
      product_ids: [],
      excluded_product_ids: [],
      usage_limit: null,
      usage_limit_per_user: null,
      limit_usage_to_x_items: null,
      free_shipping: false,
      product_categories: [],
      excluded_product_categories: [],
      exclude_sale_items: false,
      minimum_amount: '0',
      maximum_amount: '0',
      email_restrictions: []
    } as WooCommerceCoupon);
  }

  if (upperCode === 'FREESHIP') {
    return NextResponse.json({
      id: 2,
      code: 'FREESHIP',
      amount: '0',
      discount_type: 'fixed_cart',
      description: 'Free shipping on all orders',
      date_expires: null,
      usage_count: 0,
      individual_use: false,
      product_ids: [],
      excluded_product_ids: [],
      usage_limit: null,
      usage_limit_per_user: null,
      limit_usage_to_x_items: null,
      free_shipping: true,
      product_categories: [],
      excluded_product_categories: [],
      exclude_sale_items: false,
      minimum_amount: '0',
      maximum_amount: '0',
      email_restrictions: []
    } as WooCommerceCoupon);
  }
  
  if (upperCode === 'SAVE500') {
    return NextResponse.json({
      id: 3,
      code: 'SAVE500',
      amount: '500',
      discount_type: 'fixed_cart',
      description: '₹500 off on orders above ₹5000',
      date_expires: null,
      usage_count: 0,
      individual_use: false,
      product_ids: [],
      excluded_product_ids: [],
      usage_limit: null,
      usage_limit_per_user: null,
      limit_usage_to_x_items: null,
      free_shipping: false,
      product_categories: [],
      excluded_product_categories: [],
      exclude_sale_items: false,
      minimum_amount: '5000',
      maximum_amount: '0',
      email_restrictions: []
    } as WooCommerceCoupon);
  }

  return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
}
