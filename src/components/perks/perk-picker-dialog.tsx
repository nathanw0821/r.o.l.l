"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PERK_CATALOG, isGhoulPerkCard, type PerkCard, type SpecialCategory } from "@/lib/perks/catalog";
import { getInGamePerkCardImage } from "@/lib/perks/clean-perk-assets";
import { webpSiblingForCardImage } from "@/lib/perks/card-webp";
import { OFFICIAL_SPECIAL_THEMES } from "@/lib/perks/special-theme";
import {
  PERK_EFFECT_TAG_LABEL,
  PERK_EFFECT_TAG_ORDER,
  countPerkEffectTags,
  perkEffectTags,
  type PerkEffectTag,
} from "@/lib/perks/perk-effect-categories";
import { cn } from "@/lib/utils";

export type PerkPickerScope = SpecialCategory | "GHOUL";

export type PerkPickerDialogProps = {
  /** Which cards to offer; `null` keeps the dialog closed. */
  scope: PerkPickerScope | null;
  onClose: () => void;
  /** Equips at rank 1; the rank is adjusted on the equipped card afterwards. */
  onEquip: (card: PerkCard) => void;
  equippedIds: ReadonlySet<string>;
  isFemale?: boolean;
  /** Opener button, refocused on close (Radix only returns focus to a DialogTrigger). */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  isCompactDensity?: boolean;
};

export function perkPickerTitle(scope: PerkPickerScope): string {
  if (scope === "LEGENDARY") return "Add legendary perk";
  if (scope === "GHOUL") return "Add Ghoul perks";
  return `Add ${OFFICIAL_SPECIAL_THEMES[scope].name} perks`;
}

export function perkPickerCards(scope: PerkPickerScope): PerkCard[] {
  return PERK_CATALOG.filter((c) => {
    if (c.isOutdated) return false;
    if (scope === "GHOUL") return isGhoulPerkCard(c.id || c.name);
    return c.special === scope;
  });
}

/**
 * Scoped perk picker: one SPECIAL (or the legendary / Ghoul sets), search, one pick equips at
 * rank 1 and closes. Rows use the display-sized WebP siblings of the 1:1 card art, so opening
 * a picker loads ~35 small images instead of the whole 268-card catalog.
 */
