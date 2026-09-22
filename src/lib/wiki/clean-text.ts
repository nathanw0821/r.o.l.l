/**
 * Pure text cleaners for the Guides ("Truth Wiki") corpus.
 *
 * The corpus in `wiki-articles-data.ts` and `public/data/wiki/<id>.json` was scraped
 * from four sites and still carries their markup: Markdown images, asset/upload URLs,
 * author bylines, wiki maintenance notices, share/comment chrome and reference markers.
 * These functions turn that into readable text. Snippets, titles and bodies all come out
 * image-free: embedding third-party images would hotlink other sites (see `cleanBody`).
 *
 * Contract:
 *  - every function is pure and deterministic (no I/O, no clock, no randomness);
 *  - every function is idempotent: clean(clean(x)) === clean(x);
 *  - `id` and `url` are never derived from or touched here.
 *
 * Used at build time by `scripts/truth/clean-wiki-corpus.ts` and at render time by
 * `/api/wiki/search` as a safety net, so a future dirty import cannot leak markup.
 */

/** Longest a cleaned snippet may be. Cards show three lines; 240 chars fills them. */
export const SNIPPET_MAX_LENGTH = 240;

/** Shortest tail we accept when we cut a snippet at a sentence boundary. */
const SNIPPET_MIN_SENTENCE_CUT = 80;

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MONTH_NAME_PATTERN =
  "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?";

/**
 * Abbreviated month only. Used for the bare `- Nov 25, 2025` byline line, so that a
 * heading date written in full ("update notes – July 23, 2024") survives.
 */
const MONTH_ABBR_PATTERN =
  "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\.?(?![a-z])";

/**
 * Day/month order used by each source's date slugs. NukaKnights is a German-language
 * site and writes DD.MM.YYYY (proved by the corpus: first components run up to 31,
 * second components never exceed 12). Anything unknown falls back to DMY, but the
 * snippet is consulted first, so this table is only the tie-breaker.
 */
const SOURCE_DATE_ORDER: Record<string, "DMY" | "MDY"> = {
  NukaKnights: "DMY",
  TheDuchessFlame: "MDY",
  "Fallout Wiki": "MDY",
  "Fallout Fandom": "MDY",
  "Bethesda Official": "MDY",
};

/**
 * Sources whose titles are slugs turned into Title Case by the scraper, so they are
 * safe to push back to sentence case. Wiki sources are left alone: their titles are
 * real page names ("Ally: The Woman Who Fell To Earth") and Title Case is correct there.
 */
const SENTENCE_CASE_SOURCES = new Set(["NukaKnights", "TheDuchessFlame"]);

/** Words that are lowercased inside a sentence-cased title unless they are the first word. */
const TITLE_STOP_WORDS = new Set([
  "a",
  "about",
  "after",
  "all",
  "an",
  "and",
  "are",
  "as",
  "at",
  "before",
  "between",
  "but",
  "by",
  "can",
  "during",
  "for",
  "from",
  "has",
  "have",
  "here",
  "how",
  "in",
  "into",
  "is",
  "it",
  "its",
  "my",
  "nor",
  "of",
  "on",
  "or",
  "other",
  "out",
  "over",
  "per",
  "so",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "this",
  "to",
  "under",
  "until",
  "up",
  "via",
  "vs",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "why",
  "with",
  "you",
  "your",
]);

/** Always kept capitalised in a title, whatever the snippet says. */
const ALWAYS_PROPER = new Set([
  "appalachia",
  "atom",
  "atomic",
  "bethesda",
  "fallout",
  "minerva",
  "nuka",
  "nukaknights",
  "pip-boy",
  "pipboy",
  "vault",
  "vault-tec",
  "wastelanders",
]);

/** Verbs that mark a repeated title as the grammatical subject of the first sentence. */
const SUBJECT_VERBS = new Set([
  "adds",
  "allows",
  "appear",
  "appears",
  "are",
  "became",
  "becomes",
  "can",
  "comes",
  "consists",
  "could",
  "gives",
  "grants",
  "has",
  "have",
  "increases",
  "is",
  "may",
  "provides",
  "reduces",
  "refers",
  "requires",
  "returns",
  "was",
  "were",
  "will",
  "works",
]);

/* -------------------------------------------------------------------------- */
/* Low-level helpers                                                          */
/* -------------------------------------------------------------------------- */

export function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&hellip;/gi, "…")
    .replace(/ /g, " ");
}

function isAssetUrl(url: string): boolean {
  return (
    /\.(?:png|jpe?g|gif|webp|svg|bmp|ico|avif)(?:[/?#]|$)/i.test(url) ||
    /\/uploads?\//i.test(url) ||
    /static\.wixstatic\.com/i.test(url) ||
    /images\.fallout\.wiki/i.test(url) ||
    /wikia\.nocookie\.net/i.test(url)
  );
}

/** Removes `![alt](url)` images and every half-scraped `![…` fragment. */
function stripMarkdownImages(text: string): string {
  // The alt text itself may contain brackets ("![[April April] headline](url)"), so the
  // alt is matched lazily up to the first "](" that actually closes the image.
  return text
    .replace(/!\[[^\n]*?\]\s*\([^)\n]*\)/g, " ")
    .replace(/!\[[^\n]*?\]\s*\([^)\n]*$/g, " ")
    .replace(/!\[[^\]\n]*\]?/g, " ")
    .replace(/!\[/g, " ");
}

/** Turns `[label](url)` into `label` and drops link fragments left by truncation. */
function unwrapMarkdownLinks(text: string): string {
  return text
    .replace(/\[([^\]\n]*)\]\s*\((?:[^)\n]*)\)/g, "$1")
    .replace(/\[([^\]\n]*)\]\s*\([^)\n]*$/g, "$1");
}

