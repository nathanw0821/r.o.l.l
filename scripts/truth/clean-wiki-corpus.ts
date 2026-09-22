/**
 * Cleans the Guides ("Truth Wiki") corpus in place.
 *
 *   npx tsx scripts/truth/clean-wiki-corpus.ts          # write
 *   npx tsx scripts/truth/clean-wiki-corpus.ts --dry-run # report only
 *
 * What it does, in order:
 *  0. drops every guide listed in `src/data/truth/guides-excluded.json` (pages about the
 *     source websites, navigation shells, other games) from the index and deletes its body
 *     file, so a re-import can never bring one back;
 *  1. runs `cleanBody` over every `public/data/wiki/<id>.json` (which also strips source-site
 *     boilerplate: author footers, donation appeals, bylines, reader comments); every image is removed
 *     (they are hotlinks to other sites or dead relative paths) and the index entry gets
 *     `sourceImages: true` so the reader links to the original article for the pictures;
 *  2. runs `cleanSnippet` / `cleanTitle` over every entry of `FALLBACK_WIKI_ARTICLES`,
 *     falling back to the first prose of the cleaned body (never an image line) when
 *     the scraped snippet was nothing but chrome;
 *  3. re-files the 1,025 entries parked in the junk category "All Vault Records" into
 *     the seven existing categories plus "Patch notes & news" and "Atomic Shop archive",
 *     leaving anything the rules cannot place in "General"; patch notes and Bethesda
 *     Official posts filed under "Build Mechanics & Damage" move to "Patch notes & news";
 *  4. marks `archived` (time-bound series posts more than 90 days older than the newest
 *     post of the same series; patch notes are never archived) and `stub` (cleaned body
 *     under 300 characters);
 *  5. rewrites the corpus with the same formatting it has today and prints a
 *     before/after report.
 *
 * The script is deterministic and idempotent: a second run changes nothing. It never
 * touches `id` or `url`. Refresh the committed category counts afterwards with
 * `npx tsx scripts/truth/build-wiki-counts.ts`.
 */
import fs from "node:fs";
import path from "node:path";

import excludedGuides from "../../src/data/truth/guides-excluded.json";
import {
  SITE_BOILERPLATE_MARKER,
  bodyHasImages,
  cleanBody,
  cleanSnippet,
  cleanTitle,
  siteBoilerplateKinds,
} from "../../src/lib/wiki/clean-text";
import {
  FALLBACK_WIKI_ARTICLES,
  type WikiArticleItem,
} from "../../src/lib/wiki/wiki-articles-data";

const ROOT = process.cwd();
const INDEX_FILE = path.join(ROOT, "src/lib/wiki/wiki-articles-data.ts");
const BODY_DIR = path.join(ROOT, "public/data/wiki");
const EXPORT_MARKER = "export const FALLBACK_WIKI_ARTICLES: WikiArticleItem[] = ";

const DRY_RUN = process.argv.includes("--dry-run");

/** Guide ids that are not Fallout 76 information (reviewed list, see the JSON's $comment). */
const EXCLUDED_IDS = new Set(excludedGuides.guides.map((g) => String(g.id)));

/** A cleaned body shorter than this is a stub. */
const STUB_BODY_LENGTH = 300;
/** A cleaned snippet shorter than this gets rebuilt from the body. */
const SNIPPET_FALLBACK_LENGTH = 40;
/** How far behind the newest post of a series a post may be before it is archived. */
const ARCHIVE_AFTER_DAYS = 90;

const JUNK_CATEGORY = "All Vault Records";

const CATEGORY = {
  weapons: "Weapons & Legendary Mods",
  armor: "Armor & Power Armor",
  perks: "Perks & Mutations",
  vendors: "Vendors & Minerva Sales",
  events: "Events & Expeditions",
  mechanics: "Build Mechanics & Damage",
  crafting: "Crafting & Materials",
  patch: "Patch notes & news",
  shop: "Atomic Shop archive",
  general: "General",
} as const;

/** Buckets this script derives (everything else is hand-curated and left alone). */
const SCRIPT_OWNED_CATEGORIES = new Set<string>([
  "",
  JUNK_CATEGORY,
  CATEGORY.patch,
  CATEGORY.shop,
  CATEGORY.general,
]);

