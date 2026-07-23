import { WooCommerceReview } from "@/types/woocommerce";
import { absoluteUrl } from "@/lib/seo/site";

// This app's own /api/products/reviews route, not a separate backend — there is no
// external review service. The previous `NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'`
// fallback was always taken (that env var was never actually set anywhere), so in
// production this silently tried to reach localhost:3000 from wherever the request ran:
// from the server for getProductReviews() (product/[slug]/page.tsx calls it in a Server
// Component), and from each visitor's own machine for createProductReview() (called
// client-side) — both fail every time, which is why reviews never loaded and submissions
// never went through. absoluteUrl() resolves to the real site origin in both contexts.
const API_URL = absoluteUrl('/api/products');

/**
 * Fetch reviews for a specific product
 */
export async function getProductReviews(productId: number): Promise<WooCommerceReview[]> {
  try {
    const res = await fetch(`${API_URL}/reviews?product_id=${productId}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) {
      console.warn(`Failed to fetch reviews for product ${productId}: ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return [];
  }
}

/**
 * Payload to create a new review
 */
export interface ReviewPayload {
  product_id: number;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
}

/**
 * Create a new review
 */
export async function createProductReview(payload: ReviewPayload): Promise<{ success: boolean; data?: WooCommerceReview; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || 'Failed to submit review' };
    }

    return { success: true, data };
  } catch (error) {
    console.error(`Error submitting review for product ${payload.product_id}:`, error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}
