/**
 * Deals tab — shared reactive store.
 *
 * One module-level store is shared by the launcher (tooltip line + dot) and by
 * the chat panel (Deals tab, Home carousel, header subtitle).
 *
 * The store keeps the whole sheet in memory and derives what is live "now"
 * from a ticking clock, so a new daily drop appears on its own at launch time
 * and edits made in the Google Sheet show up without rebuilding the widget.
 */
import { computed, ref } from 'vue';
import type { ChatOptions } from '../types';
import {
  extractSheetGid,
  extractSheetId,
  fetchDeals,
  formatShortDate,
  getDealEndDate,
  getSaleDay,
  getWallClock,
  groupDealsByDay,
  parseLaunchTime,
  parsePreviewClock,
  selectLiveDeals,
  toIsoDate,
} from '../utils/deals';
import type { Deal, DealsGroup, DealsSchedule, WallClock } from '../utils/deals';

/** Google Sheet that feeds the Deals tab unless `dealsSheetUrl` overrides it. */
export const DEFAULT_DEALS_SHEET_ID = '1S7ZNbLW8duM0KpBaHhW6S3uhAqTK2FRGemZeDBYhiLs';
export const DEFAULT_DEALS_TIME_ZONE = 'America/New_York';
export const DEFAULT_DEALS_LAUNCH_TIME = '09:00';
export const DEFAULT_DEALS_TITLE = 'Holiday Sale';
export const DEFAULT_DEALS_TAB_LABEL = 'Deals';
/** URL parameter for previewing another day, e.g. `?hl_deals_date=2026-11-18`. */
export const DEALS_PREVIEW_PARAM = 'hl_deals_date';

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
export const DEALS_STYLES_MARK = '3';
const DEALS_STYLES_PROPERTY = '--tt-chat-deals-styles';
/** Waits between the checks for a stylesheet that is still loading; later the minute tick takes over. */
const STYLES_CHECK_DELAYS_MS = [60, 140, 300, 500, 1000, 2000, 3000, 5000, 8000];

const DEFAULT_REFRESH_SECONDS = 300;
const MIN_REFRESH_SECONDS = 30;
/**
 * After a daily launch every open page re-reads the sheet (to catch last-minute
 * edits) at a random moment within this window, not all at the same second.
 */
const LAUNCH_REFRESH_SPREAD_MS = 45 * 1000;
/** Saved copies older than this are never shown, even if the sheet cannot be reached. */
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
/** Minimum pause between two requests triggered by the visitor (chat opened, tab focused). */
const MIN_REQUEST_GAP_MS = 20 * 1000;

const CACHE_KEY_PREFIX = 'tt-chat-deals:v2:';
/** Copies saved by earlier versions of the widget (other reading rules): removed on start. */
const OLD_CACHE_KEY_PREFIXES = ['tt-chat-deals:v1:'];
const SEEN_KEY = 'tt-chat-deals-seen';

export type DealsStatus = 'idle' | 'loading' | 'ready' | 'error';

interface DealsConfig {
  enabled: boolean;
  sheetId: string;
  gid: string;
  timeZone: string;
  launchHour: number;
  launchMinute: number;
  endDate: string | null;
  title: string;
  tabLabel: string;
  refreshMs: number;
  previewClock: WallClock | null;
}

function emptyConfig(): DealsConfig {
  return {
    enabled: false,
    sheetId: '',
    gid: '0',
    timeZone: DEFAULT_DEALS_TIME_ZONE,
    launchHour: 9,
    launchMinute: 0,
    endDate: null,
    title: DEFAULT_DEALS_TITLE,
    tabLabel: DEFAULT_DEALS_TAB_LABEL,
    refreshMs: DEFAULT_REFRESH_SECONDS * 1000,
    previewClock: null,
  };
}

/* ------------------------------- state ----------------------------------- */

