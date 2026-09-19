"use client";

import * as React from "react";
import { Search, ExternalLink, ArrowUpDown, ArrowLeft, AlertTriangle, X, SlidersHorizontal, ChevronLeft, ChevronRight, ListTree } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createLinkPlanState, linkifyToNodes } from "@/components/linkified-text";
import { openFeedback, outdatedGuideFeedback } from "@/lib/feedback/feedback-prefill";

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
  type GuideSort,
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

/** `X-Suggestions`: comma-separated, URI-encoded category ids; unknown ids are dropped. */
function parseSuggestionsHeader(raw: string | null): string[] {
  if (!raw) return [];
  const ids: string[] = [];
  for (const part of raw.split(",")) {
    try {
      const id = decodeURIComponent(part.trim());
      if (CATEGORY_LABELS.has(id) && id !== "all" && !ids.includes(id)) ids.push(id);
    } catch {
      // malformed entry: skip it
    }
  }
  return ids.slice(0, 3);
}

/** Committed counts; "all" follows the archive toggle so it matches what the list shows. */
function categoryCount(id: string, includeArchive: boolean): number {
  if (id === "all") return includeArchive ? TOTAL_ARTICLES : TOTAL_ARTICLES - ARCHIVED_ARTICLES;
  return COUNTS[id] ?? 0;
}

