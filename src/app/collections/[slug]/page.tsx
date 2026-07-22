import { Wand2 } from 'lucide-react';
import { getPaginatedProducts } from "@/services/products";
import { ShopArchive } from "@/components/shop/ShopArchive";
import { ProductCarousel } from "@/components/shared/ProductCarousel";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { generateMetadata as baseGenerateMetadata } from "@/lib/seo/generateMetadata";
import { buildBreadcrumbSchema, buildCollectionItemListSchema } from "@/lib/seo/schema";
import { COLLECTION_CONFIG } from "@/config/collections";

export async function generateStaticParams() {
  return Object.keys(COLLECTION_CONFIG).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = COLLECTION_CONFIG[slug];

  // Resolving notFound() here (before the page component streams) ensures the HTTP
  // response status is committed as 404 before Next flushes this segment's loading.tsx
  // shell. Deciding only inside the page component leaves the status stuck at 200,
  // since by then the loading fallback has already been sent with a 200 status line.
  if (!config) {
    notFound();
  }

  return baseGenerateMetadata({
    title: `Shop ${config.title}`,
    description: config.seoDescription,
    image: config.bannerImage,
    path: `/collections/${slug}`,
    keywords: [config.title, `${config.title} jewelry`, "sterling silver", "AG Elements"],
  });
}

