export default function ProductLoading() {
  return (
    <main className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      {/* Breadcrumbs Skeleton */}
      <div className="flex gap-2 mb-8 animate-pulse">
        <div className="h-4 w-12 bg-surface-variant rounded"></div>
        <div className="h-4 w-4 bg-surface-variant rounded"></div>
        <div className="h-4 w-16 bg-surface-variant rounded"></div>
        <div className="h-4 w-4 bg-surface-variant rounded"></div>
        <div className="h-4 w-32 bg-surface-variant rounded"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left: Gallery Skeleton */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 items-start animate-pulse">
          {/* Thumbnails (Desktop) */}
          <div className="hidden md:flex flex-col gap-4 w-[100px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full aspect-[4/5] bg-surface-lavender rounded"></div>
            ))}
          </div>
          {/* Main Image */}
          <div className="w-full flex-1 rounded bg-surface-lavender aspect-[4/5]"></div>
          {/* Thumbnails (Mobile) */}
          <div className="flex md:hidden gap-4 w-full py-2 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[80px] aspect-[4/5] bg-surface-lavender rounded"></div>
            ))}
          </div>
        </div>

        {/* Right: Product Details Skeleton */}
        <div className="lg:col-span-5 flex flex-col gap-8 h-fit animate-pulse pt-4">
          <div className="flex flex-col gap-4">
            {/* Badge */}
            <div className="h-6 w-32 bg-surface-variant rounded"></div>
            {/* Title */}
            <div className="h-14 w-full bg-surface-variant rounded mt-2"></div>
            {/* Subtitle */}
            <div className="h-6 w-2/3 bg-surface-variant rounded"></div>
            {/* Price */}
            <div className="h-10 w-48 bg-surface-variant rounded mt-4"></div>
            <div className="h-4 w-32 bg-surface-variant rounded"></div>
          </div>

          <div className="flex flex-col gap-4 mt-6">
            {/* Buttons */}
            <div className="h-12 w-full bg-surface-variant rounded"></div>
            <div className="h-12 w-full bg-surface-variant rounded"></div>
            
            {/* Trust Icons */}
            <div className="flex justify-between items-center py-4 border-y border-outline-variant/30 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-16">
                  <div className="w-6 h-6 bg-surface-variant rounded-full"></div>
                  <div className="h-2 w-12 bg-surface-variant rounded"></div>
                  <div className="h-2 w-10 bg-surface-variant rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Accordion Skeletons */}
          <div className="flex flex-col border-b border-outline-variant/30 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-4 border-b border-outline-variant/30 flex justify-between items-center">
                <div className="h-5 w-32 bg-surface-variant rounded"></div>
                <div className="h-4 w-4 bg-surface-variant rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
