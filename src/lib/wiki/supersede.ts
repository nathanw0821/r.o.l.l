/**
 * "May be out of date" notes for guides that describe a mechanic the game has since changed
 * (Guides UI/UX step d, `WS5_UX_DESIGN_PLAN.md` "Guides UI/UX upgrade" item 5).
 *
 * Driven only by the reviewed rules in `src/data/truth/supersede-rules.json`: every rule names the
 * patch, the verified current value and where it was verified. Precision beats recall: a rule only
 * fires on wording that states the old value, and a guide that already states the new value is
 * excluded. Never add a rule from guesswork; add it with a real corpus example to supersede.test.ts.
 *
 * Matching runs on title + snippet (+ body when given). The list and the reader do not run the
 * regexes at request time: `scripts/truth/build-supersede-index.ts` scans every body once and
 * writes `supersede-index.json` (pinned by supersede.test.ts); `supersedeNotesForId` reads it.
 */
import rulesJson from "@/data/truth/supersede-rules.json";
import supersedeIndex from "./supersede-index.json";

export interface SupersedeRule {
  id: string;
  patch: number;
  patchName: string;
  /** One plain sentence: what changed, with the verified value. */
  changed: string;
  appliesTo: {
    titleAny?: string[];
    textAll?: string[];
    textAny?: string[];
    sourcesAny?: string[];
    categoriesAny?: string[];
  };
  excludeIf?: { textAny?: string[] };
  /** Internal deep link to the current value. */
  currentHref: string;
  /** Source + date of the verification (truth pack entry, worklog, review). */
  verified: string;
}

export interface SupersedeArticle {
  title: string;
  snippet?: string | null;
  category?: string | null;
  source?: string | null;
}

/** Most notes shown for one guide (newest patch first). */
export const MAX_SUPERSEDE_NOTES = 3;

export const SUPERSEDE_RULES: readonly SupersedeRule[] = rulesJson as SupersedeRule[];

/**
 * Pages the rules never apply to: patch notes, test-server notes and update previews are dated
 * records by definition, and some corpus pages describe other games or retired modes.
 */
const EXEMPT_CATEGORIES: ReadonlySet<string> = new Set(["patch notes & news"]);
const EXEMPT_TITLE =
  /\b(?:patch ?notes?|patchnotes|pts|public test server|expected changes|possible changes|erwartete|datamining|fallout 4|nuclear winter)\b/i;

interface CompiledRule {
  rule: SupersedeRule;
  titleAny: RegExp[];
  textAll: RegExp[];
  textAny: RegExp[];
  sourcesAny: ReadonlySet<string> | null;
  categoriesAny: ReadonlySet<string> | null;
  exclude: RegExp[];
}

const compileAll = (patterns: string[] | undefined): RegExp[] => (patterns ?? []).map((p) => new RegExp(p, "i"));
const lowerSet = (values: string[] | undefined): ReadonlySet<string> | null =>
  values && values.length > 0 ? new Set(values.map((v) => v.toLowerCase())) : null;

/** Compiled once at module load. */
const COMPILED: readonly CompiledRule[] = SUPERSEDE_RULES.map((rule) => ({
  rule,
  titleAny: compileAll(rule.appliesTo.titleAny),
  textAll: compileAll(rule.appliesTo.textAll),
  textAny: compileAll(rule.appliesTo.textAny),
  sourcesAny: lowerSet(rule.appliesTo.sourcesAny),
  categoriesAny: lowerSet(rule.appliesTo.categoriesAny),
  exclude: compileAll(rule.excludeIf?.textAny),
}));

const RULE_BY_ID: ReadonlyMap<string, SupersedeRule> = new Map(SUPERSEDE_RULES.map((r) => [r.id, r]));

export function isSupersedeExempt(article: SupersedeArticle): boolean {
  return EXEMPT_CATEGORIES.has((article.category || "").toLowerCase()) || EXEMPT_TITLE.test(article.title);
}

