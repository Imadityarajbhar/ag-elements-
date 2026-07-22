# Storefront Link Audit & Fix Report

Full-site audit of every customer journey (navigation, homepage, collections, products, search, and every
hardcoded `/collections/` reference in `src`), cross-checked against the live WooCommerce REST API
(`agelements.in`), with every discovered broken or low-relevance destination fixed. WooCommerce remained the
single source of truth throughout — no products, categories, or data were invented.

## Summary

| Metric | Result |
|---|---|
| Live published products | 114 |
| Live WooCommerce categories | 18 |
| Customer-facing 404s found | 0 (kada/mangalsutra/payal/kids correctly 404 — see note) |
| Broken/dead links found | 7 distinct issues, across 10 files |
| "Coming Soon" / empty-collection states | 0 |
| Generic `/shop` catch-alls replaced with a relevant destination | 3 |

## Audit table

| Component | Current Route | Destination | WooCommerce Category | Product Count | Status |
|---|---|---|---|---|---|
| Header / Mobile Menu / Footer | Necklaces, Bracelets, Bangles, Earrings, Rings, Men's Bracelet, Men's Necklace | `/collections/*` | 609, 546, 72, 67, 545, 613, 589 | 25, 21, 1, 15, 18, 1, 23 | OK (already fixed in prior audit pass) |
| Homepage — Hero "Bridal Collection" | was `/shop` | `/shop?pa_occasion=574` | pa_occasion:wedding | 25 | **Fixed** |
| Homepage — Editorial "Bridal Collection" edit | was `/shop` | `/shop?pa_occasion=574` | pa_occasion:wedding | 25 | **Fixed** |
| Homepage — Editorial "Everyday Stacking" edit | was `/shop` | `/collections/everyday` (new) | 590 | 90 | **Fixed** |
| Homepage — Shop by Category grid | `/collections/{necklaces,bracelets,earrings,rings}` | same | 609/546/67/545 | 25/21/15/18 | OK, no change |
| Homepage — Best Sellers / Trending / Customer Favorites "view all" | `/shop` | `/shop` | best-sellers (549) has 0 live products | 0 | OK — `/shop` is correct here; a dedicated link would be an empty collection |
| 404 page recovery tiles | Necklaces, Earrings, Rings, **Mangalsutra** | Mangalsutra → **Bracelets** | 543 → 546 | 0 → 21 | **Fixed** (dead category on the recovery page itself) |
| Product page breadcrumb | `/collections/{categoryName.toLowerCase()}` | `/collections/{validated slug}` or `/shop` | n/a (logic bug) | n/a | **Fixed** — see root cause below |
| Gifting hub — "Shop by Occasion" (3 tiles) | `/shop?attribute_term={id}` | `/shop?pa_occasion={id}` | pa_occasion: wedding/festive/everyday-wear | 25 / 47 / 71 | **Fixed** — was silently ignored, showing all 114 products |
| Shop/Collection filter sidebar (`ShopFilters.tsx`) | hardcoded list incl. Kada/Mangalsutra/Payal/Kids | derived from `COLLECTION_TITLES` | — | — | **Fixed** |
| Search (`/api/products/search`) | could route to real-but-unlinked categories (office, party, festive, mens-ring) | only routes to categories with a real collection page | — | — | **Fixed** |
| Search synonyms (`lib/search.ts`) | `anklet(s)` → dead `payal` slug; `bridal` → nonexistent `bridal-collection` slug | `anklet(s)` → `anklets` (547); dead `bridal` synonym removed | 547 | 4 | **Fixed** |
| `sitemap.ts` collection routes | hardcoded `['necklaces','rings','earrings','bracelets','sets']` (`sets` never existed) | derived from `COLLECTION_CONFIG` keys | — | — | **Fixed** |
| `shop-filters.ts` — `neckpieces` (73) | referenced a category deleted from WooCommerce since the prior audit pass | removed | 73 (404 on lookup) | 0 | **Fixed** |
| `/collections/kada`, `/mangalsutra`, `/payal`, `/kids` | no live WooCommerce category exists for any of them (confirmed 404 on `GET /products/categories/{id}`); their former products are now filed under other categories | intentionally not routable — no destination would be genuine | none | 0 | **Correct as-is**: renders the app's real "not found" page, not a fake empty collection. No UI still links to these slugs. |

## Root causes

