"use client";
import { Star, BadgeCheck, ThumbsUp, ThumbsDown } from 'lucide-react';

import React, { useState } from 'react';
import { WooCommerceReview } from '@/types/woocommerce';
import { createProductReview } from '@/services/reviews';

interface ProductReviewsProps {
  productId: number;
  initialReviews: WooCommerceReview[];
  averageRating: string;
  ratingCount: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex text-primary">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="text-[18px]" />
      ))}
    </div>
  );
}

export function ProductReviews({ productId, initialReviews, averageRating, ratingCount }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<WooCommerceReview[]>(initialReviews);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({ rating: 5, reviewer: '', reviewer_email: '', review: '' });
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const avg = parseFloat(averageRating || '0').toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    const res = await createProductReview({
      product_id: productId,
      ...formState
    });

    if (res.success && res.data) {
      setSubmitMessage({ type: 'success', text: 'Thank you! Your review has been submitted and is pending approval.' });
      setFormState({ rating: 5, reviewer: '', reviewer_email: '', review: '' });
      // We don't automatically append it to the list unless it's auto-approved, but we could optimistic update if needed.
    } else {
      setSubmitMessage({ type: 'error', text: res.message || 'Something went wrong. Please try again.' });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-12" id="reviews">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between bg-surface-container-low p-6 md:p-8 rounded-xl shadow-[0px_4px_20px_rgba(35,33,58,0.05)]">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center justify-center bg-surface-lavender text-charcoal-navy w-24 h-24 rounded-full shadow-sm">
            <span className="font-headline-lg text-[32px] font-semibold leading-none">{avg}</span>
            <span className="font-label-sm text-[12px] uppercase tracking-widest text-outline">out of 5</span>
          </div>
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <StarRating rating={Math.round(parseFloat(avg))} />
            <span className="font-body-md text-on-surface-variant">Based on {ratingCount} review{ratingCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <a 
          href="#write-review"
          className="w-full md:w-auto bg-primary text-pearl-white px-6 py-3 rounded uppercase font-label-md tracking-widest font-semibold hover:bg-primary/90 transition-colors text-center"
        >
          Write a Review
        </a>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-6">
        {reviews.length === 0 ? (
          <p className="text-on-surface-variant font-body-md text-center py-8">Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-outline-variant/30 pb-6 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-[18px] font-semibold text-charcoal-navy">{review.reviewer}</span>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-ag-purple bg-ag-purple/10 px-2 py-0.5 rounded font-label-sm text-[10px] uppercase tracking-widest font-semibold">
                        <BadgeCheck className="text-[14px]" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-on-surface-variant font-body-sm text-[14px]">
                  {new Date(review.date_created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              
              <div 
                className="font-body-md text-[16px] text-on-surface-variant leading-relaxed prose prose-sm prose-p:my-1" 
                dangerouslySetInnerHTML={{ __html: review.review }} 
              />

              {/* Helpful Votes Placeholder */}
              <div className="flex items-center gap-4 mt-2">
                <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
                  <ThumbsUp className="text-[18px]" />
                  Helpful
                </button>
                <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
                  <ThumbsDown className="text-[18px]" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Write a Review Form */}
      <div id="write-review" className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline-variant/30 mt-8">
        <h3 className="font-headline-md text-[28px] font-medium text-charcoal-navy mb-6">Write a Review</h3>
        
        {submitMessage ? (
          <div className={`p-4 rounded mb-6 ${submitMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {submitMessage.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Rating Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md font-semibold text-charcoal-navy uppercase tracking-widest">Rating *</label>
            <div className="flex text-primary cursor-pointer">
              {Array.from({ length: 5 }).map((_, i) => (
                <span 
                  key={i} 
                  onClick={() => setFormState({ ...formState, rating: i + 1 })}
                  className="material-symbols-outlined text-[28px] hover:scale-110 transition-transform" 
                  style={{ fontVariationSettings: i < formState.rating ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="reviewer" className="font-label-md font-semibold text-charcoal-navy uppercase tracking-widest">Name *</label>
              <input 
                id="reviewer"
                required 
                type="text" 
                className="border border-outline-variant bg-transparent p-3 rounded text-on-surface font-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                value={formState.reviewer}
                onChange={e => setFormState({ ...formState, reviewer: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="reviewer_email" className="font-label-md font-semibold text-charcoal-navy uppercase tracking-widest">Email *</label>
              <input 
                id="reviewer_email"
                required 
                type="email" 
                className="border border-outline-variant bg-transparent p-3 rounded text-on-surface font-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                value={formState.reviewer_email}
                onChange={e => setFormState({ ...formState, reviewer_email: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="review" className="font-label-md font-semibold text-charcoal-navy uppercase tracking-widest">Review *</label>
            <textarea 
              id="review"
              required 
              rows={5}
              className="border border-outline-variant bg-transparent p-3 rounded text-on-surface font-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              value={formState.review}
              onChange={e => setFormState({ ...formState, review: e.target.value })}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-charcoal-navy text-pearl-white px-8 py-4 rounded uppercase font-label-md tracking-widest font-semibold hover:bg-charcoal-navy/90 transition-colors w-full md:w-auto self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