const config = ref<DealsConfig>(emptyConfig());
const allDeals = ref<Deal[]>([]);
/** Merged blocks found in the sheet; null = that part could not be read (or nothing is loaded yet). */
const mergedBlocks = ref<number | null>(null);
const status = ref<DealsStatus>('idle');
const nowMs = ref(Date.now());
const seenDay = ref('');
/** Preview moment set at runtime (URL parameter or `setDealsPreviewDate`). */
const runtimePreview = ref<WallClock | null>(null);
/** The stylesheet with the Deals styles is loaded (see DEALS_STYLES_MARK). */
const stylesReady = ref(false);

let lastSuccessAt = 0;
let lastAttemptAt = 0;
let inFlight: Promise<void> | null = null;
let clockTimer: ReturnType<typeof setTimeout> | null = null;
let launchRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let visibilityHandler: (() => void) | null = null;
let stylesTimer: ReturnType<typeof setTimeout> | null = null;
let stylesLoadHandler: (() => void) | null = null;
let lastSaleDay = '';

/* ------------------------------ derived ---------------------------------- */

const clock = computed<WallClock>(
  () => runtimePreview.value || config.value.previewClock || getWallClock(nowMs.value, config.value.timeZone),
);

const schedule = computed<DealsSchedule>(() => ({
  launchHour: config.value.launchHour,
  launchMinute: config.value.launchMinute,
  endDate: config.value.endDate,
}));

/** The day whose drop is the latest one (changes at launch time, not at midnight). */
const saleDay = computed(() => getSaleDay(clock.value, schedule.value));

const liveDeals = computed<Deal[]>(() =>
  config.value.enabled && stylesReady.value ? selectLiveDeals(allDeals.value, clock.value, schedule.value) : [],
);

const groups = computed<DealsGroup[]>(() => groupDealsByDay(liveDeals.value));

/** Deals launched in the latest daily drop. */
const todayDeals = computed<Deal[]>(() => liveDeals.value.filter((deal) => deal.date === saleDay.value));

/** What the Home carousel shows: today's drop, or the most recent one. */
const featuredDeals = computed<Deal[]>(() => {
  if (todayDeals.value.length > 0) return todayDeals.value;
  return groups.value.length > 0 ? groups.value[0].deals : [];
});

const hasDeals = computed(() => liveDeals.value.length > 0);
const newTodayCount = computed(() => todayDeals.value.length);

/** Last day of the sale for the deals that are live now, e.g. `Nov 30`. */
const endLabel = computed(() => {
  let end = '';
  for (const deal of liveDeals.value) {
    const dealEnd = getDealEndDate(deal, schedule.value);
    if (dealEnd > end) end = dealEnd;
  }
  return end ? formatShortDate(end) : '';
});

const title = computed(() => config.value.title);
const tabLabel = computed(() => config.value.tabLabel);
const isEnabled = computed(() => config.value.enabled);
const isPreview = computed(() => !!(runtimePreview.value || config.value.previewClock));

/** True until the visitor has opened the chat after the latest drop. */
const hasUnseen = computed(() => newTodayCount.value > 0 && seenDay.value !== saleDay.value);

/* ------------------------------ storage ---------------------------------- */

function cacheKey(): string {
  return `${CACHE_KEY_PREFIX}${config.value.sheetId}:${config.value.gid}`;
}

function readCache(): { at: number; deals: Deal[]; mergedBlocks: number | null } | null {
  try {
    const raw = window.localStorage.getItem(cacheKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.at !== 'number' || !Array.isArray(parsed.deals)) return null;
    const age = Date.now() - parsed.at;
    if (age < 0 || age > CACHE_MAX_AGE_MS) return null;
    const deals = (parsed.deals as Deal[]).filter(
      (deal) => deal && typeof deal.date === 'string' && typeof deal.name === 'string' && typeof deal.id === 'string',
    );
    return { at: parsed.at, deals, mergedBlocks: typeof parsed.merged === 'number' ? parsed.merged : null };
  } catch {
    return null;
  }
}

function writeCache(deals: Deal[], merged: number | null): void {
  try {
    window.localStorage.setItem(cacheKey(), JSON.stringify({ at: Date.now(), deals, merged }));
  } catch {
    // Storage may be blocked or full: the widget simply refetches next time.
  }
}