export default async function CollectionPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params;
  const resolvedParams = await searchParams;
  const config = COLLECTION_CONFIG[slug];
  
  if (!config) {
    notFound();
  }

  const categoryId = config.id;
  const titleSlug = config.title;

  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  
  // Note: we IGNORE ?category= in searchParams for collections because the URL slug dictates the category
  const min_price = typeof resolvedParams.min_price === 'string' ? resolvedParams.min_price : undefined;
  const max_price = typeof resolvedParams.max_price === 'string' ? resolvedParams.max_price : undefined;
  const featured = resolvedParams.featured === 'true';
  const on_sale = resolvedParams.on_sale === 'true';
  const order = typeof resolvedParams.order === 'string' ? resolvedParams.order as any : undefined;
  const orderby = typeof resolvedParams.orderby === 'string' ? resolvedParams.orderby as any : undefined;
  // Parse dynamic attributes from URL parameters
  const attributeKeys = ['pa_gender', 'pa_material', 'pa_collection', 'pa_stone', 'pa_occasion', 'pa_finish', 'pa_style'];
  const activeAttributes: string[] = [];
  const activeAttributeTerms: string[] = [];

  for (const key of attributeKeys) {
    const val = typeof resolvedParams[key] === 'string' ? resolvedParams[key] : undefined;
    if (val) {
      activeAttributes.push(key);
      activeAttributeTerms.push(val);
    }
  }

  // Handle old generic attribute_term or config-level attribute
  const legacyAttributeTerm = typeof resolvedParams.attribute_term === 'string' ? resolvedParams.attribute_term : undefined;
  if (legacyAttributeTerm) {
    activeAttributes.push(config.attribute || 'pa_material,pa_gender,pa_collection');
    activeAttributeTerms.push(legacyAttributeTerm);
  } else if (config.attribute && config.attribute_term) {
    activeAttributes.push(config.attribute);
    activeAttributeTerms.push(config.attribute_term);
  }

  const attribute = activeAttributes.length > 0 ? activeAttributes.join(',') : undefined;
  const attribute_term = activeAttributeTerms.length > 0 ? activeAttributeTerms.join(',') : undefined;
  const stock_status = typeof resolvedParams.stock_status === 'string' ? resolvedParams.stock_status as any : undefined;
  const new_arrivals = resolvedParams.new_arrivals === 'true';

  // 1. Fetch main grid products
  const { products, total, totalPages } = await getPaginatedProducts({
    page,
    per_page: 24,
    search,
    category: categoryId.toString(),
    min_price,
    max_price,
    featured,
    on_sale,
    order,
    orderby,
    attribute,
    attribute_term,
    stock_status,
    new_arrivals
  });

  // 2. Fetch featured products specifically for THIS category for the top carousel
  const { products: featuredProducts } = await getPaginatedProducts({
    page: 1,
    per_page: 8,
    category: categoryId.toString(),
    attribute,
    attribute_term,
    featured: true // Just fetch top featured items for this category
  });

  // Fallback to latest products in category if no featured products
  const carouselProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);

  // 3. Recently Added & Popular Products within this collection specifically
  // (only worth fetching if the collection actually has products at all).
  const [recentlyAddedResult, popularResult] = total > 0
    ? await Promise.all([
        getPaginatedProducts({ page: 1, per_page: 8, category: categoryId.toString(), orderby: 'date', order: 'desc' }),
        getPaginatedProducts({ page: 1, per_page: 8, category: categoryId.toString(), orderby: 'popularity', order: 'desc' }),
      ])
    : [{ products: [] }, { products: [] }];
  const recentlyAdded = recentlyAddedResult.products;
  const popularProducts = popularResult.products;

  const relatedCollections = (config.relatedSlugs || [])
    .map((relSlug) => ({ slug: relSlug, config: COLLECTION_CONFIG[relSlug] }))
    .filter((c): c is { slug: string; config: typeof COLLECTION_CONFIG[string] } => Boolean(c.config));

  // Breadcrumb + CollectionPage/ItemList Schema — the ItemList only ever lists the
  // real products actually rendered in the grid (carouselProducts), never padded.
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Jewellery", path: "/shop" },
    { name: titleSlug, path: `/collections/${slug}` },
  ]);
  const collectionSchema = buildCollectionItemListSchema(titleSlug, carouselProducts);

  return (
    <div className="flex flex-col w-full bg-pearl-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {carouselProducts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
      )}

      {/* 1. Full-Bleed Editorial Banner */}
      <section className="relative w-full h-[45vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-charcoal-navy">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url('${config.bannerImage}')` }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-charcoal-navy/80 via-charcoal-navy/20 to-charcoal-navy/40"></div>
        <div className="relative z-20 text-center flex flex-col items-center px-4 mt-12">
          {/* Breadcrumbs - Elegant white version for banner */}
          <nav className="font-label-sm text-[12px] font-medium text-pearl-white/70 flex items-center gap-2 mb-6 uppercase tracking-[0.15em]">
            <Link className="hover:text-pearl-white transition-colors" href="/">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link className="hover:text-pearl-white transition-colors" href="/shop">Jewellery</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-pearl-white font-bold">{titleSlug}</span>
          </nav>
          
          <h1 className="font-display-lg text-[48px] tablet:text-[72px] leading-none font-medium text-pearl-white drop-shadow-lg tracking-tight mb-4">
            {titleSlug}
          </h1>
        </div>
      </section>

      {/* 2. Collection Story Block */}
      <section className="py-16 tablet:py-24 px-margin-mobile tablet:px-margin-desktop max-w-[1440px] mx-auto w-full">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <Wand2 className="text-[32px] text-ag-purple mb-6 font-light" />
          <h2 className="font-headline-md text-[32px] tablet:text-[40px] leading-tight font-medium text-charcoal-navy mb-6">
            {config.storyHeading}
          </h2>
          <p className="font-body-lg text-[18px] tablet:text-[20px] leading-[1.8] text-on-surface-variant font-light">
            {config.storyText}
          </p>
          <div className="w-12 h-[1px] bg-outline-variant mt-10"></div>
        </div>
      </section>

      {total === 0 ? (
        <section className="py-24 tablet:py-32 w-full flex items-center justify-center bg-pearl-white">
          <div className="max-w-2xl mx-auto text-center px-4">
            <div className="w-16 h-16 mx-auto mb-8 bg-surface-variant rounded-full flex items-center justify-center shadow-inner">
              <Wand2 className="w-8 h-8 text-on-surface-variant/50" />
            </div>
            <h2 className="font-display-md text-[36px] tablet:text-[48px] text-charcoal-navy font-medium mb-4 tracking-tight">
              Coming Soon
            </h2>
            <p className="font-body-lg text-[18px] text-on-surface-variant mb-10 leading-relaxed max-w-lg mx-auto">
              Our {titleSlug} collection is coming soon. We are curating something truly special for you.
            </p>
            <Link 
              href="/collections/rings"
              className="inline-flex items-center justify-center bg-charcoal-navy text-pearl-white px-8 py-4 rounded-none font-label-md uppercase tracking-[0.15em] hover:bg-ag-purple transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Explore Rings
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* 3. Featured Products Carousel */}
          {carouselProducts.length > 0 && (
            <div className="bg-surface-container-lowest w-full pt-4 pb-12 tablet:pb-24 border-b border-outline-variant/30">
              <ProductCarousel title={`Featured ${titleSlug}`} products={carouselProducts} />
            </div>
          )}

          {/* 4. Shop Archive & Filters */}
          <section className="py-12 tablet:py-16 w-full">
            <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop">
              <div className="mb-8 tablet:mb-12">
                <h2 className="font-headline-sm text-[28px] font-medium text-charcoal-navy">Explore All {titleSlug}</h2>
                <p className="font-body-md text-on-surface-variant mt-2">Showing {total} {total === 1 ? 'result' : 'results'}</p>
              </div>
              
              <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center">Loading products...</div>}>
                <ShopArchive 
                  products={products} 
                  total={total} 
                  totalPages={totalPages} 
                  baseCategorySlug={slug}
                />
              </Suspense>
            </div>
          </section>

          {/* 5. Recently Added in this Collection */}
          {recentlyAdded.length > 0 && (
            <div className="w-full pt-4 pb-12 tablet:pb-24 border-t border-outline-variant/30">
              <ProductCarousel title={`Recently Added to ${titleSlug}`} products={recentlyAdded} analyticsSource="recently-added" />
            </div>
          )}

          {/* 6. Popular in this Collection */}
          {popularProducts.length > 0 && (
            <div className="bg-surface-container-lowest w-full pt-4 pb-12 tablet:pb-24 border-t border-outline-variant/30">
              <ProductCarousel title={`Popular in ${titleSlug}`} products={popularProducts} analyticsSource="popular-in-collection" />
            </div>
          )}
        </>
      )}

      {/* 7. Related Collections */}
      {relatedCollections.length > 0 && (
        <section className="py-16 tablet:py-24 px-margin-mobile tablet:px-margin-desktop max-w-[1440px] mx-auto w-full border-t border-outline-variant/30">
          <h2 className="font-headline-sm text-[28px] font-medium text-charcoal-navy mb-8 text-center">You May Also Like</h2>
          <div className="grid grid-cols-2 tablet:grid-cols-4 gap-4 tablet:gap-6">
            {relatedCollections.map(({ slug: relSlug, config: relConfig }) => (
              <Link
                key={relSlug}
                href={`/collections/${relSlug}`}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(35,33,58,0.05)]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${relConfig.bannerImage}')` }}
                />
                <div className="absolute inset-0 bg-charcoal-navy/40 group-hover:bg-charcoal-navy/50 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-headline-sm text-[18px] tablet:text-[22px] font-medium text-pearl-white drop-shadow-lg">
                    {relConfig.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
