import { getProductBySlug, getProducts, getProductsByIds, getRecommendations } from "@/services/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AddToCartButton, ProductGallery } from "@/components/shared/AddToCartButton";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProductCarousel } from "@/components/shop/ProductCarousel";
import { WishlistButton } from "@/components/shared/WishlistButton";
import { getProductReviews } from "@/services/reviews";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { ProductViewTracker } from "@/components/shop/ProductViewTracker";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Suspense } from "react";

export const runtime = 'edge';

const ProductReviews = dynamic(() => import("@/components/shop/ProductReviews").then(m => m.ProductReviews));
const RecentlyViewed = dynamic(() => import("@/components/shop/RecentlyViewed").then(m => m.RecentlyViewed));
const StickyAddToCart = dynamic(() => import("@/components/shared/StickyAddToCart").then(m => m.StickyAddToCart));

import { generateMetadata as getSeoMetadata } from "@/lib/seo/generateMetadata";

interface PDPProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PDPProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return getSeoMetadata({ title: "Product Not Found" });
  
  return getSeoMetadata({
    title: product.name,
    description: product.description || `Buy ${product.name} at AG Elements.`,
    image: product.images[0]?.url,
  });
}

export default async function ProductDetailPage({ params }: PDPProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

async function ReviewsSection({ productId, averageRating, ratingCount }: { productId: number, averageRating: string, ratingCount: number }) {
  const initialReviews = await getProductReviews(productId);
  return (
    <section className="mt-section-v-padding pt-16 border-t border-outline-variant/30">
      <h2 className="font-headline-md text-[32px] font-medium text-center text-charcoal-navy mb-12">Customer Reviews</h2>
      <ProductReviews 
        productId={productId}
        initialReviews={initialReviews}
        averageRating={averageRating}
        ratingCount={ratingCount}
      />
    </section>
  );
}

async function RecommendationsSection({ product }: { product: any }) {
  const relatedPromise = product.relatedIds && product.relatedIds.length > 0
    ? getProductsByIds(product.relatedIds.slice(0, 8))
    : getRecommendations(product, 8, 'material');

  const completePromise = product.crossSellIds && product.crossSellIds.length > 0
    ? getProductsByIds(product.crossSellIds.slice(0, 8))
    : getRecommendations(product, 8, 'category');

  const upsellPromise = product.upsellIds && product.upsellIds.length > 0
    ? getProductsByIds(product.upsellIds.slice(0, 8))
    : getRecommendations(product, 8, 'price');

  const [relatedProducts, completeTheLook, customersAlsoBought] = await Promise.all([relatedPromise, completePromise, upsellPromise]);

  return (
    <div className="flex flex-col gap-8">
      {relatedProducts.length > 0 && <ProductCarousel title="Related Products" products={relatedProducts} />}
      {completeTheLook.length > 0 && <ProductCarousel title="Complete The Look" products={completeTheLook} />}
      {customersAlsoBought.length > 0 && <ProductCarousel title="Customers Also Bought" products={customersAlsoBought} />}
      
      {/* Client-side Recently Viewed */}
      <RecentlyViewed currentProductId={Number(product.id)} />
    </div>
  );
}

  // We ensure there's at least one image
  const mainImage = product.images[0]?.url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDUJcDFZ4gfxtgf5QZ4A3vCMYjs1GNnlSvqwfSOFoUudjcqTEFGwyItsyiomIUMhVYrv8zbpUSghtF9q1KKoc05XwxQFeuo5Sjas05jBNlpzK487FACTxY_qeNUFAxWuMANmTPUhuZSFcUoWkUrCE8DKXvnxlU6TKwOq6yoSV1S_2mqi8HMXJZHR8FFCCoouBwu5a_a9ZmgvYm_LiGhKoM5OZGcuA2XONxOC-52soC1NTKIGl--7f8k3w";
  
  // Use images 1, 2, 3 for thumbnails, fallback to main if less
  const thumbnails = product.images.length > 1 
    ? product.images.slice(0, 3) 
    : [
        { id: '1', url: mainImage, alt: product.name },
        { id: '2', url: mainImage, alt: product.name },
        { id: '3', url: mainImage, alt: product.name },
      ];

  const categoryName = product.categories[0]?.name || "Jewelry";

  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agelements.example.com'}/product/${product.slug}`;

  // JSON-LD Schema (Product + Reviews)
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [mainImage],
    "description": product.shortDescription || product.description?.replace(/<[^>]+>/g, ''),
    "sku": product.sku,
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "INR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stockStatus === 'outofstock' ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
    },
    ...(product.averageRating && product.ratingCount && product.ratingCount > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.averageRating,
        "reviewCount": product.ratingCount
      }
    } : {})
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agelements.example.com'}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryName,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agelements.example.com'}/collections/${categoryName.toLowerCase()}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": productUrl
      }
    ]
  };

  return (
    <main className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductViewTracker product={product} />

      {/* Breadcrumbs */}
      <nav className="font-label-sm text-[12px] font-medium text-on-surface-variant flex items-center gap-2 mb-8 uppercase tracking-widest">
        <Link className="hover:text-primary transition-colors" href="/">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link className="hover:text-primary transition-colors" href={`/collections/${categoryName.toLowerCase()}`}>{categoryName}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-on-surface font-semibold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left: Interactive Gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 relative items-start h-full">
          <Suspense fallback={<div className="h-[600px] w-full bg-surface-container-lowest animate-pulse rounded" />}>
            <ProductGallery product={product} />
          </Suspense>
        </div>

        {/* Right: Product Details */}
        <div className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-[120px] h-fit">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 bg-secondary text-on-secondary-container px-3 py-1 rounded text-[12px] font-label-sm font-semibold w-fit mb-2 uppercase tracking-widest">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              {product.material || "925 Sterling Silver"}
            </div>
            <h1 className="font-headline-lg text-[48px] leading-[56px] font-medium text-charcoal-navy">{product.name}</h1>
            <p className="font-body-lg text-[18px] text-on-surface-variant">Handcrafted Silver Jewelry</p>
          </div>

          {/* Add to Cart & Actions (includes price, variants, buttons) */}
          <div className="flex flex-col gap-4">
            
            {/* Urgency / Scarcity Message */}
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-md border border-red-100">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <span className="font-label-sm font-bold uppercase tracking-widest text-[12px]">High Demand: Only 2 left in stock!</span>
            </div>

            <Suspense fallback={<div className="h-12 bg-surface-container-lowest animate-pulse rounded" />}>
              <AddToCartButton product={product} />
            </Suspense>

            <div className="flex justify-center mt-2">
              <WishlistButton product={product} withText className="hover:scale-100" />
            </div>

            {/* Trust Icons */}
            <TrustBadges />
          </div>

          {/* Accordions */}
          <div className="flex flex-col border-b border-outline-variant/30">
            <Accordion className="w-full">
              {/* 1. Specifications */}
              <AccordionItem value="specifications">
                <AccordionTrigger className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy">Specifications</AccordionTrigger>
                <AccordionContent className="font-body-md text-[16px] text-on-surface-variant leading-relaxed">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-outline uppercase tracking-wider">SKU</span>
                      <span>{product.sku || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-outline uppercase tracking-wider">Material</span>
                      <span>{product.material || '925 Sterling Silver'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-outline uppercase tracking-wider">Finish</span>
                      <span>{product.finish || 'High-polish silver'}</span>
                    </div>
                    {product.stone && (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-outline uppercase tracking-wider">Stone</span>
                        <span>{product.stone}</span>
                      </div>
                    )}
                    {product.purity && (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-outline uppercase tracking-wider">Purity</span>
                        <span>{product.purity}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-outline uppercase tracking-wider">Weight</span>
                        <span>{product.weight}</span>
                      </div>
                    )}
                    {product.dimensions && product.dimensions.length && (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-outline uppercase tracking-wider">Dimensions</span>
                        <span>{product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height}</span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Delivery & Returns */}
              <AccordionItem value="delivery">
                <AccordionTrigger className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy">Delivery & Returns</AccordionTrigger>
                <AccordionContent className="font-body-md text-[16px] text-on-surface-variant leading-relaxed">
                  <div className="flex flex-col gap-4 pt-2">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-ag-purple mt-0.5">inventory_2</span>
                      <div>
                        <span className="block font-semibold text-charcoal-navy">Stock Status</span>
                        <span className="capitalize">{product.stockStatus === 'outofstock' ? 'Out of Stock' : product.stockStatus === 'onbackorder' ? 'On Backorder' : 'In Stock - Ready to Ship'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-ag-purple mt-0.5">local_shipping</span>
                      <div>
                        <span className="block font-semibold text-charcoal-navy">Shipping & Delivery</span>
                        <span>Free expedited shipping across India. Estimated delivery within 3-5 business days.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-ag-purple mt-0.5">sync_alt</span>
                      <div>
                        <span className="block font-semibold text-charcoal-navy">7-Day Returns</span>
                        <span>We accept returns and exchanges within 7 days of delivery, provided the item is unworn and in its original packaging.</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3. Warranty & Certificate */}
              <AccordionItem value="warranty">
                <AccordionTrigger className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy">Warranty & Certificate</AccordionTrigger>
                <AccordionContent className="font-body-md text-[16px] text-on-surface-variant leading-relaxed">
                  <div className="flex flex-col gap-4 pt-2">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-ag-purple mt-0.5">verified</span>
                      <div>
                        <span className="block font-semibold text-charcoal-navy">Authenticity Certificate</span>
                        <span>Every AG Elements piece comes with a physical Certificate of Authenticity guaranteeing the purity of the 925 Sterling Silver.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-ag-purple mt-0.5">security</span>
                      <div>
                        <span className="block font-semibold text-charcoal-navy">6-Month Warranty</span>
                        <span>Enjoy a 6-month warranty against any manufacturing defects. We stand by the craftsmanship of our artisans.</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4. Materials & Care */}
              <AccordionItem value="care">
                <AccordionTrigger className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy">Materials & Care Guide</AccordionTrigger>
                <AccordionContent className="font-body-md text-[16px] text-on-surface-variant leading-relaxed">
                  <p>Our jewelry is crafted from solid 925 sterling silver, free from nickel and lead. To maintain its luster, gently wipe with a soft polishing cloth after wear. Store in the provided AG Elements pouch away from moisture and direct sunlight.</p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li>Avoid exposure to harsh chemicals, perfumes, and lotions.</li>
                    <li>Remove before swimming, bathing, or exercising.</li>
                    <li>Clean regularly with a mild soap and warm water solution, drying thoroughly.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* 5. Jewellery Expert */}
              <AccordionItem value="expert">
                <AccordionTrigger className="font-label-md text-[14px] font-semibold uppercase tracking-widest text-charcoal-navy">Consult a Jewellery Expert</AccordionTrigger>
                <AccordionContent className="font-body-md text-[16px] text-on-surface-variant leading-relaxed">
                  <div className="flex flex-col gap-4 pt-2">
                    <p>Have questions about this piece? Our Jewellery Experts are available to assist you with styling advice, sizing, or any other inquiries.</p>
                    <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-label-md uppercase tracking-widest w-fit hover:bg-[#128C7E] transition-colors">
                      <span className="material-symbols-outlined">chat</span>
                      WhatsApp Us
                    </a>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Below the Fold Content */}
      {/* Product Story / Craftsmanship       {/* Editorial Image Block */}
      <section className="mt-section-v-padding pt-16 border-t border-outline-variant/30 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <div className="relative aspect-[4/3] bg-surface-lavender rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(35,33,58,0.05)]">
            <Image fill sizes="(max-width: 768px) 100vw, 50vw" alt="Silversmith working on a piece of jewelry" className="object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPPmdoIQY2dETKqp7gluGbmwPtyZS53-eQzFIoxDSeP1q85Dvcad4wjxKdr-gx6ECF2EKloDg3EF5RCnLD_iuqGIZFp6BbCDmKUy8Wh2cqeJ_qpFZGTS6M7uePf76pYT2HzIfM3srVgganSFtYqBn2EI4eafaR2bMfmLWIZlz_QJoK9DNtfgyll3TzG6jztpTXiGbIt92nmH0F4UQHG1L0cs3KRYhMcGWcnX8tGjcjLErESEEWo6qeHQ" />
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="font-headline-md text-[32px] font-medium text-charcoal-navy">Heritage & Craftsmanship</h2>
          <p className="font-body-md text-[16px] text-on-surface-variant leading-relaxed">Every piece at AG Elements carries the legacy of artisanal silversmithing dating back to 1954. This piece is painstakingly hand-engraved by our master artisans, blending traditional techniques with contemporary design. We source only the finest 925 sterling silver, ensuring that each creation is not just an accessory, but a timeless heirloom meant to be cherished for generations.</p>
        </div>
      </section>

      {/* Recommendations Sections */}
      <Suspense fallback={<div className="h-[400px] w-full bg-surface-container-lowest animate-pulse rounded my-8" />}>
        <RecommendationsSection product={product} />
      </Suspense>

      {/* Product Reviews Section */}
      <Suspense fallback={<div className="h-[300px] w-full bg-surface-container-lowest animate-pulse rounded my-8" />}>
        <ReviewsSection 
          productId={Number(product.id)} 
          averageRating={product.averageRating || '0'} 
          ratingCount={product.ratingCount || 0} 
        />
      </Suspense>

    </main>
  );
}
