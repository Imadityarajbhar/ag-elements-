import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <main className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      <Skeleton className="h-4 w-64 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <Skeleton className="h-[600px] w-full rounded" />
        </div>

        {/* Details */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-full rounded" />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
