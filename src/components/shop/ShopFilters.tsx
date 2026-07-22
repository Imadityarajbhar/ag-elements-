"use client";

import { useCallback, useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SHOP_FILTERS } from "@/config/shop-filters";
import { COLLECTION_TITLES } from "@/config/collections";
import { useUIStore } from "@/store/uiStore";
import { trackFilterUse, trackFilterClear, trackCollectionClick } from "@/lib/analytics";

interface ShopFiltersProps {
  baseCategorySlug?: string;
}

export function ShopFilters({ baseCategorySlug }: ShopFiltersProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Price state for debounced slider
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "500");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "10000");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.set('page', '1'); // Reset pagination on filter change
      return params.toString();
    },
    [searchParams]
  );

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    useUIStore.getState().setIsFiltering(isPending);
  }, [isPending]);

  const toggleQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValues = params.get(name)?.split(',') || [];
      
      let newValues;
      if (currentValues.includes(value)) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues, value].filter(Boolean);
      }

      if (newValues.length === 0) {
        params.delete(name);
      } else {
        params.set(name, newValues.join(','));
      }
      params.set('page', '1');
      trackFilterUse(name, value);
      startTransition(() => {
        router.push(pathname + "?" + params.toString(), { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('min_price', minPrice);
    params.set('max_price', maxPrice);
    params.set('page', '1');
    trackFilterUse('price', `${minPrice}-${maxPrice}`);
    startTransition(() => {
      router.push(pathname + "?" + params.toString(), { scroll: false });
    });
  };

  const clearFilters = () => {
    trackFilterClear();
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  // Derived from COLLECTION_TITLES (the single source of truth for navigable
  // collections) so this list can never drift out of sync with real routes.
  const categories = [
    { name: "All Products", slug: "all" },
    ...Object.entries(COLLECTION_TITLES).map(([slug, name]) => ({ name, slug })),
  ];
  
  // Options below are pruned to attribute terms that actually have products
  // assigned (verified against live WooCommerce term counts) — a checkbox for a
  // zero-count term always returns an empty grid, which is a broken filter in
  // effect even though the term technically exists.
  const filters = [
    {
      id: "pa_gender",
      title: "Gender",
      options: [
        { label: "Men", value: SHOP_FILTERS.attributes.pa_gender.terms["men"]?.toString() },
        { label: "Women", value: SHOP_FILTERS.attributes.pa_gender.terms["women"]?.toString() },
        { label: "Unisex", value: SHOP_FILTERS.attributes.pa_gender.terms["unisex"]?.toString() }
      ]
    },
    {
      id: "pa_material",
      title: "Material",
      options: [
        { label: "925 Sterling Silver", value: SHOP_FILTERS.attributes.pa_material.terms["925-sterling-silver"]?.toString() },
        { label: "Gold Plated", value: SHOP_FILTERS.attributes.pa_material.terms["gold-plated"]?.toString() },
        { label: "Rose Gold", value: SHOP_FILTERS.attributes.pa_material.terms["rose-gold"]?.toString() },
      ]
    },
    {
      id: "pa_collection",
      title: "Collection",
      options: [
        { label: "Bridal Collection", value: (SHOP_FILTERS.attributes.pa_collection?.terms as any)["bridal-collection"]?.toString() },
        { label: "Men's Collection", value: (SHOP_FILTERS.attributes.pa_collection?.terms as any)["mens-collection"]?.toString() },
        { label: "Party Collection", value: (SHOP_FILTERS.attributes.pa_collection?.terms as any)["party-collection"]?.toString() },
        { label: "Rose Gold Collection", value: (SHOP_FILTERS.attributes.pa_collection?.terms as any)["rose-gold-collection"]?.toString() },
        { label: "Office Wear", value: (SHOP_FILTERS.attributes.pa_collection?.terms as any)["office-wear"]?.toString() },
        { label: "Festive Collection", value: (SHOP_FILTERS.attributes.pa_collection?.terms as any)["festive-collection"]?.toString() },
        { label: "Oxidised Collection", value: (SHOP_FILTERS.attributes.pa_collection?.terms as any)["oxidised-collection"]?.toString() },
        { label: "Classic Collection", value: (SHOP_FILTERS.attributes.pa_collection?.terms as any)["classic-collection"]?.toString() },
        { label: "Everyday Essentials", value: (SHOP_FILTERS.attributes.pa_collection?.terms as any)["everyday-essentials"]?.toString() },
      ]
    },
    {
      id: "pa_style",
      title: "Style",
      options: [
        { label: "Classic", value: (SHOP_FILTERS.attributes.pa_style?.terms as any)["classic"]?.toString() },
        { label: "Modern", value: (SHOP_FILTERS.attributes.pa_style?.terms as any)["modern"]?.toString() },
        { label: "Elegant", value: (SHOP_FILTERS.attributes.pa_style?.terms as any)["elegant"]?.toString() },
        { label: "Statement", value: (SHOP_FILTERS.attributes.pa_style?.terms as any)["statement"]?.toString() },
        { label: "Traditional", value: (SHOP_FILTERS.attributes.pa_style?.terms as any)["traditional"]?.toString() },
        { label: "Luxury", value: (SHOP_FILTERS.attributes.pa_style?.terms as any)["luxury"]?.toString() },
        { label: "Minimal", value: (SHOP_FILTERS.attributes.pa_style?.terms as any)["minimal"]?.toString() },
        { label: "Vintage", value: (SHOP_FILTERS.attributes.pa_style?.terms as any)["vintage"]?.toString() },
      ]
    },
    {
      id: "pa_stone",
      title: "Stone",
      options: [
        { label: "CZ", value: (SHOP_FILTERS.attributes.pa_stone?.terms as any)["aaa-cubic-zirconia"]?.toString() },
        { label: "Zircon", value: (SHOP_FILTERS.attributes.pa_stone?.terms as any)["zircon"]?.toString() },
        { label: "Pearl", value: (SHOP_FILTERS.attributes.pa_stone?.terms as any)["pearl"]?.toString() },
        { label: "No Stone", value: (SHOP_FILTERS.attributes.pa_stone?.terms as any)["no-stone"]?.toString() },
        { label: "Emerald", value: (SHOP_FILTERS.attributes.pa_stone?.terms as any)["emerald"]?.toString() },
        { label: "Ruby", value: (SHOP_FILTERS.attributes.pa_stone?.terms as any)["ruby"]?.toString() }
      ]
    },
    {
      id: "pa_occasion",
      title: "Occasion",
      options: [
        { label: "Everyday", value: (SHOP_FILTERS.attributes.pa_occasion?.terms as any)["everyday"]?.toString() },
        { label: "Office", value: (SHOP_FILTERS.attributes.pa_occasion?.terms as any)["office"]?.toString() },
        { label: "Casual", value: (SHOP_FILTERS.attributes.pa_occasion?.terms as any)["casual"]?.toString() },
        { label: "Party", value: (SHOP_FILTERS.attributes.pa_occasion?.terms as any)["party"]?.toString() },
        { label: "Festive", value: (SHOP_FILTERS.attributes.pa_occasion?.terms as any)["festive"]?.toString() },
        { label: "Wedding", value: (SHOP_FILTERS.attributes.pa_occasion?.terms as any)["wedding"]?.toString() }
      ]
    },
    {
      id: "pa_finish",
      title: "Finish",
      options: [
        { label: "Rhodium Plated", value: (SHOP_FILTERS.attributes.pa_finish?.terms as any)["rhodium-plated"]?.toString() },
        { label: "Oxidised", value: (SHOP_FILTERS.attributes.pa_finish?.terms as any)["oxidised"]?.toString() },
        { label: "Glossy", value: (SHOP_FILTERS.attributes.pa_finish?.terms as any)["glossy"]?.toString() },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
        <h2 className="font-heading-sm text-charcoal-navy">Filters</h2>
        <button onClick={clearFilters} className="text-ag-purple font-label-md hover:underline">
          Clear All
        </button>
      </div>

      {/* @ts-expect-error - Base UI Accordion props missing in types */}
      <Accordion type="multiple" defaultValue={["categories", "price", "material"]} className="w-full">
        {/* Categories */}
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="py-4 hover:no-underline">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 pt-2">
              {categories.map((cat) => {
                const isSelected = cat.slug === 'all' ? !baseCategorySlug : baseCategorySlug === cat.slug;
                
                // Preserve other filters when changing category, but remove 'category' and 'page'
                const params = new URLSearchParams(searchParams.toString());
                params.delete('category');
                params.delete('page');
                
                const href = cat.slug === 'all' 
                  ? `/shop?${params.toString()}`
                  : `/collections/${cat.slug}?${params.toString()}`;

                return (
                  <Link
                    key={cat.slug}
                    href={href}
                    scroll={false}
                    aria-current={isSelected ? "page" : undefined}
                    onClick={() => cat.slug !== 'all' && trackCollectionClick(cat.slug, "shop-filters")}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center">
                      <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${isSelected ? 'bg-ag-purple border-ag-purple' : 'border-outline group-hover:border-ag-purple'}`}>
                        {isSelected && <svg className="w-3 h-3 text-white block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path></svg>}
                      </div>
                    </div>
                    <span className={`font-body-md ${isSelected ? 'text-ag-purple font-medium' : 'text-on-surface-variant group-hover:text-charcoal-navy'}`}>
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price */}
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-4 hover:no-underline">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex flex-col flex-1">
                  <span className="text-xs text-on-surface-variant mb-1">Min (₹)</span>
                  <input
                    type="number"
                    min="0"
                    aria-label="Minimum price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-ag-purple"
                  />
                </div>
                <span className="text-on-surface-variant mt-5">-</span>
                <div className="flex flex-col flex-1">
                  <span className="text-xs text-on-surface-variant mb-1">Max (₹)</span>
                  <input
                    type="number"
                    min="0"
                    aria-label="Maximum price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-outline-variant/50 rounded px-3 py-2 text-sm focus:outline-none focus:border-ag-purple"
                  />
                </div>
              </div>
              <Button onClick={handlePriceApply} variant="outline" className="w-full h-9">
                Apply
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Dynamic Attribute Filters */}
        {filters.map((filter) => {
          const currentValues = searchParams.get(filter.id)?.split(',') || [];
          return (
            <AccordionItem key={filter.id} value={filter.id} className="border-none">
              <AccordionTrigger className="py-4 hover:no-underline">{filter.title}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3 pt-2" role="group" aria-label={`Filter by ${filter.title}`}>
                  {filter.options.map((opt) => {
                    if (!opt.value) return null;
                    const isSelected = currentValues.includes(opt.value);
                    return (
                      <label key={opt.label} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleQueryString(filter.id, opt.value!)}
                          className="w-4 h-4 rounded border-outline-variant/50 text-ag-purple focus:ring-ag-purple"
                        />
                        <span className={`font-body-md ${isSelected ? 'text-charcoal-navy font-medium' : 'text-on-surface-variant group-hover:text-charcoal-navy'}`}>
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}

        {/* Special Toggles */}
        <AccordionItem value="special" className="border-none">
          <AccordionTrigger className="py-4 hover:no-underline">More Filters</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={searchParams.get('featured') === 'true'}
                  onChange={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (params.get('featured') === 'true') params.delete('featured');
                    else params.set('featured', 'true');
                    params.set('page', '1');
                    router.push(pathname + "?" + params.toString(), { scroll: false });
                  }}
                  className="w-4 h-4 rounded border-outline-variant/50 text-ag-purple focus:ring-ag-purple"
                />
                <span className="font-body-md text-on-surface-variant group-hover:text-charcoal-navy">Featured</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={searchParams.get('new_arrivals') === 'true'}
                  onChange={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (params.get('new_arrivals') === 'true') params.delete('new_arrivals');
                    else params.set('new_arrivals', 'true');
                    params.set('page', '1');
                    router.push(pathname + "?" + params.toString(), { scroll: false });
                  }}
                  className="w-4 h-4 rounded border-outline-variant/50 text-ag-purple focus:ring-ag-purple"
                />
                <span className="font-body-md text-on-surface-variant group-hover:text-charcoal-navy">New Arrivals</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={searchParams.get('on_sale') === 'true'}
                  onChange={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (params.get('on_sale') === 'true') params.delete('on_sale');
                    else params.set('on_sale', 'true');
                    params.set('page', '1');
                    router.push(pathname + "?" + params.toString(), { scroll: false });
                  }}
                  className="w-4 h-4 rounded border-outline-variant/50 text-ag-purple focus:ring-ag-purple"
                />
                <span className="font-body-md text-on-surface-variant group-hover:text-charcoal-navy">On Sale</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={searchParams.get('stock_status') === 'instock'}
                  onChange={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (params.get('stock_status') === 'instock') params.delete('stock_status');
                    else params.set('stock_status', 'instock');
                    params.set('page', '1');
                    router.push(pathname + "?" + params.toString(), { scroll: false });
                  }}
                  className="w-4 h-4 rounded border-outline-variant/50 text-ag-purple focus:ring-ag-purple"
                />
                <span className="font-body-md text-on-surface-variant group-hover:text-charcoal-navy">In Stock Only</span>
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
