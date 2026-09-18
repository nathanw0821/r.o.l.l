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

/**
 * Body heading level for a block, as rendered: "# " → h2, "## " → h3, "### " → h4.
 * Returns null for anything else ("#### " and deeper render as paragraphs, as before).
 */
export function guideHeadingLevel(trimmed: string): 2 | 3 | 4 | null {
  if (trimmed.startsWith("# ")) return 2;
  if (trimmed.startsWith("## ")) return 3;
  if (trimmed.startsWith("### ")) return 4;
  return null;
}

/** Heading text exactly as the parser shows it (first "#… " marker removed). */
export function guideHeadingText(trimmed: string, level: 2 | 3 | 4): string {
  const marker = level === 2 ? "# " : level === 3 ? "## " : "### ";
  return trimmed.replace(marker, "");
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
    const text = guideHeadingText(trimmed, level).trim();
    const base = slugifyHeading(text);
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    slugByBlock.set(idx, slug);
    entries.push({ level, text, slug });
  });
  return { entries, slugByBlock };
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

/** "Patch 30 (Fallout Worlds)" → "Patch 30, Fallout Worlds" so it reads inside one pair of brackets. */
export function flattenPatchLabel(patchVersion: string): string {
  return patchVersion.replace(/\s*\(([^)]*)\)\s*$/, ", $1").trim();
}
