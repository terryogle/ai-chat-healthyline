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
export declare const SPEC_DEFINITIONS: SpecDefinition[];
export declare const HEALTHYLINE_SERIES: SeriesSpecItem[];
export declare const CATEGORY_GROUPS: readonly ["All Series", "Far Infrared and PEMF Mat with Photon", "FIR and PEMF Mat", "Far Infrared Mat"];
