export default function CartLoading() {
  return (
    <main className="w-full max-w-[1024px] mx-auto px-margin-mobile md:px-margin-desktop py-16">
      <div className="h-12 w-48 bg-surface-variant rounded mb-12 animate-pulse"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left: Cart Items Skeleton */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center pb-8 border-b border-outline-variant/30 animate-pulse">
              <div className="w-24 h-24 bg-surface-lavender rounded shrink-0"></div>
              <div className="flex flex-col gap-2 flex-grow">
                <div className="h-5 w-3/4 bg-surface-variant rounded"></div>
                <div className="h-4 w-1/4 bg-surface-variant rounded"></div>
                <div className="h-5 w-1/3 bg-surface-variant rounded mt-2"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary Skeleton */}
        <div className="lg:col-span-4 h-fit animate-pulse">
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-6">
            <div className="h-8 w-1/2 bg-surface-variant rounded mb-2"></div>
            
            <div className="flex justify-between items-center">
              <div className="h-4 w-1/3 bg-surface-variant rounded"></div>
              <div className="h-4 w-1/4 bg-surface-variant rounded"></div>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
              <div className="h-4 w-1/3 bg-surface-variant rounded"></div>
              <div className="h-4 w-1/4 bg-surface-variant rounded"></div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="h-6 w-1/3 bg-surface-variant rounded"></div>
              <div className="h-6 w-1/3 bg-surface-variant rounded"></div>
            </div>
            
            <div className="h-14 w-full bg-surface-variant rounded mt-4"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
