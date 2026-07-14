import { SHOP_FILTERS } from './shop-filters';

export interface CollectionConfig {
  id: number;
  title: string;
  bannerImage: string;
  storyHeading: string;
  storyText: string;
  seoDescription: string;
}

// Maps frontend Collection URL slugs to robust configuration data
export const COLLECTION_CONFIG: Record<string, CollectionConfig> = {
  necklaces: {
    id: SHOP_FILTERS.categories.neckpieces,
    title: 'Necklaces',
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAViqDQIVVy8z4CPXgOfyAooGfLdxYJh3Wr6bnqxAiAPpCTqjQ8E4OcpIgNuTIknTrZ8gXwsspLree11mtO5Gt_am_yQzE9flYPE4XMtqmDnSqBasV_GCzHDlxiczPLuuQAkmaYY_6I8AJxIy7W1hjsob9UPCRwln7XOxMPi1h9PR9BHW9Gr0ITQN26erNyPwifn3kk0AGKUYlAdoQlYSWWxSFio65BuWDQ5KZkvempRsV5EJze4T29zA',
    storyHeading: 'The Art of the Necklace',
    storyText: 'From delicate chains designed for everyday stacking to bold statement pieces that command the room, our necklace collection celebrates the timeless elegance of 925 sterling silver. Discover pieces that rest close to your heart.',
    seoDescription: 'Shop our curated collection of 925 sterling silver necklaces. From everyday chains to statement pieces, discover Kuntal Kaustubh Kathane\'s timeless designs.',
  },
  bracelets: {
    id: SHOP_FILTERS.categories.bracelets,
    title: 'Bracelets',
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbgh3H-hSJ9jP5dEIraPESMpSZe-khIlIE0aMQergyEF_Vev3TfKeu5thuhX3uwFaN0ziIjCLqKnPBPXPAzgPR-_HNHFvr3_yClZzJo15pFfUi8xGPbGVhaYygARQWZTotpUb9YWtyTYNCvHRjdY1Gq982TfcByBgjXd7y8fRqxBW8-N18l9NuCqJGNvmOWFz8d3LnYJHFKBG3Ft3u0F4V-Iwz-V60HolpHJ35jN5iDeVy7la55ZtugQ',
    storyHeading: 'Elegance at Hand',
    storyText: 'Wrap your wrists in pure elegance. Our bracelet collection features intricately designed cuffs, fluid chains, and modern bangles that catch the light with every movement.',
    seoDescription: 'Explore exquisite 925 sterling silver bracelets by AG Elements. Discover cuffs, chains, and bangles crafted for everyday luxury and elegant stacking.',
  },
  earrings: {
    id: SHOP_FILTERS.categories.earrings,
    title: 'Earrings',
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgYShAiK_WIPmW8XzCj504v1jLWuG1cfWTnZsg933i2ucADqVunBR1qG5SLt6vnry3FMYd5IjpuhbkkvpxbiBxVKdw1xPl-_cypjd1BUkgfnLWl5Z2bOp_Ch46lWO9hlVuedtU4st5dLRYuHi67StD9Fie2aQXNqIQLW4Bo1gwfo8_dl16zt-SlIi0eD1QdfaWRkmCg9NsIJWLg6avXY2r9HuoLEivcUOSNR8r0dkjK-reWSX-Jr0odA',
    storyHeading: 'Frame Your Brilliance',
    storyText: 'Whether you prefer the subtle shine of minimalist studs or the dramatic sway of ornate drops, our silver earrings are crafted to illuminate your face and elevate any ensemble.',
    seoDescription: 'Discover our beautiful collection of 925 sterling silver earrings. From minimalist studs to dramatic drops, find your perfect everyday or occasion wear.',
  },
  kada: {
    id: SHOP_FILTERS.categories.kada,
    title: 'Kada',
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6KV5FbcYeAvUedrYFz719aD7lOCpvTN33Cni1_mlGhzExy2mJPh3D30VPZpM88t-Ia0BD4drWRiOsQ56IXABSwJXzG4ZVwTdeKcF6D7FGRZUuLoT_n6D7IGtusFHMyJDmZi3TBydChYIbzkb48bIVYCE4pMbNthxC50IqJ9MkKHzToc_7r7Z3kJlkew7Y1ds6-GaY_unWNzLR8SfstYVMxX9JN6TPEcG27t1YoKsb618bs43YzTP18A',
    storyHeading: 'Heritage Reimagined',
    storyText: 'A symbol of strength and tradition, our Kada collection blends ancient craftsmanship with modern design sensibilities. Substantial, striking, and undeniably premium.',
    seoDescription: 'Shop our exclusive range of 925 sterling silver Kadas. Traditional craftsmanship meets modern design in these substantial, premium statement pieces.',
  },
  mangalsutra: {
    id: SHOP_FILTERS.categories.mangalsutra,
    title: 'Mangalsutra',
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqgyRxlWbI_M3PLo5C-lGdFYsm1yQ67JmCtqb--2ZZQ23w3bTtqYfyfbRrWzerIqL8gyA2Ow8DmNp5Q71aR2CvdoleSaWSsgBFrewpEiBr61srFNGyMm7d2klQMBxSMwQcQCcTIRgKmBMn2fIHrxUNONU1ljUGEW_kXW57GhRLPSHvrFaBXL6dz8aN2OuAoci6iu_JmH40qnYE-_PLqELcDXWPHIALajwql66KIHdH9KtaTdNSGKPQ-Q',
    storyHeading: 'A Promise in Silver',
    storyText: 'Redefining bridal elegance. Our silver mangalsutras respect the profound cultural significance of this sacred thread while offering a sleek, modern aesthetic for the contemporary woman.',
    seoDescription: 'Discover our elegant 925 sterling silver Mangalsutra collection. Modern designs that honor traditional promises, crafted specifically for the contemporary woman.',
  },
  rings: {
    id: SHOP_FILTERS.categories.rings,
    title: 'Rings',
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-sh3tO5RAyWg2MmHjF_iJZsB33tZzzZ3dYnBUDIGke_7G2QryEp28ofzfcgQHvXdVSVMcHr5D7QLy8rKpe39oeTPl5PyRA84DMJxRDeL2PqHbuf6FTIXRGEJYsy6OxtazyCDKjrBVKl2YVsyZZsNYIltKW2RVWVIdDYXRIxR7WuboAV2JavY2JLYQ7LH_0I548FyzpLYZYVUHSoY1hq43QkdJqz3kgNWO9duwPijX67GiLGbqwesnbA',
    storyHeading: 'Signature Statements',
    storyText: 'From subtle bands designed for seamless stacking to intricate cocktail rings that demand attention, our collection ensures your hands are always dressed in luxury.',
    seoDescription: 'Shop our curated collection of 925 sterling silver rings. Discover everyday stacking bands and bold statement cocktail rings crafted for luxury.',
  },
  anklets: {
    id: SHOP_FILTERS.categories.anklets,
    title: 'Anklets',
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGMSuTaZDwlElLilXUJ8xo7X7DtGQcpIz_Rs3jz3zbq7qsRedFc3kAEA2rqkyNOO3KRtYtFgz9EBuZ1xNzoqxjOZWZq5_ceTqGAUgHOuXN-iVQ-Gl56mr3Wnyd3g31BksWGrEGgiXYKFTodk3Rx6b_wLOKh_n5F-clqmCQVFPpW4Pgl1RTLIjexTA5tmZRwV5AoJhEwgJ9pee7-S2FolaN9EQbsXAXsey58d2lIB11Skx3-gDjBb0ikg',
    storyHeading: 'Poetry in Motion',
    storyText: 'Delicate details that grace your every step. Our silver anklets are designed to add a touch of whimsy and elegance to your everyday journey.',
    seoDescription: 'Explore our beautiful 925 sterling silver anklet collection. Delicate, elegant designs that add a touch of luxury to your every step.',
  },
  mens: {
    id: SHOP_FILTERS.categories.mens,
    title: "Men's",
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVPG_NxUQQz2Jcu8HJfHRV12nWworIMPWOwMwvagcRprZYeT3xBcfW_m56h-jz47MSacfFos8eF5cUqojKD_4Ui0IXROEqeX_jdhGR2gWp899esWEZFiQiiHoYxF8Pxxfl5sjr2empr26C_Vav7rZEOb0atBAwUYdbrdxBr-jkdrLpGWtw8OwxHGYAcXHrUnDrOJd0bUINio6hgZvL8Cl5P1RP0njtEvhdkqjpAXHKOnMCoeIrxSGYSQ',
    storyHeading: 'Refined Masculinity',
    storyText: 'Bold, structured, and uncompromisingly premium. Our men\'s collection features robust silver chains, statement rings, and heavy kadas built for the modern gentleman.',
    seoDescription: 'Discover our exclusive 925 sterling silver Men\'s jewellery collection. Shop bold chains, statement rings, and premium kadas for the modern gentleman.',
  },
};

// Backwards compatibility for existing imports
export const COLLECTION_MAP: Record<string, number> = Object.fromEntries(
  Object.entries(COLLECTION_CONFIG).map(([slug, config]) => [slug, config.id])
);

export const COLLECTION_TITLES: Record<string, string> = Object.fromEntries(
  Object.entries(COLLECTION_CONFIG).map(([slug, config]) => [slug, config.title])
);