function dropOldCaches(): void {
  try {
    const suffix = `${config.value.sheetId}:${config.value.gid}`;
    for (const prefix of OLD_CACHE_KEY_PREFIXES) window.localStorage.removeItem(`${prefix}${suffix}`);
  } catch {
    // Ignore storage issues
  }
}

function readSeenDay(): string {
  try {
    return window.localStorage.getItem(SEEN_KEY) || '';
  } catch {
    return '';
  }
}

/* ------------------------------ loading ---------------------------------- */

/**
 * Reloads the sheet. Without `force` the call is skipped when the data was
 * requested a few seconds ago.
 */
export function refreshDeals(force = false): Promise<void> {
  const current = config.value;
  if (!current.enabled || !current.sheetId || typeof fetch !== 'function') return Promise.resolve();
  if (inFlight) return inFlight;
  if (!force && Date.now() - lastAttemptAt < MIN_REQUEST_GAP_MS) return Promise.resolve();

  lastAttemptAt = Date.now();
  if (status.value !== 'ready') status.value = 'loading';
  const requestedSheet = `${current.sheetId}:${current.gid}`;
  const year = Number(clock.value.date.slice(0, 4));

  inFlight = fetchDeals(current.sheetId, current.gid, year)
    .then((sheet) => {
      // Ignore the answer if the widget was reconfigured in the meantime.
      if (`${config.value.sheetId}:${config.value.gid}` !== requestedSheet) return;
      allDeals.value = sheet.deals;
      mergedBlocks.value = sheet.mergedBlocks;
      status.value = 'ready';
      lastSuccessAt = Date.now();
      writeCache(sheet.deals, sheet.mergedBlocks);
    })
    .catch(() => {
      // Keep whatever is already on screen; report an error only if there is nothing.
      if (`${config.value.sheetId}:${config.value.gid}` !== requestedSheet) return;
      if (status.value !== 'ready') status.value = 'error';
    })
    .then(() => {
      inFlight = null;
    });
  return inFlight;
}

function isPageVisible(): boolean {
  return typeof document === 'undefined' || document.visibilityState !== 'hidden';
}

/* ------------------------------- styles ---------------------------------- */

/** True once the loaded stylesheet carries the mark of this script's Deals styles. */
function checkStyles(): boolean {
  if (stylesReady.value) return true;
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return false;
  try {
    const mark = getComputedStyle(document.documentElement).getPropertyValue(DEALS_STYLES_PROPERTY).trim();
    if (mark === DEALS_STYLES_MARK) stylesReady.value = true;
  } catch {
    /* not readable now: checked again later */
  }
  return stylesReady.value;
}

function stopStylesWatch(): void {
  if (stylesTimer) clearTimeout(stylesTimer);
  stylesTimer = null;
  if (stylesLoadHandler && typeof window !== 'undefined') {
    window.removeEventListener('load', stylesLoadHandler);
  }
  stylesLoadHandler = null;
}

/** The stylesheet may still be on its way (it is a separate file): look again a few times. */
function watchStyles(): void {
  stopStylesWatch();
  if (checkStyles()) return;

  let attempt = 0;
  const again = (): void => {
    stylesTimer = null;
    if (checkStyles()) {
      stopStylesWatch();
      return;
    }
    if (attempt < STYLES_CHECK_DELAYS_MS.length) {
      stylesTimer = setTimeout(again, STYLES_CHECK_DELAYS_MS[attempt]);
      attempt += 1;
    }
  };
  stylesLoadHandler = () => {
    if (checkStyles()) stopStylesWatch();
  };
  window.addEventListener('load', stylesLoadHandler);
  again();
}

/**
 * Re-reads the clock. All rows of the sheet are already in memory, so when the
 * launch time passes the new drop shows up at once, without a request.
 */