/* -------------------------------------------------------------------------- */
/* Categorisation                                                             */
/* -------------------------------------------------------------------------- */

/** True for real patch notes (never archived, whatever series they belong to). */
const PATCH_NOTES = /\b(?:patch ?notes|patchnotes|hotfix|release notes|update version|update notes|patch \d+(?:\.\d+)*)\b/i;

/**
 * Ordered keyword rules, first match wins. Each rule sees the title, the URL path and
 * the cleaned snippet, all lowercased, so the outcome only depends on the corpus.
 */
const CATEGORY_RULES: ReadonlyArray<{ category: string; test: RegExp }> = [
  { category: CATEGORY.shop, test: /\batom(?:ic)? (?:update )?shop\b|\batomic-shop\b|\batom-shop\b|\batom shop\b/ },
  {
    category: CATEGORY.patch,
    test: /\b(?:patch ?notes|patchnotes|hotfix|release notes|update version|update notes|patch \d|datamining|pts\b|public test ?server|testserver|roadmap|news\b|nachrichten|announcement|ankündigung|dlss\d*|remaster|community section|community area|community bereich)\b/,
  },
  {
    category: CATEGORY.vendors,
    test: /\bminerva\b|\bvendor|\bgold bullion\b|\bbullion\b|\bpurveyor\b|\bcaps\b|\btrading\b|\bmerchandis|\bshop\b|\bpreise\b|\bhändler\b/,
  },
  {
    category: CATEGORY.events,
    test: /\bevent|\bexpedition|\bdaily ops?\b|\bseason(?:al|s)?\b|\bsaison\b|\bscoreboard\b|\bcalendar\b|\bkalender\b|\bmothman\b|\binvader|\btreasure hunt|\bdouble (?:xp|ep|mutations)\b|\bgold rush\b|\bscrip surplus\b|\bmeteoric\b|\bnuke\b|\braid\b|\bquest\b|\bally:|\bchallenge/,
  },
  {
    category: CATEGORY.armor,
    test: /\barmor\b|\barmour\b|\bpower armor\b|\bhelmet\b|\bunderarmor\b|\bjetpack\b|\bt-?(?:45|51|60|65)\b|\bx-?01\b|\bexcavator\b|\bhellcat\b|\bultracite\b|\brüstung\b/,
  },
  {
    category: CATEGORY.weapons,
    test: /\bweapon|\brifle\b|\bpistol\b|\bshotgun\b|\bgun\b|\bmelee\b|\bbow\b|\bcrossbow\b|\blauncher\b|\bgrenade\b|\bmine\b|\blegendary\b|\bammo\b|\bammunition\b|\bmods?\b|\bfixer\b|\bcremator\b|\bgauss\b|\bwaffe/,
  },
  {
    category: CATEGORY.perks,
    test: /\bperk|\bmutation|\bs\.?p\.?e\.?c\.?i\.?a\.?l\b|\bserum\b|\bcards?\b|\bbobblehead\b|\bmagazine\b|\blegendary perk\b/,
  },
  {
    category: CATEGORY.crafting,
    test: /\bcraft|\bplan:|\brecipe\b|\bmaterial|\bjunk\b|\bflux\b|\bscrap|\bworkshop\b|\bc\.?a\.?m\.?p\.?\b|\bblueprint\b|\bresource|\bfarm|\bspawn|\bfish|\bfood\b|\bdrink\b|\bconsumable\b|\bbau\b/,
  },
  {
    category: CATEGORY.mechanics,
    test: /\bdamage\b|\bdps\b|\bcrit|\bv\.?a\.?t\.?s\b|\bstats?\b|\bformula\b|\bcalculator\b|\bmechanic|\blevel|\bxp\b|\bexperience\b|\bhealth\b|\bresistance\b|\bbuild\b|\bguide\b|\btool|\bcreature|\benemy|\bfaq\b|\bterminal/,
  },
];

/**
 * Official patch notes and news, recognised by source or by title/URL. Deliberately
 * narrower than the patch rule above: "patch 22" alone is not enough, because build
 * guides say "… bis Patch 22"; "update patch 62" (a patch preview) is.
 */
