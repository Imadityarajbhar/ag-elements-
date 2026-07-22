"use client";
import { Search } from 'lucide-react';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { trackSearch, trackSortUse } from "@/lib/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShopToolbarProps {
  totalCount: number;
}

export function ShopToolbar({ totalCount }: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'default';
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Push the debounced search term to the URL once it settles
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = debouncedSearchTerm.trim();
    if (trimmed !== '') {
      params.set('search', trimmed);
    } else {
      params.delete('search');
    }
    // Only push if changed
    if (params.get('search') !== searchParams.get('search')) {
      params.set('page', '1');
      router.push(pathname + "?" + params.toString(), { scroll: false });
      // Note: totalCount here is still the pre-navigation count (the new result
      // count isn't known until the server re-renders with the new search param).
      if (trimmed) trackSearch(trimmed, totalCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const handleSortChange = (value: string) => {
    trackSortUse(value);
    const params = new URLSearchParams(searchParams.toString());
    
    // Clear old sort params
    params.delete('orderby');
    params.delete('order');
    params.set('sort', value);

    switch (value) {
      case 'newest':
        params.set('orderby', 'date');
        params.set('order', 'desc');
        break;
      case 'price-asc':
        params.set('orderby', 'price');
        params.set('order', 'asc');
        break;
      case 'price-desc':
        params.set('orderby', 'price');
        params.set('order', 'desc');
        break;
      case 'name-asc':
        params.set('orderby', 'title');
        params.set('order', 'asc');
        break;
      case 'name-desc':
        params.set('orderby', 'title');
        params.set('order', 'desc');
        break;
      case 'featured':
        params.set('featured', 'true');
        break;
      case 'popularity':
        params.set('orderby', 'popularity');
        params.set('order', 'desc');
        break;
      default:
        params.delete('sort');
        break;
    }

    params.set('page', '1');
    router.push(pathname + "?" + params.toString(), { scroll: false });
  };

  const perPage = 24; // Default
  const page = parseInt(searchParams.get('page') || '1', 10);
  const start = Math.min((page - 1) * perPage + 1, totalCount);
  const end = Math.min(page * perPage, totalCount);

  return (
    <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 mb-6">
      <div className="text-on-surface-variant font-body-md" role="status" aria-live="polite">
        {totalCount === 0
          ? "No products found"
          : `Showing ${start}–${end} of ${totalCount} products`}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full tablet:w-64">
          <label htmlFor="shop-toolbar-search" className="sr-only">Search products</label>
          <Input
            id="shop-toolbar-search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 w-full"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]" />
        </div>

        <Select value={currentSort} onValueChange={(val: string | null) => val && handleSortChange(val)}>
          <SelectTrigger className="w-[180px] h-10" aria-label="Sort products">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Sorting</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest Arrivals</SelectItem>
            <SelectItem value="popularity">Most Popular</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
