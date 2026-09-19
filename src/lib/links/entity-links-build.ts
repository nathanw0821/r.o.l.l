/**
 * Build-time half of the entity link map: reads the perk, legendary, unique-item, update and
 * mechanics-glossary catalogs and produces the sorted entries stored in `entity-link-index.json`.
 * Import this only from scripts and tests, never from UI code (it pulls in the full catalogs).
 * Regenerate with: npx tsx scripts/truth/build-entity-links.ts
 */

import { FALLBACK_LEGENDARY_EFFECTS } from "@/lib/static-fallback-catalog";
import perkCards from "@/data/perk-cards.json";
import { UNIQUE_ITEMS } from "@/lib/truth/unique-items";
import { BASE_GEAR_PIECES } from "@/lib/builder/base-gear";
import { UPDATE_PATCHES } from "@/lib/wiki/update-patches";
import { GLOSSARY_TERMS, glossaryHref } from "@/lib/truth/mechanics-glossary";
import {
  EFFECT_LINK_STOPLIST,
  GLOSSARY_LINK_STOPLIST,
  MIN_ENTITY_NAME_LENGTH,
  PERK_LINK_STOPLIST,
  normalizeEntityKey,
  type EntityKind,
  type EntityLink
} from "@/lib/links/entity-links";

function isLinkableName(name: string): boolean {
  return name.trim().length >= MIN_ENTITY_NAME_LENGTH;
}

/** Update chip label without the parenthetical or a trailing year: "The Pitt (Expedition 1)" -> "The Pitt". */
function updateMatchName(label: string): string {
  return label
    .replace(/\s*\(.*\)\s*$/, "")
    .replace(/\s+\d{4}$/, "")
    .trim();
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when `key` equals or contains one of `names` as a whole word (keys are already lower-cased). */
export function containsWholeName(key: string, names: readonly string[]): boolean {
  return names.some((name) => new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapeRegex(name)}(?:$|[^\\p{L}\\p{N}])`, "u").test(key));
}

export function buildEntityLinks(): EntityLink[] {
  const byKey = new Map<string, EntityLink>();
  const add = (name: string, href: string, kind: EntityKind) => {
    const clean = name.replace(/[’‘]/g, "'").trim();
    if (!isLinkableName(clean)) return;
    const key = normalizeEntityKey(clean);
    if (byKey.has(key)) return; // priority: first source wins
    byKey.set(key, { key, name: clean, href, kind });
  };

  // 1. Major updates (guides filter).
  for (const patch of UPDATE_PATCHES) {
    if (patch.id === "all") continue;
    add(updateMatchName(patch.label), `/wiki?update=${patch.id}`, "update");
  }

  // 2. Unique items whose base-gear row exists in the builder.
  const baseIds = new Set(BASE_GEAR_PIECES.map((piece) => piece.id));
  for (const item of UNIQUE_ITEMS) {
    const pieceId = item.baseItemId;
    if (!pieceId || !baseIds.has(pieceId)) continue;
    add(item.name, `/build?tab=gear&piece=${pieceId}`, "unique");
  }

  // 3. Perk cards.
  for (const card of perkCards as Array<{ name: string }>) {
    if (!card?.name || PERK_LINK_STOPLIST.has(normalizeEntityKey(card.name))) continue;
    add(card.name, `/perks?q=${encodeURIComponent(card.name)}`, "perk");
  }

  // 4. Legendary effects.
  for (const row of FALLBACK_LEGENDARY_EFFECTS) {
    const name = row.effectName;
    if (!name || EFFECT_LINK_STOPLIST.has(normalizeEntityKey(name))) continue;
    add(name, `/all-effects?q=${encodeURIComponent(name)}`, "effect");
  }

  // 5. Mechanics glossary, lowest priority. A term is left out when its key is taken or when it
  //    contains a higher-priority name as a whole word: "Unyielding thresholds" would otherwise win
  //    the longest match over the Unyielding effect and take its link away.
  const higherPriority = Array.from(byKey.values()).map((e) => e.key);
  for (const entry of GLOSSARY_TERMS) {
    const key = normalizeEntityKey(entry.term);
    if (GLOSSARY_LINK_STOPLIST.has(key) || containsWholeName(key, higherPriority)) continue;
    add(entry.term, glossaryHref(entry.slug), "glossary");
  }

  // Longest first (then alphabetical) so the regex alternation prefers the longest name at a position.
  return Array.from(byKey.values()).sort(
    (a, b) => b.name.length - a.name.length || a.key.localeCompare(b.key)
  );
}

