"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUIStore } from "@/store/uiStore";
import { useDebounce } from "@/hooks/useDebounce";
import { getSearchSuggestions, SearchSuggestions } from "@/services/search";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchOverlay() {
  const router = useRouter();
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  
  const [results, setResults] = useState<SearchSuggestions | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [isSearchOpen]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    getSearchSuggestions(debouncedQuery).then((data) => {
      if (isMounted) {
        setResults(data);
        setIsSearching(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const handleClose = () => {
    closeSearch();
  };

  const handleSeeAll = () => {
    if (!query.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    handleClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSeeAll();
    }
  };

  const hasResults = results && (results.products.length > 0 || results.categories.length > 0 || results.tags.length > 0);

  return (
    <Dialog open={isSearchOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="top-[10%] translate-y-0 max-w-2xl sm:max-w-3xl p-0 overflow-hidden bg-pearl-white/95 backdrop-blur-xl border-outline-variant/30 editorial-shadow rounded-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search for products, categories, or tags</DialogDescription>
        
        {/* Search Input Area */}
        <div className="relative flex items-center border-b border-outline-variant/30 p-4 sm:p-6">
          <span className="material-symbols-outlined text-on-surface-variant text-2xl mr-4">search</span>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for jewellery, collections, or SKU..."
            className="flex-1 border-none shadow-none text-lg sm:text-xl font-heading bg-transparent focus-visible:ring-0 px-0 placeholder:text-on-surface-variant/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button 
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="ml-4 text-on-surface-variant hover:text-charcoal-navy"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
          <button 
            onClick={handleClose}
            className="ml-4 text-sm font-label-md text-ag-purple hover:underline"
          >
            Cancel
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-3xl mb-4">progress_activity</span>
              <p className="font-body-md">Searching...</p>
            </div>
          ) : query.trim() === "" ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/70">
              <span className="material-symbols-outlined text-4xl mb-4">search</span>
              <p className="font-body-md">Start typing to search our collection</p>
            </div>
          ) : !hasResults ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-4">sentiment_dissatisfied</span>
              <p className="font-body-md mb-2">No results found for "{query}"</p>
              <p className="text-sm">Try checking for typos or using different keywords</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Categories & Tags */}
              {(results.categories.length > 0 || results.tags.length > 0) && (
                <div>
                  <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4">Suggestions</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map(cat => (
                      <button
                        key={`cat-${cat.id}`}
                        onClick={() => {
                          router.push(`/collections/${cat.slug}`);
                          handleClose();
                        }}
                        className="px-4 py-2 rounded-full border border-outline-variant/50 hover:border-ag-purple hover:bg-ag-purple/5 font-body-sm text-charcoal-navy transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">category</span>
                        {cat.name}
                      </button>
                    ))}
                    {results.tags.map(tag => (
                      <button
                        key={`tag-${tag.id}`}
                        onClick={() => {
                          router.push(`/shop?search=${tag.slug}`);
                          handleClose();
                        }}
                        className="px-4 py-2 rounded-full border border-outline-variant/50 hover:border-ag-purple hover:bg-ag-purple/5 font-body-sm text-charcoal-navy transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">tag</span>
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Products</h3>
                    <button 
                      onClick={handleSeeAll}
                      className="text-sm font-label-md text-ag-purple hover:underline flex items-center gap-1"
                    >
                      See all <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.products.map(product => (
                      <button
                        key={product.id}
                        onClick={() => {
                          router.push(`/product/${product.slug}`);
                          handleClose();
                        }}
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-surface-container transition-colors text-left group"
                      >
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-surface-container shrink-0">
                          <Image
                            src={product.images[0]?.src || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading text-charcoal-navy truncate">{product.name}</h4>
                          <p className="font-sans text-sm text-on-surface-variant mt-1">
                            ₹{product.price.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {hasResults && (
          <div className="border-t border-outline-variant/30 p-4 bg-surface/50 flex justify-center">
            <Button onClick={handleSeeAll} className="w-full sm:w-auto">
              View All Results for "{query}"
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
