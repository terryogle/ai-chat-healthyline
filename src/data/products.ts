export interface Product {
  product_id: string;
  name: string;
  category: string;
  search_tags: string;
  short_description: string;
  image: string;
  link: string;
}

export const PRODUCT_SERIES_LIST = [
  'All',
  'Jet Series',
  'Mesh Series',
  'TAJ Series',
  'TAO Series',
  'Rainbow Chakra Series'
] as const;

export const CATALOG_PRODUCTS: Product[] = [
  {
    product_id: 'jet-7224',
    name: 'Jet Mat 72" x 24"',
    category: 'Jet Series',
    search_tags: 'jet series, jet 7224, full body, pemf, photon light, red light, gemstones, tourmaline, jade, amethyst',
    short_description: 'Jet 7224 (72" x 24") is our bestselling full-body Jet model, designed for balanced, head-to-toe therapy coverage. At 72 inches long, it supports full supine sessions for most users, while the 24-inch width fits comfortably on beds, lounge chairs, sofas, the floor, or massage tables, without overwhelming the space. This size has become a customer favorite because it delivers complete body alignment from shoulders to feet while maintaining a streamlined footprint that works easily in most homes. HealthyLine mats are heavier than most — and that\'s intentional. The weight comes from a dense layer of real, natural gemstones embedded throughout the mat. These aren\'t decorative — they are the core of how the mat works. Natural gemstones amplify Far Infrared heat, allowing warmth to penetrate deeper into the body and distribute more evenly across the surface. Gemstones make up over half the total weight of each mat. There is simply no lightweight substitute that delivers the same depth or consistency of heat.',
    image: 'https://healthyline.com/cdn/shop/files/Jet-7224-1000x1000.webp?v=1753389243&width=1920',
    link: 'https://healthyline.com/products/jet-series-pemf-farinfrared-red-light-therapy-mats?variant=45701705629748'
  },
  {
    product_id: 'mesh-7224',
    name: 'Mesh JT Mat™ 72” x 24”',
    category: 'Mesh Series',
    search_tags: 'mesh jt mat, mesh series, jade, tourmaline, flexible, lightweight, far infrared, negative ions, joint wrap',
    short_description: 'Mesh JT Mat™ 72” x 24” is designed for full-body therapy, providing comprehensive coverage to help ease muscle tension and restore energy balance. Ideal for use on a bed, floor, or massage table. For those new to Far Infrared Heat Therapy and Grounding Mats, this is a great introductory product without breaking the bank. The Mesh Series is a Far Infrared Heating Mats that delivers natural Far Infrared Heat. Each has a mesh lining and flexible design that holds round pieces of jade and tourmaline. When heated, the natural gemstones emit far-infrared heat and negative ions to promote relaxation, circulation, and detoxification. The open-mesh design enhances heat penetration while keeping the mats lightweight and breathable, ensuring effective results',
    image: 'https://healthyline.com/cdn/shop/files/Jade-Tourmaline-Mesh-Mat-7224-Soft-InframatPro_1.webp?v=1772562681&width=2000',
    link: 'https://healthyline.com/products/mesh-series-gemstone-inframat-pro?variant=45760085426228'
  },
  {
    product_id: 'taj-7224',
    name: 'TAJ Mat 72” x 24”',
    category: 'TAJ Series',
    search_tags: 'taj mat 7224, taj series, tourmaline, amethyst, jade, pemf, far infrared, red light, photon, full body',
    short_description: 'TAJ Mat™ 72” x 24” delivers full-body therapy with a slightly more compact design, ideal for use on a bed, floor, or massage table. Each mat is filled with pounds of genuine, earth-sourced gemstones—essential for delivering deep, therapeutic benefits. The weight reflects its professional-grade quality, grounding power, and lasting value. The TAJ Series is our legacy model PEMF Far Infrared Heating Mat, combining Heated Gemstone, Far-Infrared, PEMF, Red Light, and Negative Ion Therapy to promote muscle relaxation, improve circulation, and manage arthritic pain. The unique combination of natural gemstones - crushed Amethyst and rounded Jade and Tourmaline - release natural far infrared heat while applying targeted pressure to ease muscle tension. Whether used for professional treatments or daily self-care, the TAJ Series delivers a tailored wellness experience with the largest variety of sizes.',
    image: 'https://healthyline.com/cdn/shop/files/Taj-7224-1000x1000.webp?v=1758896606&width=1000',
    link: 'https://healthyline.com/products/taj-series-mats-pemf-photon-inframat-pro?variant=45755447967796'
  },
  {
    product_id: 'amethyst-1818',
    name: 'Amethyst Far Infrared Heating Pad 1818',
    category: 'TAO Series',
    search_tags: 'amethyst heating pad, 1818, tao series, tourmaline, obsidian, targeted relief, compact pad, far infrared',
    short_description: 'The Amethyst Far Infrared Heating Pad (18” x 18”) is a compact natural gemstone heating pad containing Amethyst, Tourmaline, and Obsidian. The natural gemstones evenly distribute heat across the surface to relieve tension in smaller areas such as the abdomen, arms, or lower back. When heated, natural gemstones emit natural far-infrared rays and negative ions. These promote blood circulation, ease muscle tension, and support your physical and mental well-being.',
    image: 'https://healthyline.com/cdn/shop/files/Tourmaline-Amethyst-Obsidian-TAO-Mat_-Small-1818-Soft-InfraMat-Pro_1_fe95d873-5769-4b93-9ba1-d2968471ff19.webp?v=1782707698&width=1920',
    link: 'https://healthyline.com/products/amethyst-far-infrared-heating-pad-1818'
  },
  {
    product_id: 'rainbow-7428-4th',
    name: 'Rainbow Mat 74" x 28" 4th edition',
    category: 'Rainbow Chakra Series',
    search_tags: 'rainbow chakra mat, 7428 4th edition, 7 gemstones, chakra alignment, pemf, photon light, far infrared, meditation',
    short_description: 'Rainbow Chakra Mat™ 7428 (74″ x 28″) 4th edition - The 4th Edition Rainbow Mat 7428 builds on our most advanced model, offering enhanced PEMF and Photon Light Technology. It’s equipped with preset wellness modes, 7-Color Photon Light Therapy, and advanced timer settings to combine the most advanced technology with natural therapies to help you align, restore, and awaken your inner balance. HealthyLine mats are heavy by design. Their weight comes from a dense layer of real, natural gemstones that amplify Far Infrared heat, allowing warmth to penetrate more deeply and distribute evenly. The gemstones make up over half the mat’s weight and are the primary source of performance. Lighter mats use thin stone layers or fillers and cannot deliver the same depth or consistency of heat. The Rainbow Chakra Mat™ is a PEMF Far Infrared Heating Mat designed to align your mind, body, and spirit. Featuring seven chakra-aligning gemstones, it evenly distributes soothing heat while integrating PEMF, Negative Ion, Red Light, and Far Infrared Therapies. Together, these natural therapies promote relaxation, enhance blood circulation, and ease muscle tension. Perfect for meditation, yoga, or holistic wellness, the Rainbow Chakra Mat encourages detoxification, eases tension, and promotes a state of mental calm and physical rejuvenation.',
    image: 'https://healthyline.com/cdn/shop/files/Amethyst-Sodalite-Blue-Lace-Agate-Green-Aventurine-Yellow-Aventurine-Carnelian-Red-Jasper-Rainbow-Mat-Large-7428-Firm-PEMF-InframatPro-4th-edition.webp?v=1776652656&width=1920',
    link: 'https://healthyline.com/products/rainbow-chakra-pemf-farinfrared-red-light-mat?variant=45749464137780'
  }
];
