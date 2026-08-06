export interface Product {
  product_id: string;
  name: string;
  category: string; // 'Jet Series' | 'Mesh Series' | 'Platinum Series' | 'Rainbow Chakra Series' | 'Soft Series' | 'TAJ Series' | 'TAO Series'
  search_tags: string; // comma-separated or string keywords
  short_description: string;
  image: string;
  link: string;
}

export const PRODUCT_SERIES_LIST = [
  'All',
  'Jet Series',
  'Mesh Series',
  'Platinum Series',
  'Rainbow Chakra Series',
  'Soft Series',
  'TAJ Series',
  'TAO Series'
] as const;

export const CATALOG_PRODUCTS: Product[] = [
  {
    product_id: 'rainbow-4020',
    name: 'Rainbow Chakra Mat™ 4020 Firm PEMF',
    category: 'Rainbow Chakra Series',
    search_tags: 'chakra, pemf, rainbow, meditation, firm, far infrared, amethyst, 7 gemstones',
    short_description: 'Compact gemstone mat for chakra alignment with FIR, PEMF & Red Light Therapy.',
    image: 'https://healthyline.com/cdn/shop/files/Amethyst-Sodalite-Blue-Lace-Agate-Green-Aventurine-Yellow-Aventurine-Carnelian-Red-Jasper-Rainbow-Mat-4020-Firm-PEMF-InframatPro-4th-edition_1_9f2602ce-44a3-448f-a368-5f14e04e4c1c.webp?v=1772470017',
    link: 'https://healthyline.com/products/rainbow-chakra-pemf-farinfrared-red-light-mat?variant=47076949655604'
  },
  {
    product_id: 'taj-3624',
    name: 'TAJ Mat™ 3624 Firm PEMF InframatPro®',
    category: 'TAJ Series',
    search_tags: 'taj, amethyst, jade, tourmaline, pemf, firm, heated mat',
    short_description: 'Triple-gemstone therapeutic mat with Tourmaline, Amethyst, and Jade + PEMF & FIR.',
    image: 'https://healthyline.com/cdn/shop/files/TAJ-3624-Firm-PEMF-InframatPro-1.webp?v=1772470000',
    link: 'https://healthyline.com/products/taj-mat-3624-firm-pemf-inframatpro'
  },
  {
    product_id: 'tao-1818',
    name: 'TAO Chair Mat™ 1818 Soft InframatPro®',
    category: 'TAO Series',
    search_tags: 'tao, chair, cushion, tourmaline, onyx, office, seating, heated',
    short_description: 'Ergonomic heating cushion with Tourmaline & Bianstone for office or car seats.',
    image: 'https://healthyline.com/cdn/shop/files/TAO-1818-Soft-InframatPro-1.webp?v=1772470010',
    link: 'https://healthyline.com/products/tao-chair-mat-1818-soft'
  },
  {
    product_id: 'jet-5024',
    name: 'Jet Series™ Full Body PEMF Mat',
    category: 'Jet Series',
    search_tags: 'jet, travel, lightweight, flexible, pemf, portable, body mat',
    short_description: 'High-performance lightweight mat engineered for portable recovery & systemic relaxation.',
    image: 'https://healthyline.com/cdn/shop/files/Amethyst-Sodalite-Blue-Lace-Agate-Green-Aventurine-Yellow-Aventurine-Carnelian-Red-Jasper-Rainbow-Mat-4020-Firm-PEMF-InframatPro-4th-edition_1_9f2602ce-44a3-448f-a368-5f14e04e4c1c.webp?v=1772470017',
    link: 'https://healthyline.com/collections/jet-series'
  },
  {
    product_id: 'mesh-7224',
    name: 'Mesh Series™ Flexible Body Mat',
    category: 'Mesh Series',
    search_tags: 'mesh, flexible, jade, tourmaline, breathable, full body',
    short_description: 'Flexible mesh design with embedded Jade & Tourmaline spheres for maximum comfort.',
    image: 'https://healthyline.com/cdn/shop/files/TAJ-3624-Firm-PEMF-InframatPro-1.webp?v=1772470000',
    link: 'https://healthyline.com/collections/mesh-series'
  },
  {
    product_id: 'platinum-7230',
    name: 'Platinum Series™ Full Spectrum Mat',
    category: 'Platinum Series',
    search_tags: 'platinum, advanced, full body, pemf, photon, customizable frequency',
    short_description: 'Ultimate multi-technology wellness system featuring fully customizable PEMF frequency control.',
    image: 'https://healthyline.com/cdn/shop/files/Amethyst-Sodalite-Blue-Lace-Agate-Green-Aventurine-Yellow-Aventurine-Carnelian-Red-Jasper-Rainbow-Mat-4020-Firm-PEMF-InframatPro-4th-edition_1_9f2602ce-44a3-448f-a368-5f14e04e4c1c.webp?v=1772470017',
    link: 'https://healthyline.com/collections/platinum-series'
  },
  {
    product_id: 'soft-6024',
    name: 'Soft Series™ Pillow Top Thermal Mat',
    category: 'Soft Series',
    search_tags: 'soft, pillow, sleep, comfort, infrared, memory foam, spine support',
    short_description: 'Ultra-plush memory foam topped heating pad for deep restorative sleep & spine support.',
    image: 'https://healthyline.com/cdn/shop/files/TAO-1818-Soft-InframatPro-1.webp?v=1772470010',
    link: 'https://healthyline.com/collections/soft-series'
  }
];
