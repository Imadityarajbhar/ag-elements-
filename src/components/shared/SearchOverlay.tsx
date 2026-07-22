"use client";
import { Search, X, Loader2, Frown, Grid, Tag, ArrowRight } from 'lucide-react';

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUIStore } from "@/store/uiStore";
import { useDebounce } from "@/hooks/useDebounce";
import { getSearchSuggestions, SearchSuggestions } from "@/services/search";
import { normalizeQuery, stripS, searchSynonyms } from "@/lib/search";
import { trackSearch, trackCollectionClick, trackRecommendationClick } from "@/lib/analytics";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// A single flattened, keyboard-navigable list spanning categories -> tags ->
// products, so ArrowUp/ArrowDown moves through everything shown, in the same
// order it's rendered.
type FlatItem =
  | { type: "category"; id: string; label: string; activate: () => void }
  | { type: "tag"; id: string; label: string; activate: () => void }
  | { type: "product"; id: string; label: string; activate: () => void };

export function SearchOverlay() {
  const router = useRouter();
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [results, setResults] = useState<SearchSuggestions | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef<Record<string, SearchSuggestions>>({});

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
    const trimmedQuery = debouncedQuery.trim();
    setHighlightedIndex(-1);
    if (!trimmedQuery) {
      setResults(null);
      setIsSearching(false);
      return;
    }

    // Check local memory cache first for immediate zero-latency results
    if (cacheRef.current[trimmedQuery]) {
      const cached = cacheRef.current[trimmedQuery];
      setResults(cached);
      setIsSearching(false);
      trackSearch(trimmedQuery, cached.products.length);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    getSearchSuggestions(trimmedQuery).then((data) => {
      if (isMounted) {
        cacheRef.current[trimmedQuery] = data; // Cache the result
        setResults(data);
        setIsSearching(false);
        trackSearch(trimmedQuery, data.products.length);
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

    // Check if the query matches a category name in our suggestions (handling singular/plural and synonyms)
    if (results && results.categories.length > 0) {
      const normalizedQ = normalizeQuery(query);
      const synonym = searchSynonyms[normalizedQ] || normalizedQ;
      
      const matchedCategories = results.categories.filter(c => {
        const cName = normalizeQuery(c.name);
        const cSlug = normalizeQuery(c.slug);
        return cName === synonym || cSlug === synonym || stripS(cName) === stripS(synonym);
      });
      
      const sortedCategories = matchedCategories.sort((a, b) => {
        // 1. Prefer populated over empty
        const aPopulated = (a.count || 0) > 0 ? 1 : 0;
        const bPopulated = (b.count || 0) > 0 ? 1 : 0;
        if (aPopulated !== bPopulated) return bPopulated - aPopulated;

        // 2. Prefer exact match over stemmed
        const aName = normalizeQuery(a.name);
        const aSlug = normalizeQuery(a.slug);
        const bName = normalizeQuery(b.name);
        const bSlug = normalizeQuery(b.slug);
        
        const aExact = aName === synonym || aSlug === synonym ? 1 : 0;
        const bExact = bName === synonym || bSlug === synonym ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;

        // 3. Fallback to higher count
        return (b.count || 0) - (a.count || 0);
      });

      const exactCategory = sortedCategories[0];
      const validCategory = exactCategory && (exactCategory.count || 0) > 0 ? exactCategory : null;
      if (validCategory) {
        goToCollection(validCategory.slug);
        return;
      }
    }

    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    handleClose();
  };

  const goToCollection = (slug: string) => {
    trackCollectionClick(slug, "search-overlay");
    router.push(`/collections/${slug}`);
    handleClose();
  };

  const goToTagSearch = (tagSlug: string) => {
    router.push(`/shop?search=${tagSlug}`);
    handleClose();
  };

  const goToProduct = (product: SearchSuggestions["products"][number]) => {
    trackRecommendationClick("search-overlay", product);
    router.push(`/product/${product.slug}`);
    handleClose();
  };

  const hasResults = results && (results.products.length > 0 || results.categories.length > 0 || results.tags.length > 0);

  // Flattened, keyboard-navigable list spanning categories -> tags -> products,
  // in the same order they're rendered below.
  const flatItems: FlatItem[] = useMemo(() => {
    if (!results) return [];
    return [
      ...results.categories.map((c) => ({ type: "category" as const, id: `cat-${c.id}`, label: c.name, activate: () => goToCollection(c.slug) })),
      ...results.tags.map((t) => ({ type: "tag" as const, id: `tag-${t.id}`, label: t.name, activate: () => goToTagSearch(t.slug) })),
      ...results.products.map((p) => ({ type: "product" as const, id: `prod-${p.id}`, label: p.name, activate: () => goToProduct(p) })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Keep the highlighted item scrolled into view as arrow keys move through the list.
  useEffect(() => {
    if (highlightedIndex < 0 || !flatItems[highlightedIndex]) return;
    document.getElementById(flatItems[highlightedIndex].id)?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, flatItems]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flatItems.length === 0) return;
      setHighlightedIndex((i) => (i + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flatItems.length === 0) return;
      setHighlightedIndex((i) => (i <= 0 ? flatItems.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && flatItems[highlightedIndex]) {
        flatItems[highlightedIndex].activate();
      } else {
        handleSeeAll();
      }
    }
  };

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
          <Search className="text-on-surface-variant text-2xl mr-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for jewellery, collections, or SKU..."
            className="flex-1 border-none shadow-none text-lg sm:text-xl font-heading bg-transparent focus-visible:ring-0 px-0 placeholder:text-on-surface-variant/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={flatItems.length > 0}
            aria-controls="search-results-listbox"
            aria-activedescendant={highlightedIndex >= 0 ? flatItems[highlightedIndex]?.id : undefined}
            aria-autocomplete="list"
          />
          {query && (
            <button 
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="ml-4 text-on-surface-variant hover:text-charcoal-navy"
            >
              <X  />
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
        <div id="search-results-listbox" role="listbox" aria-label="Search results" className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant" role="status" aria-live="polite">
              <Loader2 className="animate-spin text-3xl mb-4" />
              <p className="font-body-md">Searching...</p>
            </div>
          ) : query.trim() === "" ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/70">
              <Search className="text-4xl mb-4" />
              <p className="font-body-md">Start typing to search our collection</p>
            </div>
          ) : !hasResults ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant" aria-live="polite">
              <Frown className="text-4xl mb-4" />
              <p className="font-body-md mb-2">No products found for "{query}"</p>
              <p className="text-sm mb-8">Try another keyword or browse our collections.</p>
              {results && results.suggestions.length > 0 && (
                <div className="w-full">
                  <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4 text-center">You Might Like</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {results.suggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => goToProduct(product)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container transition-colors text-left group"
                      >
                        <div className="relative w-14 h-14 rounded-md overflow-hidden bg-surface-container shrink-0">
                          <Image
                            src={product.images[0]?.src || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading text-sm text-charcoal-navy truncate">{product.name}</h4>
                          <p className="font-sans text-xs text-on-surface-variant mt-1">₹{product.price.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-8" aria-live="polite">
              {/* Categories & Tags */}
              {(results.categories.length > 0 || results.tags.length > 0) && (
                <div>
                  <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4">Suggestions</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map(cat => {
                      const flatIndex = flatItems.findIndex((i) => i.id === `cat-${cat.id}`);
                      const isHighlighted = flatIndex === highlightedIndex;
                      return (
                        <button
                          key={`cat-${cat.id}`}
                          id={`cat-${cat.id}`}
                          role="option"
                          aria-selected={isHighlighted}
                          onClick={() => goToCollection(cat.slug)}
                          className={`px-4 py-2 rounded-full border font-body-sm text-charcoal-navy transition-colors flex items-center gap-2 ${isHighlighted ? 'border-ag-purple bg-ag-purple/5' : 'border-outline-variant/50 hover:border-ag-purple hover:bg-ag-purple/5'}`}
                        >
                          <Grid className="text-[16px] text-on-surface-variant" />
                          {cat.name}
                        </button>
                      );
                    })}
                    {results.tags.map(tag => {
                      const flatIndex = flatItems.findIndex((i) => i.id === `tag-${tag.id}`);
                      const isHighlighted = flatIndex === highlightedIndex;
                      return (
                        <button
                          key={`tag-${tag.id}`}
                          id={`tag-${tag.id}`}
                          role="option"
                          aria-selected={isHighlighted}
                          onClick={() => goToTagSearch(tag.slug)}
                          className={`px-4 py-2 rounded-full border font-body-sm text-charcoal-navy transition-colors flex items-center gap-2 ${isHighlighted ? 'border-ag-purple bg-ag-purple/5' : 'border-outline-variant/50 hover:border-ag-purple hover:bg-ag-purple/5'}`}
                        >
                          <Tag className="text-[16px] text-on-surface-variant" />
                          {tag.name}
                        </button>
                      );
                    })}
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
                      See all <ArrowRight className="text-[16px]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.products.map(product => {
                      const flatIndex = flatItems.findIndex((i) => i.id === `prod-${product.id}`);
                      const isHighlighted = flatIndex === highlightedIndex;
                      return (
                        <button
                          key={product.id}
                          id={`prod-${product.id}`}
                          role="option"
                          aria-selected={isHighlighted}
                          onClick={() => goToProduct(product)}
                          className={`flex items-center gap-4 p-2 rounded-lg transition-colors text-left group ${isHighlighted ? 'bg-surface-container' : 'hover:bg-surface-container'}`}
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
                      );
                    })}
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
