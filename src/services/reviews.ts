import { WooCommerceReview } from "@/types/woocommerce";
import { absoluteUrl } from "@/lib/seo/site";
import { wcClient } from "@/services/woocommerce/client";

// createProductReview is called client-side (a visitor submitting a review from the
// browser), so it has to go over HTTP to this app's own /api/products/reviews route —
// the browser can't use wcClient directly (server-only: it holds the WC consumer secret).
// absoluteUrl() resolves that route to the real site origin.
const API_URL = absoluteUrl('/api/products');

/**
 * Fetch reviews for a specific product.
 *
 * Runs server-side only (called from a Server Component), so it talks to wcClient
 * directly instead of round-tripping through this app's own /api/products/reviews
 * route — that route exists for the client-side submission flow below, not for this.
 */
export async function getProductReviews(productId: number): Promise<WooCommerceReview[]> {
  try {
    return await wcClient.fetch<WooCommerceReview[]>(
      `/products/reviews?product=${productId}&status=approved`,
      { next: { revalidate: 60 } }
    );
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
