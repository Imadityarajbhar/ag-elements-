export const HOMEPAGE_LINKS = {
  hero: {
    shopCollection: '/shop',
    exploreBridal: '/shop',
  },
  carousels: {
    bestSellers: '/shop?featured=true', 
    trending: '/shop?new_arrivals=true',
    customerFavorites: '/shop?featured=true',
  },
  editorial: {
    bridalEdit: '/shop?search=bridal',
    everydayStacking: '/shop?search=everyday',
    aboutStory: '/about',
  },
  categories: {
    necklaces: '/collections/necklaces',
    bracelets: '/collections/bracelets',
    earrings: '/collections/earrings',
    rings: '/collections/rings',
  },
  instagram: {
    profile: '#', // TODO: Add official AG Elements Instagram URL (e.g., https://instagram.com/agelements)
    posts: [
      { id: 1, url: '/collections/necklaces' },
      { id: 2, url: '/collections/bracelets' },
      { id: 3, url: '/collections/earrings' },
      { id: 4, url: '/collections/rings' },
      { id: 5, url: '/collections/necklaces' },
    ]
  }
};