/** Drops image/upload URLs and bare asset paths, keeping ordinary prose links. */
function stripAssetUrls(text: string): string {
  return text
    .replace(/\bhttps?:\/\/\S+/gi, (match) => (isAssetUrl(match) ? " " : match))
    .replace(
      /(^|\s)\/{1,2}(?:uploads?|public|static|media|images|thumb|assets)\/\S*/gi,
      "$1",
    );
}

/** Wiki maintenance / cleanup notices. Prose that merely describes the page is kept. */
const MAINTENANCE_PATTERNS: RegExp[] = [
  /\bInfobox too small\b/gi,
  /\bYou can help us improve the article by adding the data!?/gi,
  /\bFor more information,?\s*please see our policies\s*\.?/gi,
  /\bThis (?:content|article|page|section) (?:is|has|or section)[^.]{0,90}?(?:missing[^.]{0,60}|not been written yet|needs? expanding|requires? cleanup|needs? to be wikified|is a stub)\s*\.?/gi,
  /\bThis (?:article|page|section) is a stub\s*\.?/gi,
  /\bYou can help (?:us|the (?:Fallout )?Wiki|Nukapedia) by expanding it\s*\.?/gi,
  /\bPlease help(?: us)? (?:by )?(?:expanding|improving)[^.]{0,80}\.?/gi,
  // Fallout Wiki image-request notice: "Please help by uploading it.Details: No details given".
  /\bPlease help(?: us)? by uploading (?:it|an image|images|a picture)\s*\.?/gi,
  /\bDetails\s*:\s*No details given\s*\.?/gi,
];