function tick(): void {
  nowMs.value = Date.now();
  checkStyles();
  if (lastSaleDay && saleDay.value !== lastSaleDay) {
    // A new drop just went live (or the sale just ended): also pick up any
    // last-minute edits made in the sheet.
    if (launchRefreshTimer) clearTimeout(launchRefreshTimer);
    launchRefreshTimer = setTimeout(() => {
      launchRefreshTimer = null;
      if (isPageVisible()) refreshDeals(true);
    }, 1000 + Math.random() * LAUNCH_REFRESH_SPREAD_MS);
  }
  lastSaleDay = saleDay.value;
}

/** Wakes up right after every full minute, so a drop appears exactly at launch time. */
function scheduleTick(): void {
  const untilNextMinute = 60000 - (Date.now() % 60000);
  clockTimer = setTimeout(() => {
    tick();
    scheduleTick();
  }, untilNextMinute + 200);
}

/* ------------------------------ lifecycle -------------------------------- */

export function stopDeals(): void {
  if (clockTimer) clearTimeout(clockTimer);
  if (launchRefreshTimer) clearTimeout(launchRefreshTimer);
  if (refreshTimer) clearInterval(refreshTimer);
  clockTimer = null;
  launchRefreshTimer = null;
  refreshTimer = null;
  stopStylesWatch();
  if (visibilityHandler && typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', visibilityHandler);
  }
  visibilityHandler = null;
}

function readPreviewFromUrl(): WallClock | null {
  try {
    const value = new URLSearchParams(window.location.search).get(DEALS_PREVIEW_PARAM);
    return parsePreviewClock(value);
  } catch {
    return null;
  }
}

function buildConfig(options: ChatOptions): DealsConfig {
  const base = emptyConfig();
  const source = (options.dealsSheetUrl || options.dealsSheetId || DEFAULT_DEALS_SHEET_ID).trim();
  const sheetId = extractSheetId(source);
  const gid = String(options.dealsSheetGid ?? '').trim() || extractSheetGid(source) || '0';
  const [launchHour, launchMinute] = parseLaunchTime(options.dealsLaunchTime || DEFAULT_DEALS_LAUNCH_TIME);

  let endDate: string | null = null;
  const endMatch = String(options.dealsEndDate ?? '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (endMatch) endDate = toIsoDate(Number(endMatch[1]), Number(endMatch[2]), Number(endMatch[3]));

  const refreshSeconds = Number(options.dealsRefreshSeconds ?? DEFAULT_REFRESH_SECONDS);
  const refreshMs =
    Number.isFinite(refreshSeconds) && refreshSeconds > 0
      ? Math.max(MIN_REFRESH_SECONDS, refreshSeconds) * 1000
      : 0;

  return {
    ...base,
    enabled: options.showDeals !== false && !!sheetId,
    sheetId,
    gid,
    timeZone: (options.dealsTimeZone || '').trim() || DEFAULT_DEALS_TIME_ZONE,
    launchHour,
    launchMinute,
    endDate,
    title: (options.dealsTitle || '').trim() || DEFAULT_DEALS_TITLE,
    tabLabel: (options.dealsTabLabel || '').trim() || DEFAULT_DEALS_TAB_LABEL,
    refreshMs,
    previewClock: parsePreviewClock(options.dealsPreviewDate),
  };
}

/** Called once by the chat plugin when the widget is created. */
export function startDeals(options: ChatOptions): void {
  stopDeals();

  const next = buildConfig(options);
  const sheetChanged = next.sheetId !== config.value.sheetId || next.gid !== config.value.gid;
  config.value = next;

  if (sheetChanged) {
    allDeals.value = [];
    mergedBlocks.value = null;
    status.value = 'idle';
    lastSuccessAt = 0;
    lastAttemptAt = 0;
  }

  if (!next.enabled || typeof window === 'undefined') return;

  watchStyles();
  runtimePreview.value = options.dealsAllowUrlPreview === false ? null : readPreviewFromUrl();
  seenDay.value = readSeenDay();
  nowMs.value = Date.now();
  lastSaleDay = saleDay.value;

  // While browsing from page to page a visitor re-reads the sheet at most once
  // per refresh interval: the copy saved by the previous page is shown at once
  // and is only refreshed when it is older than that. (Opening the chat and the
  // daily launch moment always ask for the latest sheet, see below.)
  const freshMs = next.refreshMs > 0 ? next.refreshMs : DEFAULT_REFRESH_SECONDS * 1000;
  let cacheIsFresh = false;
  if (sheetChanged) {
    dropOldCaches();
    const cached = readCache();
    if (cached) {
      allDeals.value = cached.deals;
      mergedBlocks.value = cached.mergedBlocks;
      status.value = 'ready';
      lastSuccessAt = cached.at;
      cacheIsFresh = Date.now() - cached.at < freshMs;
    }
  }
  if (!cacheIsFresh) refreshDeals(true);

  scheduleTick();
  if (next.refreshMs > 0) {
    refreshTimer = setInterval(() => {
      if (isPageVisible()) refreshDeals(true);
    }, next.refreshMs);
  }

  visibilityHandler = () => {
    if (!isPageVisible()) return;
    tick();
    // Coming back to the page after a while: make sure the list is current.
    if (Date.now() - lastSuccessAt > freshMs) refreshDeals();
  };
  document.addEventListener('visibilitychange', visibilityHandler);
}

/**
 * Preview helper for testing: pretend "now" is another moment in the sale
 * time zone. Accepts `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`; `null` returns to the
 * real clock. Returns false when the value could not be understood.
 */
export function setDealsPreviewDate(value: string | null | undefined): boolean {
  if (value === null || value === undefined || value === '') {
    runtimePreview.value = null;
    nowMs.value = Date.now();
    lastSaleDay = saleDay.value;
    return true;
  }
  const parsed = parsePreviewClock(value);
  if (!parsed) return false;
  runtimePreview.value = parsed;
  lastSaleDay = saleDay.value;
  return true;
}

/** Remembers that the visitor has seen the latest drop (hides the launcher dot). */
function markSeen(): void {
  if (newTodayCount.value === 0 || seenDay.value === saleDay.value) return;
  seenDay.value = saleDay.value;
  // A previewed day must not change what the visitor has really seen.
  if (isPreview.value) return;
  try {
    window.localStorage.setItem(SEEN_KEY, saleDay.value);
  } catch {
    // Ignore storage issues
  }
}

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
  days: Array<{ date: string; label: string; count: number }>;
}

