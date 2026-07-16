import { NextResponse } from 'next/server';
import { getProducts, getProductsByCategory, getProductsByIds } from '@/services/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('categorySlug');
  const include = searchParams.get('include');
  const perPage = searchParams.get('per_page');
  
  try {
    let products;
    const options: Record<string, string> = {};
    if (perPage) options.per_page = perPage;

    if (include) {
      const ids = include.split(',').map(Number).filter(id => !isNaN(id));
      products = await getProductsByIds(ids);
    } else if (categorySlug) {
      products = await getProductsByCategory(categorySlug);
    } else {
      products = await getProducts(new URLSearchParams(options).toString());
    }
    
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products from backend' },
      { status: 500 }
    );
  }
}