/** Bylines, read-time stamps, credits. */
const BYLINE_PATTERNS: RegExp[] = [
  /\bWriter\s*:\s*[A-Z][\w'’. -]{0,40}/g,
  /\bBy\s+Duchess Flame\b/gi,
  /(?:^|\s)[-–—]\s*Duchess Flame\b/g,
  /\bImage Credit\s*:?[^\n]*/gi,
  /\bUpdated\s*(?:on)?\s*:?\s*MONTH\s+\d{1,2},?\s*\d{4}/g,
  // Same stamp, cut short by the scraper's own truncation ("Updated: Jan 6").
  /\bUpdated\s*(?:on)?\s*:?\s*MONTH\s+\d{1,2}\s*$/g,
  /\b(?:Posted|Published|Written)\s*(?:on)?\s*:?\s*MONTH\s+\d{1,2},?\s*\d{4}/gi,
  /(?:^|\s)[-–—]\s*ABBRMONTH\s+\d{1,2},?\s*\d{4}(?=\s|$)/g,
  /\b\d+\s*min(?:ute)?s?\s+read\b/gi,
].map(
  (re) =>
    new RegExp(
      re.source
        .replace(/ABBRMONTH/g, MONTH_ABBR_PATTERN)
        .replace(/MONTH/g, MONTH_NAME_PATTERN),
      re.flags,
    ),
);

/** Share / navigation / comment chrome from the three blog sources. */
const CHROME_PATTERNS: RegExp[] = [
  /^\s*Top of page\s*$/gim,
  /\bTop of page\b/g,
  /\bMain article:\s*[^.!?\n]{1,60}?(?=\s+(?:This|The|We|Fallout|Patch|Update|Today|“|"|')\b)/g,
  /\bFor an overview of\s+[^.\n]{1,120}?,?\s*see\s+[^.\n]{1,80}?(?:\.|$)/gi,
  /\bFor (?:the|a|other)\s+[^.\n]{1,120}?,\s*see\s+[^.\n]{1,80}?(?:\.|$)/gi,
  /^\s*See also\b[:,]?\s*/i,
  /\bHey there, I'?m Kat,? also known as Duchess!?/gi,
  /\bHi,? I'?m Kat or Duchess\b\.?/gi,
  /\bIf you find my guides useful, here are a few ways you can support me:?/gi,
  /\bShare My Guides:[^\n]*/gi,
  /\b(?:One-Time Donation|Monthly Contribution):[^\n]*/gi,
  /\bThanks for your support!?/gi,
  /\bDo you want to report this comment\?/gi,
  /\bMöchtest du diesen Kommentar melden\?/gi,
  /\bUnterstütze uns Mit Deiner Spende\b/gi,
  /\bView canonical entry\b[^\n]*/gi,
  /\bTest in B\.U\.I\.L\.D\.[^\n]*/gi,
  /\bView in P\.E\.R\.K\.[^\n]*/gi,
];

/** Whole body lines that are pure chrome. */
const CHROME_LINE_PATTERNS: RegExp[] = [
  /^#{1,6}\s*(?:Comments?|Kommentare)\s*:?\s*$/i,
  /^#{1,6}\s*(?:Delete comment|Kommentar Löschen)\s*$/i,
  /^#{1,6}\s*(?:Report|Melden)\s*$/i,
  /^#{1,6}\s*(?:Enlarge image|Bild vergrößern)\s*$/i,
  /^#{1,6}\s*(?:References?|Einzelnachweise)\s*$/i,
  /^(?:Top of page|Home:.*|Specifications|Category:.*|Source:.*)$/i,
  /^Search all \d[\d,]*.*$/i,
  /^Updated:?\s*$/i,
  /^[-–—*]?\s*\d+\s*min(?:ute)?s?\s+read\s*$/i,
  /^[-–—*]?\s*Duchess Flame\s*$/i,
  /^Image Credit\s*:?\s*.*$/i,
  /^[-–—*|\s]*$/,
];

/** Reference markers, edit links and the empty brackets the wiki scraper leaves behind. */
function stripReferenceMarkers(text: string): string {
  let out = text;
  let previous: string;
  // Nested leftovers such as "[[]]" need more than one pass to reach a fixed point.
  do {
    previous = out;
    out = out
      .replace(/\[\s*\d{1,3}\s*\]/g, "")
      .replace(
        /\[\s*(?:citation needed|verification overdue|verified|edit|note \d+|Dev \d+)\s*\]/gi,
        "",
      )
      .replace(/\[\s*\]/g, "");
  } while (out !== previous);
  return out;
}

function applyAll(text: string, patterns: RegExp[]): string {
  let out = text;
  for (const pattern of patterns) {
    out = out.replace(pattern, " ");
  }
  return out;
}

/** Collapses runs of spaces and repairs the gaps the strippers leave behind. */
function tidyInline(text: string): string {
  return text
    .replace(/\(\s*\)/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:!?])(?!\d)/g, "$1") // keep " .44" / " .50" calibres
    .replace(/([(“])\s+/g, "$1")
    .replace(/\s+([)”])/g, "$1")
    .replace(/([,;:])\s*(?=[,;:.])/g, "")
    .replace(/[ \t]+/g, " ")
    .trim()
    .replace(/^[-–—:|·•,;.\s]+/, "")
    .replace(/[\s,;:|·•-]+$/, "");
}

/* -------------------------------------------------------------------------- */
/* Site boilerplate (text about the source websites, not about the game)      */
/* -------------------------------------------------------------------------- */

/**
 * The kinds of source-site boilerplate {@link stripSiteBoilerplate} removes. Used by the
 * corpus script to report how many guides each kind touched.
 */
export type SiteBoilerplateKind =
  | "duchess-footer-v1"
  | "duchess-footer-v2"
  | "buffs-n-brew"
  | "nk-donation"
  | "nk-header"
  | "nk-comments"
  | "comment-invite"
  | "wiki-maintenance"
  | "site-chrome";

interface BoilerplateRule {
  kind: SiteBoilerplateKind;
  /** Removed wherever they occur, so a run-on scrape (one long line) is handled too. */
  inline?: RegExp[];
  /** Whole lines (trimmed) that are removed when they match. */
  lines?: RegExp[];
}

/**
 * Every pattern is anchored on wording that only the site itself uses (the author's
 * signature, the site's donation widget, the wiki's own maintenance templates), never
 * on a single word such as "support" or "donate", which also occur in game text.
 */
const SITE_BOILERPLATE_RULES: BoilerplateRule[] = [
  {
    // TheDuchessFlame footer, 2024+ wording ("Aussie data miner ... Ko-fi page").
    kind: "duchess-footer-v1",
    inline: [
      /I'?m an Aussie data miner who creates guides for farming, events,? and food buffs in Fallout 76\.*/g,
      /I firmly believe that knowledge should be accessible to everyone, so my guides will always be free\.\s*However, maintaining a website and using photo and video editing software can be costly\./g,
      /-?[ \t]*_{0,2}Follow Me on Social Media:?_{0,2}:?\s*Keep up with my latest updates by following me on social media\./g,
      /-?[ \t]*_{0,2}One-Time Donation:?_{0,2}:?\s*Buy me a coffee\./g,
      /-?[ \t]*_{0,2}Monthly Contribution:?_{0,2}:?\s*Become a regular supporter by subscribing to my Ko-fi page\./g,
      /Every bit of support helps cover the costs of creating these guides and maybe even gets me a cup of coffee or three\s*;?\)?/g,
    ],
  },
  {
    // TheDuchessFlame footer, older wording ("Australian data miner ... buying me a ko-fi").
    kind: "duchess-footer-v2",
    inline: [
      /I'?m an Australian data miner who writes farming, events?,? and food buff guides for Fallout 76(?: and Starfield)?\./g,
      /I believe that all knowledge and information should be free,? which is why my guides will never be locked behind a paywall\.\s*However, running a website and photo and video editing software does not come cheaply\./g,
      /So,? if you (?:found|find) my guides (?:helpful|useful),? please consider buy(?:ing)? me a ko-?fi \(coffee\) using the link below\./gi,
      /All monies go towards the tools for writing my guides and maybe for an actual cup of coffee or 3\s*;?\)?/g,
      /Alternatively, share my guides with your fellow (?:vault |space |vault and space )*dwellers and help them to survive the (?:wasteland|spaceland|Starfield)\./g,
    ],
  },
  {
    // The author's food-buff group plug that ends many TheDuchessFlame guides.
    kind: "buffs-n-brew",
    inline: [
      /Join us at _{0,2}Buffs n Brew_{0,2}, a group dedicated to food buffs and (?:food buff )?farming\./g,
      /Buffs n Brew is a community built around food buff farming, crafting, and sharing knowledge\.\s*Whether you[’']re looking to stock up or learn the best ways to boost your build, we[’']re here to help\./g,
      /Let Buffs n Brew handle it! Place your food buff order, and our chefs will whip up your meal and deliver it straight to your camp[’']s front door\./g,
    ],
    lines: [
      /^Love food buffs\?$/,
      /^Love your food buffs\? We[’']ve got you covered\.$/,
      /^Craving buffs but short on time to make them yourself\?$/,
      /^(?:Discord|Facebook|Buffs n Brew)\s*-\s*_{0,2}(?:All Platforms|PC|XBOX|Xbox|PlayStation)_{0,2}(?:\s*\([^)\n]*\))?$/,
      /^\*\*Buffs n Brew (?:XBOX|Xbox|PC|PlayStation)\*\*$/,
    ],
  },
  {
    // NukaKnights donation widget and merchandising plug (German and English).
    kind: "nk-donation",
    inline: [
      /Hat Dir dieser Artikel weitergeholfen\? Dann unterstütze uns gern mit einer Spende oder einem Abonnement\.(?:\s*Jetzt Spenden)*/g,
      /(?:Support us with your donation\s*)*Did this article help you\? Then please support us with a donation or subscription\.(?:\s*Donate now)*/g,
      /(?:Support(?:ed)? us with your donation\s*)+(?=\n|$)/g,
      /The Merchandising Shop is another channel to \*\*support\*\* us and (?:to )?\*\*donate\*\* in this form\.[^\n]*/g,
    ],
    lines: [/^(?:#{1,6}\s*)?(?:Unterstütze uns|Mit Deiner Spende|Support us|With your donation|Jetzt Spenden|Donate now)$/],
  },
  {
    // "Artikel <category><title> <date><category> <author> <date> 2 0 1 <category>" – the
    // scraped byline, date, like/comment counters and category chips of a NukaKnights post.
    kind: "nk-header",
    inline: [
      new RegExp(
        String.raw`^(?:Artikel|Article) [^\n]*? \S+ (?:(?:\d{2}[./]\d{2}[./]\d{4}|[A-Z][a-z]+ \d{1,2}(?:st|nd|rd|th)?, \d{4}) )+\d{1,4} \d{1,4} \d{1,4}` +
          String.raw`(?: (?:NKCAT)(?:,? ?(?:NKCAT))*)?(?: |$)`.replace(
            /NKCAT/g,
            "Atom Shop|Fallout 76 News|Spielbrett / Saison|Game Board / Season|Datamining|Insider|Builds|Tipps|Tips|Patchnotes|Patch notes|PTS|Karten|Cards|Maps|Nuka Knights",
          ),
        "gm",
      ),
    ],
  },
  {
    // Reader comment chrome on NukaKnights: lists of commenter names ("a:b:c:") and the
    // "Like this event…" hint. The comment threads themselves are cut by `cutCommentThread`.
    kind: "nk-comments",
    lines: [
      /^(?:[^\s:*][^:*\n]{0,29}:){2,}$/,
      /^\*?Tip: Like this event to receive a notification when it starts or someone comments\.\*?$/,
    ],
  },
  {
    // "What do you think? Feel free to write in the comments." – an invitation to use the
    // site's comment box, together with the rhetorical questions that lead into it.
    kind: "comment-invite",
    inline: [
      /(?<=^|[.!?][ \t])(?:[^.!?\n]*\?[ \t]*)*\**(?:If you [^.!?\n]{0,60}?,\s*)?(?:Schreibt (?:es )?(?:uns )?gern in die Kommentare|(?:Feel free to |[Pp]lease |[Jj]ust )?(?:[Ww]rite|[Ll]eave)[^.!?\n]{0,80}? in the comments[^.!?\n]{0,80})[.!]?\**/gm,
    ],
  },
  {
    // The wikis' own maintenance templates (Fallout Wiki, Nukapedia / Fallout Fandom).
    kind: "wiki-maintenance",
    inline: [/This content (?:or section )?(?:needs expanding|requires updating)\.\s*(?=Please help us improve)/g],
    lines: [
      /^(?:\*\*[^*\n]{1,60}\*\*\s*)?Please help us improve the article(?: by adding missing information)?!?$/i,
      /^\|\s*\|[^|\n]*(?:help us improve the article|help \*?(?:Nukapedia|Fallout Wiki)\*?|Nukapedia\*? ?'s quality standards)[^|\n]*\|\s*$/i,
      /^(?:\*\*[^*\n]{1,60}\*\*\s*)?(?:This article is too short to provide more than rudimentary information about the subject\.\s*|The infobox template in\s*)?You can help \*?Nukapedia\*? ?by (?:writing|expanding|uploading|filling|improving) it(?: in)?\s*\.?$/i,
      /^\*?Nukapedia\*? ?by (?:writing|expanding|uploading|filling|improving) it(?: in)?\s*\.?$/i,
      /^You can help$/,
      /^Article suggested to be split into independent articles as outlined above\.?$/,
      /^(?=.{0,300}$).*\bNukapedia\b.{0,8}quality standards.*$/,
      /^The article, infobox or file image has quality issues that need to be rectified\. Please help \*?Fallout Wiki\*? by editing or replacing it with a better version\.?$/,
    ],
  },
  {
    // Site navigation and widget text that says nothing about the game.
    kind: "site-chrome",
    lines: [
      /^bottom of page$/i,
      /^Scroll Down$/,
      /^\*?Click on (?:the )?map for (?:a )?high[- ]resolution version\*?$/i,
      /^\*\*Your progress will be automatically saved as you mark the boxes on the checklist below\.\*\*$/,
      /^Related Links:$/,
      // NukaKnights' article revision widget ("**Changelog** · 1 changes · Last changed: …").
      /^\*\*Changelog\*\*\s*·\s*\d+ (?:changes?|Änderungen?)\s*·\s*(?:Last changed|Letzte Änderung):[^\n]*$/,
      // A line whose only content is a pointer to a link on the source site: either the
      // scraped link marker ("… can be found __here__.") or a pointer to a site resource
      // ("The advanced 10 sec guide can be found here."). "The skeleton … can be found
      // here." in a wiki location article is about the game world and is not matched.
      /^(?:OR )?[^.!?\n]{0,120}?\bcan (?:now )?be found __here[_.:\s]*$/,
      /^(?:OR )?[^.!?,\n]{0,100}?\b(?:guides?|maps?|checklists?|cop(?:y|ies)|version|photos|list|tracker|calculator|spreadsheet|video|channel|breakdown|patch notes|background)\b[^.!?,\n]{0,40}?\bcan (?:now )?be found here[.:]?$/i,
    ],
  },
];

/**
 * A reader comment's timestamp on NukaKnights: "0 am 29.05.2026 um 17:09:28 Uhr",
 * "0 on August 29, 2025 at 10:36:44 am", "0 on 12/5/2025 at 12:16:01 p.m". Articles never
 * give a time to the second, so this only ever matches the comment widget.
 */
const COMMENT_TIMESTAMP = new RegExp(
  [
    String.raw`\b\d+\s+am \d{1,2}\.\d{1,2}\.\d{4} um \d{1,2}:\d{2}:\d{2} Uhr`,
    String.raw`\bon (?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? \d{1,2}, \d{4}|\d{1,2}/\d{1,2}/\d{4}) at \d{1,2}:\d{2}:\d{2}(?:\s*(?:a\.m|p\.m|am|pm)\b)?`,
  ].join("|"),
);

/** A line that is nothing but a commenter's name ("Luise76:") or a reply chain ("a:b:c:"). */
const COMMENTER_LINE = /^[^\s:]+:$/;
const REPLY_CHAIN_LINE = /^(?:[^\s:*][^:*\n]{0,29}:){2,}$/;
/** The site team's own reply signature ("skywalka team:"). */
const TEAM_SIGNATURE_LINE = /^skywalka ?team:$/i;

/** Single-word labels that look like a commenter line but belong to the article. */
const ARTICLE_LABELS = new Set([
  "quelle", "quellen", "source", "sources", "zutaten", "ingredients", "description", "beschreibung",
  "collects", "note", "notes", "hinweis", "tipp", "tip", "rewards", "belohnungen", "alpha", "bravo",
  "charlie", "update", "fazit", "info", "achtung", "wichtig", "voraussetzungen", "requirements",
]);

/** A heading, table row or list item: article structure, never part of a comment. */
const STRUCTURE_LINE = /^\s*(?:#|\||[-*+]\s|\d+\.\s)/;

function isCommenterLine(line: string): boolean {
  const t = line.trim();
  if (REPLY_CHAIN_LINE.test(t) || TEAM_SIGNATURE_LINE.test(t)) return true;
  return COMMENTER_LINE.test(t) && !ARTICLE_LABELS.has(t.slice(0, -1).toLowerCase().replace(/^-/, ""));
}

/**
 * Cuts a NukaKnights reader-comment thread off the end of a body. The site always renders
 * comments after the article, so everything from the start of the thread on is user
 * interaction. The thread starts at the first commenter-name line that has text right under
 * it and only unstructured prose between it and the first comment timestamp, or else at the
 * paragraph holding that timestamp.
 */
function cutCommentThread(text: string): string {
  const match = COMMENT_TIMESTAMP.exec(text);
  if (!match) return cutQuotedReplyThread(text);
  const paragraphStart = text.lastIndexOf("\n\n", match.index);
  let cut = paragraphStart < 0 ? 0 : paragraphStart;

  const lines = text.slice(0, match.index).split("\n");
  let offset = 0;
  for (let i = 0; i < lines.length && offset < cut; i += 1) {
    const next = lines[i + 1];
    if (isCommenterLine(lines[i]) && next !== undefined && next.trim() !== "") {
      const between = lines.slice(i + 1);
      if (!between.some((line) => STRUCTURE_LINE.test(line))) {
        cut = offset;
        break;
      }
    }
    offset += lines[i].length + 1;
  }
  return text.slice(0, cut);
}

/**
 * A NukaKnights reply thread whose timestamps the scrape dropped (id 3640): the parent comment
 * is quoted, then the commenter's name line, then the same quote again, with nothing but prose
 * after it. The thread starts at the quoted paragraph. Without the repeat a lone "Name:" line
 * could be article text, so nothing is cut.
 */
function cutQuotedReplyThread(text: string): string {
  const lines = text.split("\n");
  let offset = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const next = lines[i + 1];
    if (isCommenterLine(lines[i]) && next !== undefined && next.trim() !== "") {
      const after = lines.slice(i + 1);
      if (!after.some((line) => STRUCTURE_LINE.test(line))) {
        const quote = after.join("\n").trim().split(/\n\s*\n/)[0].trim();
        const before = text.slice(0, offset);
        const quotedAt = quote.length >= 20 ? before.indexOf(quote) : -1;
        if (quotedAt >= 0) {
          const paragraphStart = before.lastIndexOf("\n\n", quotedAt);
          return text.slice(0, paragraphStart < 0 ? 0 : paragraphStart);
        }
      }
    }
    offset += lines[i].length + 1;
  }
  return text;
}

/**
 * Lines that are only left dangling once the boilerplate after them is gone: a heading or a
 * bold-only line with nothing under it ("## Gallery" over dropped images, "__Rewards__" at the
 * end of a quest guide, id 4443).
 */
const DANGLING_TAIL = [
  /^(?:\*\*|__)Other Guides(?:\*\*|__)$/,
  COMMENTER_LINE,
  TEAM_SIGNATURE_LINE,
  /^#{1,6}\s*\S/,
  /^(?:\*\*|__)[^*_\n]+(?:\*\*|__):?$/,
];

function dropDanglingTail(lines: string[]): string[] {
  const out = [...lines];
  for (;;) {
    while (out.length > 0 && !out[out.length - 1].trim()) out.pop();
    if (out.length === 0) return out;
    const last = out[out.length - 1].trim();
    if (!DANGLING_TAIL.some((re) => re.test(last))) return out;
    out.pop();
  }
}

function applyRule(text: string, rule: BoilerplateRule): string {
  let out = text;
  for (const re of rule.inline ?? []) out = out.replace(re, "");
  if (rule.lines?.length) {
    out = out
      .split("\n")
      .filter((line) => !rule.lines!.some((re) => re.test(line.trim())))
      .join("\n");
  }
  return out;
}

/**
 * Removes text that is about the source website rather than about Fallout 76: author
 * signatures and donation appeals, group plugs, NukaKnights bylines, like counters,
 * reader comments and comment invitations, wiki maintenance templates and page chrome.
 * Game text is never touched, even where it uses words such as "support" or "donation".
 *
 * Pure and idempotent. A text without boilerplate comes back unchanged.
 */
export function stripSiteBoilerplate(text: string): string {
  if (!text) return "";
  let out = cutCommentThread(text);
  for (const rule of SITE_BOILERPLATE_RULES) out = applyRule(out, rule);
  const rawLines = out.split("\n");
  const lines = dropDanglingTail(rawLines);
  if (out === text && lines.length === rawLines.length) return text;
  return lines
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Words that only site boilerplate uses. A card snippet was cut from the page by the
 * scraper, often mid-sentence, so the exact patterns above may not match it; a snippet
 * that still contains one of these is rebuilt from the cleaned body instead.
 */
export const SITE_BOILERPLATE_MARKER =
  /Nukapedia|help us improve the\b|Please help Fallout Wiki|quality standards|Unterstütze uns|Mit Deiner Spende|Hat Dir dieser Artikel|Did this article help you|Jetzt Spenden|Donate now|\bskywalka\b|data miner who (?:creates|writes)|\bko-?fi\b|Buffs n Brew|Tip: Like this event|(?:^|\s)(?:[^\s:]+:){2,}(?=\s|$)|\b\d+ am \d{1,2}\.\d{1,2}\.\d{4} um \d/i;

/** Which kinds of site boilerplate a text contains (for reporting; empty when clean). */
export function siteBoilerplateKinds(text: string): SiteBoilerplateKind[] {
  if (!text) return [];
  const kinds: SiteBoilerplateKind[] = [];
  if (cutCommentThread(text) !== text) kinds.push("nk-comments");
  for (const rule of SITE_BOILERPLATE_RULES) {
    if (applyRule(text, rule) !== text && !kinds.includes(rule.kind)) kinds.push(rule.kind);
  }
  // Only a dangling tail ("**Other Guides**", a lone commenter name) was removed.
  if (kinds.length === 0 && stripSiteBoilerplate(text) !== text.trim()) kinds.push("site-chrome");
  return kinds;
}

/* -------------------------------------------------------------------------- */
/* Title-repeat removal                                                       */
/* -------------------------------------------------------------------------- */

interface NormalizedText {
  norm: string;
  /** `map[i]` is the index in the source string of the character that produced `norm[i]`. */
  map: number[];
}

function normalizeForCompare(text: string): NormalizedText {
  const norm: string[] = [];
  const map: number[] = [];
  let pendingSpace = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (/[0-9a-z]/i.test(ch)) {
      if (pendingSpace && norm.length > 0) {
        norm.push(" ");
        map.push(i);
      }
      pendingSpace = false;
      norm.push(ch.toLowerCase());
      map.push(i);
    } else {
      pendingSpace = true;
    }
  }
  return { norm: norm.join(""), map };
}

/**
 * Drops a leading repeat of the title, e.g. a scraped `<h1>` glued to the first
 * paragraph. Kept when the title is the grammatical subject of the sentence that
 * follows it ("Nuka-Cola Dark is a consumable…").
 */
export function stripLeadingTitleRepeat(text: string, title?: string): string {
  if (!title) return text;
  const t = normalizeForCompare(title);
  if (t.norm.length < 4) return text;
  const s = normalizeForCompare(text);
  if (!s.norm.startsWith(t.norm)) return text;
  // The repeat must be a whole-word prefix.
  if (s.norm.length > t.norm.length && s.norm[t.norm.length] !== " ") return text;

  const lastIdx = s.map[t.norm.length - 1];
  const rest = text.slice(lastIdx + 1);
  const trimmed = rest.replace(/^[\s\-–—:|·•,.)\]]+/, "");
  const firstWord = (trimmed.match(/^[A-Za-z']+/) || [""])[0].toLowerCase();
  if (SUBJECT_VERBS.has(firstWord)) return text;
  if (/^['’]s\b/.test(rest.trimStart())) return text;
  return trimmed;
}

/* -------------------------------------------------------------------------- */
/* Snippets                                                                   */
/* -------------------------------------------------------------------------- */

function isSentenceEnd(text: string, index: number): boolean {
  const ch = text[index];
  if (ch !== "." && ch !== "!" && ch !== "?") return false;
  const prev = text[index - 1];
  if (!prev) return false;
  // "V.A.T.S." / "S.P.E.C.I.A.L." / initials are not sentence ends.
  if (ch === "." && /[A-Z]/.test(prev)) return false;
  return true;
}

function truncateToSentence(text: string): { text: string; truncated: boolean } {
  if (text.length <= SNIPPET_MAX_LENGTH) return { text, truncated: false };
  for (let i = SNIPPET_MAX_LENGTH - 1; i >= SNIPPET_MIN_SENTENCE_CUT; i -= 1) {
    const next = text[i + 1];
    if ((next === undefined || /\s/.test(next)) && isSentenceEnd(text, i)) {
      return { text: text.slice(0, i + 1), truncated: false };
    }
  }
  const window = text.slice(0, SNIPPET_MAX_LENGTH);
  let cut = window.lastIndexOf(" ", SNIPPET_MAX_LENGTH - 1);
  if (cut < SNIPPET_MIN_SENTENCE_CUT) cut = SNIPPET_MAX_LENGTH - 1;
  return {
    text: window.slice(0, cut).replace(/[\s,;:–—-]+$/, ""),
    truncated: true,
  };
}

/**
 * Cleans one card snippet: no markup, no chrome, no byline, ends on a sentence
 * boundary within {@link SNIPPET_MAX_LENGTH} characters. `title` is optional and is
 * only used to drop a leading heading repeat.
 */
export function cleanSnippet(text: string, title?: string): string {
  if (!text) return "";
  let out = stripSiteBoilerplate(decodeEntities(text));

  // Remember whether the scraper already cut this snippet mid-sentence.
  const hadEllipsis = /(?:\.{3}|…)\s*$/.test(out);
  out = out.replace(/(?:\.{3}|…)\s*$/, " ");

  out = out.replace(/<[^>]*>/g, " ");
  out = stripMarkdownImages(out);
  out = unwrapMarkdownLinks(out);
  out = stripAssetUrls(out);
  out = stripReferenceMarkers(out);
  out = applyAll(out, MAINTENANCE_PATTERNS);
  out = applyAll(out, BYLINE_PATTERNS);
  out = applyAll(out, CHROME_PATTERNS);
  out = out.replace(/\*+([^*\n]+)\*+/g, "$1").replace(/[*_`]{2,}/g, "");
  out = out.replace(/\s+/g, " ");
  out = tidyInline(out);
  out = stripLeadingTitleRepeat(out, title);
  out = tidyInline(out);
  if (!out) return "";

  const { text: cut, truncated } = truncateToSentence(out);
  // The cut can land just after an ellipsis the source itself contained, so normalise
  // the tail once more; otherwise a second pass would turn "…Reward..." into "…Reward…".
  out = cut.replace(/(?:\.{3}|…)\s*$/, "").replace(/[\s,;:–—-]+$/, "");
  if (!out) return "";
  const openEnded = truncated || hadEllipsis || out !== cut;
  if (openEnded && !/[.!?)”"]$/.test(out)) out += "…";
  return out;
}

/* -------------------------------------------------------------------------- */
/* Bodies                                                                     */
/* -------------------------------------------------------------------------- */

function isTableRow(line: string): boolean {
  return line.trimStart().startsWith("|");
}

/**
 * Whether a raw body references any image. Used to tell readers the original page has
 * pictures, because bodies no longer embed them (see `cleanBody`).
 */
export function bodyHasImages(text: string): boolean {
  return /!\[[^\]]*\]\([^)\s]+\)/.test(text || "");
}

/**
 * Cleans a full article body while keeping the Markdown structure the reader renders
 * (headings, lists, tables, blockquotes).
 *
 * Every image is removed. The corpus images live on other people's servers (Duchess
 * Flame's Wix CDN, Bethesda's CDN, Nuka Knights) or are relative paths that were never
 * valid here; embedding them would hotlink those sites' bandwidth. The reader links to
 * the original article instead (`sourceImages` flag on the index entry).
 */
export function cleanBody(text: string): string {
  if (!text) return "";
  let out = decodeEntities(text);
  out = out.replace(/\r\n?/g, "\n");
  // Site boilerplate goes first, so the line rules below see the lines it leaves behind
  // (a byline cut off the front of a line exposes a "See also:" start, for example), and
  // again at the end for anything that only matches once markup has been unwrapped.
  out = stripSiteBoilerplate(out);
  out = out.replace(/<[^>]*>/g, " ");

  out = stripMarkdownImages(out);
  out = unwrapMarkdownLinks(out);
  out = stripAssetUrls(out);
  out = stripReferenceMarkers(out);
  out = applyAll(out, MAINTENANCE_PATTERNS);
  out = applyAll(out, BYLINE_PATTERNS);
  out = applyAll(out, CHROME_PATTERNS);

  const kept: string[] = [];
  for (const rawLine of out.split("\n")) {
    const table = isTableRow(rawLine);
    let line = rawLine.replace(/\(\s*\)/g, " ");
    if (!table) line = line.replace(/[ \t]+([,.;:!?])(?!\d)/g, "$1");
    line = line.replace(/[ \t]+/g, " ").trimEnd();
    const probe = line.trim();
    if (CHROME_LINE_PATTERNS.some((re) => re.test(probe))) {
      kept.push("");
      continue;
    }
    // A line that was nothing but a stripped image or URL disappears entirely.
    if (!probe && rawLine.trim()) {
      kept.push("");
      continue;
    }
    kept.push(line);
  }

  const cleaned = kept
    .join("\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return stripSiteBoilerplate(cleaned);
}

/* -------------------------------------------------------------------------- */
/* Titles                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A `DD MM YYYY` / `MM DD YYYY` slug. The year must be four digits and the whole run
 * must not sit inside a longer dotted number, so build strings such as "1.7.22.12"
 * are never mistaken for dates.
 */
const DATE_SLUG = /(^|[^\d.])(\d{1,2})[ ._/-](\d{1,2})[ ._/-](\d{4})(?![\d.])/;

function resolveDayMonthOrder(
  a: number,
  b: number,
  source: string | undefined,
  snippet: string | undefined,
): "DMY" | "MDY" {
  if (a > 12 && b <= 12) return "DMY";
  if (b > 12 && a <= 12) return "MDY";
  if (snippet) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const dotted = new RegExp(`\\b0?${a}\\.0?${b}\\.|\\b${pad(a)}\\.${pad(b)}\\.`);
    const slashed = new RegExp(`\\b0?${a}/0?${b}/|\\b${pad(a)}/${pad(b)}/`);
    if (dotted.test(snippet)) return "DMY";
    if (slashed.test(snippet)) return "MDY";
  }
  return (source && SOURCE_DATE_ORDER[source]) || "DMY";
}

function formatDate(day: number, month: number, year: number): string | null {
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
}

/** Words that appear capitalised inside the snippet away from a sentence start. */
function capitalisedWordsIn(snippet: string | undefined): Set<string> {
  const found = new Set<string>();
  if (!snippet) return found;
  const re = /[A-Z][A-Za-z'’-]*/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(snippet)) !== null) {
    let i = match.index - 1;
    while (i >= 0 && /\s/.test(snippet[i])) i -= 1;
    const prev = i >= 0 ? snippet[i] : "";
    if (prev === "" || ".!?“\"".includes(prev)) continue;
    const word = match[0].toLowerCase();
    found.add(word);
    if (word.endsWith("s")) found.add(word.slice(0, -1));
    else found.add(`${word}s`);
  }
  return found;
}

function isAcronymish(word: string): boolean {
  if (/^[A-Z0-9.]{2,}$/.test(word)) return true;
  if (/^(?:[A-Za-z]\.){2,}$/.test(word)) return true;
  return false;
}

function looksTitleCased(title: string): boolean {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length < 4) return false;
  let smallCapitalised = 0;
  let smallLowercase = 0;
  let capitalised = 0;
  for (let i = 1; i < words.length; i += 1) {
    const bare = words[i].replace(/^[^\w]+|[^\w]+$/g, "");
    if (!bare || /\d/.test(bare)) continue;
    const isSmall = TITLE_STOP_WORDS.has(bare.toLowerCase());
    if (/^[A-Z]/.test(bare)) {
      capitalised += 1;
      if (isSmall) smallCapitalised += 1;
    } else if (isSmall) {
      smallLowercase += 1;
    }
  }
  return smallCapitalised >= 1 && smallLowercase === 0 && capitalised >= 3;
}

function toSentenceCase(title: string, snippet: string | undefined): string {
  const keep = capitalisedWordsIn(snippet);
  const words = title.split(/\s+/);
  const bares = words.map((w) => w.replace(/^[^\w]+|[^\w]+$/g, ""));
  const isSingleLetter = (i: number) => i >= 0 && i < bares.length && /^[A-Za-z]$/.test(bares[i]);
  return words
    .map((word, i) => {
      const bare = bares[i];
      if (!bare) return word;
      if (i === 0) return word;
      if (/\d/.test(bare)) return word;
      // A lone capital is only an acronym letter when it sits beside another one
      // ("C A M P", "V A T S"); otherwise it is the article "A".
      const spacedAcronym = bare.length === 1 && (isSingleLetter(i - 1) || isSingleLetter(i + 1));
      if (spacedAcronym || (bare.length > 1 && isAcronymish(bare))) return word;
      const lower = bare.toLowerCase();
      if (ALWAYS_PROPER.has(lower)) return word;
      if (TITLE_STOP_WORDS.has(lower)) return word.toLowerCase();
      if (/[:?!.]$/.test(words[i - 1])) return word;
      if (keep.has(lower)) return word;
      return word.toLowerCase();
    })
    .join(" ");
}

/**
 * Cleans an article title: date slugs become readable dates, scraped SEO Title Case
 * becomes sentence case with proper nouns intact. `id` and `url` are untouched.
 */
export function cleanTitle(
  title: string,
  source?: string,
  snippet?: string,
): string {
  if (!title) return "";
  let out = decodeEntities(title.trim());
  out = out.replace(/<[^>]*>/g, "");
  out = out.replace(/\.(?:html?|php|md|txt|json)$/i, "");
  out = out.replace(/\?.*$/, "");
  out = stripReferenceMarkers(out);
  out = out.replace(/\s+/g, " ").trim();

  // A date this function already appended on an earlier run: lift it off so the
  // casing rules below never see it, and put it back unchanged at the end.
  let dateSuffix: string | null = null;
  const formatted = out.match(
    new RegExp(`,\\s*(\\d{1,2} (?:${MONTHS_SHORT.join("|")}) \\d{4})\\s*$`),
  );
  if (formatted) {
    dateSuffix = formatted[1];
    out = out.slice(0, formatted.index).trim();
  }

  const dateMatch = dateSuffix ? null : out.match(DATE_SLUG);
  if (dateMatch && dateMatch.index !== undefined) {
    const a = parseInt(dateMatch[2], 10);
    const b = parseInt(dateMatch[3], 10);
    const year = parseInt(dateMatch[4], 10);
    const order = resolveDayMonthOrder(a, b, source, snippet);
    dateSuffix = order === "DMY" ? formatDate(a, b, year) : formatDate(b, a, year);
    if (dateSuffix) {
      const start = dateMatch.index + dateMatch[1].length;
      out = (out.slice(0, start) + " " + out.slice(dateMatch.index + dateMatch[0].length))
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  if (source && SENTENCE_CASE_SOURCES.has(source)) {
    out = out.replace(/\s+in Fallout 76\s*$/i, "");
    if (looksTitleCased(out)) out = toSentenceCase(out, snippet);
  }

  // The in-game name is the Atomic Shop; the scraper wrote "Atom Shop". Applied after
  // the casing pass so "Shop" is never left lowercase (which would not be idempotent).
  out = out.replace(/\bAtom(?:ic)? (?:Update )?Shop\b/gi, "Atomic Shop");
  out = out.replace(/\bAtomic Shop Update\b/g, "Atomic Shop update");

  out = out.replace(/\s+/g, " ").replace(/\s+([,:;])/g, "$1").trim();
  out = out.replace(/[\s,;:|·•-]+$/, "");

  if (dateSuffix) out = out ? `${out}, ${dateSuffix}` : dateSuffix;
  return out;
}