1. **Product breadcrumb used the wrong field.** `src/app/product/[slug]/page.tsx` built its breadcrumb link from `product.categories[0].name.toLowerCase()` — the *name* of whichever WooCommerce category happened to sort first (by category ID), not a slug validated against the frontend's actual routes. Many products carry categories like "Everyday," "Office," or "Party" (WooCommerce housekeeping/occasion tags) with lower IDs than their real "Necklaces"/"Rings" category, so the breadcrumb could easily point at a slug with no collection page at all.
2. **Gifting hub used an ambiguous legacy query param.** `/shop?attribute_term=574` set `attribute=pa_material,pa_gender,pa_collection` (three unrelated taxonomies) while `574` is actually a `pa_occasion` term ID. WooCommerce couldn't resolve the mismatch and silently returned the entire unfiltered catalog — not a 404, but not the "Wedding & Bridal" results the tile promised either.
3. **Three separate hardcoded collection lists had drifted from the real config.** `ShopFilters.tsx`, `sitemap.ts`, and `lib/search.ts` each maintained their own independent list of category slugs instead of reading from `collections.ts` (the single source of truth established in the prior audit pass). Each had gone stale in a different way — dead slugs, a phantom slug, and a synonym pointing at a deleted category.
4. **Live WooCommerce data changed again since the last fix.** Category 73 (`neckpieces`) — kept intentionally last time because it was still live — has since been deleted from WooCommerce entirely (confirmed via direct `GET /products/categories/73` → 404 today). This is exactly the class of drift the `COLLECTION_TITLES`/`COLLECTION_MAP` single-source-of-truth refactors (fix #3) are meant to make self-correcting going forward.
5. **Two homepage CTAs pointed at `/shop` where a more relevant destination existed.** "Bridal Collection" had no dedicated WooCommerce category, but 25 live products carry the `pa_occasion: wedding` term. "Everyday Stacking" pointed at `/shop` despite "Everyday" being WooCommerce's single largest category (90 products, more than any other).

## Files modified

- `src/config/shop-filters.ts` — removed dead `neckpieces` (73) entry
- `src/config/collections.ts` — added `everyday` collection (590)
- `src/config/homepage-links.ts` — Bridal CTAs → `/shop?pa_occasion=` (derived from `SHOP_FILTERS`, not a bare literal); Everyday Stacking → `/collections/everyday`
- `src/app/not-found.tsx` — replaced dead Mangalsutra recovery tile with Bracelets
- `src/app/product/[slug]/page.tsx` — breadcrumb now resolves via `COLLECTION_MAP`, falls back to `/shop` if no product category has a live page
- `src/components/shop/ShopFilters.tsx` — category filter list now derived from `COLLECTION_TITLES`
- `src/app/api/products/search/route.ts` — category auto-navigate/suggestions gated on `COLLECTION_MAP`
- `src/lib/search.ts` — fixed `anklet(s)` synonym, removed dead `bridal` synonym
- `src/app/sitemap.ts` — collection routes derived from `COLLECTION_CONFIG` keys
- `src/app/gifting/page.tsx` — occasion tiles now use `pa_occasion=` instead of legacy `attribute_term=`

**Not modified** (already correct, verified during the audit): `Header.tsx`, `MobileMenu.tsx`, `Footer.tsx`, `SearchOverlay.tsx`, homepage "Shop by Category" grid, `collections/[slug]/page.tsx`.

## Validation results

- **TypeScript:** `npx tsc --noEmit` — 0 errors.
- **Production build:** `npm run build` — succeeds, all 65 routes compiled, no build errors.
- **ESLint** on all 10 touched files: 21 pre-existing errors / 6 warnings surfaced (untyped `any` casts in `ShopFilters.tsx`'s attribute-filter definitions, two async components declared inside `product/[slug]/page.tsx`'s render body, one unused helper). Verified via diff inspection that **none of these lines were touched by this task** — they predate this fix and are unrelated to routing/links, so left as-is per scope (fixing them would be an unrelated refactor).
- **Live crawl** (dev server + direct WooCommerce API calls) of every route touched:
  - `/collections/{necklaces,bracelets,bangles,earrings,rings,mens-bracelet,mens-necklace,anklets,mens,everyday}` — all render real product grids matching live WooCommerce counts (25/21/1/15/18/1/23/4/4/90).
  - `/collections/{kada,mangalsutra,payal,kids}` — correctly render the app's not-found boundary (no fake "Coming Soon", no phantom grid) — confirmed no remaining UI links to any of these slugs.
  - `/product/classic-gold-rope-chain-necklace` breadcrumb JSON-LD confirmed pointing at a real, live collection (`/collections/everyday`), not a raw category-name guess.
  - `/gifting` — all three occasion tiles confirmed emitting `pa_occasion=574/563/564`.
  - `/` (homepage) — Bridal and Everyday Stacking CTAs confirmed emitting the new hrefs.
  - `/shop` filter sidebar — confirmed no remaining Kada/Mangalsutra/Payal/Kids chips (the one text match found was the product name "Traditional Floral Stone Kada Bracelet," a real, correctly-categorized product — not a dead filter).

## Remaining issues (not fixed — noted, not hidden)

- **Nav breadth is a merchandising choice, not a bug.** "Everyday" (90 products, the largest category in the store) and "Anklets"/"Men's" have working collection pages but aren't linked from the primary Header/MobileMenu/Footer nav. Adding them there is a product decision beyond "fix broken links" and wasn't made unilaterally.
- **Breadcrumb category choice is "first resolvable," not "most specific."** The product-page fix guarantees the breadcrumb link always resolves to a real page, but if a product carries both "Everyday" and "Necklaces," it picks whichever WooCommerce returns first (lowest category ID) rather than always preferring the core product-type category. No customer-facing link is broken by this, but the label shown isn't always the most on-brand one.
- **`src/services/mock/products.ts`** still contains fixture data referencing `kada`/`mangalsutra` categories — confirmed unused by any import in `src` (inert, not customer-reachable), left untouched.
- **Pre-existing ESLint debt** noted above (21 errors / 6 warnings) — unrelated to routing, out of scope for this fix.
