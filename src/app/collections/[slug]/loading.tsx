import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionLoading() {
  return (
    <div className="flex flex-col w-full bg-pearl-white min-h-screen">
      {/* Banner */}
      <div className="relative w-full h-[45vh] min-h-[400px] bg-surface-variant" />

      {/* Story block */}
      <section className="py-16 tablet:py-24 px-margin-mobile tablet:px-margin-desktop max-w-[1440px] mx-auto w-full">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-2/3 max-w-md" />
        </div>
      </section>

      {/* Product grid */}
      <section className="py-12 tablet:py-16 w-full">
        <div className="max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop">
          <div className="mb-8 tablet:mb-12 flex flex-col gap-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-32" />
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
        </div>
      </section>
    </div>
  );
}
