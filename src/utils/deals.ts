/**
 * Deals tab — data layer.
 *
 * Every piece of content shown in the Deals tab (names, lines, prices, links,
 * images, launch dates) is read from a Google Sheet: one row = one deal, and
 * every cell is used exactly as it stands in the sheet. Nothing about the
 * offers is hard-coded or guessed in the widget. The only things that live
 * here are the column-name aliases and the scheduling rules:
 *
 *   - a row goes live at the launch time (default 9:00 AM New York time)
 *     on the day written in its "Date" cell;
 *   - it stays live through the last day of that month;
 *   - a row without a date (or without a name) is not shown;
 *   - a merged cell belongs to every row it covers, as it looks in the sheet.
 */
import { readXlsxMerges } from './xlsxMerges';
import type { MergeRange } from './xlsxMerges';

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

/** Sheet layout the widget falls back to when a header is renamed: A..G. */
const DEFAULT_COLUMN_ORDER: ColumnKey[] = [
  'date',
  'image',
  'link',
  'name',
  'description',
  'regularPrice',
  'salePrice',
];

/** Header names (lower-cased, letters/digits only) accepted for every field. */
const COLUMN_ALIASES: Record<ColumnKey, string[]> = {
  date: ['date', 'day', 'launchdate', 'startdate'],
  image: ['image', 'imageurl', 'imagelink', 'img', 'picture', 'photo'],
  link: ['frontend', 'frontendurl', 'frontendlink', 'link', 'url', 'producturl', 'productlink'],
  name: ['bundlename', 'name', 'title', 'bundle', 'dealname', 'productname', 'product'],
  description: ['shortline', 'description', 'shortdescription', 'subtitle', 'line'],
  regularPrice: [
    'bundleregulartotal',
    'regulartotal',
    'regularprice',
    'regular',
    'compareatprice',
    'compareat',
    'oldprice',
    'fullprice',
  ],
  salePrice: ['bundlesaleprice', 'saleprice', 'sale', 'price', 'dealprice', 'newprice'],
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Month-name prefixes (English + Russian) used when a date cell is plain text. */
const MONTH_PREFIXES: Array<[string, number]> = [
  ['jan', 1], ['feb', 2], ['mar', 3], ['apr', 4], ['may', 5], ['jun', 6],
  ['jul', 7], ['aug', 8], ['sep', 9], ['oct', 10], ['nov', 11], ['dec', 12],
  ['янв', 1], ['фев', 2], ['мар', 3], ['апр', 4], ['май', 5], ['мая', 5], ['июн', 6],
  ['июл', 7], ['авг', 8], ['сен', 9], ['окт', 10], ['ноя', 11], ['дек', 12],
];

/* -------------------------------------------------------------------------- */
/* Date helpers (pure, time-zone free: they only work on ISO day strings)      */
/* -------------------------------------------------------------------------- */

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Builds a validated ISO day string, or null when the date does not exist. */
export function toIsoDate(year: number, month: number, day: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (year < 1970 || year > 2200 || month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function lastDayOfMonth(isoDate: string): string {
  const [y, m] = isoDate.split('-').map(Number);
  return `${y}-${pad2(m)}-${pad2(daysInMonth(y, m))}`;
}

/** `2026-11-30` -> `Nov 30` (the widget UI is English). */
export function formatShortDate(isoDate: string): string {
  const [, m, d] = isoDate.split('-').map(Number);
  return `${MONTHS_SHORT[m - 1] || ''} ${d}`.trim();
}

/* -------------------------------------------------------------------------- */
/* Clock: "what day/time is it in the sale time zone?"                         */
/* -------------------------------------------------------------------------- */

const formatterCache: Record<string, Intl.DateTimeFormat> = {};

export function getWallClock(epochMs: number, timeZone: string): WallClock {
  try {
    let formatter = formatterCache[timeZone];
    if (!formatter) {
      formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      });
      formatterCache[timeZone] = formatter;
    }
    const parts: Record<string, string> = {};
    for (const part of formatter.formatToParts(new Date(epochMs))) {
      parts[part.type] = part.value;
    }
    const date = toIsoDate(Number(parts.year), Number(parts.month), Number(parts.day));
    const hour = Number(parts.hour) % 24;
    const minute = Number(parts.minute);
    if (date && Number.isFinite(hour) && Number.isFinite(minute)) {
      return { date, hour, minute };
    }
  } catch {
    // Unknown time zone / very old browser: fall through to fixed EST.
  }
  const est = new Date(epochMs - 5 * 60 * 60 * 1000);
  return {
    date: est.toISOString().slice(0, 10),
    hour: est.getUTCHours(),
    minute: est.getUTCMinutes(),
  };
}

/**
 * Parses a preview moment: `YYYY-MM-DD` (treated as noon, i.e. after launch)
 * or `YYYY-MM-DDTHH:mm` / `YYYY-MM-DD HH:mm` (sale time zone wall clock).
 */
export function parsePreviewClock(value: string | null | undefined): WallClock | null {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s_]+(\d{1,2})[:.h](\d{2}))?$/i);
  if (!match) return null;
  const date = toIsoDate(Number(match[1]), Number(match[2]), Number(match[3]));
  if (!date) return null;
  const hour = match[4] !== undefined ? Number(match[4]) : 12;
  const minute = match[5] !== undefined ? Number(match[5]) : 0;
  if (hour > 23 || minute > 59) return null;
  return { date, hour, minute };
}

