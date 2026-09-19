/**
 * Pure helpers for the /wiki reading view: body block rules shared with the page's
 * mini-markdown parser, heading slugs + the "On this page" table of contents, and the
 * related-guides selection. Unit tested in guide-reader.test.ts.
 */
import { findEntityMatches } from "@/lib/links/entity-links";

/** Body blocks are separated by blank lines, exactly as the reader's parser splits them. */
export function splitGuideBlocks(content: string): string[] {
  return content ? content.split(/\n\s*\n/) : [];
}

/** Scraped page chrome the reader never renders (kept identical to the parser's former inline list). */
export function isSkippedGuideBlock(trimmed: string): boolean {
  return (
    /^top of page$/i.test(trimmed) ||
    /^home:\s*/i.test(trimmed) ||
    /^specifications$/i.test(trimmed) ||
    /^category:/i.test(trimmed) ||
    /^source:/i.test(trimmed) ||
    /^view canonical entry/i.test(trimmed) ||
    /^writer:\s*duchess flame/i.test(trimmed) ||
    /^search all \d+/i.test(trimmed) ||
    /^test in b\.u\.i\.l\.d\./i.test(trimmed) ||
    /^view in p\.e\.r\.k\./i.test(trimmed)
  );
}

/** Trimmed block with the "2024" + "5 min read" byline fix applied, as the parser renders it. */
export function normalizeGuideBlock(block: string): string {
  return block.trim().replace(/(\d{4})(\d+\s*min\s*read)/i, "$1 • $2");
}

/** Rendered heading levels: the page title is the h1, so body markdown starts at h2. */
export type GuideHeadingLevel = 2 | 3 | 4 | 5 | 6;

/**
 * "#"–"######" then whitespace ("## Crafting", "##\n Bigfoot"), or two or more "#" glued to the
 * text ("##Challenges", a scrape artefact). A single "#" glued to text is not a heading ("#5 Things").
 */
