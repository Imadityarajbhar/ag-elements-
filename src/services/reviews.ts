import { WooCommerceReview } from "@/types/woocommerce";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Fetch reviews for a specific product
 */
export async function getProductReviews(productId: number): Promise<WooCommerceReview[]> {
  try {
    const res = await fetch(`${API_URL}/products/reviews?product_id=${productId}`, {
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
    const res = await fetch(`${API_URL}/products/reviews`, {
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
