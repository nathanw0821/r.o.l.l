"use client";

import * as React from "react";
import { Search, ExternalLink, Shield, ArrowUpDown, Terminal, ArrowLeft, AlertTriangle, X, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createLinkPlanState, linkifyToNodes } from "@/components/linkified-text";

import wikiCategoryCounts from "@/lib/wiki/wiki-category-counts.json";
import { UPDATE_PATCHES } from "@/lib/wiki/update-patches";
import {
  GUIDES_PER_PAGE,
  WIKI_SOURCES,
  activeFilterChips,
  clearAllFilters,
  countActiveFilters,
  firstSentence,
  pageCount,
  pageOffset,
  parseGuideListState,
  removeFilter,
  serializeGuideListState,
  type GuideFilterKey,
  type GuideListState,
  type WikiSource,
} from "@/lib/wiki/guide-list-state";

const COUNTS = wikiCategoryCounts as Record<string, number>;
const TOTAL_ARTICLES = COUNTS.all ?? 0;
const ARCHIVED_ARTICLES = COUNTS.archived ?? 0;
const STUB_ARTICLES = COUNTS.stub ?? 0;

interface ArticleItem {
  id: number | string;
  source: string;
  title: string;
  url: string;
  content: string;
  main_image: string | null;
  category: string;
  snippet: string;
  updatedAt?: string;
  archived?: boolean;
  stub?: boolean;
  /** The original article has pictures; they are linked, not embedded. */
  sourceImages?: boolean;
}

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";

/** Category ids are the `?category=` values and the counts keys; do not rename them. */
const CATEGORY_LIST: ReadonlyArray<{ id: string; label: string; desc: string }> = [
  { id: "all", label: "All guides", desc: "Every guide in the library." },
  { id: "Weapons & Mods", label: "Weapons & legendary mods", desc: "Drop odds, crafting costs and mod tables." },
  { id: "Armor & Power Armor", label: "Armor & power armor", desc: "Resistances, set bonuses and power armor plans." },
  { id: "Perks & Mutations", label: "Perks & mutations", desc: "S.P.E.C.I.A.L. card ranks and serum effects." },
  { id: "Vendors & Minerva", label: "Vendors & Minerva", desc: "Minerva schedules and Gold Bullion." },
  { id: "Events & Expeditions", label: "Events & expeditions", desc: "Public event rewards, The Pitt and Atlantic City expeditions." },
  { id: "Build Mechanics & Damage", label: "Build mechanics & damage", desc: "Crit formulas, sneak multipliers and AP regen." },
  { id: "Crafting & Resources", label: "Crafting & materials", desc: "Flux locations, junk farming and camp plans." },
  { id: "Patch notes & news", label: "Patch notes & news", desc: "Update notes, hotfixes and test server datamines." },
  { id: "Atomic Shop archive", label: "Atomic Shop archive", desc: "Weekly Atomic Shop offers and bundle rundowns." },
];

const CATEGORY_LABELS = new Map(CATEGORY_LIST.map((c) => [c.id, c.label]));
const categoryLabel = (id: string) => CATEGORY_LABELS.get(id) ?? id;

/** Committed counts; "all" follows the archive toggle so it matches what the list shows. */
function categoryCount(id: string, includeArchive: boolean): number {
  if (id === "all") return includeArchive ? TOTAL_ARTICLES : TOTAL_ARTICLES - ARCHIVED_ARTICLES;
  return COUNTS[id] ?? 0;
}

function searchApiUrl(state: GuideListState, sort: SortOption, offset: number, limit: number): string {
  const params = new URLSearchParams({
    q: state.q,
    category: state.category,
    sort,
    update: state.update,
    archive: state.archive ? "1" : "0",
    offset: String(offset),
    limit: String(limit),
  });
  if (state.source) params.set("source", state.source);
  if (state.hideStubs) params.set("stubs", "hide");
  return `/api/wiki/search?${params.toString()}`;
}

function toHighResImageUrl(url: string | null): string {
  if (!url) return "";
  let clean = url;
  if (clean.includes("static.wixstatic.com/media/")) {
    const match = clean.match(/(https:\/\/static\.wixstatic\.com\/media\/[^/\s]+\.(?:jpg|png|webp|gif))/i);
    if (match) return match[1];
    const match2 = clean.match(/(https:\/\/static\.wixstatic\.com\/media\/[^/\s]+~mv2)/i);
    if (match2) return match2[1] + ".jpg";
  }
  if (clean.includes("wikia.nocookie.net")) {
    clean = clean.replace(/\/revision\/latest\/scale-to-width-down\/\d+.*$/, "");
    clean = clean.replace(/\/scale-to-width-down\/\d+.*$/, "");
  }
  return clean;
}

import { getArticleOutdatedStatus } from "@/lib/wiki/outdated-articles";
import { cleanTitle as cleanArticleTitle } from "@/lib/wiki/clean-text";

/**
 * Render-time safety net only: the corpus titles are cleaned at build time by
 * scripts/truth/clean-wiki-corpus.ts, so this is a no-op on current data. It replaces
 * the old `sanitizeTitle` call, which turned every hyphen into a space ("T-51b" became
 * "T 51b"). Source and snippet are deliberately omitted so nothing is re-cased here.
 */