/** `09:00` -> [9, 0]. Falls back to 9:00 AM. */
export function parseLaunchTime(value: string | null | undefined): [number, number] {
  const match = String(value ?? '').trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (match) {
    const hour = Number(match[1]);
    const minute = match[2] !== undefined ? Number(match[2]) : 0;
    if (hour <= 23 && minute <= 59) return [hour, minute];
  }
  return [9, 0];
}

/**
 * The "sale day": before the daily launch time the previous day's drop is
 * still the latest one, so the sale day only advances at launch time.
 */
export function getSaleDay(clock: WallClock, schedule: DealsSchedule): string {
  const nowMinutes = clock.hour * 60 + clock.minute;
  const launchMinutes = schedule.launchHour * 60 + schedule.launchMinute;
  return nowMinutes >= launchMinutes ? clock.date : addDays(clock.date, -1);
}

export function getDealEndDate(deal: Deal, schedule: DealsSchedule): string {
  return schedule.endDate || lastDayOfMonth(deal.date);
}

/** Deals that are visible right now, in sheet order. */
export function selectLiveDeals(deals: Deal[], clock: WallClock, schedule: DealsSchedule): Deal[] {
  const saleDay = getSaleDay(clock, schedule);
  return deals.filter((deal) => deal.date <= saleDay && clock.date <= getDealEndDate(deal, schedule));
}

/** Groups deals by launch day, newest day first; sheet order inside a day. */
export function groupDealsByDay(deals: Deal[]): DealsGroup[] {
  const byDate = new Map<string, Deal[]>();
  for (const deal of deals) {
    const bucket = byDate.get(deal.date);
    if (bucket) bucket.push(deal);
    else byDate.set(deal.date, [deal]);
  }
  return Array.from(byDate.keys())
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
    .map((date) => ({ date, label: formatShortDate(date), deals: byDate.get(date) as Deal[] }));
}

/* -------------------------------------------------------------------------- */
/* Sheet parsing                                                               */
/* -------------------------------------------------------------------------- */

