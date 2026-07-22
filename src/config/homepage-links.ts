import { SHOP_FILTERS } from './shop-filters';

const weddingOccasionTerm = SHOP_FILTERS.attributes.pa_occasion.terms.wedding;
const everydayOccasionTerm = SHOP_FILTERS.attributes.pa_occasion.terms.everyday;

export const HOMEPAGE_LINKS = {
  hero: {
    shopCollection: '/shop',
    exploreBridal: `/shop?pa_occasion=${weddingOccasionTerm}`,
  },
  carousels: {
    bestSellers: '/shop',
    customerFavorites: '/shop',
  },
  editorial: {
    bridalEdit: `/shop?pa_occasion=${weddingOccasionTerm}`,
    everydayStacking: `/shop?pa_occasion=${everydayOccasionTerm}`,
    aboutStory: '/about',
  },
  ctaBanner: {
    giftFinder: '/gifting/finder',
  },
  categories: {
    necklaces: '/collections/necklaces',
    bracelets: '/collections/bracelets',
    earrings: '/collections/earrings',
    rings: '/collections/rings',
  },
  instagram: {
    profile: 'https://instagram.com/agelements',
    posts: [
      { id: 1, url: '/collections/necklaces' },
      { id: 2, url: '/collections/bracelets' },
      { id: 3, url: '/collections/earrings' },
      { id: 4, url: '/collections/rings' },
      { id: 5, url: '/collections/necklaces' },
    ]
  }
};