const PATCH_NEWS_SIGNAL =
  /\b(?:patch ?notes|patchnotes|hotfix|release notes|update version|update notes|inside the vault|update patch \d+|fallout \d+ patch(?:es| \d))\b/;

/** Bethesda's own posts (patch notes, update pages, Inside the Vault) are news by definition. */
const NEWS_SOURCES = new Set(["Bethesda Official"]);

function primaryText(article: WikiArticleItem, title: string): string {
  const urlPath = (() => {
    try {
      return new URL(article.url).pathname;
    } catch {
      return article.url;
    }
  })();
  return `${title} ${urlPath.replace(/[-_/.]+/g, " ")}`.toLowerCase();
}

function isPatchNews(article: WikiArticleItem, title: string): boolean {
  return NEWS_SOURCES.has(article.source) || PATCH_NEWS_SIGNAL.test(primaryText(article, title));
}

/**
 * The hand-curated categories are left alone, with one exception: patch notes and news
 * that were filed under "Build Mechanics & Damage" move to "Patch notes & news". Once
 * moved they sit in a script-owned bucket, and `categorise` puts them straight back
 * there on every rerun, so the move is idempotent.
 */
function refileCurated(article: WikiArticleItem, title: string): string {
  if (article.category === CATEGORY.mechanics && isPatchNews(article, title)) return CATEGORY.patch;
  return article.category;
}

/**
 * Two passes on purpose: the title and the URL slug say what an article IS, the snippet
 * only says what it mentions. Matching the title first keeps "Events Calendar" out of
 * the vendor bucket just because the page happens to list a Minerva date.
 */
function categorise(article: WikiArticleItem, title: string, snippet: string): string {
  if (isPatchNews(article, title)) return CATEGORY.patch;
  const primary = primaryText(article, title);
  for (const rule of CATEGORY_RULES) {
    if (rule.test.test(primary)) return rule.category;
  }
  const secondary = snippet.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.test.test(secondary)) return rule.category;
  }
  return CATEGORY.general;
}

/* -------------------------------------------------------------------------- */
/* Time-bound series                                                          */
/* -------------------------------------------------------------------------- */

const SERIES: ReadonlyArray<{ key: string; test: RegExp }> = [
  { key: "Atomic Shop update", test: /\batom(?:ic)? (?:update )?shop\b/i },
  { key: "Datamining", test: /\bdatamining\b/i },
  { key: "Minerva list", test: /\bminerva\b/i },
  {
    key: "Event calendar",
    test: /\bevent|\bkalender\b|\bcalendar\b|\bdouble (?:xp|ep|mutations)\b|\bgold rush\b|\bscrip surplus\b|\btreasure hunter\b|\bweekend\b|\bwochenend/i,
  },
];

