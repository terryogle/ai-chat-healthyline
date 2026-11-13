import { MergeRange } from './xlsxMerges';

export type { MergeRange } from './xlsxMerges';
export interface Deal {
    /** Stable key (sheet row based). */
    id: string;
    /** 1-based row number in the sheet (row 1 = headers). */
    row: number;
    /** Launch day, ISO `YYYY-MM-DD`. */
    date: string;
    name: string;
    description: string;
    image: string;
    link: string;
    regularPrice: string;
    salePrice: string;
}
export interface DealsGroup {
    /** Launch day, ISO `YYYY-MM-DD`. */
    date: string;
    /** Short label, e.g. `Nov 18`. */
    label: string;
    deals: Deal[];
}
/** Wall-clock time in the sale time zone. */
export interface WallClock {
    /** ISO `YYYY-MM-DD`. */
    date: string;
    hour: number;
    minute: number;
}
export interface DealsSchedule {
    launchHour: number;
    launchMinute: number;
    /** Optional hard end date (ISO). Default: last day of each deal's month. */
    endDate: string | null;
}
export interface GvizCell {
    v?: unknown;
    f?: unknown;
}
export interface GvizTable {
    labels: string[];
    rows: (GvizCell | null)[][];
}
type ColumnKey = 'date' | 'image' | 'link' | 'name' | 'description' | 'regularPrice' | 'salePrice';
type ColumnMap = Record<ColumnKey, number>;
/** Builds a validated ISO day string, or null when the date does not exist. */
export declare function toIsoDate(year: number, month: number, day: number): string | null;
export declare function addDays(isoDate: string, days: number): string;
export declare function lastDayOfMonth(isoDate: string): string;
/** `2026-11-30` -> `Nov 30` (the widget UI is English). */
export declare function formatShortDate(isoDate: string): string;
export declare function getWallClock(epochMs: number, timeZone: string): WallClock;
/**
 * Parses a preview moment: `YYYY-MM-DD` (treated as noon, i.e. after launch)
 * or `YYYY-MM-DDTHH:mm` / `YYYY-MM-DD HH:mm` (sale time zone wall clock).
 */
export declare function parsePreviewClock(value: string | null | undefined): WallClock | null;
/** `09:00` -> [9, 0]. Falls back to 9:00 AM. */
export declare function parseLaunchTime(value: string | null | undefined): [number, number];
/**
 * The "sale day": before the daily launch time the previous day's drop is
 * still the latest one, so the sale day only advances at launch time.
 */
export declare function getSaleDay(clock: WallClock, schedule: DealsSchedule): string;
export declare function getDealEndDate(deal: Deal, schedule: DealsSchedule): string;
/** Deals that are visible right now, in sheet order. */
export declare function selectLiveDeals(deals: Deal[], clock: WallClock, schedule: DealsSchedule): Deal[];
/** Groups deals by launch day, newest day first; sheet order inside a day. */
export declare function groupDealsByDay(deals: Deal[]): DealsGroup[];
/** RFC 4180 CSV parser (quoted fields, escaped quotes, embedded new lines). */
export declare function parseCsv(input: string): string[][];
/** Parses the Google Visualization (`gviz/tq?tqx=out:json`) response. */
export declare function parseGviz(input: string): GvizTable | null;
/** Maps sheet columns to deal fields by header name, then by position. */
export declare function resolveColumns(labels: string[]): ColumnMap;
/**
 * Parses a date typed as text ("Nov 12", "нояб. 12", "12.11.2026", "11/12",
 * "2026-11-12"). Used only when the cell is not a real spreadsheet date.
 */
export declare function parseDateText(raw: string, fallbackYear: number): string | null;
/** Only http(s) links are ever rendered; anything else is treated as empty. */
export declare function cleanUrl(value: unknown): string;
/** Store-admin URLs are not customer-facing, so they are never linked. */
export declare function isAdminUrl(url: string): boolean;
/**
 * Turns the sheet into deals.
 *
 * `csv` (the exported sheet, every cell exactly as displayed) is the source of
 * all texts; `gviz` adds real, locale-independent dates; `merges` says which
 * cells are merged. The first two can replace each other, so a failure of one
 * endpoint does not break the tab. Without `merges` only the first row of a
 * merged block has its value.
 */
export declare function buildDeals(csv: string[][] | null, gviz: GvizTable | null, currentYear: number, merges?: MergeRange[] | null): Deal[];
/** The crossed-out price is shown only when it differs from the sale price. */
export declare function hasDiscount(deal: Deal): boolean;
/** Main price to display: the sale price, or the regular one if there is no sale price. */
export declare function mainPrice(deal: Deal): string;
/** Asks the Shopify CDN for a smaller rendition; other hosts are left untouched. */
export declare function sizedImageUrl(url: string, width: number): string;
/** Accepts a bare sheet ID or a full Google Sheets URL. */
export declare function extractSheetId(value: string | null | undefined): string;
/** Reads `gid=123` from a Google Sheets URL (empty string when absent). */
export declare function extractSheetGid(value: string | null | undefined): string;
export interface DealsSheet {
    deals: Deal[];
    /**
     * Number of merged blocks found in the tab; `null` when that part of the
     * sheet could not be read (the rows are then used without merged values).
     */
    mergedBlocks: number | null;
}
/**
 * Loads the sheet straight from Google (the sheet must be shared as
 * "Anyone with the link → Viewer"). Throws when it cannot be read at all.
 */
export declare function fetchDeals(sheetId: string, gid: string, currentYear: number, timeoutMs?: number): Promise<DealsSheet>;
