declare const _default: import('vue').DefineComponent<{}, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    submit: (data: {
        mode: "email";
        value: string;
        verificationCode?: string;
    }) => void;
    cancel: () => void;
}, string, import('vue').PublicProps, Readonly<{}> & Readonly<{
    onSubmit?: ((data: {
        mode: "email";
        value: string;
        verificationCode?: string;
    }) => any) | undefined;
    onCancel?: (() => any) | undefined;
}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, true, {}, any>;
export default _default;