function cleanTitle(title: string): string {
  return cleanArticleTitle(title);
}

/**
 * `linkify` (plain paragraphs of the reader only) links game terms in the text between the
 * bold/italic runs: first occurrence per paragraph, never to `currentPath`.
 */
function renderFormattedInlineText(text: string, linkify?: { currentPath: string | null }): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let keyIdx = 0;
  const linkState = linkify ? createLinkPlanState() : null;
  const pushPlain = (plain: string) => {
    if (!linkify || !linkState) {
      parts.push(plain);
      return;
    }
    parts.push(...linkifyToNodes(plain, { currentPath: linkify.currentPath, state: linkState, keyPrefix: `lk${keyIdx++}` }));
  };

  const mdPattern = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)/g;
  let match;
  let lastIndex = 0;

  while ((match = mdPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      pushPlain(text.substring(lastIndex, match.index));
    }
    const matchedStr = match[0];
    if (matchedStr.startsWith("***") && matchedStr.endsWith("***")) {
      parts.push(
        <strong key={keyIdx++} className="font-bold italic text-amber-300">
          {matchedStr.slice(3, -3)}
        </strong>
      );
    } else if (matchedStr.startsWith("**") && matchedStr.endsWith("**")) {
      parts.push(
        <strong key={keyIdx++} className="font-bold text-amber-300">
          {matchedStr.slice(2, -2)}
        </strong>
      );
    } else if (matchedStr.startsWith("*") && matchedStr.endsWith("*")) {
      parts.push(
        <em key={keyIdx++} className="italic text-emerald-300">
          {matchedStr.slice(1, -1)}
        </em>
      );
    }
    lastIndex = mdPattern.lastIndex;
  }
  if (lastIndex < text.length) {
    pushPlain(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/** Images we may embed: served from this site only. Third-party images are linked, never hotlinked. */
function isSameSiteImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("/") && !url.startsWith("//");
}

function parseCleanArticleContent(content: string, currentPath: string | null = null) {
  if (!content) return null;

  const blocks = content.split(/\n\s*\n/);
  const seenImages = new Set<string>();
  let activeTitleWord: { type: "Prefix & Suffix" | "Prefix" | "Suffix"; word: string } | null = null;

  return blocks.map((block, idx) => {
    let trimmed = block.trim();
    if (!trimmed) return null;

    if (
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
    ) {
      return null;
    }

    trimmed = trimmed.replace(/(\d{4})(\d+\s*min\s*read)/i, "$1 • $2");

    // 1. Markdown Table
    if (trimmed.startsWith("|")) {
      activeTitleWord = null;
      const rows = trimmed.split("\n").filter((r) => r.trim().startsWith("|"));
      if (rows.length > 0) {
        return (
          <div key={idx} className="my-6 overflow-x-auto rounded-xl border border-slate-700 bg-[#060a10] p-3 shadow-lg">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <tbody>
                {rows.map((rowStr, rIdx) => {
                  if (/^\|[\s\-:|]+\|$/.test(rowStr.trim())) return null;
                  const cells = rowStr.split("|").slice(1, -1).map((c) => c.trim());
                  const isHeader = rIdx === 0;

                  return (
                    <tr
                      key={rIdx}
                      className={
                        isHeader
                          ? "bg-amber-500/15 text-amber-400 font-bold border-b border-amber-500/40 uppercase tracking-wider"
                          : "border-b border-slate-800 hover:bg-slate-900/60 transition-colors"
                      }
                    >
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 leading-snug">
                          {renderFormattedInlineText(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // 2. Markdown Image
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const altText = imgMatch[1] || "";
      const rawImgUrl = imgMatch[2];
      // Never embed an image served by another site (no hotlinking). Bodies are cleaned
      // image-free; this guards against a future dirty import.
      if (!isSameSiteImage(rawImgUrl)) {
        return null;
      }
      const hdUrl = toHighResImageUrl(rawImgUrl);

      const imgKey = hdUrl.toLowerCase();
      if (seenImages.has(imgKey)) {
        return null;
      }
      seenImages.add(imgKey);

      const currentTitle = activeTitleWord;
      activeTitleWord = null;

      if (currentTitle) {
        const isDualBadge = currentTitle.type === "Prefix & Suffix";

        return (
          <div key={idx} className="my-6 flex flex-col items-center justify-center group">
            <div className="relative w-full max-w-[460px] rounded-xl overflow-hidden shadow-2xl border-2 border-amber-500/40 bg-[#03060a] p-1 transition-all hover:border-amber-400">
              <div className="relative rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={hdUrl}
                  alt={`${currentTitle.type}: ${currentTitle.word}`}
                  className="w-full h-auto max-h-[420px] object-contain rounded-md"
                  onError={(e) => {
                    (e.currentTarget.parentElement?.parentElement?.parentElement as HTMLElement).style.display = "none";
                  }}
                />

                {isDualBadge ? (
                  <>
                    <div className="absolute top-[38%] left-[18%] right-[42%] -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      <div className="w-full text-center font-black text-slate-950 uppercase font-mono tracking-widest text-lg sm:text-2xl md:text-3xl drop-shadow-md truncate">
                        {currentTitle.word}
                      </div>
                    </div>
                    <div className="absolute top-[71%] left-[26%] right-[8%] -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      <div className="w-full text-center font-black text-slate-950 uppercase font-mono tracking-widest text-xl sm:text-3xl md:text-4xl drop-shadow-md truncate">
                        {currentTitle.word}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute top-[57%] left-0 right-0 -translate-y-1/2 flex items-center justify-center px-[8%] pointer-events-none">
                    <div className="w-full text-center font-black text-slate-950 uppercase font-mono tracking-widest text-xl sm:text-3xl md:text-4xl drop-shadow-md truncate">
                      {currentTitle.word}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              Player Title {currentTitle.type}: <span className="text-emerald-400 uppercase tracking-wider">{currentTitle.word}</span>
            </div>
          </div>
        );
      }

      return (
        <div key={idx} className="my-6 rounded-xl overflow-hidden border border-slate-700 bg-[#03060a] p-2 shadow-xl transition-all hover:border-amber-400/50">
          <div className="rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center p-2">
            <img
              src={hdUrl}
              alt={altText || "Fallout 76 Guide Visual"}
              className="w-auto h-auto max-h-[480px] max-w-full object-contain rounded-md shadow-lg"
              onError={(e) => {
                (e.currentTarget.parentElement?.parentElement as HTMLElement).style.display = "none";
              }}
            />
          </div>
          {altText && !altText.includes("Writer:") && !altText.includes("http") && altText !== "Fallout 76 Guide Visual" && (
            <div className="px-3 py-2 text-[11px] font-mono text-amber-400/90 text-center font-medium border-t border-slate-800 mt-1">
              {altText}
            </div>
          )}
        </div>
      );
    }

    // 3. Title Definition
    const titleMatch = trimmed.match(/Player Title (Prefix\s*&\s*Suffix|Prefix\s+and\s+Suffix|Prefix|Suffix)\s*:\s*([A-Za-z0-9\s"'-]+)/i) ||
                       trimmed.match(/Title (Prefix\s*&\s*Suffix|Prefix\s+and\s+Suffix|Prefix|Suffix)\s*:\s*([A-Za-z0-9\s"'-]+)/i);
    if (titleMatch) {
      const rawType = titleMatch[1].toLowerCase();
      const typeLabel = (rawType.includes("prefix") && rawType.includes("suffix"))
        ? "Prefix & Suffix"
        : rawType.includes("prefix")
        ? "Prefix"
        : "Suffix";

      activeTitleWord = {
        type: typeLabel,
        word: titleMatch[2].trim().replace(/^["']|["']$/g, "")
      };
    } else {
      activeTitleWord = null;
    }

    // 4. Headings
    if (trimmed.startsWith("# ")) {
      return (
        <h2 key={idx} className="text-2xl font-mono font-black text-amber-400 border-b-2 border-amber-500/30 pb-2 mt-8 mb-4 tracking-wide uppercase">
          {trimmed.replace("# ", "")}
        </h2>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h3 key={idx} className="text-xl font-mono font-bold text-amber-300 border-b border-slate-800 pb-1.5 mt-6 mb-3">
          {trimmed.replace("## ", "")}
        </h3>
      );
    }
    if (trimmed.startsWith("### ")) {
      return (
        <h4 key={idx} className="text-lg font-mono font-bold text-emerald-400 mt-5 mb-2">
          {trimmed.replace("### ", "")}
        </h4>
      );
    }

    // 5. Blockquotes
    if (trimmed.startsWith("> ")) {
      return (
        <blockquote key={idx} className="my-4 border-l-4 border-amber-500/60 pl-4 py-2 italic text-slate-200 bg-amber-500/10 rounded-r font-mono text-xs">
          {renderFormattedInlineText(trimmed.replace(/^>\s+/, ""))}
        </blockquote>
      );
    }

    // 6. Bullet Lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return (
        <ul key={idx} className="list-disc pl-6 my-2 text-slate-200 text-sm space-y-1.5 font-sans">
          <li>{renderFormattedInlineText(trimmed.replace(/^[-*]\s+/, ""))}</li>
        </ul>
      );
    }

    // 7. Standard Paragraph
    return (
      <p key={idx} className="text-slate-200 whitespace-pre-line leading-relaxed font-sans text-sm md:text-base tracking-normal">
        {renderFormattedInlineText(trimmed, { currentPath })}
      </p>
    );
  });
}

function getEquipmentKeyFromTitle(title: string, content: string): string {
  const text = (title + " " + content).toLowerCase();
  
  if (text.includes("civil engineer")) return "civil-engineer";
  if (text.includes("secret service")) return "secret-service";
  if (text.includes("brotherhood recon") || text.includes("bos recon")) return "bos-recon";
  if (text.includes("covert scout")) return "covert-scout";
  if (text.includes("urban scout")) return "urban-scout";
  if (text.includes("forest scout")) return "forest-scout";
  if (text.includes("arctic marine")) return "arctic-marine";
  if (text.includes("marine")) return "marine";
  if (text.includes("heavy combat") || text.includes("combat armor") || text.includes("combat armour")) return "heavy-combat";
  if (text.includes("thorn")) return "thorn";
  if (text.includes("solar")) return "solar";
  if (text.includes("trapper")) return "trapper";
  if (text.includes("wood")) return "wood";
  if (text.includes("heavy metal") || text.includes("metal armor")) return "heavy-metal";
  if (text.includes("heavy leather") || text.includes("leather armor")) return "heavy-leather";
  if (text.includes("heavy robot") || text.includes("robot armor")) return "heavy-robot";
  if (text.includes("botsmith")) return "botsmith";
  
  // Power Armor
  if (text.includes("t-65") || text.includes("t65")) return "t65-torso";
  if (text.includes("t-60") || text.includes("t60")) return "t60-torso";
  if (text.includes("t-51") || text.includes("t51")) return "t51-torso";
  if (text.includes("t-45") || text.includes("t45")) return "t45-torso";
  if (text.includes("excavator")) return "excavator-torso";
  if (text.includes("x-01") || text.includes("x01")) return "x01-torso";
  if (text.includes("ultracite")) return "ultracite-torso";
  if (text.includes("strangler heart")) return "strangler-heart-chest";
  if (text.includes("hellcat")) return "hellcat-torso";
  if (text.includes("union power") || text.includes("union pa")) return "union-pa-torso";
  if (text.includes("vulcan")) return "vulcan-torso";

  // Weapons
  if (text.includes("fixer")) return "fixer";
  if (text.includes("handmade")) return "handmade";
  if (text.includes("railway")) return "railway";
  if (text.includes("cremator")) return "cremator";
  if (text.includes("flamer") || text.includes("holy fire")) return "holy-fire";
  if (text.includes("gatling plasma")) return "gatling-plasma";
  if (text.includes("50 cal")) return "cal50";
  if (text.includes("minigun")) return "minigun";
  if (text.includes("pepper shaker")) return "pepper-shaker";
  if (text.includes("gauss minigun")) return "gauss-minigun";
  if (text.includes("plasma caster")) return "plasma-caster";
  if (text.includes("chainsaw")) return "chainsaw";
  if (text.includes("auto axe")) return "auto-axe";
  if (text.includes("power fist")) return "power-fist";
  if (text.includes("deathclaw gauntlet")) return "dc-gauntlet";
  if (text.includes("war glaive")) return "war-glaive";
  if (text.includes("plasma cutter")) return "plasma-cutter";

  return cleanTitle(title);
}


const PILL =
  "guides-pill guides-mono inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[13px] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]";
const RAIL_OPTION =
  "guides-pill guides-mono flex w-full items-center justify-between gap-2 rounded-md border border-transparent px-2 py-1.5 text-left text-[13px] text-[var(--text-muted)] hover:bg-[var(--control-hover)] hover:text-[var(--text-primary)]";
const GROUP_HEADING = "guides-heading guides-mono mb-1.5 text-[13px] text-[var(--text-soft)]";

function CategoryList({
  state,
  onSelect,
  layout,
}: {
  state: GuideListState;
  onSelect: (id: string) => void;
  layout: "row" | "column";
}) {
  return (
    <ul className={layout === "row" ? "flex flex-wrap gap-2" : "space-y-0.5"}>
      {CATEGORY_LIST.map((cat) => {
        const current = state.category === cat.id;
        return (
          <li key={cat.id}>
            <button
              type="button"
              title={cat.desc}
              aria-pressed={current}
              onClick={() => onSelect(cat.id)}
              className={layout === "row" ? PILL : RAIL_OPTION}
            >
              <span>{cat.label}</span>
              <span className="text-[var(--text-soft)]">{categoryCount(cat.id, state.archive).toLocaleString()}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Source, update and option filters: the desktop rail and the phone disclosure render the same groups. */
function FilterGroups({
  state,
  onChange,
  idPrefix,
  includeCategory,
}: {
  state: GuideListState;
  onChange: (next: GuideListState) => void;
  idPrefix: string;
  includeCategory: boolean;
}) {
  const set = (patch: Partial<GuideListState>) => onChange({ ...state, ...patch, page: 1 });
  return (
    <div className="space-y-5">
      {includeCategory ? (
        <section aria-labelledby={`${idPrefix}-category`}>
          <h2 id={`${idPrefix}-category`} className={GROUP_HEADING}>Category</h2>
          <CategoryList state={state} onSelect={(id) => set({ category: id })} layout="column" />
        </section>
      ) : null}

      <section aria-labelledby={`${idPrefix}-source`}>
        <h2 id={`${idPrefix}-source`} className={GROUP_HEADING}>Source</h2>
        <ul className="space-y-0.5">
          {[null, ...WIKI_SOURCES].map((source) => (
            <li key={source ?? "all"}>
              <button
                type="button"
                aria-pressed={state.source === source}
                onClick={() => set({ source: source as WikiSource | null })}
                className={RAIL_OPTION}
              >
                {source ?? "All sources"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={`${idPrefix}-update`}>
        <h2 id={`${idPrefix}-update`} className={GROUP_HEADING}>Update</h2>
        <ul className="space-y-0.5">
          {UPDATE_PATCHES.map((patch) => (
            <li key={patch.id}>
              <button
                type="button"
                aria-pressed={state.update === patch.id}
                onClick={() => set({ update: patch.id })}
                className={RAIL_OPTION}
              >
                {patch.label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={`${idPrefix}-options`} className="space-y-2">
        <h2 id={`${idPrefix}-options`} className={GROUP_HEADING}>Options</h2>
        <label className="guides-mono flex cursor-pointer items-center gap-2 px-2 text-[13px] text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={state.archive}
            onChange={(e) => set({ archive: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          <span>Include archive ({ARCHIVED_ARTICLES.toLocaleString()})</span>
        </label>
        <label className="guides-mono flex cursor-pointer items-center gap-2 px-2 text-[13px] text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={state.hideStubs}
            onChange={(e) => set({ hideStubs: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          <span>Hide stubs ({STUB_ARTICLES.toLocaleString()})</span>
        </label>
      </section>
    </div>
  );
}

function TruthWikiContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname() || "/wiki";
  const listState = React.useMemo(() => parseGuideListState(searchParams), [searchParams]);
  const listKey = serializeGuideListState(listState);

  const [queryInput, setQueryInput] = React.useState(listState.q);
  const [sortBy, setSortBy] = React.useState<SortOption>("newest");
  const [articles, setArticles] = React.useState<ArticleItem[]>([]);
  const [total, setTotal] = React.useState<number | null>(null);
  const [selectedArticle, setSelectedArticle] = React.useState<ArticleItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingContent, setLoadingContent] = React.useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLOListElement>(null);
  const resultsTopRef = React.useRef<HTMLDivElement>(null);
  /** Query string this page last wrote itself; any other URL change is navigation (link, back/forward). */
  const selfWrittenRef = React.useRef<string | null>(null);
  /** Deep-link values (?q=, ?id=) seen on the previous URL, to auto-open the reader only when they change. */
  const prevDeepLinkRef = React.useRef<{ q: string; id: string } | null>(null);
  const sortRef = React.useRef(sortBy);
  React.useEffect(() => {
    sortRef.current = sortBy;
  }, [sortBy]);

  React.useEffect(() => {
    if (!selectedArticle) return;
    if (selectedArticle.content && selectedArticle.content.trim().length > 0) return;

    let active = true;
    setLoadingContent(true);
    fetch(`/data/wiki/${encodeURIComponent(selectedArticle.id)}.json`)
      .then((res) => res.json() as Promise<{ content?: string }>)
      .then((data) => {
        if (active && data?.content) {
          setSelectedArticle((prev) => (prev ? { ...prev, content: data.content! } : null));
        }
      })
      .catch((err) => {
        console.warn("Failed to load article content:", err);
      })
      .finally(() => {
        if (active) setLoadingContent(false);
      });

    return () => {
      active = false;
    };
  }, [selectedArticle?.id, selectedArticle?.content]);

  /** Write list state to the URL. Filters and paging push a history entry; typing replaces it. */
  const writeState = React.useCallback(
    (next: GuideListState, mode: "push" | "replace" = "push") => {
      const qs = serializeGuideListState(next);
      if (qs === window.location.search.replace(/^\?/, "")) return;
      selfWrittenRef.current = qs;
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (mode === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    },
    [pathname],
  );

  // Deep links that open the reader: ?id= (alias ?article=) opens that guide; ?q= (alias ?query=)
  // opens the best title match, as before. Runs on load and on navigation (a /wiki?q= link, back or
  // forward) when the value changed; never for URL updates this page makes while you type or page.
  const openDeepLink = React.useCallback(async (id: string, state: GuideListState) => {
    try {
      if (id) {
        const res = await fetch(`/api/wiki/search?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
          setSelectedArticle(data[0] as ArticleItem);
          return;
        }
      }
      const q = state.q;
      if (q.trim().length > 1) {
        const res = await fetch(searchApiUrl(state, sortRef.current, 0, 100));
        const data = await res.json();
        const list: ArticleItem[] = Array.isArray(data) ? data : [];
        const cleanQ = q.toLowerCase().trim();
        const bestMatch =
          list.find((a) => a.title.toLowerCase() === cleanQ) ||
          list.find((a) => a.title.toLowerCase().startsWith(cleanQ)) ||
          list.find((a) => a.title.toLowerCase().includes(cleanQ)) ||
          list[0];
        if (bestMatch) setSelectedArticle(bestMatch);
      }
    } catch (err) {
      console.error("Failed to open linked guide:", err);
    }
  }, []);

  React.useEffect(() => {
    const qs = searchParams?.toString() ?? "";
    const external = selfWrittenRef.current === null || qs !== selfWrittenRef.current;
    selfWrittenRef.current = null;
    const id = searchParams?.get("id") || searchParams?.get("article") || "";
    const prev = prevDeepLinkRef.current;
    prevDeepLinkRef.current = { q: listState.q, id };
    if (!external) return;
    setQueryInput(listState.q);
    const idChanged = Boolean(id) && (!prev || prev.id !== id);
    const qChanged = listState.q.trim().length > 1 && (!prev || prev.q !== listState.q);
    if (idChanged || qChanged) void openDeepLink(idChanged ? id : "", listState);
  }, [searchParams, listState, openDeepLink]);

  // Typing updates ?q= after a short pause and returns to page 1.
  React.useEffect(() => {
    if (queryInput === listState.q) return;
    const timer = setTimeout(() => writeState({ ...listState, q: queryInput, page: 1 }, "replace"), 250);
    return () => clearTimeout(timer);
  }, [queryInput, listState, writeState]);

  // Fetch the current page whenever the URL state or the sort changes.
  React.useEffect(() => {
    const state = parseGuideListState(new URLSearchParams(listKey));
    const controller = new AbortController();
    setLoading(true);
    fetch(searchApiUrl(state, sortBy, pageOffset(state.page), GUIDES_PER_PAGE), { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        const list: ArticleItem[] = Array.isArray(data) ? data : [];
        const header = Number(res.headers.get("X-Total-Count"));
        setArticles(list);
        setTotal(Number.isFinite(header) && res.headers.has("X-Total-Count") ? header : list.length);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch guides:", err);
        setArticles([]);
        setTotal(0);
        setLoading(false);
      });
    return () => controller.abort();
  }, [listKey, sortBy]);

  const pages = pageCount(total ?? 0);

  // A page past the end (e.g. an old link) goes to the last page.
  React.useEffect(() => {
    if (loading || total === null || total === 0) return;
    if (listState.page > pages) writeState({ ...listState, page: pages }, "replace");
  }, [loading, total, pages, listState, writeState]);

  // Keyboard: "/" focuses search; j/k move between result rows; Enter opens the focused row (native link).
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (selectedArticle) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key !== "j" && e.key !== "k") return;
      const rows = Array.from(resultsRef.current?.querySelectorAll<HTMLElement>("[data-guide-row]") ?? []);
      if (rows.length === 0) return;
      const current = rows.indexOf(document.activeElement as HTMLElement);
      const next =
        current < 0 ? 0 : e.key === "j" ? Math.min(rows.length - 1, current + 1) : Math.max(0, current - 1);
      e.preventDefault();
      rows[next].focus();
      rows[next].scrollIntoView({ block: "nearest" });
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedArticle]);

  const applyFilters = (next: GuideListState) => writeState(next, "push");
  const goToPage = (page: number) => {
    writeState({ ...listState, page }, "push");
    resultsTopRef.current?.scrollIntoView({ block: "start" });
  };
  const clearAll = () => {
    setQueryInput("");
    writeState(clearAllFilters(), "push");
  };
  const removeChip = (key: GuideFilterKey) => {
    if (key === "q") setQueryInput("");
    writeState(removeFilter(listState, key), "push");
  };

  const chips = activeFilterChips(listState, categoryLabel);
  const filterCount = countActiveFilters(listState);
  const pageHref = (page: number) => {
    const qs = serializeGuideListState({ ...listState, page });
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const firstShown = total ? pageOffset(listState.page) + 1 : 0;
  const lastShown = total ? Math.min(total, pageOffset(listState.page) + articles.length) : 0;

  return (
    <div className="guides-page mx-auto max-w-7xl space-y-6 py-3 text-[var(--text-primary)]">
      {/* ARTICLE READER MODAL (When an article is clicked) */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-[#0f172a] border-2 border-slate-700 rounded-2xl w-full max-w-5xl my-auto p-6 md:p-8 space-y-6 shadow-2xl relative border-t-4 border-t-amber-400">
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <button
                onClick={() => setSelectedArticle(null)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold hover:bg-slate-800 hover:text-amber-400 transition-all"
              >
                <ArrowLeft className="h-4 w-4" /> ← Back to Vault Codex Hub
              </button>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-xs font-mono font-bold text-amber-400 uppercase">
                  {selectedArticle.category || "General"}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-400 uppercase">
                  SOURCE: {selectedArticle.source}
                </span>
              </div>
            </div>

            {/* Article Title Banner */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-amber-400 font-mono tracking-wide leading-tight">
                {cleanTitle(selectedArticle.title)}
              </h1>
              <a
                href={selectedArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono font-bold transition-colors mt-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Original Guide Source on {selectedArticle.source} ↗
              </a>
              {selectedArticle.sourceImages ? (
                <p className="mt-1 text-xs text-slate-400 font-mono">
                  This guide has pictures on the original page. We link to them rather than copy them.
                </p>
              ) : null}
            </div>

            {/* Outdated Archival Advisory Banner */}
            {(() => {
              const outdatedStatus = getArticleOutdatedStatus(selectedArticle);
              if (!outdatedStatus) return null;
              return (
                <div className="rounded-xl border-2 border-amber-500/70 bg-amber-950/60 p-5 space-y-3 text-amber-200 shadow-xl font-mono">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-sm font-black uppercase text-amber-400 tracking-wider">
                      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                      VAULT-TEC ADVISORY: OUTDATED ARCHIVAL RECORD ({outdatedStatus.patchVersion})
                    </div>
                    <span className="text-[0.65rem] px-2.5 py-0.5 rounded-full bg-red-950 border border-amber-500/50 text-amber-300 font-bold uppercase">
                      Historical Knowledge
                    </span>
                  </div>
                  <p className="text-xs text-amber-100/95 leading-relaxed">
                    {outdatedStatus.reason}
                  </p>
                  <div className="pt-1">
                    <Link
                      href={outdatedStatus.replacementHref}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase transition-all shadow-md active:scale-95"
                    >
                      Open Live 2026 Ground Truth: {outdatedStatus.replacementTitle} ➔
                    </Link>
                  </div>
                </div>
              );
            })()}

            {/* Main Article Document Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4 max-h-[680px] overflow-y-auto pr-2">
                {loadingContent ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3 font-mono text-amber-400">
                    <Terminal className="h-8 w-8 animate-pulse text-amber-500" />
                    <span className="text-sm font-bold tracking-wider">RETRIEVING VAULT-TEC TERMINAL ARCHIVE...</span>
                  </div>
                ) : (
                  parseCleanArticleContent(selectedArticle.content || selectedArticle.snippet, pathname)
                )}
              </div>

              {/* Sidebar Specifications */}
              <div className="lg:col-span-4 bg-[#060a10] rounded-xl border border-slate-700 p-5 space-y-5 h-fit shadow-inner">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>TECHNICAL SPECIFICATIONS</span>
                  <Shield className="h-4 w-4 text-amber-400/70" />
                </div>

                {selectedArticle.main_image && !/^(?:https?:)?\/\//i.test(selectedArticle.main_image) && (
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400 transition-all bg-[#03060a] p-1"
                  >
                    <img
                      src={selectedArticle.main_image.startsWith("http") ? toHighResImageUrl(selectedArticle.main_image) : `/static/images/${selectedArticle.main_image.split('/').pop()}`}
                      alt={cleanTitle(selectedArticle.title)}
                      className="w-full h-48 object-contain rounded-md"
                      onError={(e) => {
                        (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                      }}
                    />
                  </a>
                )}

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-800 py-1.5">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-semibold text-amber-400">{selectedArticle.category || "General"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-1.5">
                    <span className="text-slate-400">Source:</span>
                    <span className="font-semibold text-emerald-400">{selectedArticle.source}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    href={`/build?equip=${encodeURIComponent(getEquipmentKeyFromTitle(selectedArticle.title, selectedArticle.content))}`}
                    className="w-full py-2.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    🛠️ Test in B.U.I.L.D. Sandbox
                  </Link>
                  <Link
                    href="/perks"
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    🃏 View in P.E.R.K. Matrix
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH-FIRST HEADER */}
      <header className="space-y-4">
        <div className="space-y-1.5">
          <h1 className="guides-display guides-heading text-[32px] leading-none text-[var(--color-accent)]">Fallout 76 guides</h1>
          <p className="guides-prose max-w-[75ch] text-[15px] leading-relaxed text-[var(--text-muted)]">
            {TOTAL_ARTICLES.toLocaleString()} guides: patch notes, drop odds, Minerva schedules, event checklists and damage math, searchable in one place. Older guides are flagged when a patch has changed them.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div role="search" className="relative min-w-0 flex-1">
            <label htmlFor="guides-search" className="sr-only">
              Search guides
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-accent)]" />
            <input
              ref={searchInputRef}
              id="guides-search"
              type="search"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={`Search ${TOTAL_ARTICLES.toLocaleString()} guides by title, item or quest`}
              aria-keyshortcuts="/"
              autoComplete="off"
              className="guides-search guides-mono w-full rounded-lg border-2 border-[var(--border-strong)] bg-[var(--background-primary)] py-3.5 pl-12 pr-12 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-soft)]"
            />
            <kbd
              aria-hidden="true"
              className="guides-mono pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-[var(--border-strong)] px-1.5 text-[13px] text-[var(--text-soft)] sm:block"
            >
              /
            </kbd>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 lg:justify-end">
            <p aria-live="polite" aria-atomic="true" className="guides-mono text-[15px] text-[var(--text-muted)]">
              {total === null ? null : (
                <>
                  Showing <span className="text-[var(--text-primary)]">{total.toLocaleString()}</span> {total === 1 ? "guide" : "guides"}
                </>
              )}
            </p>
            <label className="guides-mono flex items-center gap-2 text-[13px] text-[var(--text-soft)]">
              <ArrowUpDown aria-hidden="true" className="h-4 w-4" />
              <span>Sort</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  if (listState.page > 1) writeState({ ...listState, page: 1 }, "push");
                }}
                className="cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[13px] text-[var(--text-primary)]"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title-asc">Title A to Z</option>
                <option value="title-desc">Title Z to A</option>
              </select>
            </label>
          </div>
        </div>

        <nav aria-label="Categories" className="hidden lg:block">
          <CategoryList state={listState} onSelect={(id) => applyFilters({ ...listState, category: id, page: 1 })} layout="row" />
        </nav>
      </header>

      <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-8">
        {/* FILTER RAIL (desktop) */}
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-4">
            <FilterGroups state={listState} onChange={applyFilters} idPrefix="rail" includeCategory={false} />
          </div>
        </aside>

        <div className="min-w-0 space-y-4" ref={resultsTopRef}>
          {/* FILTERS DISCLOSURE (phones and tablets) */}
          <details className="guides-disclosure rounded-lg border border-[var(--border)] bg-[var(--surface)] lg:hidden">
            <summary className="guides-mono flex items-center gap-2 px-4 py-3 text-[15px] text-[var(--text-primary)]">
              <SlidersHorizontal aria-hidden="true" className="h-4 w-4 text-[var(--color-accent)]" />
              Filters ({filterCount})
            </summary>
            <div className="border-t border-[var(--border)] px-2 py-4">
              <FilterGroups state={listState} onChange={applyFilters} idPrefix="sheet" includeCategory />
            </div>
          </details>

          {/* ACTIVE FILTER CHIPS */}
          {chips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <ul aria-label="Active filters" className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <li key={chip.key} className="min-w-0 max-w-full">
                    <button
                      type="button"
                      onClick={() => removeChip(chip.key)}
                      aria-label={`Remove ${chip.label}`}
                      className="guides-mono inline-flex max-w-full items-center gap-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-1 text-[13px] text-[var(--text-primary)] hover:border-[var(--color-accent)]"
                    >
                      <span className="truncate">{chip.label}</span>
                      <X aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[var(--text-soft)]" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={clearAll}
                className="guides-mono px-1 text-[13px] text-[var(--color-accent)] underline underline-offset-2"
              >
                Clear all
              </button>
            </div>
          ) : null}

          {loading ? (
            <p className="guides-mono text-[13px] text-[var(--color-accent)]">Loading guides…</p>
          ) : null}

          {/* EMPTY STATE */}
          {!loading && articles.length === 0 ? (
            <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <p className="guides-mono text-[15px] text-[var(--text-primary)]">No guides match these filters.</p>
              <button type="button" onClick={clearAll} className="guides-mono text-[13px] text-[var(--color-accent)] underline underline-offset-2">
                Clear all filters and search
              </button>
            </div>
          ) : null}

          {/* RESULT ROWS */}
          {articles.length > 0 ? (
            <ol
              ref={resultsRef}
              aria-label={`Guides ${firstShown} to ${lastShown}`}
              aria-busy={loading}
              className={`divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] ${loading ? "opacity-60" : ""}`}
            >
              {articles.map((item) => {
                const outdatedInfo = getArticleOutdatedStatus(item);
                const summary = firstSentence(item.snippet || (item.content || "").substring(0, 150));
                return (
                  <li key={String(item.id)}>
                    <a
                      href={`${pathname}?id=${encodeURIComponent(String(item.id))}`}
                      data-guide-row
                      onClick={(e) => {
                        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                        e.preventDefault();
                        setSelectedArticle(item);
                      }}
                      className="guides-row"
                    >
                      <span className="guides-row__title guides-mono block text-[18px] leading-snug text-[var(--text-primary)]">
                        {cleanTitle(item.title)}
                      </span>
                      {summary ? (
                        <span className="guides-prose mt-1 line-clamp-2 text-[15px] leading-normal text-[var(--text-muted)]">
                          {summary}
                        </span>
                      ) : null}
                      <span className="guides-mono mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--text-soft)]">
                        <span>{item.source}</span>
                        <span>{categoryLabel(item.category || "General")}</span>
                        {outdatedInfo ? (
                          <span className="inline-flex items-center gap-1 rounded border border-[var(--color-accent)] px-1.5 text-[var(--color-accent)]">
                            <AlertTriangle aria-hidden="true" className="h-3 w-3" /> Outdated
                          </span>
                        ) : null}
                        {item.archived ? (
                          <span className="rounded border border-[var(--border-strong)] px-1.5 text-[var(--text-muted)]">Archived</span>
                        ) : null}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          ) : null}

          {/* PAGINATION */}
          {total !== null && total > 0 ? (
            <nav aria-label="Pagination" className="guides-mono flex items-center justify-between gap-3 text-[13px]">
              {listState.page > 1 ? (
                <a
                  href={pageHref(listState.page - 1)}
                  rel="prev"
                  onClick={(e) => {
                    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    goToPage(listState.page - 1);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--border-strong)] px-3 py-2 text-[var(--text-primary)] hover:border-[var(--color-accent)]"
                >
                  <ChevronLeft aria-hidden="true" className="h-4 w-4" /> Previous
                </a>
              ) : (
                <span aria-hidden="true" className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-3 py-2 text-[var(--text-soft)] opacity-60">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </span>
              )}
              <span className="text-[var(--text-muted)]">
                Page {Math.min(listState.page, pages).toLocaleString()} of {pages.toLocaleString()}
              </span>
              {listState.page < pages ? (
                <a
                  href={pageHref(listState.page + 1)}
                  rel="next"
                  onClick={(e) => {
                    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    goToPage(listState.page + 1);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--border-strong)] px-3 py-2 text-[var(--text-primary)] hover:border-[var(--color-accent)]"
                >
                  Next <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </a>
              ) : (
                <span aria-hidden="true" className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-3 py-2 text-[var(--text-soft)] opacity-60">
                  Next <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </nav>
          ) : null}

          <p className="guides-mono hidden text-[13px] text-[var(--text-soft)] lg:block">
            Keys: <kbd>/</kbd> search, <kbd>j</kbd> and <kbd>k</kbd> move between guides, <kbd>Enter</kbd> opens one.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TruthWikiPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center font-mono text-xs text-amber-400">Loading Vault Codex...</div>}>
      <TruthWikiContent />
    </React.Suspense>
  );
}
