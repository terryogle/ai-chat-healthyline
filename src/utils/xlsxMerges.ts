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

/** Worksheets larger than this (unpacked) are not read; the sheet is then used without merge info. */
const MAX_UNPACKED_BYTES = 32 * 1024 * 1024;

/* -------------------------------------------------------------------------- */
/* DEFLATE                                                                     */
/* -------------------------------------------------------------------------- */

const MAX_BITS = 15;
const LENGTH_BASE = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258,
];
const LENGTH_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const DIST_BASE = [
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577,
];
const DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
const CODE_LENGTH_ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

interface Huffman {
  /** Number of codes of each bit length. */
  count: Uint16Array;
  /** Symbols ordered by code. */
  symbol: Uint16Array;
}

function buildHuffman(lengths: ArrayLike<number>, total: number): Huffman {
  const count = new Uint16Array(MAX_BITS + 1);
  for (let i = 0; i < total; i++) count[lengths[i]]++;
  const offsets = new Uint16Array(MAX_BITS + 2);
  for (let len = 1; len <= MAX_BITS; len++) offsets[len + 1] = offsets[len] + count[len];
  const symbol = new Uint16Array(total);
  for (let i = 0; i < total; i++) {
    if (lengths[i] !== 0) symbol[offsets[lengths[i]]++] = i;
  }
  return { count, symbol };
}

let fixedTables: { literals: Huffman; distances: Huffman } | null = null;

function getFixedTables(): { literals: Huffman; distances: Huffman } {
  if (!fixedTables) {
    const lengths = new Uint8Array(288);
    for (let i = 0; i < 288; i++) lengths[i] = i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8;
    const distances = new Uint8Array(30);
    for (let i = 0; i < 30; i++) distances[i] = 5;
    fixedTables = { literals: buildHuffman(lengths, 288), distances: buildHuffman(distances, 30) };
  }
  return fixedTables;
}

/**
 * Unpacks a raw DEFLATE stream. `size` is the unpacked size announced by the
 * archive; anything that does not fit, or any malformed input, throws.
 */
