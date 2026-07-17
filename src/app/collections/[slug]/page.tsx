import { Wand2 } from 'lucide-react';
import { getPaginatedProducts } from "@/services/products";
import { ShopArchive } from "@/components/shop/ShopArchive";
import { ProductCarousel } from "@/components/shared/ProductCarousel";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { generateMetadata as baseGenerateMetadata } from "@/lib/seo/generateMetadata";
import { COLLECTION_CONFIG } from "@/config/collections";

export async function generateStaticParams() {
  return Object.keys(COLLECTION_CONFIG).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = COLLECTION_CONFIG[slug];
  
  if (!config) {
    return baseGenerateMetadata({
      title: "Collection Not Found | AG Elements",
    });
  }
  
  return baseGenerateMetadata({
    title: `Shop ${config.title} | AG Elements`,
    description: config.seoDescription,
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
  const attributeKeys = ['pa_gender', 'pa_material', 'pa_collection', 'pa_stone', 'pa_occasion'];
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
        "name": "Jewellery",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agelements.example.com'}/shop`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": titleSlug,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agelements.example.com'}/collections/${slug}`
      }
    ]
  };

  return (
    <div className="flex flex-col w-full bg-pearl-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
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

      {/* 3. Featured Products Carousel (Only show if we have products) */}
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

    </div>
  );
}
