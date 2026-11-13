import { Ref } from 'vue';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    createdAt: string;
    files?: File[];
    actions?: ChatAction[];
}
export interface ChatOptions {
    webhookUrl: string;
    webhookConfig?: {
        method?: 'GET' | 'POST';
        headers?: Record<string, string>;
    };
    target?: string | Element;
    mode?: 'window' | 'fullscreen';
    initialMessages?: string[];
    chatInputKey?: string;
    chatSessionKey?: string;
    loadPreviousSession?: boolean;
    showTooltip?: boolean;
    tooltipText?: string;
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        userMessageColor?: string;
        botMessageColor?: string;
        userTextColor?: string;
        botTextColor?: string;
        headerColor?: string;
        headerTextColor?: string;
        toggleBackground?: string;
    };
    icons?: {
        openChat?: string;
        closeChat?: string;
        send?: string;
        headerLogo?: string;
    };
    placeholder?: string;
    title?: string;
    subtitle?: string;
    allowFileUploads?: boolean;
    showBestSellers?: boolean;
    showCatalog?: boolean;
    showCompare?: boolean;
    showMyOrders?: boolean;
    /** Set to false to switch the Deals tab off completely. Default: true. */
    showDeals?: boolean;
    /** Google Sheet with the deals: full URL or just the sheet ID. */
    dealsSheetUrl?: string;
    /** Same as `dealsSheetUrl` (kept for readability when only the ID is passed). */
    dealsSheetId?: string;
    /** Tab inside the sheet (the `gid` from its URL). Default: taken from the URL, else 0. */
    dealsSheetGid?: string | number;
    /** Sale name used in the tooltip, header and Home block. Default: "Holiday Sale". */
    dealsTitle?: string;
    /** Label of the tab. Default: "Deals". */
    dealsTabLabel?: string;
    /** Line under the sale pill in the launcher tooltip while deals are live. Default: "We're here 24/7"; "" hides it. */
    dealsTooltipText?: string;
    /**
     * Seconds between two automatic slides of the Home slider (minimum 2). Default: 4; 0 turns it off.
     * It stops for good once the visitor presses an arrow or a dot, or swipes the cards sideways.
     */
    dealsAutoSlideSeconds?: number;
    /** IANA time zone of the sale. Default: "America/New_York". */
    dealsTimeZone?: string;
    /** Daily launch time in that zone, 24h "HH:mm". Default: "09:00". */
    dealsLaunchTime?: string;
    /** Optional hard end date "YYYY-MM-DD". Default: last day of each deal's month. */
    dealsEndDate?: string;
    /**
     * How often a visitor's browser re-reads the sheet, in seconds (minimum 30). Default: 300.
     * The sheet is also re-read when the chat is opened and at the daily launch time.
     * 0 = no periodic re-reading while a page stays open.
     */
    dealsRefreshSeconds?: number;
    /** Testing: pretend it is this day/time in the sale zone ("YYYY-MM-DD" or "YYYY-MM-DDTHH:mm"). */
    dealsPreviewDate?: string;
    /** Testing: allow the `?hl_deals_date=YYYY-MM-DD` URL parameter. Default: true. */
    dealsAllowUrlPreview?: boolean;
}
export interface Chat {
    messages: Ref<ChatMessage[]>;
    currentSessionId: Ref<string | null>;
    waitingForResponse: Ref<boolean>;
    pendingCallbackValue: Ref<string | null>;
    loadPreviousSession?: () => Promise<string | undefined>;
    startNewSession?: () => Promise<string>;
    sendMessage: (text: string, files: File[], privacy?: boolean) => Promise<void>;
}
export interface LoadPreviousSessionResponseItem {
    id: string | string[];
    kwargs: {
        content: string;
        additional_kwargs?: Record<string, unknown>;
    };
}
export interface LoadPreviousSessionResponse {
    data: LoadPreviousSessionResponseItem[];
}
export interface ChatAction {
    type: string;
    label: string;
    action: string;
    value?: string;
}
export interface SendMessageResponse {
    output?: string | string[];
    text?: string;
    actions?: ChatAction[];
}
export interface CatalogProduct {
    id: string;
    name: string;
    category: string;
    description: string;
    image: string;
    link: string;
    search_tags?: string;
}
export interface CatalogResponse {
    items: CatalogProduct[];
    categories: string[];
    total?: number;
}
export interface OtpResponse {
    success: boolean;
    message?: string;
    email?: string;
    [key: string]: any;
}