export function inflateRaw(source: Uint8Array, size: number): Uint8Array {
  if (!Number.isFinite(size) || size < 0 || size > MAX_UNPACKED_BYTES) {
    throw new Error('inflate: unsupported size');
  }
  const out = new Uint8Array(size);
  let outPos = 0;
  let pos = 0;
  let bitBuffer = 0;
  let bitCount = 0;

  const bits = (need: number): number => {
    let value = bitBuffer;
    while (bitCount < need) {
      if (pos >= source.length) throw new Error('inflate: unexpected end of data');
      value |= source[pos++] << bitCount;
      bitCount += 8;
    }
    bitBuffer = value >>> need;
    bitCount -= need;
    return value & ((1 << need) - 1);
  };

  const decode = (table: Huffman): number => {
    let code = 0;
    let first = 0;
    let index = 0;
    for (let len = 1; len <= MAX_BITS; len++) {
      code |= bits(1);
      const count = table.count[len];
      if (code - count < first) return table.symbol[index + (code - first)];
      index += count;
      first = (first + count) << 1;
      code <<= 1;
    }
    throw new Error('inflate: invalid code');
  };

  const readBlock = (literals: Huffman, distances: Huffman): void => {
    for (;;) {
      let symbol = decode(literals);
      if (symbol < 256) {
        if (outPos >= size) throw new Error('inflate: output overflow');
        out[outPos++] = symbol;
        continue;
      }
      if (symbol === 256) return;
      symbol -= 257;
      if (symbol >= LENGTH_BASE.length) throw new Error('inflate: invalid length');
      const length = LENGTH_BASE[symbol] + bits(LENGTH_EXTRA[symbol]);
      const distanceSymbol = decode(distances);
      if (distanceSymbol >= DIST_BASE.length) throw new Error('inflate: invalid distance');
      const distance = DIST_BASE[distanceSymbol] + bits(DIST_EXTRA[distanceSymbol]);
      if (distance > outPos) throw new Error('inflate: distance too far back');
      if (outPos + length > size) throw new Error('inflate: output overflow');
      for (let i = 0; i < length; i++, outPos++) out[outPos] = out[outPos - distance];
    }
  };

  let isLast = 0;
  do {
    isLast = bits(1);
    const type = bits(2);
    if (type === 0) {
      // Stored block: starts on a byte boundary.
      bitBuffer = 0;
      bitCount = 0;
      if (pos + 4 > source.length) throw new Error('inflate: unexpected end of data');
      const length = source[pos] | (source[pos + 1] << 8);
      const check = source[pos + 2] | (source[pos + 3] << 8);
      pos += 4;
      if ((length ^ 0xffff) !== check) throw new Error('inflate: invalid stored block');
      if (pos + length > source.length) throw new Error('inflate: unexpected end of data');
      if (outPos + length > size) throw new Error('inflate: output overflow');
      out.set(source.subarray(pos, pos + length), outPos);
      pos += length;
      outPos += length;
    } else if (type === 1) {
      const fixed = getFixedTables();
      readBlock(fixed.literals, fixed.distances);
    } else if (type === 2) {
      const literalCount = bits(5) + 257;
      const distanceCount = bits(5) + 1;
      const codeLengthCount = bits(4) + 4;
      if (literalCount > 286 || distanceCount > 30) throw new Error('inflate: invalid block header');

      const codeLengths = new Uint8Array(19);
      for (let i = 0; i < codeLengthCount; i++) codeLengths[CODE_LENGTH_ORDER[i]] = bits(3);
      const codeLengthTable = buildHuffman(codeLengths, 19);

      const total = literalCount + distanceCount;
      const lengths = new Uint8Array(total);
      let index = 0;
      while (index < total) {
        const symbol = decode(codeLengthTable);
        if (symbol < 16) {
          lengths[index++] = symbol;
          continue;
        }
        let repeated = 0;
        let times: number;
        if (symbol === 16) {
          if (index === 0) throw new Error('inflate: invalid repeat');
          repeated = lengths[index - 1];
          times = 3 + bits(2);
        } else if (symbol === 17) {
          times = 3 + bits(3);
        } else {
          times = 11 + bits(7);
        }
        if (index + times > total) throw new Error('inflate: invalid repeat');
        while (times-- > 0) lengths[index++] = repeated;
      }
      if (lengths[256] === 0) throw new Error('inflate: missing end-of-block code');
      readBlock(
        buildHuffman(lengths.subarray(0, literalCount), literalCount),
        buildHuffman(lengths.subarray(literalCount), distanceCount),
      );
    } else {
      throw new Error('inflate: invalid block type');
    }
  } while (!isLast);

  return outPos === size ? out : out.subarray(0, outPos);
}

/* -------------------------------------------------------------------------- */
/* ZIP                                                                         */
/* -------------------------------------------------------------------------- */

const END_OF_DIRECTORY = 0x06054b50;
const DIRECTORY_ENTRY = 0x02014b50;
const LOCAL_ENTRY = 0x04034b50;

function latin1(bytes: Uint8Array): string {
  let text = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    text += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as unknown as number[]);
  }
  return text;
}

/**
 * Returns the unpacked file chosen by `pick` (it receives every file name and
 * returns the one to read), or null when the archive has no such file.
 */
