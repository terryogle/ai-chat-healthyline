export interface SeriesSpecItem {
  id: string;
  name: string;
  shortName: string;
  categoryGroup: 'Far Infrared and PEMF Mat with Photon' | 'FIR and PEMF Mat' | 'Far Infrared Mat';
  badge?: string;
  description: string;
  bestFor: string;
  gemstones: string;
  priceRange: string;
  image: string;
  link: string;
  specs: {
    farInfrared: boolean;
    negativeIon: boolean;
    hotGemstones: boolean;
    photonLight: boolean;
    pemfFrequencies: string | null;
    pemfMaxIntensity: string | null;
    pemfPulseDuration: string | null;
    pemfWaveType: string | null;
    matFlexibility: 'Stiff' | 'Soft' | 'Flexible';
  };
  highlights: string[];
}

export interface SpecDefinition {
  key: keyof SeriesSpecItem['specs'];
  label: string;
  category: 'core' | 'pemf' | 'physical';
  description: string;
  unit?: string;
}

export const SPEC_DEFINITIONS: SpecDefinition[] = [
  {
    key: 'farInfrared',
    label: 'Far Infrared (FIR)',
    category: 'core',
    description: 'Deep penetrating thermal heat that relaxes muscles, relieves stiffness, and boosts micro-circulation.'
  },
  {
    key: 'negativeIon',
    label: 'Negative Ion Therapy',
    category: 'core',
    description: 'Natural negative ions from gemstones deliver antioxidant benefits and combat positive ion fatigue.'
  },
  {
    key: 'hotGemstones',
    label: 'Hot Gemstone Therapy',
    category: 'core',
    description: 'Natural crushed and polished gemstones (Amethyst, Tourmaline, Jade, etc.) that radiate FIR rays.'
  },
  {
    key: 'photonLight',
    label: 'Photon Therapy (Red Light)',
    category: 'core',
    description: 'Visible red 660nm LED light wavelengths supporting mitochondrial cellular energy, skin vitality, and collagen.'
  },
  {
    key: 'pemfFrequencies',
    label: 'PEMF Frequencies',
    category: 'pemf',
    description: 'Pulsed Electromagnetic Fields. 7.83Hz represents Earth’s natural Schumann resonance; 1-30Hz allows multi-target biohacking.'
  },
  {
    key: 'pemfMaxIntensity',
    label: 'PEMF Max Intensity',
    category: 'pemf',
    description: 'Magnetic flux density in Gauss (GS). 2-3GS is ideal for cellular recovery, while 8-12GS is high-power professional grade.'
  },
  {
    key: 'pemfPulseDuration',
    label: 'PEMF Pulse Duration',
    category: 'pemf',
    description: 'Speed of magnetic pulses. Ultra-fast pulses deliver targeted resonance to deep tissues.'
  },
  {
    key: 'pemfWaveType',
    label: 'PEMF Wave Type',
    category: 'pemf',
    description: 'Sine waves produce smooth natural biological frequencies; Square waves deliver rapid-rise electromagnetic stimulation.'
  },
  {
    key: 'matFlexibility',
    label: 'Mat Flexibility',
    category: 'physical',
    description: 'Stiff mats maximize gemstone density on flat surfaces; Soft & Flexible mats allow folding and bed-cushion comfort.'
  }
];