/** RFC 4180 CSV parser (quoted fields, escaped quotes, embedded new lines). */
export function parseCsv(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Parses the Google Visualization (`gviz/tq?tqx=out:json`) response. */
export function parseGviz(input: string): GvizTable | null {
  const start = input.indexOf('{');
  const end = input.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  let json: any;
  try {
    json = JSON.parse(input.slice(start, end + 1));
  } catch {
    return null;
  }
  const table = json && json.status !== 'error' ? json.table : null;
  if (!table || !Array.isArray(table.cols) || !Array.isArray(table.rows)) return null;
  return {
    labels: table.cols.map((col: any) => (col && typeof col.label === 'string' ? col.label : '')),
    rows: table.rows.map((row: any) => (row && Array.isArray(row.c) ? row.c : [])),
  };
}

function normalizeHeader(label: string): string {
  return String(label || '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/g, '');
}

/** Maps sheet columns to deal fields by header name, then by position. */
export function resolveColumns(labels: string[]): ColumnMap {
  const normalized = labels.map(normalizeHeader);
  const map = {} as ColumnMap;
  const taken = new Set<number>();

  for (const key of DEFAULT_COLUMN_ORDER) {
    const index = normalized.findIndex((label, i) => !taken.has(i) && COLUMN_ALIASES[key].includes(label));
    map[key] = index;
    if (index >= 0) taken.add(index);
  }
  DEFAULT_COLUMN_ORDER.forEach((key, position) => {
    if (map[key] < 0 && !taken.has(position)) {
      map[key] = position;
      taken.add(position);
    }
  });
  return map;
}

function parseGvizDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = value.match(/^Date\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  // gviz months are zero-based.
  return toIsoDate(Number(match[1]), Number(match[2]) + 1, Number(match[3]));
}

function normalizeYear(year: number): number {
  return year < 100 ? 2000 + year : year;
}

/**
 * Parses a date typed as text ("Nov 12", "нояб. 12", "12.11.2026", "11/12",
 * "2026-11-12"). Used only when the cell is not a real spreadsheet date.
 */
export function parseDateText(raw: string, fallbackYear: number): string | null {
  const text = String(raw || '').trim().toLowerCase();
  if (!text) return null;

  const iso = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?!\d)/);
  if (iso) return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const words = text.match(/[a-zа-яё]+/g) || [];
  for (const word of words) {
    const month = MONTH_PREFIXES.find(([prefix]) => word.startsWith(prefix));
    if (!month) continue;
    const numbers = (text.match(/\d+/g) || []).map(Number);
    const yearIndex = numbers.findIndex((n) => n >= 1970 && n <= 2200);
    const year = yearIndex >= 0 ? numbers[yearIndex] : fallbackYear;
    const day = numbers.find((n, i) => i !== yearIndex && n >= 1 && n <= 31);
    return day === undefined ? null : toIsoDate(year, month[1], day);
  }

  const numeric = text.match(/^(\d{1,2})([./-])(\d{1,2})(?:\2(\d{2,4}))?\.?$/);
  if (numeric) {
    const first = Number(numeric[1]);
    const second = Number(numeric[3]);
    const year = numeric[4] !== undefined ? normalizeYear(Number(numeric[4])) : fallbackYear;
    // "/" is read the US way (month/day), "." and "-" the European way (day.month).
    let month = numeric[2] === '/' ? first : second;
    let day = numeric[2] === '/' ? second : first;
    if (month > 12 && day <= 12) [month, day] = [day, month];
    return toIsoDate(year, month, day);
  }
  return null;
}

function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Only http(s) links are ever rendered; anything else is treated as empty. */
export function cleanUrl(value: unknown): string {
  let url = String(value ?? '').trim();
  if (!url || /\s/.test(url)) return '';
  if (url.startsWith('//')) url = `https:${url}`;
  // "healthyline.com/products/x" typed without the protocol.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url) && /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|\?|#|$)/i.test(url)) {
    url = `https://${url}`;
  }
  return /^https?:\/\/[^/]+/i.test(url) ? url : '';
}

