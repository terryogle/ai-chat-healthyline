export interface SeriesSpecItem {
  id: string;
  name: string;
  shortName: string;
  categoryGroup: 'Far Infrared and PEMF Mat with Photon Light Therapy' | 'FIR and PEMF Mat' | 'Far Infrared Mat';
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
    matFlexibility: 'Stiff' | 'Soft';
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
    label: 'Far Infrared Therapy',
    category: 'core',
    description: 'Deep penetrating thermal heat that relaxes muscles, relieves stiffness, and boosts micro-circulation.'
  },
  {
    key: 'negativeIon',
    label: 'Negative Ion Therapy',
    category: 'core',
    description: 'Natural negative ions emitted from gemstones deliver antioxidant benefits and combat positive ion fatigue.'
  },
  {
    key: 'hotGemstones',
    label: 'Hot Gemstone Therapy',
    category: 'core',
    description: 'Natural crushed and polished gemstones (Amethyst, Tourmaline, Jade, Obsidian, etc.) that radiate FIR rays.'
  },
  {
    key: 'photonLight',
    label: 'Photon Light Therapy',
    category: 'core',
    description: 'Visible red 660nm LED light wavelengths supporting mitochondrial cellular energy, skin vitality, and collagen production.'
  },
  {
    key: 'pemfFrequencies',
    label: 'PEMF Frequencies',
    category: 'pemf',
    description: 'Pulsed Electromagnetic Field frequency ranges (e.g., 0.25 to 30Hz or 1 to 30Hz) tuned for cellular recovery and natural biorhythms.'
  },
  {
    key: 'pemfMaxIntensity',
    label: 'PEMF Max Intensity',
    category: 'pemf',
    description: 'Magnetic flux density in Gauss (GS). Ranges from 2GS for gentle biological resonance up to 8-12GS for high-power intensive therapy.'
  },
  {
    key: 'pemfPulseDuration',
    label: 'PEMF Pulse Duration',
    category: 'pemf',
    description: 'Speed and duration of magnetic field pulses (Medium, Fast, or Ultra Fast) for targeted tissue absorption.'
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
    description: 'Stiff mats maximize gemstone density on flat surfaces; Soft mats allow pliable cushioning for beds, chairs, and joint wrapping.'
  }
];

