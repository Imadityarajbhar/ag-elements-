export default function CheckoutLoading() {
  return (
    <main className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-12">
      <div className="h-12 w-64 bg-surface-variant rounded mb-8 animate-pulse"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left: Form Fields Skeleton */}
        <div className="lg:col-span-7 flex flex-col gap-8 animate-pulse">
          
          <div className="bg-pearl-white p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/20">
            <div className="h-6 w-48 bg-surface-variant rounded mb-6"></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-12 bg-surface-variant rounded"></div>
              <div className="h-12 bg-surface-variant rounded"></div>
            </div>
            <div className="h-12 bg-surface-variant rounded mb-4 w-full"></div>
            <div className="h-12 bg-surface-variant rounded mb-4 w-full"></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-12 bg-surface-variant rounded"></div>
              <div className="h-12 bg-surface-variant rounded"></div>
            </div>
          </div>

          <div className="bg-pearl-white p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/20">
            <div className="h-6 w-32 bg-surface-variant rounded mb-6"></div>
            <div className="h-16 bg-surface-variant rounded mb-4 w-full"></div>
            <div className="h-16 bg-surface-variant rounded w-full"></div>
          </div>
          
        </div>

        {/* Right: Order Summary Skeleton */}
        <div className="lg:col-span-5 h-fit lg:sticky lg:top-[120px] animate-pulse">
          <div className="bg-surface-lavender p-6 md:p-8 rounded-xl">
            <div className="h-8 w-48 bg-surface-variant rounded mb-6"></div>
            
            {/* Items */}
            <div className="flex flex-col gap-4 mb-6 border-b border-outline-variant/20 pb-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-surface-variant rounded shrink-0"></div>
                  <div className="flex flex-col gap-2 flex-grow">
                    <div className="h-4 w-3/4 bg-surface-variant rounded"></div>
                    <div className="h-4 w-1/4 bg-surface-variant rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-surface-variant rounded"></div>
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-6 mb-6">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-surface-variant rounded"></div>
                <div className="h-4 w-20 bg-surface-variant rounded"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-surface-variant rounded"></div>
                <div className="h-4 w-20 bg-surface-variant rounded"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-surface-variant rounded"></div>
                <div className="h-4 w-20 bg-surface-variant rounded"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <div className="h-6 w-24 bg-surface-variant rounded"></div>
              <div className="h-6 w-32 bg-surface-variant rounded"></div>
            </div>
            
            <div className="h-14 w-full bg-surface-variant rounded"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