/** Store-admin URLs are not customer-facing, so they are never linked. */
export function isAdminUrl(url: string): boolean {
  return /^https?:\/\/(admin\.shopify\.com|[^/]+\.myshopify\.com\/admin)(\/|$|\?|#)/i.test(url);
}

function gvizCellText(cell: GvizCell | null | undefined): string {
  if (!cell) return '';
  if (typeof cell.v === 'string' && !/^Date\(/.test(cell.v)) return cell.v;
  if (cell.f !== undefined && cell.f !== null) return String(cell.f);
  if (cell.v === undefined || cell.v === null) return '';
  return String(cell.v);
}

/** True when a gviz row and a CSV row are the same sheet row. */
function isSameRow(csvCells: string[], gvizRow: (GvizCell | null)[], csvCols: ColumnMap, gvizCols: ColumnMap): boolean {
  const keys: ColumnKey[] = ['name', 'link', 'description', 'salePrice', 'regularPrice'];
  for (const key of keys) {
    const cell = gvizCols[key] >= 0 ? gvizRow[gvizCols[key]] : null;
    if (!cell || typeof cell.v !== 'string') continue;
    const csvValue = csvCols[key] >= 0 ? csvCells[csvCols[key]] : '';
    return cleanText(cell.v) === cleanText(csvValue);
  }
  return false;
}

interface RawRow {
  /** Cell texts, in sheet column order. */
  cells: string[];
  /** Real (typed) date of the Date cell, when Google reports one. */
  typedDate: string | null;
}

/**
 * Gives every row of a merged block the value of that block, the way the block
 * looks in the sheet. `rows[0]` is sheet row 2 (row 1 holds the headers).
 *
 * Google exports a merged block as its first cell followed by empty ones. If
 * the cells under the first one are not empty, the list of blocks and the
 * texts come from two different versions of the sheet (it was edited between
 * the two requests), so that block is left untouched.
 */
function applyMerges(rows: RawRow[], merges: MergeRange[], dateColumn: number): void {
  const text = (row: RawRow | undefined, column: number): string => (row ? cleanText(row.cells[column]) : '');

  for (const merge of merges) {
    // Blocks that start in the header row, or cover one row only, share nothing between deals.
    if (merge.top < 1 || merge.bottom <= merge.top) continue;
    const column = merge.left;
    const first = rows[merge.top - 1];
    if (!first || !text(first, column)) continue;

    let untouched = true;
    for (let r = merge.top + 1; r <= merge.bottom; r++) {
      if (text(rows[r - 1], column)) untouched = false;
    }
    if (!untouched) continue;

    for (let r = merge.top + 1; r <= merge.bottom; r++) {
      const row = rows[r - 1];
      if (!row) continue;
      while (row.cells.length <= column) row.cells.push('');
      row.cells[column] = first.cells[column];
      if (column === dateColumn) row.typedDate = first.typedDate;
    }
  }
}

/**
 * Turns the sheet into deals.
 *
 * `csv` (the exported sheet, every cell exactly as displayed) is the source of
 * all texts; `gviz` adds real, locale-independent dates; `merges` says which
 * cells are merged. The first two can replace each other, so a failure of one
 * endpoint does not break the tab. Without `merges` only the first row of a
 * merged block has its value.
 */
export function buildDeals(
  csv: string[][] | null,
  gviz: GvizTable | null,
  currentYear: number,
  merges: MergeRange[] | null = null,
): Deal[] {
  const hasCsv = !!csv && csv.length > 0;
  if (!hasCsv && !gviz) return [];

  const gvizCols = gviz ? resolveColumns(gviz.labels) : null;
  const cols = hasCsv ? resolveColumns((csv as string[][])[0]) : (gvizCols as ColumnMap);

  const rawRows: RawRow[] = [];
  if (hasCsv) {
    const rows = csv as string[][];
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].slice();
      const gvizRow = gviz && gvizCols ? gviz.rows[i - 1] : undefined;
      let typedDate: string | null = null;
      if (gvizRow && gvizCols && gvizCols.date >= 0 && isSameRow(cells, gvizRow, cols, gvizCols)) {
        typedDate = parseGvizDate(gvizRow[gvizCols.date]?.v);
      }
      rawRows.push({ cells, typedDate });
    }
  } else if (gviz && gvizCols) {
    for (const row of gviz.rows) {
      rawRows.push({
        cells: row.map(gvizCellText),
        typedDate: gvizCols.date >= 0 ? parseGvizDate(row[gvizCols.date]?.v) : null,
      });
    }
  }

  if (merges && merges.length > 0) applyMerges(rawRows, merges, cols.date);

  // Dates typed without a year ("Nov 12") take the year used by the real dates.
  const typedYears = rawRows.filter((r) => r.typedDate).map((r) => Number((r.typedDate as string).slice(0, 4)));
  const fallbackYear = typedYears.length > 0 ? typedYears[0] : currentYear;

  const cell = (row: RawRow, key: ColumnKey): string => (cols[key] >= 0 ? row.cells[cols[key]] ?? '' : '');

  const deals: Deal[] = [];

  rawRows.forEach((row, index) => {
    const sheetRow = index + 2;
    const name = cleanText(cell(row, 'name'));
    const dateText = cleanText(cell(row, 'date'));

    // The Date cell decides when the row goes live: no date, no deal.
    const date = row.typedDate || (dateText ? parseDateText(dateText, fallbackYear) : null);
    if (!date || !name) return;

    const link = cleanUrl(cleanText(cell(row, 'link')));
    deals.push({
      id: `r${sheetRow}`,
      row: sheetRow,
      date,
      name,
      description: cleanText(cell(row, 'description')),
      image: cleanUrl(cleanText(cell(row, 'image'))),
      link: isAdminUrl(link) ? '' : link,
      regularPrice: cleanText(cell(row, 'regularPrice')),
      salePrice: cleanText(cell(row, 'salePrice')),
    });
  });

  return deals;
}