function searchApiUrl(state: GuideListState, offset: number, limit: number): string {
  const params = new URLSearchParams({
    q: state.q,
    category: state.category,
    sort: state.sort,
    update: state.update,
    archive: state.archive ? "1" : "0",
    offset: String(offset),
    limit: String(limit),
  });
  if (state.source) params.set("source", state.source);
  if (state.hideStubs) params.set("stubs", "hide");
  if (state.hideOutdated) params.set("current", "1");
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
import { SUPERSEDE_INDEX, isPossiblyOutdated, supersedeNotesForId } from "@/lib/wiki/supersede";
import { cleanTitle as cleanArticleTitle } from "@/lib/wiki/clean-text";
import {
  MIN_TOC_ENTRIES,
  adjacentGuides,
  buildGuideToc,
  flattenPatchLabel,
  guideHeadingLevel,
  guideHeadingText,
  isSkippedGuideBlock,
  normalizeGuideBlock,
  selectRelatedGuides,
  splitGuideBlocks,
  type GuideTocEntry,
} from "@/lib/wiki/guide-reader";

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

function parseCleanArticleContent(
  content: string,
  currentPath: string | null = null,
  slugByBlock: ReadonlyMap<number, string> = new Map(),
) {
  if (!content) return null;

  const blocks = splitGuideBlocks(content);
  const seenImages = new Set<string>();
  let activeTitleWord: { type: "Prefix & Suffix" | "Prefix" | "Suffix"; word: string } | null = null;

  return blocks.map((block, idx) => {
    if (!block.trim()) return null;
    if (isSkippedGuideBlock(block.trim())) return null;

    const trimmed = normalizeGuideBlock(block);

    // 1. Markdown Table (scrolls inside its own container, never the page)
    if (trimmed.startsWith("|")) {
      activeTitleWord = null;
      const rows = trimmed.split("\n").filter((r) => r.trim().startsWith("|"));
      if (rows.length > 0) {
        return (
          <div key={idx} role="region" aria-label="Table" tabIndex={0} className="guides-table-wrap my-5">
            <table className="guides-mono w-full border-collapse text-left text-[13px]">
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
                          ? "border-b border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] text-[var(--color-accent)]"
                          : "border-b border-[var(--border)] last:border-b-0"
                      }
                    >
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className={`px-3 py-2 align-top leading-snug ${cell.length > 40 ? "min-w-[16rem]" : "whitespace-nowrap"}`}>
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

    // 4. Headings (h2/h3 carry the table-of-contents ids; h4-h6 stay out of the contents)
    const headingLevel = guideHeadingLevel(trimmed);
    if (headingLevel === 2) {
      return (
        <h2
          key={idx}
          id={slugByBlock.get(idx)}
          className="guides-heading guides-mono guides-anchor mt-10 mb-3 border-b border-[var(--border)] pb-2 text-[24px] leading-tight text-[var(--color-accent)]"
        >
          {guideHeadingText(trimmed)}
        </h2>
      );
    }
    if (headingLevel === 3) {
      return (
        <h3
          key={idx}
          id={slugByBlock.get(idx)}
          className="guides-heading guides-mono guides-anchor mt-8 mb-2 text-[18px] leading-snug text-[var(--color-accent)]"
        >
          {guideHeadingText(trimmed)}
        </h3>
      );
    }
    if (headingLevel === 4) {
      return (
        <h4 key={idx} className="guides-heading guides-mono mt-6 mb-2 text-[15px] leading-snug text-[var(--text-primary)]">
          {guideHeadingText(trimmed)}
        </h4>
      );
    }
    if (headingLevel === 5) {
      return (
        <h5 key={idx} className="guides-heading guides-mono mt-5 mb-1.5 text-[14px] leading-snug text-[var(--text-primary)]">
          {guideHeadingText(trimmed)}
        </h5>
      );
    }
    if (headingLevel === 6) {
      return (
        <h6 key={idx} className="guides-heading guides-mono mt-4 mb-1.5 text-[13px] leading-snug text-[var(--text-muted)]">
          {guideHeadingText(trimmed)}
        </h6>
      );
    }

    // 5. Blockquotes
    if (trimmed.startsWith("> ")) {
      return (
        <blockquote key={idx} className="guides-prose my-4 border-l-2 border-[var(--color-accent)] pl-4 text-[16px] italic leading-[1.65] text-[var(--text-muted)]">
          {renderFormattedInlineText(trimmed.replace(/^>\s+/, ""))}
        </blockquote>
      );
    }

    // 6. Bullet Lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      return (
        <ul key={idx} className="guides-prose my-2 list-disc pl-6 text-[16px] leading-[1.65] text-[var(--text-primary)]">
          <li>{renderFormattedInlineText(trimmed.replace(/^[-*]\s+/, ""))}</li>
        </ul>
      );
    }

    // 7. Standard Paragraph
    return (
      <p key={idx} className="guides-prose my-4 whitespace-pre-line text-[16px] leading-[1.65] text-[var(--text-primary)]">
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
        <label className="guides-mono flex cursor-pointer items-center gap-2 px-2 text-[13px] text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={state.hideOutdated}
            onChange={(e) => set({ hideOutdated: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          <span>Hide possibly outdated</span>
        </label>
      </section>
    </div>
  );
}

const READER_BUTTON =
  "guides-mono inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--text-primary)] hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:text-[var(--text-soft)] disabled:opacity-60";

/** Left-button click without modifiers: handle in place; anything else keeps the native link. */
function isPlainClick(e: React.MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

function formatGuideDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function GuideToc({ entries, onJump }: { entries: GuideTocEntry[]; onJump: (slug: string) => void }) {
  return (
    <ol className="guides-toc space-y-0.5">
      {entries.map((entry) => (
        <li key={entry.slug} className={entry.level === 3 ? "pl-3" : undefined}>
          <a
            href={`#${entry.slug}`}
            onClick={(e) => {
              if (!isPlainClick(e)) return;
              e.preventDefault();
              onJump(entry.slug);
            }}
            className="guides-prose block rounded px-2 py-1 text-[14px] leading-snug text-[var(--text-muted)] hover:bg-[var(--control-hover)] hover:text-[var(--text-primary)]"
          >
            {entry.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

interface GuideReaderProps {
  article: ArticleItem;
  pathname: string;
  loadingContent: boolean;
  titleRef: React.RefObject<HTMLHeadingElement>;
  position: { index: number; total: number };
  prev: ArticleItem | null;
  next: ArticleItem | null;
  related: ArticleItem[];
  guideHref: (id: ArticleItem["id"]) => string;
  onBack: () => void;
  onOpen: (item: ArticleItem) => void;
}

function GuideReader({
  article,
  pathname,
  loadingContent,
  titleRef,
  position,
  prev,
  next,
  related,
  guideHref,
  onBack,
  onOpen,
}: GuideReaderProps) {
  const body = article.content || article.snippet;
  const toc = React.useMemo(() => buildGuideToc(body), [body]);
  const showToc = !loadingContent && toc.entries.length >= MIN_TOC_ENTRIES;
  const outdatedStatus = getArticleOutdatedStatus(article);
  const supersedeNotes = supersedeNotesForId(article.id);
  const moreSupersedeNotes = (SUPERSEDE_INDEX[String(article.id)]?.length ?? 0) - supersedeNotes.length;
  const date = formatGuideDate(article.updatedAt);
  const category = categoryLabel(article.category || "General");

  const jumpTo = React.useCallback((slug: string) => {
    const target = document.getElementById(slug);
    if (!target) return;
    target.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });
    window.history.replaceState(window.history.state, "", `#${slug}`);
  }, []);

  const openFromLink = (item: ArticleItem) => (e: React.MouseEvent) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    onOpen(item);
  };

  return (
    <article aria-labelledby="guide-reader-title" className="guides-reader">
      <nav aria-label="Guide navigation" className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onBack} aria-keyshortcuts="Escape" className={READER_BUTTON}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to results
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {position.index >= 0 ? (
            <span className="guides-mono hidden text-[13px] text-[var(--text-soft)] sm:inline">
              {position.index + 1} of {position.total} on this page
            </span>
          ) : null}
          <button
            type="button"
            disabled={!prev}
            onClick={() => prev && onOpen(prev)}
            aria-keyshortcuts="["
            title={prev ? `Previous: ${cleanTitle(prev.title)}` : undefined}
            className={READER_BUTTON}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" /> Previous
          </button>
          <button
            type="button"
            disabled={!next}
            onClick={() => next && onOpen(next)}
            aria-keyshortcuts="]"
            title={next ? `Next: ${cleanTitle(next.title)}` : undefined}
            className={READER_BUTTON}
          >
            Next <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <header className="mt-6 max-w-[72ch] space-y-2">
        <p className="guides-mono flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[var(--text-soft)]">
          <span>{category}</span>
          <span>{article.source}</span>
          {date ? <span>Updated {date}</span> : null}
        </p>
        <h1
          id="guide-reader-title"
          ref={titleRef}
          tabIndex={-1}
          className="guides-display guides-heading break-words text-[40px] leading-[1.05] text-[var(--color-accent)]"
        >
          {cleanTitle(article.title)}
        </h1>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="guides-mono inline-flex items-start gap-1.5 text-[13px] text-[var(--text-primary)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--color-accent)]"
        >
          <ExternalLink aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
          View Original Guide Source on {article.source} ↗
        </a>
        {article.sourceImages ? (
          <p className="guides-prose text-[14px] leading-normal text-[var(--text-soft)]">
            This guide has pictures on the original page. We link to them rather than copy them.
          </p>
        ) : null}
      </header>

      {outdatedStatus ? (
        <div role="note" className="mt-6 max-w-[72ch] space-y-2 rounded-lg border border-[var(--color-accent)] bg-[var(--surface)] p-4">
          <p className="guides-mono flex items-start gap-2 text-[15px] text-[var(--color-accent)]">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            This guide is out of date ({flattenPatchLabel(outdatedStatus.patchVersion)})
          </p>
          <p className="guides-prose text-[15px] leading-[1.6] text-[var(--text-muted)]">{outdatedStatus.reason}</p>
          <Link
            href={outdatedStatus.replacementHref}
            className="guides-mono inline-block text-[13px] text-[var(--color-accent)] underline underline-offset-4"
          >
            Current version: {outdatedStatus.replacementTitle}
          </Link>
        </div>
      ) : null}

      {supersedeNotes.length > 0 ? (
        <section
          role="note"
          aria-labelledby="guide-supersede-title"
          data-supersede-notes
          className={`${outdatedStatus ? "mt-4" : "mt-6"} max-w-[72ch] space-y-3 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] p-4`}
        >
          <h2 id="guide-supersede-title" className="guides-heading guides-mono text-[15px] text-[var(--text-primary)]">
            May be out of date
          </h2>
          <p className="guides-prose text-[15px] leading-[1.6] text-[var(--text-muted)]">
            Parts of this guide describe how the game worked before a later patch. The rest of it may still be accurate.
          </p>
          <ul className="space-y-3">
            {supersedeNotes.map((rule) => (
              <li key={rule.id} data-supersede-rule={rule.id} className="space-y-1">
                <p className="guides-prose text-[15px] leading-[1.6] text-[var(--text-primary)]">
                  <span className="guides-mono text-[var(--text-soft)]">
                    Patch {rule.patch} ({rule.patchName}):
                  </span>{" "}
                  {rule.changed}
                </p>
                <Link
                  href={rule.currentHref}
                  className="guides-mono inline-block text-[13px] text-[var(--color-accent)] underline underline-offset-4"
                >
                  See the current value
                </Link>
              </li>
            ))}
          </ul>
          {moreSupersedeNotes > 0 ? (
            <p className="guides-prose text-[14px] text-[var(--text-soft)]">
              {moreSupersedeNotes === 1 ? "One more change also touches this guide." : `${moreSupersedeNotes} more changes also touch this guide.`}
            </p>
          ) : null}
        </section>
      ) : null}

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,72ch)_15rem] lg:gap-x-12">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          {showToc ? (
            <details className="guides-disclosure mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] lg:hidden">
              <summary className="guides-mono flex items-center gap-2 px-4 py-3 text-[15px] text-[var(--text-primary)]">
                <ListTree aria-hidden="true" className="h-4 w-4 text-[var(--color-accent)]" />
                On this page ({toc.entries.length})
              </summary>
              <nav aria-label="On this page" className="border-t border-[var(--border)] px-2 py-3">
                <GuideToc entries={toc.entries} onJump={jumpTo} />
              </nav>
            </details>
          ) : null}

          <div className="guides-reader-body min-w-0 max-w-[72ch]">
            {loadingContent ? (
              <p role="status" className="guides-mono py-12 text-[13px] text-[var(--color-accent)]">
                Loading guide…
              </p>
            ) : (
              parseCleanArticleContent(body, pathname, toc.slugByBlock)
            )}
          </div>

          {prev || next ? (
            <nav aria-label="Previous and next guide" className="mt-12 grid max-w-[72ch] gap-3 sm:grid-cols-2">
              {prev ? (
                <a href={guideHref(prev.id)} onClick={openFromLink(prev)} className="guides-adjacent">
                  <span className="guides-mono block text-[13px] text-[var(--text-soft)]">Previous</span>
                  <span className="guides-mono mt-0.5 block text-[15px] leading-snug">{cleanTitle(prev.title)}</span>
                </a>
              ) : (
                <span aria-hidden="true" className="hidden sm:block" />
              )}
              {next ? (
                <a href={guideHref(next.id)} onClick={openFromLink(next)} className="guides-adjacent sm:text-right">
                  <span className="guides-mono block text-[13px] text-[var(--text-soft)]">Next</span>
                  <span className="guides-mono mt-0.5 block text-[15px] leading-snug">{cleanTitle(next.title)}</span>
                </a>
              ) : null}
            </nav>
          ) : null}

          <p className="guides-mono mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[var(--text-soft)]">
            <span>Something in this guide wrong or out of date?</span>
            <button
              type="button"
              data-report-outdated
              onClick={() => openFeedback(outdatedGuideFeedback({ id: article.id, title: cleanTitle(article.title), source: article.source }))}
              className="text-[var(--color-accent)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--color-accent)]"
            >
              Report outdated
            </button>
          </p>

          <p className="guides-mono mt-6 hidden text-[13px] text-[var(--text-soft)] lg:block">
            Keys: <kbd>[</kbd> and <kbd>]</kbd> previous and next guide, <kbd>Esc</kbd> back to results.
          </p>
        </div>

        <aside className="mt-10 space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
          <section aria-labelledby="guide-about" className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 id="guide-about" className="guides-heading guides-mono text-[15px] text-[var(--text-primary)]">
              About this guide
            </h2>

            {article.main_image && !/^(?:https?:)?\/\//i.test(article.main_image) && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${cleanTitle(article.title)} on ${article.source} (opens in a new tab)`}
                className="relative block overflow-hidden rounded-md border border-[var(--border)] bg-[var(--background-primary)] p-1"
              >
                <ExternalLink aria-hidden="true" className="absolute right-2 top-2 h-3.5 w-3.5 text-[var(--color-accent)]" />
                <img
                  src={article.main_image.startsWith("http") ? toHighResImageUrl(article.main_image) : `/static/images/${article.main_image.split("/").pop()}`}
                  alt={cleanTitle(article.title)}
                  className="h-48 w-full rounded object-contain"
                  onError={(e) => {
                    (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                  }}
                />
              </a>
            )}

            <dl className="guides-mono space-y-1.5 text-[13px]">
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-1.5">
                <dt className="text-[var(--text-soft)]">Category</dt>
                <dd className="text-right text-[var(--text-primary)]">{article.category || "General"}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-1.5">
                <dt className="text-[var(--text-soft)]">Source</dt>
                <dd className="text-right text-[var(--text-primary)]">{article.source}</dd>
              </div>
              {date ? (
                <div className="flex justify-between gap-3 border-b border-[var(--border)] pb-1.5">
                  <dt className="text-[var(--text-soft)]">Updated</dt>
                  <dd className="text-right text-[var(--text-primary)]">{date}</dd>
                </div>
              ) : null}
            </dl>

            <div className="flex flex-col gap-2">
              <Link
                href={`/build?equip=${encodeURIComponent(getEquipmentKeyFromTitle(article.title, article.content))}`}
                className="guides-mono flex items-center justify-center gap-1.5 rounded-md border border-[var(--color-accent)] px-3 py-2 text-center text-[13px] text-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
              >
                🛠️ Test in B.U.I.L.D. Sandbox
              </Link>
              <Link
                href="/perks"
                className="guides-mono flex items-center justify-center gap-1.5 rounded-md border border-[var(--border-strong)] px-3 py-2 text-center text-[13px] text-[var(--text-primary)] hover:border-[var(--color-accent)]"
              >
                🃏 View in P.E.R.K. Matrix
              </Link>
            </div>
          </section>

          {showToc ? (
            <nav aria-label="On this page" className="guides-toc-rail hidden lg:block">
              <h2 className="guides-heading guides-mono mb-2 px-2 text-[13px] text-[var(--text-soft)]">On this page</h2>
              <GuideToc entries={toc.entries} onJump={jumpTo} />
            </nav>
          ) : null}
        </aside>

        {related.length > 0 ? (
          <section aria-labelledby="guide-related" className="mt-12 min-w-0 max-w-[72ch] lg:col-start-1 lg:row-start-2">
            <h2 id="guide-related" className="guides-heading guides-mono mb-3 text-[18px] text-[var(--text-primary)]">
              Related guides
            </h2>
            <ol className="divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              {related.map((item) => {
                const summary = firstSentence(item.snippet || (item.content || "").substring(0, 150));
                return (
                  <li key={String(item.id)}>
                    <a href={guideHref(item.id)} data-related-guide onClick={openFromLink(item)} className="guides-row">
                      <span className="guides-row__title guides-mono block text-[18px] leading-snug text-[var(--text-primary)]">
                        {cleanTitle(item.title)}
                      </span>
                      {summary ? (
                        <span className="guides-prose mt-1 line-clamp-2 text-[15px] leading-normal text-[var(--text-muted)]">{summary}</span>
                      ) : null}
                      <span className="guides-mono mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--text-soft)]">
                        <span>{item.source}</span>
                        <span>{categoryLabel(item.category || "General")}</span>
                        {getArticleOutdatedStatus(item) ? (
                          <span className="inline-flex items-center gap-1 rounded border border-[var(--color-accent)] px-1.5 text-[var(--color-accent)]">
                            <AlertTriangle aria-hidden="true" className="h-3 w-3" /> Outdated
                          </span>
                        ) : null}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}
      </div>
    </article>
  );
}

function TruthWikiContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname() || "/wiki";
  const listState = React.useMemo(() => parseGuideListState(searchParams), [searchParams]);
  const listKey = serializeGuideListState(listState);

  const [queryInput, setQueryInput] = React.useState(listState.q);
  const [articles, setArticles] = React.useState<ArticleItem[]>([]);
  const [total, setTotal] = React.useState<number | null>(null);
  /** Category ids from the API's X-Suggestions header when a query matches nothing. */
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
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

  // Reader: focus + scroll hand-off between the list and the open guide.
  const readerTitleRef = React.useRef<HTMLHeadingElement>(null);
  const selectedRef = React.useRef<ArticleItem | null>(null);
  React.useEffect(() => {
    selectedRef.current = selectedArticle;
  }, [selectedArticle]);
  /** Set when a guide opens from the list: where to scroll back to, which row to refocus, whether we pushed a history entry. */
  const returnRef = React.useRef<{ scrollY: number; rowId: string | null; pushed: boolean } | null>(null);
  /** Pending list restore after the reader closes (consumed by the effect below). */
  const restoreRef = React.useRef<{ scrollY: number; rowIds: string[] } | null>(null);
  /** `#slug` from a deep link, scrolled to once that guide's body has loaded. */
  const pendingHashRef = React.useRef<string | null>(null);
  /** Move focus to the reader's title on the next open (not on the first page load of a deep link). */
  const focusTitleRef = React.useRef(false);
  /** Same-category guides for "Related guides", one fetch per category. */
  const [relatedPools, setRelatedPools] = React.useState<Record<string, ArticleItem[]>>({});

  React.useEffect(() => {
    if (!selectedArticle) return;
    if (selectedArticle.content && selectedArticle.content.trim().length > 0) return;

    let active = true;
    setLoadingContent(true);
    fetch(`/data/wiki/${encodeURIComponent(selectedArticle.id)}.json`)
      .then((res) => res.json() as Promise<{ content?: string }>)
      .then((data) => {
        if (active && data?.content) {
          const loadedId = String(selectedArticle.id);
          setSelectedArticle((prev) => (prev && String(prev.id) === loadedId ? { ...prev, content: data.content! } : prev));
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

  /** Write a query string this page owns to the URL (drops any #hash). */
  const writeUrl = React.useCallback(
    (qs: string, mode: "push" | "replace") => {
      if (qs === window.location.search.replace(/^\?/, "") && !window.location.hash) return;
      selfWrittenRef.current = qs;
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (mode === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    },
    [pathname],
  );

  /** Write list state to the URL. Filters and paging push a history entry; typing replaces it. */
  const writeState = React.useCallback(
    (next: GuideListState, mode: "push" | "replace" = "push") => writeUrl(serializeGuideListState(next), mode),
    [writeUrl],
  );

  /** The list's own query string plus `id=` for the open guide. */
  const readerQuery = React.useCallback(
    (id: ArticleItem["id"]) => {
      const params = new URLSearchParams(serializeGuideListState(listState));
      params.set("id", String(id));
      return params.toString();
    },
    [listState],
  );
  const guideHref = React.useCallback((id: ArticleItem["id"]) => `${pathname}?${readerQuery(id)}`, [pathname, readerQuery]);

  /** Open a guide in the reader. From the list this pushes a history entry; inside the reader it replaces. */
  const openGuide = React.useCallback(
    (item: ArticleItem) => {
      const fromList = !selectedRef.current;
      if (fromList) {
        returnRef.current = { scrollY: window.scrollY, rowId: String(item.id), pushed: true };
      }
      pendingHashRef.current = null;
      focusTitleRef.current = true;
      selectedRef.current = item;
      setSelectedArticle(item);
      writeUrl(readerQuery(item.id), fromList ? "push" : "replace");
    },
    [readerQuery, writeUrl],
  );

  /** Close the reader state and queue the list's scroll + focus restore. */
  const dismissReader = React.useCallback(() => {
    const current = selectedRef.current;
    const ret = returnRef.current;
    returnRef.current = null;
    pendingHashRef.current = null;
    restoreRef.current = {
      scrollY: ret?.scrollY ?? 0,
      rowIds: [current ? String(current.id) : "", ret?.rowId ?? ""].filter(Boolean),
    };
    selectedRef.current = null;
    setSelectedArticle(null);
  }, []);

  /** "Back to results": the list URL (query, filters, page) exactly as it was. */
  const closeReader = React.useCallback(() => {
    const pushed = returnRef.current?.pushed ?? false;
    dismissReader();
    if (pushed) window.history.back();
    else writeState(listState, "replace");
  }, [dismissReader, listState, writeState]);

  // Deep links that open the reader: ?id= (alias ?article=) opens that guide; ?q= (alias ?query=)
  // opens the best title match, as before. Runs on load and on navigation (a /wiki?q= link, back or
  // forward) when the value changed; never for URL updates this page makes while you type or page.
  const openDeepLink = React.useCallback(async (id: string, state: GuideListState) => {
    try {
      if (id) {
        const res = await fetch(`/api/wiki/search?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (Array.isArray(data) && data[0]) {
          selectedRef.current = data[0] as ArticleItem;
          setSelectedArticle(data[0] as ArticleItem);
          return;
        }
      }
      const q = state.q;
      if (q.trim().length > 1) {
        const res = await fetch(searchApiUrl(state, 0, 100));
        const data = await res.json();
        const list: ArticleItem[] = Array.isArray(data) ? data : [];
        const cleanQ = q.toLowerCase().trim();
        const bestMatch =
          list.find((a) => a.title.toLowerCase() === cleanQ) ||
          list.find((a) => a.title.toLowerCase().startsWith(cleanQ)) ||
          list.find((a) => a.title.toLowerCase().includes(cleanQ)) ||
          list[0];
        if (bestMatch) {
          selectedRef.current = bestMatch;
          setSelectedArticle(bestMatch);
          // Keep the URL pointing at the open guide so reload, share and back work like ?id=.
          const params = new URLSearchParams(serializeGuideListState(state));
          params.set("id", String(bestMatch.id));
          const qs = params.toString();
          selfWrittenRef.current = qs;
          window.history.replaceState(null, "", `${pathname}?${qs}`);
        }
      }
    } catch (err) {
      console.error("Failed to open linked guide:", err);
    }
  }, [pathname]);

  React.useEffect(() => {
    const qs = searchParams?.toString() ?? "";
    const external = selfWrittenRef.current === null || qs !== selfWrittenRef.current;
    selfWrittenRef.current = null;
    const id = searchParams?.get("id") || searchParams?.get("article") || "";
    const prev = prevDeepLinkRef.current;
    prevDeepLinkRef.current = { q: listState.q, id };
    if (!external) return;
    setQueryInput(listState.q);
    // Browser back/forward or a link to the list without ?id= closes the reader.
    if (!id && selectedRef.current) dismissReader();
    const idChanged = Boolean(id) && (!prev || prev.id !== id);
    const qChanged = listState.q.trim().length > 1 && (!prev || prev.q !== listState.q);
    if (idChanged || qChanged) {
      pendingHashRef.current = idChanged ? decodeURIComponent(window.location.hash.replace(/^#/, "")) || null : null;
      if (idChanged) returnRef.current = null;
      focusTitleRef.current = prev !== null;
      void openDeepLink(idChanged ? id : "", listState);
    }
  }, [searchParams, listState, openDeepLink, dismissReader]);

  // Typing updates ?q= after a short pause and returns to page 1.
  React.useEffect(() => {
    if (queryInput === listState.q) return;
    const timer = setTimeout(() => writeState({ ...listState, q: queryInput, page: 1 }, "replace"), 250);
    return () => clearTimeout(timer);
  }, [queryInput, listState, writeState]);

  // Fetch the current page whenever the URL state (filters, sort, page) changes.
  React.useEffect(() => {
    const state = parseGuideListState(new URLSearchParams(listKey));
    const controller = new AbortController();
    setLoading(true);
    fetch(searchApiUrl(state, pageOffset(state.page), GUIDES_PER_PAGE), { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        const list: ArticleItem[] = Array.isArray(data) ? data : [];
        const header = Number(res.headers.get("X-Total-Count"));
        setArticles(list);
        setTotal(Number.isFinite(header) && res.headers.has("X-Total-Count") ? header : list.length);
        setSuggestions(parseSuggestionsHeader(res.headers.get("X-Suggestions")));
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch guides:", err);
        setArticles([]);
        setTotal(0);
        setSuggestions([]);
        setLoading(false);
      });
    return () => controller.abort();
  }, [listKey]);

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

  const selectedId = selectedArticle ? String(selectedArticle.id) : null;
  const selectedCategory = selectedArticle?.category || "";
  const selectedHasContent = Boolean(selectedArticle?.content && selectedArticle.content.trim());

  // A guide opened: start at its top (unless a #section was asked for) and move focus to its title.
  React.useEffect(() => {
    if (!selectedId) return;
    if (!pendingHashRef.current) window.scrollTo(0, 0);
    if (focusTitleRef.current) readerTitleRef.current?.focus({ preventScroll: true });
    focusTitleRef.current = false;
  }, [selectedId]);

  // ?id=<guide>#<section>: scroll to the section once the body (and its heading ids) has rendered.
  React.useEffect(() => {
    const slug = pendingHashRef.current;
    if (!selectedId || !slug || loadingContent || !selectedHasContent) return;
    pendingHashRef.current = null;
    const target = document.getElementById(slug);
    if (target) {
      target.scrollIntoView({ block: "start" });
      target.focus({ preventScroll: true });
    }
  }, [selectedId, loadingContent, selectedHasContent]);

  // The reader closed: back to the list's scroll position, focus on the guide's row (or the one it was opened from).
  React.useEffect(() => {
    if (selectedArticle) return;
    const restore = restoreRef.current;
    if (!restore) return;
    restoreRef.current = null;
    window.scrollTo(0, restore.scrollY);
    const rows = Array.from(resultsRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-guide-row]") ?? []);
    for (const id of restore.rowIds) {
      const href = `${pathname}?id=${encodeURIComponent(id)}`;
      const row = rows.find((r) => r.getAttribute("href") === href);
      if (row) {
        row.focus({ preventScroll: true });
        row.scrollIntoView({ block: "nearest" });
        return;
      }
    }
  }, [selectedArticle, pathname]);

  // Related guides: one search call per category (same category, stubs hidden, archive excluded).
  React.useEffect(() => {
    if (!selectedId || !selectedCategory || relatedPools[selectedCategory]) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ category: selectedCategory, sort: "newest", stubs: "hide", limit: "60" });
    fetch(`/api/wiki/search?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const list: ArticleItem[] = Array.isArray(data) ? data : [];
        setRelatedPools((pools) => ({ ...pools, [selectedCategory]: list }));
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.warn("Failed to load related guides:", err);
        setRelatedPools((pools) => ({ ...pools, [selectedCategory]: [] }));
      });
    return () => controller.abort();
  }, [selectedId, selectedCategory, relatedPools]);

  const adjacent = React.useMemo(() => adjacentGuides(articles, selectedId), [articles, selectedId]);
  const relatedGuides = React.useMemo(() => {
    if (!selectedArticle) return [];
    const pool = relatedPools[selectedArticle.category || ""] ?? [];
    return selectRelatedGuides(selectedArticle, [...pool, ...articles]);
    // Content loading must not recompute the selection; it only uses title, snippet and category.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, relatedPools, articles]);

  // Reader keys: "[" previous, "]" next, Escape back to results (never while typing).
  React.useEffect(() => {
    if (!selectedId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeReader();
      } else if (e.key === "[" && adjacent.prev) {
        e.preventDefault();
        openGuide(adjacent.prev);
      } else if (e.key === "]" && adjacent.next) {
        e.preventDefault();
        openGuide(adjacent.next);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedId, adjacent, closeReader, openGuide]);

  const applyFilters = (next: GuideListState) => writeState(next, "push");
  const goToPage = (page: number) => {
    writeState({ ...listState, page }, "push");
    resultsTopRef.current?.scrollIntoView({ block: "start" });
  };
  const clearAll = () => {
    setQueryInput("");
    writeState(clearAllFilters(listState.sort), "push");
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
  /** A suggested category starts a fresh browse of that category (the query found nothing). */
  const suggestionState = (id: string): GuideListState => ({ ...clearAllFilters(listState.sort), archive: listState.archive, category: id });
  const suggestionHref = (id: string) => `${pathname}?${serializeGuideListState(suggestionState(id))}`;
  const firstShown = total ? pageOffset(listState.page) + 1 : 0;
  const lastShown = total ? Math.min(total, pageOffset(listState.page) + articles.length) : 0;

  return (
    <div className="guides-page mx-auto max-w-7xl space-y-6 py-3 text-[var(--text-primary)]">
      {/* READING VIEW (replaces the list in place; the list stays mounted so its scroll and focus come back) */}
      {selectedArticle ? (
        <GuideReader
          article={selectedArticle}
          pathname={pathname}
          loadingContent={loadingContent}
          titleRef={readerTitleRef}
          position={{ index: adjacent.index, total: articles.length }}
          prev={adjacent.prev}
          next={adjacent.next}
          related={relatedGuides}
          guideHref={guideHref}
          onBack={closeReader}
          onOpen={openGuide}
        />
      ) : null}

      <div hidden={Boolean(selectedArticle)} className="space-y-6">
        {/* SEARCH-FIRST HEADER */}
        <header className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h1 className="guides-display guides-heading text-[32px] leading-none text-[var(--color-accent)]">Fallout 76 guides</h1>
              <Link
                href="/wiki/glossary"
                className="guides-mono text-[13px] text-[var(--text-primary)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--color-accent)]"
              >
                Glossary
              </Link>
            </div>
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
                  id="guides-sort"
                  value={listState.sort}
                  onChange={(e) => writeState({ ...listState, sort: e.target.value as GuideSort, page: 1 }, "push")}
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
                {suggestions.length > 0 ? (
                  <p data-guide-suggestions className="guides-mono text-[15px] text-[var(--text-primary)]">
                    No guides match. Try{" "}
                    {suggestions.map((id, i) => (
                      <React.Fragment key={id}>
                        {i > 0 ? ", " : null}
                        <a
                          href={suggestionHref(id)}
                          onClick={(e) => {
                            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                            e.preventDefault();
                            setQueryInput("");
                            applyFilters(suggestionState(id));
                          }}
                          className="text-[var(--color-accent)] underline underline-offset-2"
                        >
                          {categoryLabel(id)}
                        </a>
                      </React.Fragment>
                    ))}{" "}
                    or clear filters.
                  </p>
                ) : (
                  <p className="guides-mono text-[15px] text-[var(--text-primary)]">No guides match these filters.</p>
                )}
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
                          openGuide(item);
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
                          {isPossiblyOutdated(item.id) ? (
                            <span data-supersede-tag className="rounded border border-[var(--border-strong)] px-1.5 text-[var(--text-muted)]">
                              May be out of date
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
