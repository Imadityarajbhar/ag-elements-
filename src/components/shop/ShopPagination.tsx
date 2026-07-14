"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ShopPaginationProps {
  totalPages: number;
}

export function ShopPagination({ totalPages }: ShopPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(pathname + "?" + params.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, and pages around current page
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...');
    }
  }

  // Remove duplicate ellipses
  const displayPages = pages.filter((page, index) => {
    return page !== '...' || pages[index - 1] !== '...';
  });

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 p-0"
        aria-label="Previous page"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </Button>

      {displayPages.map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-on-surface-variant">...</span>
        ) : (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => handlePageChange(page as number)}
            className={`w-10 h-10 p-0 ${currentPage === page ? 'bg-ag-purple hover:bg-ag-purple-dark text-pearl-white' : ''}`}
          >
            {page}
          </Button>
        )
      ))}

      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 p-0"
        aria-label="Next page"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </Button>
    </div>
  );
}