/* -------------------------------------------------------------------------- */
/* Presentation helpers                                                        */
/* -------------------------------------------------------------------------- */

/** The crossed-out price is shown only when it differs from the sale price. */
export function hasDiscount(deal: Deal): boolean {
  if (!deal.regularPrice || !deal.salePrice) return false;
  const normalize = (price: string) => price.replace(/\s+/g, '');
  return normalize(deal.regularPrice) !== normalize(deal.salePrice);
}

/** Main price to display: the sale price, or the regular one if there is no sale price. */
export function mainPrice(deal: Deal): string {
  return deal.salePrice || deal.regularPrice;
}

/** Asks the Shopify CDN for a smaller rendition; other hosts are left untouched. */
export function sizedImageUrl(url: string, width: number): string {
  if (!url || !/\/cdn\/shop\//i.test(url) || /[?&]width=\d+/i.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}width=${width}`;
}

/* -------------------------------------------------------------------------- */
/* Fetching                                                                    */
/* -------------------------------------------------------------------------- */

/** Accepts a bare sheet ID or a full Google Sheets URL. */
export function extractSheetId(value: string | null | undefined): string {
  const text = String(value ?? '').trim();
  const match = text.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : text;
}

/** Reads `gid=123` from a Google Sheets URL (empty string when absent). */
export function extractSheetGid(value: string | null | undefined): string {
  const match = String(value ?? '').match(/[#?&]gid=(\d+)/);
  return match ? match[1] : '';
}

async function fetchSheet<T>(url: string, timeoutMs: number, read: (response: Response) => Promise<T>): Promise<T> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller ? controller.signal : undefined,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await read(response);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function fetchText(url: string, timeoutMs: number): Promise<string> {
  return fetchSheet(url, timeoutMs, (response) => response.text());
}

/** Time after which a failed request for the merged cells is not repeated. */
const MERGES_RETRY_WINDOW_MS = 3000;

/** Merged blocks of the tab (from the XLSX export). One quick retry, then the answer is "unknown". */
async function fetchMerges(url: string, timeoutMs: number): Promise<MergeRange[]> {
  const load = () =>
    fetchSheet(url, timeoutMs, async (response) => readXlsxMerges(new Uint8Array(await response.arrayBuffer())));
  const startedAt = Date.now();
  try {
    return await load();
  } catch (error) {
    if (Date.now() - startedAt > MERGES_RETRY_WINDOW_MS) throw error;
    await new Promise((resolve) => setTimeout(resolve, 300));
    return load();
  }
}

function looksLikeHtml(text: string): boolean {
  return /^\s*<(!doctype|html)/i.test(text);
}

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
export async function fetchDeals(
  sheetId: string,
  gid: string,
  currentYear: number,
  timeoutMs = 12000,
): Promise<DealsSheet> {
  const base = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}`;
  const tab = encodeURIComponent(gid || '0');

  const [csvResult, gvizResult, mergesResult] = await Promise.allSettled([
    fetchText(`${base}/export?format=csv&gid=${tab}`, timeoutMs),
    fetchText(`${base}/gviz/tq?tqx=out:json&headers=1&gid=${tab}`, timeoutMs),
    fetchMerges(`${base}/export?format=xlsx&gid=${tab}`, Math.min(timeoutMs, 8000)),
  ]);

  let csv: string[][] | null = null;
  if (csvResult.status === 'fulfilled' && !looksLikeHtml(csvResult.value)) {
    const rows = parseCsv(csvResult.value);
    csv = rows.length > 0 ? rows : null;
  }
  const gviz = gvizResult.status === 'fulfilled' ? parseGviz(gvizResult.value) : null;
  const merges = mergesResult.status === 'fulfilled' ? mergesResult.value : null;

  if (!csv && !gviz) {
    throw new Error('Deals sheet could not be loaded');
  }
  return {
    deals: buildDeals(csv, gviz, currentYear, merges),
    mergedBlocks: merges ? merges.length : null,
  };
}
