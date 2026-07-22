import { NextResponse } from 'next/server';
import { wcClient } from '@/services/woocommerce/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  if (!productId) {
    return NextResponse.json({ message: 'product_id is required' }, { status: 400 });
  }

  try {
    const reviews = await wcClient.fetch(`/products/reviews?product=${productId}&status=approved`);
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const data = await wcClient.fetch('/products/reviews', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: error.message || 'Failed to submit review' }, { status: 500 });
  }
}
