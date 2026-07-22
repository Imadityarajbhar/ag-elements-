import { getPaginatedProducts, AttributeFilter } from "@/services/products";
import { ShopArchive } from "@/components/shop/ShopArchive";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Suspense } from "react";
import { generateMetadata as getSeoMetadata } from "@/lib/seo/generateMetadata";

export const metadata = getSeoMetadata({
  title: "Shop Premium Sterling Silver Jewellery",
  description: "Explore the complete AG Elements collection of handcrafted premium sterling silver jewellery.",
  path: "/shop",
  keywords: ["sterling silver jewelry", "shop jewelry online", "AG Elements"],
});

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;

  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const min_price = typeof resolvedParams.min_price === 'string' ? resolvedParams.min_price : undefined;
  const max_price = typeof resolvedParams.max_price === 'string' ? resolvedParams.max_price : undefined;
  const featured = resolvedParams.featured === 'true';
  const on_sale = resolvedParams.on_sale === 'true';
  const order = typeof resolvedParams.order === 'string' ? resolvedParams.order as any : undefined;
  const orderby = typeof resolvedParams.orderby === 'string' ? resolvedParams.orderby as any : undefined;
  // Parse dynamic attributes from URL parameters. Each key maps to its own
  // WooCommerce attribute taxonomy (e.g. pa_gender, pa_occasion) — WC's REST API
  // only accepts a single attribute/attribute_term pair per request, so 2+
  // simultaneously active taxonomies are AND-combined via attributeFilters
  // (see getPaginatedProducts) rather than joined into one invalid param string.
  const attributeKeys = ['pa_gender', 'pa_material', 'pa_collection', 'pa_stone', 'pa_occasion', 'pa_finish', 'pa_style'];
  const attributeFilters: AttributeFilter[] = [];

  for (const key of attributeKeys) {
    const val = typeof resolvedParams[key] === 'string' ? resolvedParams[key] : undefined;
    if (val) {
      attributeFilters.push({ attribute: key, term: val });
    }
  }

  const stock_status = typeof resolvedParams.stock_status === 'string' ? resolvedParams.stock_status as any : undefined;
  const new_arrivals = resolvedParams.new_arrivals === 'true';

  const { products, total, totalPages } = await getPaginatedProducts({
    page,
    per_page: 24,
    search,
    category,
    min_price,
    max_price,
    featured,
    on_sale,
    order,
    orderby,
    attributeFilters,
    stock_status,
    new_arrivals
  });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <SectionHeading 
          title="Shop All Jewellery" 
          subtitle="Explore the complete AG Elements collection of handcrafted premium sterling silver jewellery."
          align="center"
        />
      </div>

      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center">Loading products...</div>}>
        <ShopArchive 
          products={products} 
          total={total} 
          totalPages={totalPages} 
        />
      </Suspense>
    </div>
  );
}