export default function PerkPickerDialog({
  scope,
  onClose,
  onEquip,
  equippedIds,
  isFemale,
  returnFocusRef,
  isCompactDensity,
}: PerkPickerDialogProps) {
  const [query, setQuery] = React.useState("");
  const [tag, setTag] = React.useState<PerkEffectTag | "all">("all");
  const open = scope !== null;
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setTag("all");
    }
  }, [open]);

  const cards = React.useMemo(() => (scope ? perkPickerCards(scope) : []), [scope]);
  // Effect categories present in this scope (derived from the cards' effect text), with counts.
  const tagChips = React.useMemo(() => {
    const counts = countPerkEffectTags(cards);
    return PERK_EFFECT_TAG_ORDER.filter((t) => (counts[t] ?? 0) > 0).map((t) => ({ tag: t, count: counts[t] ?? 0 }));
  }, [cards]);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      if (tag !== "all" && !perkEffectTags(c).includes(tag)) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || (c.ranks[0]?.description.toLowerCase().includes(q) ?? false);
    });
  }, [cards, query, tag]);

  const title = scope ? perkPickerTitle(scope) : "";

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef?.current?.focus();
        }}
        className={cn(
          "pip-terminal-panel flex max-h-[min(94vh,48rem)] flex-col gap-0 border-accent/40 rounded-xl overflow-hidden font-mono",
          "max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none",
          isCompactDensity ? "sm:max-w-xl p-3 sm:p-4" : "sm:max-w-2xl p-4 sm:p-6",
        )}
      >
        {scope && (
          <>
            <DialogHeader className="shrink-0 pr-8 relative z-10">
              <DialogTitle className={cn("font-black uppercase tracking-widest text-accent", isCompactDensity ? "text-xs" : "text-sm")}>
                &gt; {title}
              </DialogTitle>
              <DialogDescription className="text-2xs text-foreground/50 uppercase tracking-widest leading-relaxed">
                {cards.length} cards. Pick one to equip it at rank 1; set the rank on the card in your deck.
              </DialogDescription>
            </DialogHeader>
            <div className="relative mt-3 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dim" aria-hidden="true" />
              <input
                type="search"
                aria-label={`Search ${title.toLowerCase()}`}
                placeholder="Search by name or effect…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus={!isCompactDensity}
                className="w-full min-h-9 touch:min-h-11 pl-8 pr-2 py-1 rounded border border-slate-800 bg-slate-900/90 text-base sm:text-xs text-slate-200 placeholder:text-dim focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            {tagChips.length > 1 && (
              <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Filter by effect">
                <button
                  type="button"
                  aria-pressed={tag === "all"}
                  onClick={() => setTag("all")}
                  className={cn(
                    "min-h-7 touch:min-h-11 px-2 rounded border text-3xs uppercase tracking-wider font-bold",
                    tag === "all" ? "bg-emerald-500 text-slate-950 border-emerald-400" : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white",
                  )}
                >
                  All ({cards.length})
                </button>
                {tagChips.map(({ tag: t, count }) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tag === t}
                    onClick={() => setTag(t)}
                    className={cn(
                      "min-h-7 touch:min-h-11 px-2 rounded border text-3xs uppercase tracking-wider font-bold",
                      tag === t ? "bg-emerald-500 text-slate-950 border-emerald-400" : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white",
                    )}
                  >
                    {PERK_EFFECT_TAG_LABEL[t]} ({count})
                  </button>
                ))}
              </div>
            )}
            <div
              role="region"
              aria-label={`${title} options`}
              tabIndex={0}
              // auto-rows-max: inside a height-capped scroll container, auto grid rows would
              // collapse to the buttons' 44 px minimum and clip the card rows.
              className="mt-2 min-h-0 overflow-y-auto rounded-lg border border-slate-800/80 bg-[#06090e] p-2 grid grid-cols-1 sm:grid-cols-2 auto-rows-max gap-1.5"
            >
              {filtered.length === 0 ? (
                <p className="col-span-full py-6 text-center text-xs text-dim italic">No cards match.</p>
              ) : (
                filtered.map((card) => {
                  const equipped = equippedIds.has(card.id);
                  const png = getInGamePerkCardImage(card.id || card.name, 1, isFemale);
                  const webp = webpSiblingForCardImage(png);
                  const first = card.ranks[0];
                  const ghoul = isGhoulPerkCard(card.id || card.name);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      aria-label={`${equipped ? "Equipped" : "Equip"} ${card.name}`}
                      aria-current={equipped ? "true" : undefined}
                      aria-disabled={equipped || undefined}
                      onClick={() => {
                        if (equipped) return;
                        onEquip(card);
                        onClose();
                      }}
                      className={cn(
                        "min-h-11 min-w-0 text-left p-2 rounded-lg border flex items-start gap-2.5",
                        equipped
                          ? "bg-emerald-950/50 border-emerald-500/60 cursor-default"
                          : "bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900",
                      )}
                    >
                      {png ? (
                        <picture className="contents">
                          {webp ? <source type="image/webp" srcSet={webp} /> : null}
                          <img
                            src={png}
                            alt=""
                            width={64}
                            height={81}
                            loading="lazy"
                            decoding="async"
                            className="h-20 w-16 shrink-0 object-contain rounded"
                          />
                        </picture>
                      ) : (
                        <span className="h-20 w-16 shrink-0 rounded bg-slate-800" aria-hidden="true" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={cn("text-xs font-bold truncate", equipped ? "text-emerald-300" : "text-slate-100")}>
                            {card.name}
                          </span>
                          <span className="shrink-0 text-3xs uppercase tracking-wider text-slate-400">
                            {first ? `${first.cost} pt` : ""} · lvl {card.minLevel}
                          </span>
                        </span>
                        {first?.description ? (
                          <span
                            className="mt-0.5 text-2xs text-slate-400 leading-snug overflow-hidden"
                            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                          >
                            {first.description}
                          </span>
                        ) : null}
                        <span className="mt-1 flex items-center gap-1.5 text-3xs uppercase tracking-wider">
                          <span className="text-dim">{card.maxRank} rank{card.maxRank === 1 ? "" : "s"}</span>
                          {ghoul ? <span className="text-emerald-400">Ghoul</span> : null}
                          {equipped ? <span className="text-emerald-300 font-bold">Equipped</span> : null}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