export const HEALTHYLINE_SERIES: SeriesSpecItem[] = [
  {
    id: 'jet',
    name: 'Jet Series™',
    shortName: 'Jet',
    categoryGroup: 'Far Infrared and PEMF Mat with Photon',
    badge: 'High Intensity',
    description: 'High-power portable PEMF mat with intensive 8-12GS magnetic fields and photon red light for rapid recovery.',
    bestFor: 'Athletes, deep tissue recovery, rapid sports rehabilitation, intensive PEMF sessions',
    gemstones: 'Tourmaline, Jade, Amethyst',
    priceRange: '$$$',
    image: 'https://healthyline.com/cdn/shop/files/Amethyst-Sodalite-Blue-Lace-Agate-Green-Aventurine-Yellow-Aventurine-Carnelian-Red-Jasper-Rainbow-Mat-4020-Firm-PEMF-InframatPro-4th-edition_1_9f2602ce-44a3-448f-a368-5f14e04e4c1c.webp?v=1772470017',
    link: 'https://healthyline.com/collections/jet-series',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: true,
      pemfFrequencies: '1 to 30Hz',
      pemfMaxIntensity: '8 - 12GS',
      pemfPulseDuration: 'Medium',
      pemfWaveType: 'Square or Sine',
      matFlexibility: 'Stiff'
    },
    highlights: ['Max 12 Gauss intensity', 'Photon LED therapy', 'Dual Waveform (Square/Sine)', 'Adjustable 1-30Hz']
  },
  {
    id: 'rainbow-chakra',
    name: 'Rainbow Chakra Series™',
    shortName: 'Rainbow Chakra',
    categoryGroup: 'Far Infrared and PEMF Mat with Photon',
    badge: '7 Gemstones',
    description: 'Holistic 5-therapy system featuring 7 natural gemstones mapped to the body’s 7 chakras for complete balance.',
    bestFor: 'Meditation, chakra balancing, stress relief, emotional harmony, spiritual wellness',
    gemstones: 'Amethyst, Sodalite, Blue Lace Agate, Green Aventurine, Yellow Aventurine, Carnelian, Red Jasper',
    priceRange: '$$$$',
    image: 'https://healthyline.com/cdn/shop/files/Amethyst-Sodalite-Blue-Lace-Agate-Green-Aventurine-Yellow-Aventurine-Carnelian-Red-Jasper-Rainbow-Mat-4020-Firm-PEMF-InframatPro-4th-edition_1_9f2602ce-44a3-448f-a368-5f14e04e4c1c.webp?v=1772470017',
    link: 'https://healthyline.com/products/rainbow-chakra-pemf-farinfrared-red-light-mat?variant=47076949655604',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: true,
      pemfFrequencies: '7.83Hz',
      pemfMaxIntensity: '3GS',
      pemfPulseDuration: 'Medium',
      pemfWaveType: 'Sine',
      matFlexibility: 'Stiff'
    },
    highlights: ['7 Chakra Gemstones', 'Earth Schumann PEMF (7.83Hz)', 'Photon 660nm Red Light', 'Negative Ion saturation']
  },
  {
    id: 'platinum',
    name: 'Platinum Series™',
    shortName: 'Platinum',
    categoryGroup: 'Far Infrared and PEMF Mat with Photon',
    badge: 'Flagship Biohack',
    description: 'The ultimate fully customizable wellness mat with programmable PEMF frequencies, waveforms, pulse speeds and photon lights.',
    bestFor: 'Advanced biohackers, clinics, customizable therapeutic protocols, maximum versatility',
    gemstones: '5 Natural Gemstones (Amethyst, Tourmaline, Jade, Obsidian, Quartz)',
    priceRange: '$$$$$',
    image: 'https://healthyline.com/cdn/shop/files/Amethyst-Sodalite-Blue-Lace-Agate-Green-Aventurine-Yellow-Aventurine-Carnelian-Red-Jasper-Rainbow-Mat-4020-Firm-PEMF-InframatPro-4th-edition_1_9f2602ce-44a3-448f-a368-5f14e04e4c1c.webp?v=1772470017',
    link: 'https://healthyline.com/collections/platinum-series',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: true,
      pemfFrequencies: '1 to 25Hz',
      pemfMaxIntensity: '3GS',
      pemfPulseDuration: 'Ultra Fast, Fast, Medium',
      pemfWaveType: 'Square or Sine',
      matFlexibility: 'Stiff'
    },
    highlights: ['10+ Custom PEMF Programs', 'Ultra-Fast Pulse Duration', 'Square & Sine Wave Selection', 'Full Spectrum 5 Therapies']
  },
  {
    id: 'taj',
    name: 'TAJ Series™',
    shortName: 'TAJ',
    categoryGroup: 'FIR and PEMF Mat',
    badge: '#1 Best Seller',
    description: 'HealthyLine’s award-winning signature 4-therapy mat combining Tourmaline, Amethyst, Jade, Far Infrared, and PEMF.',
    bestFor: 'Daily pain relief, stiffness, joint comfort, improved circulation, sleep enhancement',
    gemstones: 'Tourmaline, Amethyst, Jade (T-A-J)',
    priceRange: '$$$',
    image: 'https://healthyline.com/cdn/shop/files/TAJ-3624-Firm-PEMF-InframatPro-1.webp?v=1772470000',
    link: 'https://healthyline.com/products/taj-mat-3624-firm-pemf-inframatpro',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: false,
      pemfFrequencies: '7.83Hz',
      pemfMaxIntensity: '3GS',
      pemfPulseDuration: 'Medium',
      pemfWaveType: 'Sine',
      matFlexibility: 'Stiff'
    },
    highlights: ['Most popular model worldwide', 'Triple Gemstone Synergy', 'Proven 7.83Hz Schumann PEMF', 'Reliable daily therapy']
  },
  {
    id: 'tao',
    name: 'TAO Series™',
    shortName: 'TAO',
    categoryGroup: 'Far Infrared Mat',
    badge: 'Pure Thermal',
    description: 'Pure far infrared gemstone heating pad with Tourmaline, Obsidian, and Jade for concentrated deep warmth without PEMF.',
    bestFor: 'Deep muscle soothing, budget-conscious thermal therapy, users sensitive to electromagnetic fields',
    gemstones: 'Tourmaline, Obsidian, Jade',
    priceRange: '$$',
    image: 'https://healthyline.com/cdn/shop/files/TAO-1818-Soft-InframatPro-1.webp?v=1772470010',
    link: 'https://healthyline.com/products/tao-chair-mat-1818-soft',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: false,
      pemfFrequencies: null,
      pemfMaxIntensity: null,
      pemfPulseDuration: null,
      pemfWaveType: null,
      matFlexibility: 'Stiff'
    },
    highlights: ['EMF-Free Far Infrared Heat', 'Negative Ion generation', 'Chair & full body sizes', 'Accessible entry price']
  },
  {
    id: 'soft',
    name: 'Soft Series™',
    shortName: 'Soft',
    categoryGroup: 'Far Infrared Mat',
    badge: 'Bed & Sleep',
    description: 'Ultra-cushioned pillow-top gemstone heating mat designed with flexible memory foam for overnight bed therapy and deep restorative sleep.',
    bestFor: 'Overnight sleep, mattress topper use, users needing plush cushioned back/spine comfort',
    gemstones: 'Crushed Amethyst & Tourmaline',
    priceRange: '$$$',
    image: 'https://healthyline.com/cdn/shop/files/TAO-1818-Soft-InframatPro-1.webp?v=1772470010',
    link: 'https://healthyline.com/collections/soft-series',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: false,
      pemfFrequencies: null,
      pemfMaxIntensity: null,
      pemfPulseDuration: null,
      pemfWaveType: null,
      matFlexibility: 'Soft'
    },
    highlights: ['Pillow-top memory foam', 'Designed for overnight sleep', 'Comfortable on any mattress', 'Gentle soothing FIR warmth']
  },
  {
    id: 'mesh',
    name: 'Mesh Series™',
    shortName: 'Mesh',
    categoryGroup: 'Far Infrared Mat',
    badge: 'Flexible Wrap',
    description: 'Lightweight, flexible gemstone mat embedded in soft mesh, allowing you to wrap it around knees, shoulders, and legs.',
    bestFor: 'Targeted joint wrapping, lightweight travel, flexible positioning on couches or chairs',
    gemstones: 'Polished Jade & Tourmaline discs',
    priceRange: '$$',
    image: 'https://healthyline.com/cdn/shop/files/TAJ-3624-Firm-PEMF-InframatPro-1.webp?v=1772470000',
    link: 'https://healthyline.com/collections/mesh-series',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: false,
      pemfFrequencies: null,
      pemfMaxIntensity: null,
      pemfPulseDuration: null,
      pemfWaveType: null,
      matFlexibility: 'Flexible'
    },
    highlights: ['Bends & wraps around joints', 'Ultra lightweight & portable', 'Jade & Tourmaline thermal power', 'Versatile multi-angle use']
  }
];

export const CATEGORY_GROUPS = [
  'All Series',
  'Far Infrared and PEMF Mat with Photon',
  'FIR and PEMF Mat',
  'Far Infrared Mat'
] as const;
