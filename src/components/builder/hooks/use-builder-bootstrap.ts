"use client";

import * as React from "react";
import { BUILDER_STORAGE_KEYS, perkLoadoutSlotKey } from "@/lib/builder/storage-keys";
import { BASE_GEAR_PIECES } from "@/lib/builder/base-gear";
import { normalizeBuilderPayload } from "@/lib/builder/normalize-builder-payload";
import type { BuilderPayload } from "@/lib/builder/types";
import { useBuilderBetaAccess } from "@/components/builder/builder-beta-gate";
import { LEGENDARY_PERK_CARDS } from "@/lib/builder/compatibility";

export interface UseBuilderBootstrapProps {
  isAdmin?: boolean;
  readOnly?: boolean;
  isMounted: boolean;
  setIsMounted: React.Dispatch<React.SetStateAction<boolean>>;
  setPayload: React.Dispatch<React.SetStateAction<BuilderPayload>>;
  setSavedLoadouts: React.Dispatch<
    React.SetStateAction<Array<{ id: string; name: string; payload: BuilderPayload }>>
  >;
}

export interface UseBuilderBootstrapResult {
  isMounted: boolean;
  showBetaPrompt: boolean;
  setShowBetaPrompt: React.Dispatch<React.SetStateAction<boolean>>;
  hasBuilderAccess: boolean;
  acceptBuilderBeta: () => void;
}

export function useBuilderBootstrap({
  isAdmin = false,
  readOnly = false,
  isMounted,
  setIsMounted,
  setPayload,
  setSavedLoadouts,
}: UseBuilderBootstrapProps): UseBuilderBootstrapResult {
  const { hasAccess: hasBuilderAccess, accept: acceptBuilderBeta } =
    useBuilderBetaAccess(isAdmin);
  const [showBetaPrompt, setShowBetaPrompt] = React.useState(false);

  React.useEffect(() => {
    if (readOnly) {
      setIsMounted(true);
      return;
    }
    try {
      const saved = localStorage.getItem(BUILDER_STORAGE_KEYS.payload);
      if (saved) {
        const parsed = JSON.parse(saved);
        const norm = normalizeBuilderPayload(parsed) || parsed;
        if (norm && typeof norm === "object" && (norm.basePieceId || norm.equipmentKind)) {
          setPayload(norm as BuilderPayload);
        }
      }

      const savedSlots = localStorage.getItem(BUILDER_STORAGE_KEYS.saves);
      if (savedSlots) {
        const parsedSlots = JSON.parse(savedSlots);
        if (Array.isArray(parsedSlots)) {
          setSavedLoadouts(parsedSlots);
        }
      }

      // Sync P.E.R.K. punch card machine loadout into B.U.I.L.D.
      try {
        const activePerkSlot = localStorage.getItem(BUILDER_STORAGE_KEYS.activePerkSlot) || "0";
        const perkSlotStr = localStorage.getItem(perkLoadoutSlotKey(activePerkSlot));
        if (perkSlotStr) {
          const perkData = JSON.parse(perkSlotStr);
          if (perkData) {
            setPayload((prev) => {
              const next = { ...prev };
              if (perkData.specials && Object.keys(perkData.specials).length > 0) {
                const s = perkData.specials;
                if (!next.baseSpecial || Object.keys(next.baseSpecial).length === 0) {
                  next.baseSpecial = {
                    str: s.S ?? 1,
                    per: s.P ?? 1,
                    end: s.E ?? 1,
                    cha: s.C ?? 1,
                    int: s.I ?? 1,
                    agi: s.A ?? 1,
                    lck: s.L ?? 1,
                  };
                }
              }
              if (Array.isArray(perkData.equippedCards) && perkData.equippedCards.length > 0) {
                const legendaryEntries: string[] = [];
                for (const item of perkData.equippedCards) {
                  const cardId = item.cardId;
                  const rank = item.rank || 4;
                  if (cardId in LEGENDARY_PERK_CARDS || cardId.startsWith("legendary-") || ["sizzling-style", "funky-duds", "what-rads", "electric-absorption", "master-infiltrator", "taking-one-for-the-team", "follow-through", "ammo-factory", "brawling-chemist", "hack-and-slash", "far-flung-fireworks", "exploding-palm", "detonation-contagion", "collateral-damage", "blood-sacrifice", "retribution", "power-armor-reboot", "power-sprinter", "survival-shortcut"].includes(cardId)) {
                    legendaryEntries.push(`${cardId}:${rank}`);
                  }
                }
                if (legendaryEntries.length > 0) {
                  next.legendaryPerkIds = Array.from(new Set([...(next.legendaryPerkIds || []), ...legendaryEntries]));
                }
              }
              return next;
            });
          }
        }
      } catch {
        // Ignore perk loadout sync error
      }

      if (!isAdmin && !hasBuilderAccess) {
        setShowBetaPrompt(true);
      }

      // Auto-equip item passed via URL parameter e.g. /build?equip=civil-engineer or /build?equip=fixer
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const equipTarget = searchParams.get("equip") || searchParams.get("gear") || searchParams.get("base") || searchParams.get("q");

        if (equipTarget) {
          const normTarget = equipTarget.toLowerCase().trim();
          const matchPiece = (query: string) => {
            return BASE_GEAR_PIECES.find((p) => {
              const pid = p.id.toLowerCase();
              const pkey = (p.armorSetKey || "").toLowerCase();
              const plabel = p.label.toLowerCase();
              return (
                pid === query ||
                pkey === query ||
                pid === `armor-set-${query}` ||
                pid.includes(query) ||
                plabel.includes(query)
              );
            });
          };

          const found = matchPiece(normTarget);
          if (found) {
            setPayload((prev) => ({
              ...prev,
              basePieceId: found.id,
              equipmentKind: found.kind,
              weaponSub: found.weaponSub ?? null
            }));
          }
        }
      }
    } catch {
      // ignore
    }
    setIsMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, hasBuilderAccess, readOnly]);

  return {
    isMounted,
    showBetaPrompt,
    setShowBetaPrompt,
    hasBuilderAccess,
    acceptBuilderBeta,
  };
}