const HEADING_MARKER = /^(#{1,6})(\s*)(?=[^\s#])/;

/**
 * Body heading level for a block, as rendered: "# " → h2, "## " → h3, "### " → h4,
 * "#### " → h5, "##### " and "###### " → h6. Returns null for anything else.
 */
export function guideHeadingLevel(trimmed: string): GuideHeadingLevel | null {
  const match = HEADING_MARKER.exec(trimmed);
  if (!match) return null;
  const hashes = match[1].length;
  if (!match[2] && hashes < 2) return null;
  return Math.min(6, hashes + 1) as GuideHeadingLevel;
}

/**
 * Heading text as the reader shows it: the "#… " marker removed, whitespace collapsed and
 * markdown emphasis dropped (headings are already set in the heading face, so "**Step 2**"
 * would otherwise show its asterisks).
 */
export function guideHeadingText(trimmed: string): string {
  return trimmed
    .replace(/^#{1,6}\s*/, "")
    .replace(/(\*{1,3}|_{2})(\S(?:.*?\S)?)\1/g, "$2")
    .replace(/\s+/g, " ")
    .trim();
}

export interface GuideTableRow {
  cells: string[];
  /** A one-cell label inside a wider table ("★★★★" above the four-star mods): spans every column. */
  group: boolean;
}

export interface GuideTable {
  /** A title row with one filled cell above the real header ("Strength" over the perk columns). */
  caption: string | null;
  /** The column header row, or null when the first row is data (the scrape dropped the header). */
  header: string[] | null;
  rows: GuideTableRow[];
  /** Column count after trailing all-empty columns are dropped. */
  columns: number;
}

/** Cells of one "| a | b |" line; a missing closing pipe ("| S Strength") keeps the last cell. */
function tableCells(line: string): string[] {
  const trimmed = line.trim();
  const parts = trimmed.split("|").slice(1);
  if (trimmed.endsWith("|") && parts.length > 0) parts.pop();
  return parts.map((c) => c.trim());
}

/** A markdown separator row: every cell is "---", ":--", "--:" or ":-:" (three dashes or more). */
function isSeparatorLine(line: string): boolean {
  const cells = tableCells(line);
  return cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function plainCell(cell: string): string {
  return cell.replace(/(\*{1,3}|_{2}|`)(\S(?:.*?\S)?)\1/g, "$2").trim();
}

/**
 * A cell that can be a column label: short, and not a value. Values are numbers ("51", "x0.13",
 * "+2", "1.5"), Form IDs ("0050DE51") and anything longer than a label (sentences, notices,
 * "Bow • Compound Bow • …" navigation lists).
 */
function isLabelCell(cell: string): boolean {
  const text = plainCell(cell);
  if (!text) return true;
  if (text.length > 40) return false;
  if (/\d/.test(text) && /^[\d\s.,%+\-–−x×/()~]+$/i.test(text)) return false;
  if (/^[0-9A-F]{8}$/.test(text)) return false;
  return true;
}

function filledCount(cells: string[]): number {
  return cells.reduce((n, c) => n + (c ? 1 : 0), 0);
}

/** Only the first cell is filled, in a table with other columns. */
function isTitleRow(cells: string[], columns: number): boolean {
  return columns > 1 && Boolean(cells[0]) && filledCount(cells) === 1;
}

/**
 * Structure of a guide table block. The scraped corpus has no markdown separator rows, and the
 * scraper dropped some tables' header rows, so "row 0 is the header" was wrong in two ways:
 *  - data tables with no header (armor stats "| | Raider Power Helmet | 51 | …", challenge lists
 *    "| Collect a RadAway … | 20 |", notices "| This page is about …") had their first data row
 *    styled as the header. The first row is now the header only when every cell is a label.
 *  - tables with a title row above the header ("Strength", then "Perk | Req | Description | …")
 *    styled the title as the header and the real header as data. The title becomes the caption.
 * A markdown separator row ("|---|---|"), if a future import has one, marks the header outright.
 * One-cell rows inside a wider table become group labels, and trailing empty columns are dropped.
 */
export function parseGuideTable(block: string): GuideTable {
  const lines = block.split("\n").filter((line) => line.trim().startsWith("|"));
  const separatorAt = lines.findIndex(isSeparatorLine);
  const raw: Array<{ cells: string[]; beforeSeparator: boolean }> = [];
  lines.forEach((line, i) => {
    if (isSeparatorLine(line)) return;
    const cells = tableCells(line);
    if (filledCount(cells) === 0) return;
    raw.push({ cells, beforeSeparator: separatorAt > 0 && i < separatorAt });
  });

  // Trailing columns that are empty in every row are scrape padding.
  let columns = 0;
  for (const { cells } of raw) {
    let last = cells.length;
    while (last > 0 && !cells[last - 1]) last--;
    columns = Math.max(columns, last);
  }
  const rows = raw.map(({ cells, beforeSeparator }) => ({ cells: cells.slice(0, columns), beforeSeparator }));

  let caption: string | null = null;
  let header: string[] | null = null;
  let start = 0;
  const isLabelRow = (cells: string[]) => filledCount(cells) > 0 && cells.every(isLabelCell);

  if (separatorAt > 0 && rows.some((r) => r.beforeSeparator)) {
    const headerIdx = rows.filter((r) => r.beforeSeparator).length - 1;
    if (headerIdx === 1 && isTitleRow(rows[0].cells, columns)) caption = plainCell(rows[0].cells[0]);
    header = rows[headerIdx].cells;
    start = headerIdx + 1;
  } else if (
    rows.length >= 2 &&
    isTitleRow(rows[0].cells, columns) &&
    filledCount(rows[1].cells) >= 2 &&
    isLabelRow(rows[1].cells)
  ) {
    caption = plainCell(rows[0].cells[0]);
    header = rows[1].cells;
    start = 2;
  } else if (rows.length > 0 && isLabelRow(rows[0].cells)) {
    header = rows[0].cells;
    start = 1;
  }

  const body = rows.slice(start).map(({ cells }) => ({
    cells,
    group: columns >= 3 && isTitleRow(cells, columns) && cells.length === 1,
  }));
  return { caption, header, rows: body, columns };
}

/** URL-safe slug: lower case, letters/digits joined by single hyphens, markdown emphasis dropped. */
export function slugifyHeading(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[*_`~]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/g, "");
  return slug || "section";
}

export interface GuideTocEntry {
  /** Heading level as rendered (2 = "# ", 3 = "## "). */
  level: 2 | 3;
  text: string;
  slug: string;
}

export interface GuideToc {
  entries: GuideTocEntry[];
  /** Block index (in `splitGuideBlocks` order) → id for every h2/h3 in the body. */
  slugByBlock: Map<number, string>;
}

/** Headings needed before the reader shows a table of contents. */
export const MIN_TOC_ENTRIES = 3;

/**
 * Stable, unique ids for every h2/h3 in a guide body (duplicates get "-2", "-3", …) and the
 * matching table-of-contents entries in reading order. Block indexes line up with the parser.
 */
export function buildGuideToc(content: string): GuideToc {
  const entries: GuideTocEntry[] = [];
  const slugByBlock = new Map<number, string>();
  const used = new Set<string>();
  splitGuideBlocks(content).forEach((block, idx) => {
    if (!block.trim() || isSkippedGuideBlock(block.trim())) return;
    const trimmed = normalizeGuideBlock(block);
    const level = guideHeadingLevel(trimmed);
    if (level !== 2 && level !== 3) return;
    const text = guideHeadingText(trimmed);
    const base = slugifyHeading(text);
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    slugByBlock.set(idx, slug);
    entries.push({ level, text, slug });
  });
  return { entries, slugByBlock };
}

/**
 * Where a contents heading sits relative to the reading band (the top 40% of the viewport),
 * as the reader's IntersectionObserver reports it.
 */
export type SectionPosition = "above" | "in" | "below";

/** Top share of the viewport that counts as "being read": the observer's rootMargin keeps this band. */
export const READING_BAND = 0.4;

/**
 * The section being read, given each contents heading's position in reading order: the first
 * heading inside the reading band, else the last one already scrolled past, else none (still
 * above the first heading).
 */
export function pickActiveSection<T>(items: ReadonlyArray<T>, positions: ReadonlyArray<SectionPosition>): T | null {
  const inBand = positions.indexOf("in");
  if (inBand >= 0) return items[inBand] ?? null;
  const above = positions.lastIndexOf("above");
  return above >= 0 ? (items[above] ?? null) : null;
}

export interface RelatedGuideCandidate {
  id: number | string;
  title: string;
  snippet?: string;
  category?: string;
  archived?: boolean;
}

/** Entity keys linked from a guide's title + snippet (the same map that links reader terms). */
export function guideEntityKeys(guide: { title: string; snippet?: string }): Set<string> {
  const text = `${guide.title} ${guide.snippet ?? ""}`;
  return new Set(findEntityMatches(text).map((m) => m.entity.key));
}

const TITLE_STOPWORDS: ReadonlySet<string> = new Set([
  "fallout", "guide", "guides", "with", "from", "this", "that", "your", "what", "when", "where", "which",
  "update", "patch", "notes", "list", "about", "into", "best", "2024", "2025", "2026",
]);

/** Distinct title words (4+ letters, no stopwords), used only to break ties between equally related guides. */
export function titleWords(title: string): Set<string> {
  const words = title.toLowerCase().match(/[a-z0-9]{4,}/g) ?? [];
  return new Set(words.filter((w) => !TITLE_STOPWORDS.has(w)));
}

export interface RelatedGuideOptions {
  limit?: number;
  /** Injected for tests; defaults to `guideEntityKeys`. */
  entityKeys?: (guide: RelatedGuideCandidate) => Set<string>;
}

/**
 * Up to `limit` (5) related guides: same category first, then guides from other categories that
 * share at least one linked game entity. Within each group more shared entities rank higher,
 * then more shared title words ("Raider Power Armor" → other power armor guides); remaining ties
 * keep the candidates' order. The guide itself, archived guides and duplicates are excluded.
 */
export function selectRelatedGuides<T extends RelatedGuideCandidate>(
  current: RelatedGuideCandidate,
  candidates: ReadonlyArray<T>,
  options: RelatedGuideOptions = {},
): T[] {
  const limit = options.limit ?? 5;
  const keysOf = options.entityKeys ?? guideEntityKeys;
  const currentKeys = keysOf(current);
  const currentId = String(current.id);
  const currentWords = titleWords(current.title);
  const seen = new Set<string>([currentId]);
  const scored: Array<{ item: T; same: boolean; shared: number; words: number; order: number }> = [];
  candidates.forEach((item, order) => {
    const id = String(item.id);
    if (seen.has(id) || item.archived) return;
    seen.add(id);
    const same = Boolean(current.category) && item.category === current.category;
    let shared = 0;
    if (currentKeys.size > 0) {
      for (const key of keysOf(item)) if (currentKeys.has(key)) shared++;
    }
    if (!same && shared === 0) return;
    let words = 0;
    for (const word of titleWords(item.title)) if (currentWords.has(word)) words++;
    scored.push({ item, same, shared, words, order });
  });
  scored.sort(
    (a, b) => Number(b.same) - Number(a.same) || b.shared - a.shared || b.words - a.words || a.order - b.order,
  );
  return scored.slice(0, Math.max(0, limit)).map((s) => s.item);
}

/** Previous / next guide ids within the current result page's order; null at the ends or when absent. */
export function adjacentGuides<T extends { id: number | string }>(
  list: ReadonlyArray<T>,
  currentId: number | string | null | undefined,
): { index: number; prev: T | null; next: T | null } {
  if (currentId === null || currentId === undefined) return { index: -1, prev: null, next: null };
  const index = list.findIndex((a) => String(a.id) === String(currentId));
  if (index < 0) return { index, prev: null, next: null };
  return {
    index,
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  };
}

/** The guide's source URL when it is an absolute http(s) link we can send readers to; null otherwise. */
export function externalSourceUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

/** "Patch 30 (Fallout Worlds)" → "Patch 30, Fallout Worlds" so it reads inside one pair of brackets. */
export function flattenPatchLabel(patchVersion: string): string {
  return patchVersion.replace(/\s*\(([^)]*)\)\s*$/, ", $1").trim();
}
