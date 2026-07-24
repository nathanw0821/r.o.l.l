"use client";

import type { BaseGearPiece } from "@/lib/builder/base-gear";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import type { BuilderEffectTotals, BuilderSpecialKey } from "@/lib/builder/compatibility";
import { ARMOR_SET_SLOT_LABELS } from "@/lib/builder/armor-sets";
import { findArmorMaterialMod, findArmorMiscMod } from "@/lib/builder/armor-piece-mods";
import { getSortedMutationLabels } from "@/lib/builder/sandbox-mutations";

export type ExportGroupedEffect = {
  mod: BuilderModDTO;
  count: number;
  benchLabels: string[];
};

export async function exportBuilderLoadoutCard(params: {
  piece: BaseGearPiece;
  payload: BuilderPayload;
  totals: BuilderEffectTotals;
  groupedEffects: ExportGroupedEffect[];
  modRows: BuilderModDTO[];
  shoppingLines: { label: string; count: number }[];
  underarmorLabels?: { shell: string; lining: string; style: string };
  mutationSummary?: string | null;
}) {
  const {
    piece,
    payload,
    totals,
    groupedEffects,
    modRows,
    shoppingLines,
    underarmorLabels
  } = params;

  let container: HTMLDivElement | null = null;

  try {
    const width = 1920;
    const height = 1080;

    container = document.createElement("div");
    container.id = "roll-builder-card-export-temp";
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.top = "0";
    container.style.zIndex = "-9999";
    container.style.opacity = "1";
    container.style.pointerEvents = "none";
    container.style.overflow = "hidden";
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.padding = "24px";
    container.style.boxSizing = "border-box";
    container.style.backgroundColor = "#080b0e";

    const stamp = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

    // Grouped Legendary Effects HTML
    const modsListHtml = groupedEffects.length > 0
      ? groupedEffects.map(({ mod, count, benchLabels }) => `
        <div style="background: rgba(18, 24, 30, 0.85); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 13px; font-weight: 900; color: #4cc38a; text-transform: uppercase;">${mod.starRank}★ ${mod.name}</span>
              ${count > 1 ? `<span style="background: rgba(76, 195, 138, 0.15); border: 1px solid rgba(76, 195, 138, 0.3); color: #4cc38a; border-radius: 999px; padding: 1px 6px; font-size: 11px; font-weight: 900;">×${count}</span>` : ""}
            </div>
            <div style="font-size: 10px; font-weight: 700; color: #a0aec0; text-transform: uppercase;">
              ${benchLabels.join(" · ")}
            </div>
          </div>
          ${mod.description ? `<div style="font-size: 11px; color: rgba(240, 236, 231, 0.7); font-style: italic;">${mod.description}</div>` : ""}
        </div>
      `).join("")
      : `<div style="color: rgba(240, 236, 231, 0.4); font-style: italic; font-size: 12px;">No legendary effects installed.</div>`;

    // S.P.E.C.I.A.L. HTML
    const specialKeys: Array<{ key: BuilderSpecialKey; label: string }> = [
      { key: "str", label: "STR" },
      { key: "per", label: "PER" },
      { key: "end", label: "END" },
      { key: "cha", label: "CHA" },
      { key: "int", label: "INT" },
      { key: "agi", label: "AGI" },
      { key: "lck", label: "LCK" },
    ];

    const specialHtml = specialKeys.map(({ key, label }) => `
      <div style="background: rgba(18, 24, 30, 0.9); padding: 8px 4px; border-radius: 6px; border: 1px solid rgba(76, 195, 138, 0.2); text-align: center;">
        <div style="font-size: 9px; font-weight: 800; color: #a0aec0;">${label}</div>
        <div style="font-size: 16px; font-weight: 900; color: #4cc38a; margin-top: 2px;">${totals[key] ?? 0}</div>
      </div>
    `).join("");

    // Resistance HTML
    const resistsHtml = `
      <div style="background: rgba(18, 24, 30, 0.9); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(76, 195, 138, 0.2); display: flex; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: #a0aec0;">DR</span>
        <span style="font-size: 13px; font-weight: 900; color: #4cc38a;">${totals.dr}</span>
      </div>
      <div style="background: rgba(18, 24, 30, 0.9); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(76, 195, 138, 0.2); display: flex; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: #a0aec0;">ER</span>
        <span style="font-size: 13px; font-weight: 900; color: #4cc38a;">${totals.er}</span>
      </div>
      <div style="background: rgba(18, 24, 30, 0.9); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(76, 195, 138, 0.2); display: flex; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: #a0aec0;">FR</span>
        <span style="font-size: 13px; font-weight: 900; color: #4cc38a;">${totals.fr}</span>
      </div>
      <div style="background: rgba(18, 24, 30, 0.9); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(76, 195, 138, 0.2); display: flex; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: #a0aec0;">RR</span>
        <span style="font-size: 13px; font-weight: 900; color: #4cc38a;">${totals.rr}</span>
      </div>
      <div style="background: rgba(18, 24, 30, 0.9); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(76, 195, 138, 0.2); display: flex; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: #a0aec0;">PR</span>
        <span style="font-size: 13px; font-weight: 900; color: #4cc38a;">${totals.pr}</span>
      </div>
      <div style="background: rgba(18, 24, 30, 0.9); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(76, 195, 138, 0.2); display: flex; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: #a0aec0;">CR</span>
        <span style="font-size: 13px; font-weight: 900; color: #4cc38a;">${totals.cr}</span>
      </div>
    `;

    // Chassis Schematic HTML
    const isSet = payload.armorPieceCrafting.length === 5;
    let schematicHtml = "";
    if (isSet) {
      schematicHtml = ARMOR_SET_SLOT_LABELS.map((label, p) => {
        const craft = payload.armorPieceCrafting[p];
        const mat = craft ? findArmorMaterialMod(craft.materialModId) : undefined;
        const misc = craft ? findArmorMiscMod(craft.miscModId) : undefined;
        const craftText = [mat?.label, misc?.label].filter(Boolean).join(" · ") || "Standard";

        const stars = [0, 1, 2, 3].map((s) => {
          const id = payload.armorLegendaryModIds[p]?.[s];
          const mod = id ? modRows.find((m) => m.id === id || m.slug === id) : null;
          return `
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px;">
              <span style="color: #a0aec0;">${s + 1}★</span>
              <span style="color: ${mod ? "#f0ece7" : "rgba(240,236,231,0.3)"}; font-weight: 700;">${mod ? mod.name : "—"}</span>
            </div>
          `;
        }).join("");

        return `
          <div style="background: rgba(18, 24, 30, 0.85); border: 1px solid rgba(76, 195, 138, 0.2); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
            <div style="font-size: 11px; font-weight: 900; color: #4cc38a; text-transform: uppercase; border-bottom: 1px solid rgba(76, 195, 138, 0.15); padding-bottom: 4px;">${label}</div>
            <div style="font-size: 10px; color: #a0aec0; text-transform: uppercase;">${craftText}</div>
            ${stars}
          </div>
        `;
      }).join("");
    } else {
      const stars = [0, 1, 2, 3].map((s) => {
        const id = payload.legendaryModIds[s];
        const mod = id ? modRows.find((m) => m.id === id || m.slug === id) : null;
        return `
          <div style="display: flex; justify-content: space-between; font-size: 12px; padding: 8px; background: rgba(18,24,30,0.8); border-radius: 6px;">
            <span style="color: #a0aec0;">${s + 1}★ Star</span>
            <span style="color: ${mod ? "#4cc38a" : "rgba(240,236,231,0.3)"}; font-weight: 800;">${mod ? mod.name : "— Empty —"}</span>
          </div>
        `;
      }).join("");
      schematicHtml = `<div style="display: flex; flex-direction: column; gap: 8px;">${stars}</div>`;
    }

    const sortedMutations = getSortedMutationLabels(payload.mutationIds);
    const sortedMutationText = sortedMutations.length > 0 ? sortedMutations.join(" · ") : "No active mutations";

    // Legendary Perks HTML
    const perksHtml = payload.legendaryPerkIds.length > 0
      ? payload.legendaryPerkIds.map((id) => `
        <div style="background: rgba(18, 24, 30, 0.85); border: 1px solid rgba(76, 195, 138, 0.2); border-radius: 6px; padding: 6px 10px; font-size: 11px; font-weight: 800; color: #f0ece7; text-transform: uppercase;">
          ${id.replace(/-/g, " ")}
        </div>
      `).join("")
      : `<div style="color: rgba(240, 236, 231, 0.4); font-style: italic; font-size: 11px;">No legendary perks equipped.</div>`;

    // Materials HTML
    const materialsHtml = shoppingLines.length > 0
      ? shoppingLines.map((line) => `
        <span style="background: rgba(76, 195, 138, 0.1); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 999px; padding: 3px 10px; font-size: 10px; font-weight: 800; color: #4cc38a; text-transform: uppercase; white-space: nowrap;">
          ${line.count}× ${line.label}
        </span>
      `).join("")
      : `<div style="color: rgba(240, 236, 231, 0.4); font-style: italic; font-size: 11px;">No materials required.</div>`;

    const inner = document.createElement("div");
    inner.style.backgroundColor = "#0e1216";
    inner.style.border = "2px solid rgba(76, 195, 138, 0.35)";
    inner.style.borderRadius = "16px";
    inner.style.padding = "24px";
    inner.style.height = "100%";
    inner.style.display = "flex";
    inner.style.flexDirection = "column";
    inner.style.gap = "16px";
    inner.style.boxSizing = "border-box";
    inner.style.fontFamily = "monospace, system-ui, sans-serif";

    inner.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(76, 195, 138, 0.4); padding-bottom: 12px;">
        <div>
          <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: #4cc38a; text-transform: uppercase;">&gt; SYSTEM DIAGNOSTICS: B.U.I.L.D. SPEC CARD</div>
          <h1 style="font-size: 26px; font-weight: 900; color: #f0ece7; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em;">${piece.label}</h1>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; font-weight: 900; color: #4cc38a; letter-spacing: 0.1em;">FALLOUT 76 R.O.L.L. HUB</div>
          <div style="font-size: 11px; color: #a0aec0; margin-top: 2px;">${stamp} · fallout76.wiki</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 28% 42% 30%; gap: 16px; flex: 1; min-height: 0;">
        
        <!-- COLUMN 1: TELEMETRY & STATS & MATRICES -->
        <div style="display: flex; flex-direction: column; gap: 12px; min-height: 0;">
          <div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 10px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 900; color: #4cc38a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">[ S.P.E.C.I.A.L. TELEMETRY ]</div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
              ${specialHtml}
            </div>
          </div>

          <div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 10px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 900; color: #4cc38a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">[ RESISTANCE RATINGS ]</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
              ${resistsHtml}
            </div>
          </div>

          <div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 10px; padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 8px; min-height: 0;">
            <div style="font-size: 11px; font-weight: 900; color: #4cc38a; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid rgba(76, 195, 138, 0.15); padding-bottom: 6px;">[ ACTIVE LEGENDARY MATRICES ]</div>
            <div style="display: flex; flex-direction: column; gap: 6px; overflow-y: auto; flex: 1;">
              ${modsListHtml}
            </div>
          </div>
        </div>

        <!-- COLUMN 2: CHASSIS D&V SCHEMATIC & SUB-SYSTEMS -->
        <div style="display: flex; flex-direction: column; gap: 12px; min-height: 0;">
          <div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 10px; padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 11px; font-weight: 900; color: #4cc38a; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid rgba(76, 195, 138, 0.15); padding-bottom: 6px;">[ CHASSIS D&amp;V SCHEMATIC ]</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
              ${schematicHtml}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            ${underarmorLabels ? `
              <div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 8px; padding: 10px;">
                <div style="font-size: 10px; font-weight: 900; color: #4cc38a; text-transform: uppercase; margin-bottom: 4px;">[ UNDERARMOR ]</div>
                <div style="font-size: 10px; color: #f0ece7; display: flex; flex-direction: column; gap: 2px;">
                  <div><span style="color:#a0aec0">BASE:</span> ${underarmorLabels.shell}</div>
                  <div><span style="color:#a0aec0">LINING:</span> ${underarmorLabels.lining}</div>
                  <div><span style="color:#a0aec0">STYLE:</span> ${underarmorLabels.style}</div>
                </div>
              </div>
            ` : ""}

            <div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 8px; padding: 10px;">
              <div style="font-size: 10px; font-weight: 900; color: #4cc38a; text-transform: uppercase; margin-bottom: 4px;">[ MUTATIONS ]</div>
              <div style="font-size: 10px; color: #4cc38a; font-weight: 700; line-height: 1.3;">
                ${sortedMutationText}
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMN 3: PERKS & BENCH MATERIALS -->
        <div style="display: flex; flex-direction: column; gap: 12px; min-height: 0;">
          <div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
            <div style="font-size: 11px; font-weight: 900; color: #4cc38a; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid rgba(76, 195, 138, 0.15); padding-bottom: 6px;">[ LEGENDARY PERKS ]</div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${perksHtml}
            </div>
          </div>

          <div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 10px; padding: 12px; flex: 1; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 11px; font-weight: 900; color: #4cc38a; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid rgba(76, 195, 138, 0.15); padding-bottom: 6px;">[ BENCH MATERIALS LIST ]</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${materialsHtml}
            </div>
          </div>
        </div>

      </div>
    `;

    container.appendChild(inner);
    document.body.appendChild(container);

    await new Promise((resolve) => setTimeout(resolve, 150));

    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(container, {
      width,
      height,
      pixelRatio: 1,
      cacheBust: true,
      style: {
        opacity: "1",
        visibility: "visible",
      }
    });

    const link = document.createElement("a");
    link.download = `roll-build-card-${piece.id}-${stamp.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Failed to export build card PNG:", err);
  } finally {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export async function exportPerkDeckCard(params: {
  characterName: string;
  slotName: string;
  specials: Record<string, number>;
  equippedCards: Array<{ cardId: string; rank: number }>;
}) {
  const { characterName, slotName, specials, equippedCards } = params;
  let container: HTMLDivElement | null = null;

  try {
    const width = 1920;
    const height = 1080;

    container = document.createElement("div");
    container.id = "roll-perk-card-export-temp";
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.top = "0";
    container.style.zIndex = "-9999";
    container.style.opacity = "1";
    container.style.pointerEvents = "none";
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.padding = "24px";
    container.style.boxSizing = "border-box";
    container.style.backgroundColor = "#080b0e";

    const stamp = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

    const inner = document.createElement("div");
    inner.style.width = "100%";
    inner.style.height = "100%";
    inner.style.display = "flex";
    inner.style.flexDirection = "column";
    inner.style.gap = "16px";
    inner.style.fontFamily = "monospace";
    inner.style.color = "#e2e8f0";

    const specialsHtml = Object.entries(specials)
      .map(([k, v]) => `<div style="background: rgba(14, 18, 22, 0.9); border: 1px solid rgba(76, 195, 138, 0.3); border-radius: 8px; padding: 10px; text-align: center;"><div style="color: #4cc38a; font-weight: 900; font-size: 18px;">${k}</div><div style="font-size: 14px; font-weight: 700; color: #fff;">${v} PTS</div></div>`)
      .join("");

    const cardsHtml = equippedCards
      .map(
        (c) =>
          `<div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 8px; padding: 10px;"><div style="color: #f59e0b; font-weight: 800; font-size: 14px;">${c.cardId} (${c.rank}★)</div></div>`
      )
      .join("");

    inner.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(76, 195, 138, 0.4); padding-bottom: 12px;">
        <div>
          <div style="color: #4cc38a; font-size: 12px; font-weight: 900; letter-spacing: 0.15em;">VAULT-TEC PUNCH CARD MACHINE // P.E.R.K. DECK</div>
          <div style="font-size: 28px; font-weight: 900; color: #ffffff;">${characterName} — ${slotName}</div>
        </div>
        <div style="text-align: right; color: rgba(226, 232, 240, 0.6); font-size: 12px;">${stamp} · fallout76.wiki</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px;">${specialsHtml}</div>
      <div style="font-size: 14px; font-weight: 900; color: #4cc38a; margin-top: 10px;">[ EQUIPPED PERK CARDS DECK (${equippedCards.length}) ]</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; flex: 1;">${cardsHtml || "<div style='color: rgba(255,255,255,0.4);'>No cards equipped</div>"}</div>
    `;

    container.appendChild(inner);
    document.body.appendChild(container);

    await new Promise((resolve) => setTimeout(resolve, 150));

    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(container, { width, height, pixelRatio: 1, cacheBust: true });

    const link = document.createElement("a");
    link.download = `roll-perk-deck-${characterName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${stamp.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Failed to export perk deck PNG:", err);
  } finally {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
