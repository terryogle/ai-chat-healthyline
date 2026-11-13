declare const _default: import('vue').DefineComponent<import('vue').ExtractPropTypes<__VLS_TypePropsToRuntimeProps<{
    /** Image URL exactly as written in the sheet (may be empty). */
    src: string;
    /** Alternative text; leave empty when the deal name is printed next to it. */
    alt?: string;
    /** Rendition width requested from the CDN, in pixels. */
    width: number;
}>>, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_TypePropsToRuntimeProps<{
    /** Image URL exactly as written in the sheet (may be empty). */
    src: string;
    /** Alternative text; leave empty when the deal name is printed next to it. */
    alt?: string;
    /** Rendition width requested from the CDN, in pixels. */
    width: number;
}>>> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, true, {}, any>;
export default _default;
type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
type __VLS_TypePropsToRuntimeProps<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
