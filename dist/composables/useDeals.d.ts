import { ChatOptions } from '../types';
import { Deal, DealsGroup, WallClock } from '../utils/deals';

/** Google Sheet that feeds the Deals tab unless `dealsSheetUrl` overrides it. */
export declare const DEFAULT_DEALS_SHEET_ID = "1S7ZNbLW8duM0KpBaHhW6S3uhAqTK2FRGemZeDBYhiLs";
export declare const DEFAULT_DEALS_TIME_ZONE = "America/New_York";
export declare const DEFAULT_DEALS_LAUNCH_TIME = "09:00";
export declare const DEFAULT_DEALS_TITLE = "Holiday Sale";
export declare const DEFAULT_DEALS_TAB_LABEL = "Deals";
/** URL parameter for previewing another day, e.g. `?hl_deals_date=2026-11-18`. */
export declare const DEALS_PREVIEW_PARAM = "hl_deals_date";
/**
 * `widget.js` and `widget.css` are two files with separate caches (CDN, browser),
 * so a visitor can receive this script next to an older stylesheet. The Deals
 * blocks are shown only when the loaded stylesheet carries this mark; until then
 * the widget stays exactly as it was before Deals existed, instead of showing
 * blocks without their styles.
 *
 * Must equal `--tt-chat-deals-styles` in `src/style.scss`. Change both together
 * whenever the Deals markup or its styles change.
 */
export declare const DEALS_STYLES_MARK = "3";
export type DealsStatus = 'idle' | 'loading' | 'ready' | 'error';
/**
 * Reloads the sheet. Without `force` the call is skipped when the data was
 * requested a few seconds ago.
 */
export declare function refreshDeals(force?: boolean): Promise<void>;
export declare function stopDeals(): void;
/** Called once by the chat plugin when the widget is created. */
export declare function startDeals(options: ChatOptions): void;
/**
 * Preview helper for testing: pretend "now" is another moment in the sale
 * time zone. Accepts `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`; `null` returns to the
 * real clock. Returns false when the value could not be understood.
 */
export declare function setDealsPreviewDate(value: string | null | undefined): boolean;
/** Remembers that the visitor has seen the latest drop (hides the launcher dot). */
declare function markSeen(): void;
export interface DealsSnapshot {
    enabled: boolean;
    status: DealsStatus;
    sheetId: string;
    gid: string;
    timeZone: string;
    launchTime: string;
    /** "Now" in the sale time zone (the previewed moment when a preview is active). */
    clock: WallClock;
    isPreview: boolean;
    /** Merged blocks found in the sheet; null when they could not be read. */
    mergedBlocks: number | null;
    /** False while the loaded stylesheet has no Deals styles: nothing is shown then. */
    stylesReady: boolean;
    /** Rows read from the sheet / rows that are live at `clock`. */
    totalDeals: number;
    liveDeals: number;
    newToday: number;
    endLabel: string;
    /** Every launch day found in the sheet with its number of deals. */
    days: Array<{
        date: string;
        label: string;
        count: number;
    }>;
}
/** Plain, non-reactive summary for the test page and for troubleshooting. */
export declare function getDealsSnapshot(): DealsSnapshot;
export declare function useDeals(): {
    /** Deals feature is switched on (it may still have nothing live). */
    isEnabled: import('vue').ComputedRef<boolean>;
    status: import('vue').Ref<DealsStatus, DealsStatus>;
    title: import('vue').ComputedRef<string>;
    tabLabel: import('vue').ComputedRef<string>;
    /** At least one deal is live right now. */
    hasDeals: import('vue').ComputedRef<boolean>;
    /** Live deals grouped by launch day, newest first. */
    groups: import('vue').ComputedRef<DealsGroup[]>;
    /** Deals from the latest drop, or from the most recent day that had one. */
    featuredDeals: import('vue').ComputedRef<Deal[]>;
    /** Number of deals launched in the latest daily drop. */
    newTodayCount: import('vue').ComputedRef<number>;
    endLabel: import('vue').ComputedRef<string>;
    hasUnseen: import('vue').ComputedRef<boolean>;
    isPreview: import('vue').ComputedRef<boolean>;
    markSeen: typeof markSeen;
    refresh: typeof refreshDeals;
};
export {};
