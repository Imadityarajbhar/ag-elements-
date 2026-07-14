"use client";

import { ShopFilters } from "./ShopFilters";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function ShopLayout({ children, baseCategorySlug }: { children: React.ReactNode, baseCategorySlug?: string }) {
  return (
    <div className="flex flex-col tablet:flex-row gap-8 items-start">
       {/* Mobile Filter Trigger */}
       <div className="tablet:hidden w-full flex justify-between items-center mb-4">
         <h2 className="font-heading-sm">Filters</h2>
         <Sheet>
           <SheetTrigger render={<Button variant="outline" className="gap-2" />}>
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Filter
           </SheetTrigger>
           <SheetContent side="left" className="w-[320px] max-w-[85vw] overflow-y-auto bg-pearl-white">
             <SheetHeader>
               <SheetTitle>Filters</SheetTitle>
             </SheetHeader>
             <div className="mt-6">
                <ShopFilters baseCategorySlug={baseCategorySlug} />
             </div>
           </SheetContent>
         </Sheet>
       </div>

       {/* Desktop Filter Sidebar */}
       <aside className="hidden tablet:block w-[260px] shrink-0 sticky top-24 self-start">
         <ShopFilters baseCategorySlug={baseCategorySlug} />
       </aside>

       {/* Main Content Area */}
       <main className="flex-1 w-full min-w-0">
         {children}
       </main>
    </div>
  );
}