function seriesKeyFor(title: string): string | null {
  if (PATCH_NOTES.test(title)) return null;
  for (const series of SERIES) {
    if (series.test.test(title)) return series.key;
  }
  return null;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Days since 1970-01-01 for a Y/M/D triple; pure arithmetic, no time zone involved. */
function toDayNumber(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/**
 * The publication date of an entry, as a day number, from the date this run put in the
 * title, the date slug in the URL, or an explicit date in the snippet. Null when the
 * entry carries no date we can trust.
 */
function publicationDay(title: string, url: string, snippet: string): number | null {
  const titled = title.match(/,\s*(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})\s*$/);
  if (titled) {
    const month = MONTHS.indexOf(titled[2].toLowerCase()) + 1;
    if (month > 0) return toDayNumber(Number(titled[3]), month, Number(titled[1]));
  }
  const slug = url.match(/(?:^|[^\d])(\d{1,2})[-_.](\d{1,2})[-_.](\d{4})(?![\d.])/);
  if (slug) {
    const day = Number(slug[1]);
    const month = Number(slug[2]);
    if (day <= 31 && month <= 12) return toDayNumber(Number(slug[3]), month, day);
  }
  const dotted = snippet.match(/(?:^|[^\d])(\d{1,2})\.(\d{1,2})\.(\d{4})(?![\d.])/);
  if (dotted) {
    const day = Number(dotted[1]);
    const month = Number(dotted[2]);
    if (day <= 31 && month <= 12) return toDayNumber(Number(dotted[3]), month, day);
  }
  const written = snippet.match(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/,
  );
  if (written) {
    const month = MONTHS.indexOf(written[1].toLowerCase()) + 1;
    if (month > 0) return toDayNumber(Number(written[3]), month, Number(written[2]));
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Snippet fallback                                                           */
/* -------------------------------------------------------------------------- */

/** Whether the index entry already records that its source page has images. */
function hasSourceImagesFlag(article: WikiArticleItem): boolean {
  return (article as { sourceImages?: unknown }).sourceImages === true;
}

/** A cleaned body with any leftover image lines removed and blank runs collapsed. */
function withoutImageLines(body: string): string {
  return body
    .split("\n")
    .filter((line) => !line.trim().startsWith("!["))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The first readable prose of a cleaned body: no headings, tables, lists or rules. */
/** A snippet that starts with scraped infobox field labels rather than prose. */
const INFOBOX_FIELD_START = /^(?:Materials|Requirements|Produces|Build at|Learn Method|Weight|Value)\s*:/;

/**
 * The first body line that defines the subject ("The **.44 Pistol** is a non-automatic pistol
 * in *Fallout 76*."), with Markdown emphasis removed. Empty when there is none.
 */
function definingSentence(body: string): string {
  for (const line of body.split("\n")) {
    const text = line.trim().replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1");
    if (!text || /^[#|>\-\d]/.test(text) || INFOBOX_FIELD_START.test(text)) continue;
    if (/\b(?:is|are|was|were)\s+(?:a|an|the)\b/.test(text) && text.length >= 30) return text;
  }
  return "";
}

function firstProse(body: string): string {
  const parts: string[] = [];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("|") || trimmed.startsWith("#") || trimmed.startsWith(">")) continue;
    // Bodies keep their standalone image lines; a snippet is never built from one.
    if (trimmed.startsWith("![")) continue;
    if (/^[-*+]\s/.test(trimmed) || /^[-=_]{3,}$/.test(trimmed)) continue;
    if (trimmed.length < 25) continue;
    parts.push(trimmed);
    if (parts.join(" ").length > 400) break;
  }
  return parts.join(" ").slice(0, 600);
}

/* -------------------------------------------------------------------------- */
/* Run                                                                        */
/* -------------------------------------------------------------------------- */

interface Counters {
  snippetsWithImageMarkup: number;
  snippetsWithAssets: number;
  snippetsWithByline: number;
  snippetsWithBoilerplate: number;
  snippetsWithRefs: number;
  snippetsOver240: number;
  dateSlugTitles: number;
  titleCaseTitles: number;
  bodiesWithImageMarkup: number;
  bodiesWithBrokenImage: number;
  bodyChars: number;
}

const IMAGE_MARKUP = /!\[/;
/** A `![` that is not the start of a complete `![alt](url)` image. */
const BROKEN_IMAGE = /!\[(?![^\n]*?\]\([^)\s]+\))/;
const ASSET_MARKUP = /\/uploads?\/|https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg)/i;
const BYLINE = /\b\d+\s*min(?:ute)?s?\s+read\b|Writer:|Duchess Flame|\bUpdated:\s*[A-Z][a-z]{2}/;
const BOILERPLATE = /Infobox too small|You can help us improve|please see our policies/i;
const REF_MARKER = /\[\d{1,3}\]|\[\]/;
const DATE_SLUG_TITLE = /(?:^|[^\d.])\d{1,2}[ ._/-]\d{1,2}[ ._/-]\d{4}(?![\d.])/;

function emptyCounters(): Counters {
  return {
    snippetsWithImageMarkup: 0,
    snippetsWithAssets: 0,
    snippetsWithByline: 0,
    snippetsWithBoilerplate: 0,
    snippetsWithRefs: 0,
    snippetsOver240: 0,
    dateSlugTitles: 0,
    titleCaseTitles: 0,
    bodiesWithImageMarkup: 0,
    bodiesWithBrokenImage: 0,
    bodyChars: 0,
  };
}

function looksTitleCased(title: string): boolean {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length < 4) return false;
  const small = /^(?:a|an|and|as|at|by|for|from|in|into|of|on|or|the|to|with|how|where|when|what|why|which)$/i;
  let capitalisedSmall = 0;
  for (let i = 1; i < words.length; i += 1) {
    const bare = words[i].replace(/^[^\w]+|[^\w]+$/g, "");
    if (small.test(bare) && /^[A-Z]/.test(bare)) capitalisedSmall += 1;
  }
  return capitalisedSmall >= 1;
}

function measure(counters: Counters, title: string, snippet: string, body: string): void {
  if (IMAGE_MARKUP.test(snippet)) counters.snippetsWithImageMarkup += 1;
  if (ASSET_MARKUP.test(snippet)) counters.snippetsWithAssets += 1;
  if (BYLINE.test(snippet)) counters.snippetsWithByline += 1;
  if (BOILERPLATE.test(snippet)) counters.snippetsWithBoilerplate += 1;
  if (REF_MARKER.test(snippet)) counters.snippetsWithRefs += 1;
  if (snippet.length > 240) counters.snippetsOver240 += 1;
  if (DATE_SLUG_TITLE.test(title)) counters.dateSlugTitles += 1;
  if (looksTitleCased(title)) counters.titleCaseTitles += 1;
  if (IMAGE_MARKUP.test(body)) counters.bodiesWithImageMarkup += 1;
  if (BROKEN_IMAGE.test(body)) counters.bodiesWithBrokenImage += 1;
  counters.bodyChars += body.length;
}

function readBody(id: WikiArticleItem["id"]): { file: string; raw: string; content: string } | null {
  const file = path.join(BODY_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const parsed = JSON.parse(raw) as { id?: unknown; content?: string };
  return { file, raw, content: parsed.content || "" };
}

function main(): void {
  const before = emptyCounters();
  const after = emptyCounters();
  const categoriesBefore = new Map<string, number>();
  const categoriesAfter = new Map<string, number>();
  const bump = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) || 0) + 1);

  const cleanedBodies = new Map<string, string>();
  let bodiesChanged = 0;
  let snippetsFromBody = 0;

  interface Draft {
    article: WikiArticleItem;
    title: string;
    snippet: string;
    category: string;
    stub: boolean;
    sourceImages: boolean;
    seriesKey: string | null;
    day: number | null;
  }
  const drafts: Draft[] = [];

  // 0. excluded guides: out of the index, body file deleted.
  const removed: WikiArticleItem[] = [];
  for (const article of FALLBACK_WIKI_ARTICLES) {
    if (EXCLUDED_IDS.has(String(article.id))) removed.push(article);
  }
  const bodyFilesDeleted: string[] = [];
  for (const g of excludedGuides.guides) {
    const file = path.join(BODY_DIR, `${g.id}.json`);
    if (fs.existsSync(file)) bodyFilesDeleted.push(file);
  }

  const boilerplateByKind = new Map<string, number>();
  let bodiesWithBoilerplate = 0;
  const emptiedByStripping: WikiArticleItem[] = [];

  for (const article of FALLBACK_WIKI_ARTICLES) {
    if (EXCLUDED_IDS.has(String(article.id))) continue;
    const body = readBody(article.id);
    const rawBody = body?.content ?? "";
    const newBody = cleanBody(rawBody);
    const kinds = siteBoilerplateKinds(rawBody);
    if (kinds.length > 0) {
      bodiesWithBoilerplate += 1;
      for (const kind of kinds) bump(boilerplateByKind, kind);
      if (!withoutImageLines(newBody)) emptiedByStripping.push(article);
    }
    if (body) {
      cleanedBodies.set(body.file, newBody);
      if (newBody !== rawBody) bodiesChanged += 1;
    }

    measure(before, article.title, article.snippet, rawBody);

    // Clean in this order on purpose: the snippet gets the ORIGINAL title so a scraped
    // heading repeat is recognised, while the title gets the cleaned snippet (without
    // the repeat removed) as evidence for which words are proper nouns.
    let snippet = cleanSnippet(article.snippet, article.title);
    // Crafting-plan guides often open with raw infobox fields ("Materials: Requirements:
    // Produces: ..."); use the body's defining sentence ("The .44 Pistol is a ...") instead.
    if (INFOBOX_FIELD_START.test(snippet)) {
      const definition = cleanSnippet(definingSentence(newBody), article.title);
      if (definition.length >= SNIPPET_FALLBACK_LENGTH) {
        snippet = definition;
        snippetsFromBody += 1;
      }
    }
    // A snippet the scraper cut out of site boilerplate (a donation line, a byline, a wiki
    // maintenance box) is rebuilt from the cleaned body, or left empty when the body has
    // no prose of its own.
    if (SITE_BOILERPLATE_MARKER.test(snippet)) {
      const fromBody = cleanSnippet(firstProse(newBody), article.title);
      snippet = SITE_BOILERPLATE_MARKER.test(fromBody) ? "" : fromBody;
      snippetsFromBody += 1;
    }
    if (snippet.length < SNIPPET_FALLBACK_LENGTH) {
      const fromBody = cleanSnippet(firstProse(newBody), article.title);
      if (fromBody.length > snippet.length && !SITE_BOILERPLATE_MARKER.test(fromBody)) {
        snippet = fromBody;
        snippetsFromBody += 1;
      }
    }
    const title = cleanTitle(article.title, article.source, cleanSnippet(article.snippet));

    bump(categoriesBefore, article.category || CATEGORY.general);
    // The seven hand-curated categories are left as they are, except for patch notes
    // parked under "Build Mechanics & Damage" (see `refileCurated`). The junk bucket
    // and the three buckets this script owns are re-derived every run, so changing a
    // rule and rerunning is enough to re-file them.
    const category = SCRIPT_OWNED_CATEGORIES.has(article.category || "")
      ? categorise(article, title, snippet)
      : refileCurated(article, title);

    measure(after, title, snippet, newBody);

    drafts.push({
      article,
      title,
      snippet,
      category,
      // Measured on the text alone: a body that is one picture and a caption is a stub.
      stub: withoutImageLines(newBody).length < STUB_BODY_LENGTH,
      // Sticky: once a body's images are stripped, the flag is the only record they existed.
      sourceImages: bodyHasImages(rawBody) || hasSourceImagesFlag(article),
      seriesKey: seriesKeyFor(title),
      // Derived from the CLEANED title and snippet, never the raw ones, so a rerun over
      // an already-cleaned corpus lands on exactly the same dates.
      day: publicationDay(title, article.url, snippet),
    });
  }

  // Archive: per series, anything more than ARCHIVE_AFTER_DAYS behind the newest post.
  const newestOfSeries = new Map<string, number>();
  for (const draft of drafts) {
    if (!draft.seriesKey || draft.day === null) continue;
    const current = newestOfSeries.get(draft.seriesKey);
    if (current === undefined || draft.day > current) newestOfSeries.set(draft.seriesKey, draft.day);
  }

  const archivedBySeries = new Map<string, number>();
  const nextArticles: WikiArticleItem[] = drafts.map((draft) => {
    const newest = draft.seriesKey ? newestOfSeries.get(draft.seriesKey) : undefined;
    const archived =
      draft.seriesKey !== null &&
      draft.day !== null &&
      newest !== undefined &&
      newest - draft.day > ARCHIVE_AFTER_DAYS;
    if (archived && draft.seriesKey) bump(archivedBySeries, draft.seriesKey);
    bump(categoriesAfter, draft.category);

    const next: WikiArticleItem = {
      id: draft.article.id,
      source: draft.article.source,
      title: draft.title,
      url: draft.article.url,
      category: draft.category,
      snippet: draft.snippet,
      main_image: draft.article.main_image ?? null,
      content: "",
    };
    if (archived) next.archived = true;
    if (draft.stub) next.stub = true;
    if (draft.sourceImages) next.sourceImages = true;
    return next;
  });

  const archivedTotal = [...archivedBySeries.values()].reduce((a, b) => a + b, 0);
  const stubTotal = nextArticles.filter((a) => a.stub).length;

  // ---- write -------------------------------------------------------------
  const existingIndex = fs.readFileSync(INDEX_FILE, "utf-8");
  const markerAt = existingIndex.indexOf(EXPORT_MARKER);
  if (markerAt < 0) throw new Error(`Could not find "${EXPORT_MARKER}" in ${INDEX_FILE}`);
  const header = existingIndex.slice(0, markerAt + EXPORT_MARKER.length);
  const nextIndex = `${header}${JSON.stringify(nextArticles, null, 2)};\n`;
  const indexChanged = nextIndex !== existingIndex;

  if (!DRY_RUN) {
    for (const file of bodyFilesDeleted) fs.unlinkSync(file);
    for (const [file, content] of cleanedBodies) {
      const next = JSON.stringify({
        id: JSON.parse(fs.readFileSync(file, "utf-8")).id,
        content,
      });
      if (next !== fs.readFileSync(file, "utf-8")) fs.writeFileSync(file, next);
    }
    if (indexChanged) fs.writeFileSync(INDEX_FILE, nextIndex);
  }

  // ---- report ------------------------------------------------------------
  const row = (label: string, a: number, b: number) =>
    `  ${label.padEnd(38)} ${String(a).padStart(7)} -> ${String(b).padStart(7)}`;

  console.log(DRY_RUN ? "\nwiki corpus clean (DRY RUN)\n" : "\nwiki corpus clean\n");
  console.log(`entries: ${nextArticles.length}, body files: ${cleanedBodies.size}\n`);
  console.log(
    `excluded (src/data/truth/guides-excluded.json): ${removed.length} removed from the index, ` +
      `${bodyFilesDeleted.length} body files ${DRY_RUN ? "to delete" : "deleted"}`,
  );
  for (const a of removed) console.log(`  - [${a.id}] ${a.source} — ${a.title}`);
  console.log(`\nsite boilerplate stripped from ${bodiesWithBoilerplate} bodies (a body can have several kinds)`);
  for (const [kind, count] of [...boilerplateByKind].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${kind.padEnd(30)} ${String(count).padStart(6)}`);
  }
  console.log(`bodies with no text left after stripping (exclusion candidates): ${emptiedByStripping.length}`);
  for (const a of emptiedByStripping) console.log(`  ? [${a.id}] ${a.source} — ${a.title}`);
  console.log("");
  console.log("clutter, before -> after");
  console.log(row("snippets with ![ markup", before.snippetsWithImageMarkup, after.snippetsWithImageMarkup));
  console.log(row("snippets with asset/upload paths", before.snippetsWithAssets, after.snippetsWithAssets));
  console.log(row("snippets with bylines", before.snippetsWithByline, after.snippetsWithByline));
  console.log(row("snippets with wiki boilerplate", before.snippetsWithBoilerplate, after.snippetsWithBoilerplate));
  console.log(row("snippets with reference markers", before.snippetsWithRefs, after.snippetsWithRefs));
  console.log(row("snippets over 240 chars", before.snippetsOver240, after.snippetsOver240));
  console.log(row("date-slug titles", before.dateSlugTitles, after.dateSlugTitles));
  console.log(row("SEO Title Case titles", before.titleCaseTitles, after.titleCaseTitles));
  console.log(row("bodies with images (kept on purpose)", before.bodiesWithImageMarkup, after.bodiesWithImageMarkup));
  console.log(row("bodies with a broken ![ fragment", before.bodiesWithBrokenImage, after.bodiesWithBrokenImage));
  console.log(row("body characters", before.bodyChars, after.bodyChars));

  console.log("\ncategories, before");
  for (const [name, count] of [...categoriesBefore].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name.padEnd(30)} ${String(count).padStart(6)}`);
  }
  console.log("\ncategories, after");
  for (const [name, count] of [...categoriesAfter].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name.padEnd(30)} ${String(count).padStart(6)}`);
  }

  console.log(`\nunclassifiable, left in "${CATEGORY.general}": ${categoriesAfter.get(CATEGORY.general) || 0}`);
  const generalSample = nextArticles.filter((a) => a.category === CATEGORY.general).slice(0, 12);
  for (const a of generalSample) console.log(`    e.g. ${a.source} — ${a.title}`);
  console.log(`archived: ${archivedTotal}`);
  for (const [name, count] of [...archivedBySeries].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name.padEnd(30)} ${String(count).padStart(6)}`);
  }
  console.log(`stub (cleaned body < ${STUB_BODY_LENGTH} chars): ${stubTotal}`);
  console.log(`snippets rebuilt from the body: ${snippetsFromBody}`);
  console.log(
    `\n${DRY_RUN ? "would change" : "changed"}: index ${indexChanged ? "yes" : "no"}, body files ${bodiesChanged}`,
  );
  console.log("next: npx tsx scripts/truth/build-wiki-counts.ts\n");
}

main();
