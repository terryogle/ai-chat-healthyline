/**
 * Deals tab — merged cells of the Google Sheet.
 *
 * The CSV and JSON answers of Google Sheets do not say which cells are merged:
 * a merged block comes back as one filled cell followed by empty ones. The only
 * key-less answer that carries this information is the XLSX export, so the
 * widget reads the list of merged blocks from it — and nothing else: every text
 * still comes from the CSV export, exactly as it is displayed in the sheet.
 *
 * An XLSX file is a ZIP archive. This module holds the minimum needed to pull
 * one worksheet out of it: a ZIP directory reader and a DEFLATE decoder
 * (RFC 1951). It has no dependencies and behaves the same in every browser.
 */
export interface MergeRange {
    /** Zero-based and inclusive: row 0 = sheet row 1, column 0 = column A. */
    top: number;
    left: number;
    bottom: number;
    right: number;
}
/**
 * Unpacks a raw DEFLATE stream. `size` is the unpacked size announced by the
 * archive; anything that does not fit, or any malformed input, throws.
 */
export declare function inflateRaw(source: Uint8Array, size: number): Uint8Array;
/**
 * Returns the unpacked file chosen by `pick` (it receives every file name and
 * returns the one to read), or null when the archive has no such file.
 */
export declare function readZipEntry(archive: Uint8Array, pick: (names: string[]) => string | null): Uint8Array | null;
/** Reads `<mergeCell ref="A8:A10"/>` entries from a worksheet XML. */
export declare function parseMergeRefs(xml: string): MergeRange[];
/**
 * Merged blocks of the exported tab. An empty list means "no merged cells";
 * a file that cannot be read throws, so the caller knows the answer is unknown.
 */
export declare function readXlsxMerges(file: Uint8Array): MergeRange[];
