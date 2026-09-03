export interface Product {
    product_id: string;
    name: string;
    category: string;
    search_tags: string;
    short_description: string;
    image: string;
    link: string;
}
export declare const PRODUCT_SERIES_LIST: readonly ["All", "Jet Series", "Mesh Series", "Platinum Series", "Rainbow Chakra Series", "Soft Series", "TAJ Series", "TAO Series"];
export declare const CATALOG_PRODUCTS: Product[];
