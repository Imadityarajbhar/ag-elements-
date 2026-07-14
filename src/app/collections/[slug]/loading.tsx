export default function CollectionLoading() {
  return (
    <div className="flex-grow w-full max-w-[1440px] mx-auto px-margin-mobile tablet:px-margin-desktop py-8 tablet:py-12">
      {/* Breadcrumbs Skeleton */}
      <div className="flex gap-2 mb-12 animate-pulse">
        <div className="h-4 w-12 bg-surface-variant rounded"></div>
        <div className="h-4 w-4 bg-surface-variant rounded"></div>
        <div className="h-4 w-16 bg-surface-variant rounded"></div>
        <div className="h-4 w-4 bg-surface-variant rounded"></div>
        <div className="h-4 w-20 bg-surface-variant rounded"></div>
      </div>

      {/* Category Header Skeleton */}
      <div className="flex flex-col items-center text-center mb-16 tablet:mb-section-v-padding-mobile animate-pulse">
        <div className="h-12 w-64 bg-surface-variant rounded mb-4"></div>
        <div className="h-4 w-[300px] bg-surface-variant rounded mb-2"></div>
        <div className="h-4 w-[250px] bg-surface-variant rounded mb-12"></div>
        
        {/* Pills skeleton */}
        <div className="flex gap-6 overflow-hidden w-full tablet:w-auto pb-4 justify-center">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-surface-variant"></div>
              <div className="h-3 w-12 bg-surface-variant rounded"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col tablet:flex-row gap-gutter relative">
        {/* Left Sidebar Filters Skeleton */}
        <aside className="w-full tablet:w-64 shrink-0 pr-8 hidden tablet:block animate-pulse">
          <div className="h-8 w-24 bg-surface-variant rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-surface-variant rounded mb-4"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-4 h-4 bg-surface-variant rounded-sm"></div>
                <div className="h-4 w-32 bg-surface-variant rounded"></div>
              </div>
            ))}
          </div>
        </aside>

        {/* Product Grid Skeleton */}
        <div className="flex-grow grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-gutter gap-y-12 tablet:gap-y-16">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col w-full animate-pulse">
              <div className="aspect-[4/5] bg-surface-lavender rounded mb-4"></div>
              <div className="flex justify-between items-start gap-4 mb-1">
                <div className="h-5 w-3/4 bg-surface-variant rounded"></div>
                <div className="h-5 w-1/4 bg-surface-variant rounded"></div>
              </div>
              <div className="h-4 w-1/2 bg-surface-variant rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