export const HEALTHYLINE_SERIES: SeriesSpecItem[] = [
  {
    id: 'jet',
    name: 'Jet Series™',
    shortName: 'Jet',
    categoryGroup: 'Far Infrared and PEMF Mat with Photon Light Therapy',
    badge: 'High Intensity',
    description: 'High-intensity PEMF mat with ultra-wide 0.25 to 30Hz frequencies, 8-12GS maximum magnetic power, and Photon Light Therapy for rapid athletic recovery and deep systemic revitalization.',
    bestFor: 'Athletes, deep tissue recovery, rapid sports rehabilitation, intensive PEMF sessions',
    gemstones: 'Tourmaline, Jade, Amethyst',
    priceRange: '$$$',
    image: 'https://healthyline.com/cdn/shop/files/Jet_Mat_7224_3_bf4b3c5d-9292-49ed-b20d-31310f2d698c.jpg?v=1748362084&width=480',
    link: 'https://healthyline.com/collections/jet-series',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: true,
      pemfFrequencies: '0.25 to 30Hz',
      pemfMaxIntensity: '8 - 12GS',
      pemfPulseDuration: 'Medium',
      pemfWaveType: 'Sine',
      matFlexibility: 'Stiff'
    },
    highlights: ['8 - 12GS Max Intensity PEMF', '0.25 to 30Hz Frequency Range', 'Photon Light Therapy (660nm)', 'Far Infrared & Negative Ions']
  },
  {
    id: 'rainbow-chakra',
    name: 'Rainbow Chakra Series',
    shortName: 'Rainbow Chakra',
    categoryGroup: 'Far Infrared and PEMF Mat with Photon Light Therapy',
    badge: '7 Gemstones',
    description: 'Holistic 5-therapy alignment mat featuring 7 natural gemstones mapped to the body’s chakras with 1 to 30Hz PEMF, 2-12GS variable intensity, and Photon Red Light.',
    bestFor: 'Meditation, chakra balancing, stress relief, emotional harmony, spiritual wellness',
    gemstones: '7 Gemstones: Amethyst, Sodalite, Blue Lace Agate, Green Aventurine, Yellow Aventurine, Carnelian, Red Jasper',
    priceRange: '$$$$',
    image: 'https://healthyline.com/cdn/shop/files/Rainbow_Chakra_Mat_7428_-_3rd_Edition.jpg?v=1736634223&width=480',
    link: 'https://healthyline.com/products/rainbow-chakra-pemf-farinfrared-red-light-mat?variant=47076949655604',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: true,
      pemfFrequencies: '1 to 30Hz',
      pemfMaxIntensity: '2 - 12GS',
      pemfPulseDuration: 'Medium',
      pemfWaveType: 'Sine',
      matFlexibility: 'Stiff'
    },
    highlights: ['7 Chakra Natural Gemstones', '2 - 12GS Variable Intensity', '1 to 30Hz PEMF Frequencies', 'Photon Red Light Therapy']
  },
  {
    id: 'platinum',
    name: 'Platinum Series™',
    shortName: 'Platinum',
    categoryGroup: 'Far Infrared and PEMF Mat with Photon Light Therapy',
    badge: 'Flagship Biohack',
    description: 'Flagship customizable biohacking mat with 1 to 30Hz PEMF, selectable Square or Sine waveforms, Ultra Fast / Fast / Medium pulse durations, and Photon Light Therapy.',
    bestFor: 'Advanced biohackers, clinics, customizable therapeutic protocols, maximum versatility',
    gemstones: '5 Natural Gemstones (Amethyst, Tourmaline, Jade, Obsidian, Quartz)',
    priceRange: '$$$$$',
    image: 'https://healthyline.com/cdn/shop/files/Platinum-7224-mat.png?v=1779244728&width=480',
    link: 'https://healthyline.com/collections/platinum-series',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: true,
      pemfFrequencies: '1 to 30Hz',
      pemfMaxIntensity: '3GS',
      pemfPulseDuration: 'Ultra Fast, Fast, Medium',
      pemfWaveType: 'Square or Sine',
      matFlexibility: 'Stiff'
    },
    highlights: ['Ultra Fast, Fast & Medium Pulses', 'Square or Sine Wave Selection', '1 to 30Hz PEMF & Photon Therapy', '3GS Magnetic Flux Density']
  },
  {
    id: 'taj',
    name: 'TAJ Series™',
    shortName: 'TAJ',
    categoryGroup: 'Far Infrared and PEMF Mat with Photon Light Therapy',
    badge: '#1 Best Seller',
    description: 'HealthyLine’s #1 signature mat combining Tourmaline, Amethyst, and Jade (TAJ) with Far Infrared, Negative Ions, 1 to 30Hz PEMF (2GS), and Photon Light Therapy.',
    bestFor: 'Daily pain relief, stiffness, joint comfort, improved circulation, sleep enhancement',
    gemstones: 'Tourmaline, Amethyst, Jade (TAJ)',
    priceRange: '$$$',
    image: 'https://healthyline.com/cdn/shop/files/TAJ_7224.webp?v=1779244751&width=480',
    link: 'https://healthyline.com/products/taj-mat-3624-firm-pemf-inframatpro',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: true,
      pemfFrequencies: '1 to 30Hz',
      pemfMaxIntensity: '2GS',
      pemfPulseDuration: 'Medium',
      pemfWaveType: 'Sine',
      matFlexibility: 'Stiff'
    },
    highlights: ['Triple Gemstone Synergy (TAJ)', '1 to 30Hz PEMF Frequency', 'Photon Light Therapy', '2GS Cellular Recovery Field']
  },
  {
    id: 'tao',
    name: 'TAO Series™',
    shortName: 'TAO',
    categoryGroup: 'FIR and PEMF Mat',
    badge: 'FIR & PEMF',
    description: 'High-efficiency FIR and PEMF mat featuring Tourmaline, Obsidian, and Jade with 1 to 30Hz PEMF, 2GS magnetic field, and negative ions for deep thermal wellness.',
    bestFor: 'Deep muscle soothing, daily recovery, comprehensive thermal and PEMF therapy',
    gemstones: 'Tourmaline, Obsidian, Jade',
    priceRange: '$$',
    image: 'https://healthyline.com/cdn/shop/files/TAO-Mat_7224.jpg?v=1736707815&width=480',
    link: 'https://healthyline.com/products/tao-chair-mat-1818-soft',
    specs: {
      farInfrared: true,
      negativeIon: true,
      hotGemstones: true,
      photonLight: false,
      pemfFrequencies: '1 to 30Hz',
      pemfMaxIntensity: '2GS',
      pemfPulseDuration: 'Medium',
      pemfWaveType: 'Sine',
      matFlexibility: 'Stiff'
    },
    highlights: ['1 to 30Hz PEMF Frequency', '2GS Magnetic Intensity', 'Tourmaline, Obsidian & Jade', 'Far Infrared & Negative Ions']
  },
  {
    id: 'soft',
    name: 'Soft Series™',
    shortName: 'Soft',
    categoryGroup: 'Far Infrared Mat',
    badge: 'Bed & Sleep',
    description: 'Ultra-cushioned memory foam heating mat designed for overnight bed therapy, spine contouring, and gentle soothing Far Infrared gemstone warmth.',
    bestFor: 'Overnight sleep, mattress topper use, plush cushioned back/spine comfort',
    gemstones: 'Crushed Amethyst & Tourmaline',
    priceRange: '$$$',
    image: 'https://healthyline.com/cdn/shop/files/SOFT-Mat_7224.jpg?v=1736707361&width=480',
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
    highlights: ['Soft Plush Flexibility', 'Engineered for Overnight Sleep', 'Deep Penetrating Far Infrared Heat', 'Negative Ion Gemstone Surface']
  },
  {
    id: 'mesh',
    name: 'Mesh Series™',
    shortName: 'Mesh',
    categoryGroup: 'Far Infrared Mat',
    badge: 'Flexible Wrap',
    description: 'Lightweight and pliable mesh mat with natural Jade and Tourmaline discs, designed to wrap around knees, shoulders, and curved body areas.',
    bestFor: 'Targeted joint wrapping, lightweight travel, flexible positioning on couches or chairs',
    gemstones: 'Polished Jade & Tourmaline Discs',
    priceRange: '$$',
    image: 'https://healthyline.com/cdn/shop/files/Mesh_JT_Mat_7224_1b9f6e4d-3d52-4665-9078-2dfe5d91e336.jpg?v=1736635780&width=480',
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
      matFlexibility: 'Soft'
    },
    highlights: ['Soft & Flexible Joint Wrapping', 'Ultra Lightweight & Portable', 'Jade & Tourmaline Discs', 'Pure Far Infrared Therapy']
  }
];

export const CATEGORY_GROUPS = [
  'All Series',
  'Far Infrared and PEMF Mat with Photon Light Therapy',
  'FIR and PEMF Mat',
  'Far Infrared Mat'
] as const;
