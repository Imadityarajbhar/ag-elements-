import { SectionHeading } from "@/components/shared/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <SectionHeading 
          title="Shop All Jewellery" 
          subtitle="Explore the complete AG Elements collection of handcrafted premium sterling silver jewellery."
          align="center"
        />
      </div>

      <div className="flex flex-col tablet:flex-row gap-8 items-start">
        {/* Desktop Sidebar Skeleton */}
        <aside className="hidden tablet:block w-[260px] shrink-0 self-start">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-48 w-full rounded" />
            <Skeleton className="h-24 w-full rounded" />
            <Skeleton className="h-48 w-full rounded" />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4 gap-x-4 gap-y-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[4/5] w-full rounded" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
