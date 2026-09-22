export interface Product {
    product_id: string;
    name: string;
    category: string;
    search_tags: string;
    short_description: string;
    image: string;
    link: string;
}
export declare const PRODUCT_SERIES_LIST: readonly ["All", "Jet Series", "Mesh Series", "TAJ Series", "TAO Series", "Rainbow Chakra Series"];
export declare const CATALOG_PRODUCTS: Product[];