function ruleMatches(c: CompiledRule, article: SupersedeArticle, text: string): boolean {
  if (c.sourcesAny && !c.sourcesAny.has((article.source || "").toLowerCase())) return false;
  if (c.categoriesAny && !c.categoriesAny.has((article.category || "").toLowerCase())) return false;
  if (c.titleAny.length > 0 && !c.titleAny.some((re) => re.test(article.title))) return false;
  if (!c.textAll.every((re) => re.test(text))) return false;
  if (c.textAny.length > 0 && !c.textAny.some((re) => re.test(text))) return false;
  if (c.exclude.some((re) => re.test(text))) return false;
  return true;
}

/** Newest patch first; rules of the same patch keep their file order. */
function byNewestPatch(a: SupersedeRule, b: SupersedeRule): number {
  return b.patch - a.patch || SUPERSEDE_RULES.indexOf(a) - SUPERSEDE_RULES.indexOf(b);
}

/**
 * Every rule that matches the guide, newest patch first (all of them; the UI shows the first
 * MAX_SUPERSEDE_NOTES). Title and snippet are always searched; `body` when given.
 *
 * Returns nothing for exempt pages (see EXEMPT_TITLE). Overlap with the hand-written rules in
 * outdated-articles.ts is handled per rule (heavy-gunner-line excludes their wording).
 */
export function supersedeNotesFor(article: SupersedeArticle, body?: string | null): SupersedeRule[] {
  if (isSupersedeExempt(article)) return [];
  const text = [article.title, article.snippet ?? "", body ?? ""].join("\n");
  return COMPILED.filter((c) => ruleMatches(c, article, text))
    .map((c) => c.rule)
    .sort(byNewestPatch);
}

/**
 * The first match of each of a rule's text patterns, for the precision review script
 * (`scripts/truth/build-supersede-index.ts --review`). Not used by the UI.
 */
export function supersedeEvidence(ruleId: string, article: SupersedeArticle, body?: string | null): string[] {
  const compiled = COMPILED.find((c) => c.rule.id === ruleId);
  if (!compiled) return [];
  const text = [article.title, article.snippet ?? "", body ?? ""].join("\n");
  const out: string[] = [];
  for (const re of [...compiled.textAll, ...compiled.textAny]) {
    const m = re.exec(text);
    if (m) out.push(text.slice(Math.max(0, m.index - 80), m.index + m[0].length + 80).replace(/\s+/g, " "));
  }
  return out;
}

/** Precomputed article id -> rule ids (newest patch first). */
export const SUPERSEDE_INDEX: Readonly<Record<string, readonly string[]>> = supersedeIndex as Record<string, string[]>;

/** Rules for one guide from the committed index, newest patch first, at most MAX_SUPERSEDE_NOTES. */
export function supersedeNotesForId(id: string | number): SupersedeRule[] {
  const ids = SUPERSEDE_INDEX[String(id)] ?? [];
  const rules: SupersedeRule[] = [];
  for (const ruleId of ids) {
    const rule = RULE_BY_ID.get(ruleId);
    if (rule) rules.push(rule);
  }
  return rules.sort(byNewestPatch).slice(0, MAX_SUPERSEDE_NOTES);
}

export function isPossiblyOutdated(id: string | number): boolean {
  return (SUPERSEDE_INDEX[String(id)]?.length ?? 0) > 0;
}

/** Build the index from a corpus; `bodyFor` returns a guide's body (or "" when it has none). */
export function buildSupersedeIndex(
  articles: ReadonlyArray<SupersedeArticle & { id: string | number }>,
  bodyFor: (id: string | number) => string,
): Record<string, string[]> {
  const index: Record<string, string[]> = {};
  const sorted = [...articles].sort((a, b) => String(a.id).localeCompare(String(b.id), "en", { numeric: true }));
  for (const article of sorted) {
    const matches = supersedeNotesFor(article, bodyFor(article.id));
    if (matches.length > 0) index[String(article.id)] = matches.map((r) => r.id);
  }
  return index;
}
