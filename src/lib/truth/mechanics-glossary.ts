/**
 * Typed loader for `src/data/truth/mechanics-glossary.json` (WS5 "Hyperlinking" item 5): the
 * mechanics glossary rendered at `/wiki/glossary`, and the "glossary" kind of the entity link map.
 *
 * Validation runs at import, so a malformed entry fails the build and the tests instead of
 * rendering a broken anchor: slug shape and uniqueness, 1 or 2 sentence definitions, a numeric
 * `verifiedPatch`, a `source`, and `seeAlso` hrefs that are internal (start with a single "/").
 */

import rawGlossary from "@/data/truth/mechanics-glossary.json";

export type GlossaryTerm = {
  /** Display name, sentence case except for proper game names ("Vault Steel", "Kill Streak"). */
  term: string;
  /** Anchor id on /wiki/glossary; lower-case words joined by hyphens. */
  slug: string;
  /** One or two plain sentences. */
  definition: string;
  /** Patch the numbers were last checked against. */
  verifiedPatch: number;
  /** Where the facts come from (truth-pack file and key, calculator, worklog or review). */
  source: string;
  /** Internal hrefs only. */
  seeAlso: string[];
};

type RawGlossary = { patch: number; verifiedAt: string; terms: GlossaryTerm[] };

export const GLOSSARY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Sentence count for the "1 or 2 sentences" rule; decimals ("0.1%") and "S.P.E.C.I.A.L." do not end a sentence. */
export function countSentences(text: string): number {
  const stripped = text
    .replace(/S\.P\.E\.C\.I\.A\.L\./g, "SPECIAL")
    .replace(/V\.A\.T\.S\./g, "VATS")
    .replace(/R\.O\.L\.L\.(?:'s)?/g, "ROLL")
    .replace(/\d\.\d/g, "0");
  // A sentence ends at . ! or ? followed by the end or by a space and a capital/digit ("Nerd Rage! have" does not).
  return stripped.split(/[.!?](?:\s+(?=[A-Z0-9(])|\s*$)/).filter((s) => s.trim().length > 0).length;
}

/** Internal href: one leading slash, no protocol, no "//" host. */
export function isInternalHref(href: string): boolean {
  return /^\/(?!\/)/.test(href) && !/^[a-z][a-z0-9+.-]*:/i.test(href);
}

export function validateGlossary(raw: RawGlossary): GlossaryTerm[] {
  if (!raw || !Array.isArray(raw.terms)) throw new Error("mechanics-glossary.json: missing terms[]");
  const seenSlugs = new Set<string>();
  const seenTerms = new Set<string>();
  for (const t of raw.terms) {
    const where = `mechanics-glossary.json "${t?.term ?? "?"}"`;
    if (!t.term?.trim()) throw new Error(`${where}: empty term`);
    if (!GLOSSARY_SLUG_PATTERN.test(t.slug)) throw new Error(`${where}: bad slug "${t.slug}"`);
    if (seenSlugs.has(t.slug)) throw new Error(`${where}: duplicate slug`);
    seenSlugs.add(t.slug);
    const termKey = t.term.trim().toLowerCase();
    if (seenTerms.has(termKey)) throw new Error(`${where}: duplicate term`);
    seenTerms.add(termKey);
    const sentences = countSentences(t.definition ?? "");
    if (sentences < 1 || sentences > 2) throw new Error(`${where}: definition must be 1 or 2 sentences (got ${sentences})`);
    if (!Number.isInteger(t.verifiedPatch) || t.verifiedPatch <= 0) throw new Error(`${where}: verifiedPatch must be a patch number`);
    if (!t.source?.trim()) throw new Error(`${where}: missing source`);
    if (!Array.isArray(t.seeAlso)) throw new Error(`${where}: seeAlso must be an array`);
    for (const href of t.seeAlso) {
      if (!isInternalHref(href)) throw new Error(`${where}: seeAlso "${href}" is not an internal href`);
    }
  }
  return raw.terms;
}

export const GLOSSARY_PATCH: number = (rawGlossary as RawGlossary).patch;
export const GLOSSARY_VERIFIED_AT: string = (rawGlossary as RawGlossary).verifiedAt;

/** Terms in A–Z order (digits first), as the page lists them. */
export const GLOSSARY_TERMS: readonly GlossaryTerm[] = [...validateGlossary(rawGlossary as RawGlossary)].sort((a, b) =>
  a.term.localeCompare(b.term, "en", { sensitivity: "base", numeric: true })
);

export const GLOSSARY_SLUGS: ReadonlySet<string> = new Set(GLOSSARY_TERMS.map((t) => t.slug));

export function glossaryHref(slug: string): string {
  return `/wiki/glossary#${slug}`;
}

/** Index letter for the A–Z bar: first letter upper-cased, "#" for a digit or symbol. */
export function glossaryLetter(term: string): string {
  const first = term.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

/** Terms grouped by index letter, in page order ("#" first). */
export function groupGlossaryByLetter(terms: readonly GlossaryTerm[] = GLOSSARY_TERMS): Array<{ letter: string; terms: GlossaryTerm[] }> {
  const groups = new Map<string, GlossaryTerm[]>();
  for (const t of terms) {
    const letter = glossaryLetter(t.term);
    const list = groups.get(letter) ?? [];
    list.push(t);
    groups.set(letter, list);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => (a === "#" ? -1 : b === "#" ? 1 : a.localeCompare(b)))
    .map(([letter, list]) => ({ letter, terms: list }));
}

const TAB_LABELS: Record<string, string> = {
  gear: "Builder: gear",
  perks: "Builder: perk deck",
  biometrics: "Builder: biometrics",
  combat: "Builder: combat damage"
};

const PAGE_LABELS: Record<string, string> = {
  "/all-effects": "Legendary tracker",
  "/1-star": "1-star mods",
  "/2-star": "2-star mods",
  "/3-star": "3-star mods",
  "/4-star": "4-star mods",
  "/build": "Builder",
  "/perks": "Perk cards",
  "/wiki": "Guides"
};

/** Readable label for a `seeAlso` href ("Severing in the tracker", "Ironclad perk", "Vault Steel"). */
export function seeAlsoLabel(href: string): string {
  const url = new URL(href, "https://roll.local");
  const q = url.searchParams.get("q");
  if (url.pathname === "/wiki/glossary") {
    const slug = url.hash.replace(/^#/, "");
    return GLOSSARY_TERMS.find((t) => t.slug === slug)?.term ?? slug;
  }
  if (url.pathname === "/perks" && q) return `${q} perk`;
  if (url.pathname === "/all-effects" && q) return `${q} in the tracker`;
  if (url.pathname === "/wiki" && q) return `Guides about ${q}`;
  if (url.pathname === "/build") {
    const piece = url.searchParams.get("piece");
    if (piece) return `Builder: ${piece.replace(/-/g, " ")}`;
    const tab = url.searchParams.get("tab");
    if (tab && TAB_LABELS[tab]) return TAB_LABELS[tab];
  }
  return PAGE_LABELS[url.pathname] ?? url.pathname;
}
