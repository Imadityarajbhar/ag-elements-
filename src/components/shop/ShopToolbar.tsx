"use client";
import { Search } from 'lucide-react';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.trim() !== '') {
        params.set('search', searchTerm.trim());
      } else {
        params.delete('search');
      }
      // Only push if changed
      if (params.get('search') !== searchParams.get('search')) {
        params.set('page', '1');
        router.push(pathname + "?" + params.toString(), { scroll: false });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  const handleSortChange = (value: string) => {
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
        // WooCommerce has a generic 'featured' param, but orderby=popularity is often used.
        // Or we can just leave it as default or popularity. 
        params.set('featured', 'true');
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
      <div className="text-on-surface-variant font-body-md">
        {totalCount === 0 
          ? "No products found" 
          : `Showing ${start}–${end} of ${totalCount} products`}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full tablet:w-64">
          <Input 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 w-full"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]" />
        </div>

        <Select value={currentSort} onValueChange={(val: string | null) => val && handleSortChange(val)}>
          <SelectTrigger className="w-[180px] h-10">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Sorting</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest Arrivals</SelectItem>
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
