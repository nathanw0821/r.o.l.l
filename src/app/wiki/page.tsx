"use client";

import * as React from "react";
import { Search, BookOpen, ExternalLink, Shield, Zap, Sparkles, LayoutGrid, List, ChevronRight, ArrowUpDown, Calendar, Filter, Terminal, Bookmark, FileText, ArrowLeft, Layers, Compass, Star } from "lucide-react";
import Link from "next/link";

interface ArticleItem {
  id: number;
  source: string;
  title: string;
  url: string;
  content: string;
  main_image: string | null;
  category: string;
  snippet: string;
  updatedAt?: string;
}

const CATEGORY_CARDS = [
  { id: "all", label: "All Vault Records", count: "3,399 Entries", icon: "🌐", desc: "Complete Fallout 76 Vault-Tec database.", color: "from-amber-500/20 to-amber-600/5 border-amber-500/40" },
  { id: "Weapons & Mods", label: "Weapons & Legendary Mods", count: "1,240 Guides", icon: "⚔️", desc: "Drop odds, crafting costs & mod matrices.", color: "from-red-500/20 to-red-600/5 border-red-500/40" },
  { id: "Armor & Power Armor", label: "Armor & Power Armor", count: "680 Guides", icon: "🛡️", desc: "Resist values, set bonuses & PA schematics.", color: "from-blue-500/20 to-blue-600/5 border-blue-500/40" },
  { id: "Perks & Mutations", label: "Perks & Mutations", count: "310 Guides", icon: "🃏", desc: "S.P.E.C.I.A.L. card ranks & serum effects.", color: "from-purple-500/20 to-purple-600/5 border-purple-500/40" },
  { id: "Vendors & Minerva", label: "Vendors & Minerva Sales", count: "190 Guides", icon: "🛒", desc: "Minerva inventory schedules & Gold Bullion.", color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/40" },
  { id: "Events & Expeditions", label: "Events & Expeditions", count: "420 Guides", icon: "🛸", desc: "Public event drop rates, The Pitt & Atlantic City Expeditions.", color: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/40" },
  { id: "Builds & Mechanics", label: "Build Mechanics & Damage", count: "350 Guides", icon: "🎯", desc: "Crit formulas, sneak multipliers & AP regen.", color: "from-amber-400/20 to-yellow-600/5 border-amber-400/40" },
  { id: "Crafting & Resources", label: "Crafting & Materials", count: "209 Guides", icon: "🛠️", desc: "Flux locations, junk farming & camp plans.", color: "from-teal-500/20 to-teal-600/5 border-teal-500/40" },
];

const UPDATE_PATCHES = [
  { id: "all", label: "🌐 All Major Updates" },
  { id: "the-pitt", label: "🧱 The Pitt (Expedition 1)" },
  { id: "atlantic-city", label: "🎲 Atlantic City (Expedition 2)" },
  { id: "skyline-valley", label: "⛰️ Skyline Valley" },
  { id: "milepost-zero", label: "⚡ Milepost Zero" },
  { id: "backwoods", label: "🌲 Backwoods 2026" },
  { id: "burning-springs", label: "🔥 Burning Springs" },
  { id: "nuka-world", label: "☢️ Nuka-World on Tour" },
  { id: "invaders", label: "🛸 Invaders from Beyond" },
];

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

import { sanitizeTitle } from "@/lib/utils/clean-formatting";

function cleanTitle(title: string): string {
  return sanitizeTitle(title);
}

function renderFormattedInlineText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let keyIdx = 0;

  const mdPattern = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)/g;
  let match;
  let lastIndex = 0;

  while ((match = mdPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
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
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function parseCleanArticleContent(content: string) {
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
      let rawImgUrl = imgMatch[2];
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
        {renderFormattedInlineText(trimmed)}
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

export default function TruthWikiPage() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest" | "title-asc" | "title-desc">("newest");
  const [updateFilter, setUpdateFilter] = React.useState("all");
  const [articles, setArticles] = React.useState<ArticleItem[]>([]);
  const [selectedArticle, setSelectedArticle] = React.useState<ArticleItem | null>(null);
  const [loading, setLoading] = React.useState(false);

  const searchArticles = React.useCallback(async (q: string, cat: string, sort: string, upd: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wiki/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}&sort=${encodeURIComponent(sort)}&update=${encodeURIComponent(upd)}&limit=100`);
      const data = await res.json();
      let list: ArticleItem[] = Array.isArray(data) ? data : [];

      if (upd && upd !== "all") {
        const targetKw = upd.toLowerCase().replace(/-/g, " ");
        const matchTerm = targetKw.includes("burning")
          ? "burning"
          : targetKw.includes("backwood")
          ? "backwood"
          : targetKw.includes("milepost")
          ? "milepost"
          : targetKw.includes("atlantic")
          ? "atlantic"
          : targetKw.includes("skyline")
          ? "skyline"
          : targetKw;

        list = list.filter((item) => {
          const t = item.title.toLowerCase();
          const c = item.content.toLowerCase();
          const catName = (item.category || "").toLowerCase();
          return t.includes(matchTerm) || c.includes(matchTerm) || catName.includes(matchTerm);
        });
      }

      if (sort === "oldest") {
        list = [...list].sort((a, b) => a.id - b.id);
      } else if (sort === "title-asc") {
        list = [...list].sort((a, b) => cleanTitle(a.title).localeCompare(cleanTitle(b.title)));
      } else if (sort === "title-desc") {
        list = [...list].sort((a, b) => cleanTitle(b.title).localeCompare(cleanTitle(a.title)));
      } else if (sort === "newest") {
        list = [...list].sort((a, b) => b.id - a.id);
      }

      setArticles(list);
    } catch (err) {
      console.error("Failed to fetch category articles:", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchArticles(query, category, sortBy, updateFilter);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, category, sortBy, updateFilter, searchArticles]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-3 py-3 text-slate-100 font-sans">
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
            </div>

            {/* Main Article Document Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4 max-h-[680px] overflow-y-auto pr-2">
                {parseCleanArticleContent(selectedArticle.content)}
              </div>

              {/* Sidebar Specifications */}
              <div className="lg:col-span-4 bg-[#060a10] rounded-xl border border-slate-700 p-5 space-y-5 h-fit shadow-inner">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>TECHNICAL SPECIFICATIONS</span>
                  <Shield className="h-4 w-4 text-amber-400/70" />
                </div>

                {selectedArticle.main_image && (
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

      {/* HERO CODEX BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#111e38] to-[#0f172a] p-8 border-2 border-slate-700 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              <Terminal className="h-4 w-4 text-amber-400" />
              <span>VAULT-TEC KNOWLEDGE PORTAL</span> • <span>3,399 INDEXED GUIDES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-400 uppercase">
              FALLOUT 76 TRUTH BIBLE CODEX
            </h1>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              Comprehensive Vault database covering legendary drop odds, Minerva sales schedules, title rewards, public event checklists, and damage calculations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#060a10] px-4 py-2.5 rounded-xl border border-slate-700 font-mono text-xs text-amber-400 shadow-inner">
              <ArrowUpDown className="h-4 w-4 text-amber-400" />
              <span className="text-slate-400 text-[11px]">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold focus:outline-none cursor-pointer text-amber-400"
              >
                <option value="newest" className="bg-[#0b121e] text-slate-200">🕒 Newest Record</option>
                <option value="oldest" className="bg-[#0b121e] text-slate-200">📜 Oldest Record</option>
                <option value="title-asc" className="bg-[#0b121e] text-slate-200">🔤 Title (A-Z)</option>
                <option value="title-desc" className="bg-[#0b121e] text-slate-200">🔲 Title (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* HERO SEARCH INPUT */}
        <div className="relative">
          <Search className="absolute left-5 top-4 h-5 w-5 text-amber-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 3,399 Vault guides by title, item name, or quest objective..."
            className="w-full pl-14 pr-4 py-4 bg-[#060a10] border-2 border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 font-mono text-sm md:text-base focus:outline-none focus:border-amber-400 shadow-inner transition-colors"
          />
        </div>
      </div>

      {/* VISUAL KNOWLEDGE CATEGORY CARDS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Compass className="h-4 w-4" /> BROWSE BY KNOWLEDGE CATEGORY
          </span>
          <span>Click any category card to filter</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_CARDS.map((card) => {
            const isSelected = category === card.id;
            return (
              <button
                key={card.id}
                onClick={() => {
                  setCategory(card.id);
                  setQuery("");
                }}
                className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 group ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-400 shadow-xl scale-[1.02]"
                    : "bg-[#0f172a] border-slate-700 hover:border-amber-500/50 hover:bg-[#131e36]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{card.icon}</span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${isSelected ? "bg-amber-500 text-slate-950 border-amber-400" : "bg-slate-900 text-slate-400 border-slate-700"}`}>
                      {card.count}
                    </span>
                  </div>
                  <h3 className={`font-bold font-mono text-sm leading-snug transition-colors ${isSelected ? "text-amber-300" : "text-slate-100 group-hover:text-amber-300"}`}>
                    {card.label}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-400 group-hover:text-amber-300 pt-2 border-t border-slate-800">
                  <span>Explore Guides</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* UPDATE PATCH FILTER BAR */}
      <div className="flex flex-wrap items-center gap-2 p-4 rounded-xl bg-[#0f172a] border border-slate-700">
        <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mr-2 flex items-center gap-1.5">
          <Filter className="h-4 w-4" /> Filter by Major Patch:
        </span>
        {UPDATE_PATCHES.map((patch) => (
          <button
            key={patch.id}
            onClick={() => setUpdateFilter(patch.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all border ${
              updateFilter === patch.id
                ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md scale-[1.02]"
                : "bg-[#060a10] hover:bg-slate-800 text-slate-400 border-slate-700 hover:border-emerald-500/40"
            }`}
          >
            {patch.label}
          </button>
        ))}
      </div>

      {/* RESULTS GRID / CARD LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-400">
          <div>
            Showing <span className="text-amber-400 font-bold">{articles.length}</span> Vault Guides in{" "}
            <span className="text-emerald-400 font-bold uppercase">{category === "all" ? "All Knowledge Categories" : category}</span>
            {updateFilter !== "all" && (
              <span className="text-amber-300 font-bold uppercase"> • Patch: {updateFilter}</span>
            )}
          </div>
          {loading && <div className="text-amber-400 animate-pulse font-bold">⚡ Querying Codex...</div>}
        </div>

        {articles.length === 0 && !loading && (
          <div className="p-16 text-center text-slate-500 font-mono space-y-3 rounded-2xl bg-[#0f172a] border border-slate-700">
            <BookOpen className="h-12 w-12 mx-auto text-amber-500/30" />
            <div className="text-sm font-bold text-slate-300">No Overseer records found matching your filter.</div>
            <button
              onClick={() => {
                setCategory("all");
                setUpdateFilter("all");
                setQuery("");
              }}
              className="text-amber-400 underline hover:text-amber-300 text-xs font-bold"
            >
              Reset All Filters &amp; Search
            </button>
          </div>
        )}

        {/* VAULT GUIDE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedArticle(item)}
              className="bg-[#0f172a] border border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 flex flex-col justify-between gap-5 cursor-pointer group transition-all hover:-translate-y-1 shadow-xl hover:shadow-2xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase">
                  <span className="px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {item.category || "General"}
                  </span>
                  <span className="text-slate-400 font-bold">{item.source}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-100 group-hover:text-amber-300 font-mono transition-colors leading-snug">
                  {cleanTitle(item.title)}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-3 font-sans leading-relaxed">
                  {item.snippet ? item.snippet.replace(/<[^>]*>/g, "") : item.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-amber-400 font-bold group-hover:text-amber-300">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Read Full Guide
                </span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