/** Plain, non-reactive summary for the test page and for troubleshooting. */
export function getDealsSnapshot(): DealsSnapshot {
  const current = config.value;
  const counts = new Map<string, number>();
  for (const deal of allDeals.value) counts.set(deal.date, (counts.get(deal.date) || 0) + 1);
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return {
    enabled: current.enabled,
    status: status.value,
    sheetId: current.sheetId,
    gid: current.gid,
    timeZone: current.timeZone,
    launchTime: `${pad(current.launchHour)}:${pad(current.launchMinute)}`,
    clock: { ...clock.value },
    isPreview: isPreview.value,
    mergedBlocks: mergedBlocks.value,
    stylesReady: checkStyles(),
    totalDeals: allDeals.value.length,
    liveDeals: liveDeals.value.length,
    newToday: newTodayCount.value,
    endLabel: endLabel.value,
    days: Array.from(counts.keys())
      .sort()
      .map((date) => ({ date, label: formatShortDate(date), count: counts.get(date) as number })),
  };
}

export function useDeals() {
  return {
    /** Deals feature is switched on (it may still have nothing live). */
    isEnabled,
    status,
    title,
    tabLabel,
    /** At least one deal is live right now. */
    hasDeals,
    /** Live deals grouped by launch day, newest first. */
    groups,
    /** Deals from the latest drop, or from the most recent day that had one. */
    featuredDeals,
    /** Number of deals launched in the latest daily drop. */
    newTodayCount,
    endLabel,
    hasUnseen,
    isPreview,
    markSeen,
    refresh: refreshDeals,
  };
}
