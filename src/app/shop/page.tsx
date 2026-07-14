import { getPaginatedProducts } from "@/services/products";
import { ShopArchive } from "@/components/shop/ShopArchive";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Premium Sterling Silver Jewellery | AG Elements",
  description: "Explore the complete AG Elements collection of handcrafted premium sterling silver jewellery.",
};

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
  const attribute = resolvedParams.attribute_term ? 'pa_material,pa_gender,pa_collection' : undefined; // Generic check, wc rest handles this strangely sometimes
  const attribute_term = typeof resolvedParams.attribute_term === 'string' ? resolvedParams.attribute_term : undefined;
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
    attribute_term,
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

      <ShopArchive 
        products={products} 
        total={total} 
        totalPages={totalPages} 
      />
    </div>
  );
}