export function readZipEntry(archive: Uint8Array, pick: (names: string[]) => string | null): Uint8Array | null {
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
  const length = archive.length;

  // The directory record sits at the very end, possibly followed by a comment.
  let end = -1;
  for (let i = length - 22; i >= 0 && i >= length - 22 - 0xffff; i--) {
    if (view.getUint32(i, true) === END_OF_DIRECTORY) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error('zip: not an archive');

  const entryCount = view.getUint16(end + 10, true);
  let cursor = view.getUint32(end + 16, true);

  interface Entry {
    method: number;
    packedSize: number;
    size: number;
    offset: number;
  }
  const entries = new Map<string, Entry>();
  for (let i = 0; i < entryCount; i++) {
    if (cursor + 46 > length || view.getUint32(cursor, true) !== DIRECTORY_ENTRY) throw new Error('zip: bad directory');
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const name = latin1(archive.subarray(cursor + 46, cursor + 46 + nameLength));
    entries.set(name, {
      method: view.getUint16(cursor + 10, true),
      packedSize: view.getUint32(cursor + 20, true),
      size: view.getUint32(cursor + 24, true),
      offset: view.getUint32(cursor + 42, true),
    });
    cursor += 46 + nameLength + extraLength + commentLength;
  }

  const wanted = pick(Array.from(entries.keys()));
  const entry = wanted ? entries.get(wanted) : undefined;
  if (!entry) return null;

  if (entry.offset + 30 > length || view.getUint32(entry.offset, true) !== LOCAL_ENTRY) throw new Error('zip: bad entry');
  const start =
    entry.offset + 30 + view.getUint16(entry.offset + 26, true) + view.getUint16(entry.offset + 28, true);
  if (start + entry.packedSize > length) throw new Error('zip: truncated entry');
  const packed = archive.subarray(start, start + entry.packedSize);

  if (entry.method === 0) return packed;
  if (entry.method === 8) return inflateRaw(packed, entry.size);
  throw new Error('zip: unsupported compression');
}

/* -------------------------------------------------------------------------- */
/* Worksheet                                                                   */
/* -------------------------------------------------------------------------- */

function columnIndex(letters: string): number {
  let index = 0;
  for (let i = 0; i < letters.length; i++) index = index * 26 + (letters.charCodeAt(i) - 64);
  return index - 1;
}

/** Reads `<mergeCell ref="A8:A10"/>` entries from a worksheet XML. */
export function parseMergeRefs(xml: string): MergeRange[] {
  const ranges: MergeRange[] = [];
  const pattern = /<(?:\w+:)?mergeCell\b[^>]*?\bref="\$?([A-Z]{1,3})\$?(\d+)(?::\$?([A-Z]{1,3})\$?(\d+))?"/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(xml)) !== null) {
    const firstColumn = columnIndex(match[1]);
    const firstRow = Number(match[2]) - 1;
    const lastColumn = match[3] ? columnIndex(match[3]) : firstColumn;
    const lastRow = match[4] ? Number(match[4]) - 1 : firstRow;
    if (firstRow < 0 || lastRow < 0) continue;
    ranges.push({
      top: Math.min(firstRow, lastRow),
      left: Math.min(firstColumn, lastColumn),
      bottom: Math.max(firstRow, lastRow),
      right: Math.max(firstColumn, lastColumn),
    });
  }
  return ranges;
}

/**
 * The export of one tab holds exactly one worksheet (`xl/worksheets/sheet1.xml`).
 * If there are several, it is not known which one is the tab: nothing is picked.
 */
function pickWorksheet(names: string[]): string | null {
  const worksheets = names.filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name));
  return worksheets.length === 1 ? worksheets[0] : null;
}

/**
 * Merged blocks of the exported tab. An empty list means "no merged cells";
 * a file that cannot be read throws, so the caller knows the answer is unknown.
 */
export function readXlsxMerges(file: Uint8Array): MergeRange[] {
  const worksheet = readZipEntry(file, pickWorksheet);
  if (!worksheet) throw new Error('xlsx: worksheet not found');
  // Cell references are plain ASCII, so a byte-per-character reading is enough.
  const xml = latin1(worksheet);
  const from = xml.indexOf('mergeCells');
  return from < 0 ? [] : parseMergeRefs(xml.slice(from));
}
