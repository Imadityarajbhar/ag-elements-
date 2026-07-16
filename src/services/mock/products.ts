import { Product } from '../../types/product';

// Mock data reflecting premium jewelry design
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'The Heritage Chain',
    slug: 'the-heritage-chain',
    price: 4500,
    regularPrice: 5200,
    salePrice: 4500,
    description: 'A classic 925 sterling silver chain that embodies everyday elegance. Beautifully crafted to sit gracefully on the collarbone.',
    shortDescription: 'Classic elegance with a modern touch.',
    images: [
      { id: 'img1_1', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL6Bqx_BxUfm5yqDK-NZS96-g67wYit2acRdUfG2Ob81cJORmAkr_LFePRNedOpgJDdhzLFfeOCmvdAd8QmXbNRl2bQmcG3N88-u5JXUxGKIJRe1NY5tpq5vu48H3J2yrlhbO00i0BIPGQ62XWXj0mmxGmMl0196EF_lKJORhpi0Pq9ij_rNsaDoulWXu1OFCng4RUyc4dpNTY8DL-0fSRqbZqRojmydwd97iQr1EdXTXI8nAvMW43mA', alt: 'The Heritage Chain' },
      { id: 'img1_2', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiFqjAygKTWEdktVX56K0eEuonB75VtROtaQ_wN4P2YPGIBIeXkZNDrTaGgxXpo637gosuEMvL6v6Aa1Xti6fCHRsj9WHwsrpIHqPn9VYSo21-3JyGgANk0SQHaShkzjjUbSMZKHLsFhUf2g_rnQmJRJ-g5rRnZagw3Tu-Y-VcurV4nfZOnTHSfnIQk3MCCn4zur29-ug4WsKwJZyb0GCs5RQZrfqpSdOG-4KlymG6iy6VD8IFQ_JG5A', alt: 'The Heritage Chain Worn' }
    ],
    categories: [{ id: 'cat1', name: 'Necklaces', slug: 'necklaces' }],
    inStock: true,
    sku: 'AG-NK-001',
    badgeType: 'sale',
    material: 'Sterling Silver 925',
    occasionTags: ['Everyday Wear', 'Gifting']
  },
  {
    id: '2',
    name: 'Bold Link Collar',
    slug: 'bold-link-collar',
    price: 12800,
    description: 'A statement architectural piece featuring thick interlocking links of sterling silver.',
    shortDescription: 'Statement architectural piece.',
    images: [
      { id: 'img2_1', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSeBT0XcyWan9aPbrJLsETU9aGTe5fGALVFMROtaXh6Zyd8snn_SOjD8vPCqbXz9Ct8LfYRw16v2wlALZvQlOGY8lokfokTksae-mfTI7nhF_dMXOji9zUUngFuktTPvZAWID9T-c2kS1aXoYuhEZAcu1HS2YTnXvF54yDCzZQxyW6U3lRN9riBLrDBzpWuKWxFM0Sqyzn2kNwIhGXVpUiYmHkNml8DyGIDfXH5krlWT_AQMI3lErkRw', alt: 'Bold Link Collar' },
      { id: 'img2_2', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHko9X2k7lnQstgTbmgYeZkWXZbvMJfV25OnmtqA8WmdSHfuF7H_vsDjmK1TOprkWuvnxnw3caJx09xPru825xUOl7mLjjffYFOVr8YHoOJ80Fh_FTrjeHeJ3g_rqxg6EO3foPahG9bdOPozvk_6qYlXxx_LCHhLoo_ySgAL6fvGmwijlMrQYnjpcftD7PGwVT-5fmjJ-QSmOlrogKJPZfwVPF_Vk_PSlRcO8WE66JbVvAo-wab3pUuA', alt: 'Bold Link Collar close up' }
    ],
    categories: [{ id: 'cat1', name: 'Necklaces', slug: 'necklaces' }],
    inStock: true,
    sku: 'AG-NK-002',
    material: 'Sterling Silver 925',
    occasionTags: ['Everyday Wear']
  },
  {
    id: '3',
    name: 'Modern Mangalsutra',
    slug: 'modern-mangalsutra',
    price: 6200,
    description: 'A contemporary take on a timeless tradition, blending onyx beads with sterling silver.',
    shortDescription: 'Contemporary timeless tradition.',
    images: [
      { id: 'img3_1', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCl2NmkwHh3ZtvNTnL05q36oyeRJrtFz-62GGBsYoRcfF7tX8vG-P-RkmGz9Z8MDwSzbW8GCTNsANvUYtFY_dIrAPGrZZ1STXLvJPvn7QG-J4hzR2nAVAjt7G7NtlgoZGLrf0KCoZE3dXhm3YkRE1cWoCF-qnq7HpMePv-WFPAw0rmkGDEwQqIxAgdokfrc4uz24gFCetk_plLguFfQrqKeMRtUQZh8H4h89s4VkKosrJ_eNLhyXBagGQ', alt: 'Modern Mangalsutra' },
      { id: 'img3_2', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJc7kDRSNTHH83NT1LGpVD00UZTowbsZ6UWulCGdwaohjAEtmaQSveNYMZgXTm9oLZysYwsELFbzZQjYloYHI3EHGF8tQqjUSf-5__9-3LTd0T0wNI0Uv9aD8Bm0kYCwFkbDELNR-iRe7C12Kdid93gkowtAwfPZLB8D9saNN4FM8Z23utPpvIiMu-EIL-ik34oKA8CxeIZmsVdtz3Mop8gOHxwFbfzuWWb1a06VliNeE38n2c4l3q8g', alt: 'Modern Mangalsutra 2' }
    ],
    categories: [{ id: 'cat2', name: 'Mangalsutra', slug: 'mangalsutra' }],
    inStock: true,
    sku: 'AG-MS-001',
    badgeType: 'bestseller',
    material: 'Sterling Silver & Onyx',
    occasionTags: ['Bridal', 'Everyday Wear']
  },
  {
    id: '4',
    name: 'Oxidized Bar Pendant',
    slug: 'oxidized-bar-pendant',
    price: 3800,
    description: 'A raw, textured oxidized silver bar pendant offering an edgy twist to classic silver.',
    shortDescription: 'Edgy twist to classic silver.',
    images: [
      { id: 'img4_1', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxEQyyA5a8sNhdStZIa4Fjiyd0wM2yGiYjdqCczeK2P6ZHcL3Vfi6nTJsesWsJ3akajJCKj_h6be654UJvTf2ImVhbdbbDmi8sMSc-84bjSo8Vnc1hfJu_9UwWdQb7UhuvhAY6R-XKdq9BVghL0-x64oEWNv0_jpqvm5zNsJnRChxRSMqjK_Yq8Ax3y0GVB0gqvmN4zZz_oD-LUd3UpPIBDkBEuPv0OvAcre2Mr56L9HVZCSp9NbHZZg', alt: 'Oxidized Bar Pendant' },
      { id: 'img4_2', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_RLGn7P7j6Kk-DrA6s67kChmceYRQhQDqAsmMBW7Eb3VzMw7Dwu77V4VZ0IGYhfUjW7ohrtVcOKKFuGZ00AcKcVVaHJfvdwYo2IbfqdVxWRB2N5gRjA01oouX0ftlnrmV-PeCOsEEB4kibi7yBO35PGfEboJagBKws5pwgsoCsrYbln1bON-LHVuVScBFXVBF6iK-C1ceO3gCqL86iX_dqmkL1fzrzpgzE1L7h5zghSBwjMKpTHlSgg', alt: 'Oxidized Bar Pendant 2' }
    ],
    categories: [{ id: 'cat1', name: 'Necklaces', slug: 'necklaces' }],
    inStock: true,
    sku: 'AG-NK-003',
    badgeType: 'new',
    isNewArrival: true,
    material: 'Oxidized Silver',
    occasionTags: ['Everyday Wear']
  },
  {
    id: '5',
    name: 'Vine Leaf Layered Necklace',
    slug: 'vine-leaf-layered-necklace',
    price: 3200,
    description: 'Intricate vine leaf detailing across a multi-layer sterling silver chain.',
    images: [
      { id: 'img5_1', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxPfme73-jf2u-faxuAkD76jIExYHD_vjuQ2m8DH3VD0a0uX9qS_Wt3ySqmlwPp3JZXUbxrKWa1yrZ3yOOwlI1nL2aNo2_uoBx5cD01l5cRjOBJVUemyYEsLoNRNcZZJfj6LQsENvsAClKFph-EXd2bOmtzf08RBcL8r9xa7niexqqrLy5I1gauI-BCZd729Bsv9l3inKWMQhcuUXiC4jCnZOJzvu8fUMgjShCKG88ls_S3NzT-dLVhQ', alt: 'Vine Leaf Necklace' }
    ],
    categories: [{ id: 'cat1', name: 'Necklaces', slug: 'necklaces' }],
    inStock: true,
    sku: 'AG-NK-004',
    badgeType: 'trending',
    material: 'Sterling Silver 925'
  },
  {
    id: '6',
    name: 'Minimalist Cuff Kada',
    slug: 'minimalist-cuff-kada',
    price: 5400,
    description: 'A smooth, heavy sterling silver kada bracelet perfect for everyday wear.',
    images: [
      { id: 'img6_1', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEMslzySTrSfTdQDkqBWm-8RV8sbUgPS6frHt2UIPAYQ5Wm_-MvF2zCHLaFqf9EhfaSPwViWTD6fJsybv4ikJ73z5Mjj0E1_3PZ1oFqYlC54M0F8TT6Fi3wsIHT5j0wy20uWPHAoUI5LhOvwnNkdEgR4RFl9tNEDwXUVYLibbmRpwKt7qGPo74k9FPjE0rehfQhdlervqSqZToq0spmOOssXgnAJffcDtODUIJdf8qEUZIHEpRg6BKJQ', alt: 'Kada Bracelet' }
    ],
    categories: [{ id: 'cat3', name: 'Kada', slug: 'kada' }],
    inStock: true,
    sku: 'AG-BR-001',
    material: 'Sterling Silver 925'
  },
  {
    id: '7',
    name: 'Pearl Drop Chandelier Earrings',
    slug: 'pearl-drop-chandelier-earrings',
    price: 8900,
    description: 'Elaborate chandelier earrings featuring freshwater pearls suspended in silver.',
    images: [
      { id: 'img7_1', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9469QTryEMm2jJMFczldS2qRO54k_QMYQ5OI-BRyPMOTIQZHYV5igdlY-8_-qTICbMTyAh_qIV2Pz7QyidMa9TURlyFbpTLOdpv92ftfww9UgERU8VB46eQ9xRM0U9V3ipyaf_FEWYGrf3Qf44x3xpki3OCEaMUvqkw535OP-zBErf3XOpBvGOFMNhnKuTb_5CU1gCHzSnB9L1Zva51x_WGMqhRDzdkIBP5eZFMWwVvlCuaM_Mt22TQ', alt: 'Earrings' }
    ],
    categories: [{ id: 'cat4', name: 'Earrings', slug: 'earrings' }],
    inStock: true,
    sku: 'AG-ER-001',
    badgeType: 'sale',
    salePrice: 8900,
    regularPrice: 10500,
    material: 'Sterling Silver & Pearl',
    occasionTags: ['Festive', 'Bridal']
  },
  {
    id: '8',
    name: 'Artisan Forged Signet Ring',
    slug: 'artisan-forged-signet-ring',
    price: 4200,
    description: 'A classic signet ring forged by our master artisans with a matte finish.',
    images: [
      { id: 'img8_1', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL6Bqx_BxUfm5yqDK-NZS96-g67wYit2acRdUfG2Ob81cJORmAkr_LFePRNedOpgJDdhzLFfeOCmvdAd8QmXbNRl2bQmcG3N88-u5JXUxGKIJRe1NY5tpq5vu48H3J2yrlhbO00i0BIPGQ62XWXj0mmxGmMl0196EF_lKJORhpi0Pq9ij_rNsaDoulWXu1OFCng4RUyc4dpNTY8DL-0fSRqbZqRojmydwd97iQr1EdXTXI8nAvMW43mA', alt: 'Ring' }
    ],
    categories: [{ id: 'cat5', name: 'Rings', slug: 'rings' }],
    inStock: true,
    sku: 'AG-RG-001',
    isNewArrival: true,
    badgeType: 'new',
    material: 'Oxidized Silver'
  }
];

export const mockGetProducts = async (): Promise<Product[]> => {
  // Simulate network delay
  return new Promise((resolve) => setTimeout(() => resolve(mockProducts), 500));
};

export const mockGetProductBySlug = async (slug: string): Promise<Product | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProducts.find((p) => p.slug === slug) || null);
    }, 500);
  });
};
