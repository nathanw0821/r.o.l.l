"use client";

import type { BaseGearPiece } from "@/lib/builder/base-gear";
import type { BuilderPayload } from "@/lib/builder/types";
import type { BuilderEffectTotals, EquippedLegendaryBenchLine } from "@/lib/builder/compatibility";

export async function exportBuilderLoadoutCard(params: {
  piece: BaseGearPiece;
  payload: BuilderPayload;
  totals: BuilderEffectTotals;
  equippedLines: EquippedLegendaryBenchLine[];
}) {
  const { piece, totals, equippedLines } = params;
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
    container.style.backgroundColor = "#0f1113";

    const inner = document.createElement("div");
    inner.style.backgroundColor = "#13171b";
    inner.style.border = "2px solid #2d3339";
    inner.style.borderRadius = "16px";
    inner.style.padding = "32px";
    inner.style.height = "100%";
    inner.style.display = "flex";
    inner.style.flexDirection = "column";
    inner.style.gap = "24px";
    inner.style.boxSizing = "border-box";
    inner.style.fontFamily = "var(--font-share-tech-mono), monospace, system-ui, sans-serif";

    const stamp = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

    const modsListHtml = equippedLines.length > 0
      ? equippedLines.map(({ mod, benchLabel }) => `
        <div style="background: rgba(23, 26, 29, 0.8); border: 1px solid #2d3339; border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #f0ece7;">${mod.name}</div>
            <div style="font-size: 10px; color: #f3a24d; text-transform: uppercase; margin-top: 2px;">${benchLabel}</div>
          </div>
          <div style="font-size: 11px; color: #c0b7ad; text-align: right; max-width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${mod.description || ""}
          </div>
        </div>
      `).join("")
      : `<div style="color: #c0b7ad; font-style: italic; font-size: 13px;">No legendary mods equipped.</div>`;

    inner.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f3a24d; padding-bottom: 16px;">
        <div>
          <div style="font-size: 12px; font-weight: 800; letter-spacing: 0.15em; color: #f3a24d; text-transform: uppercase;">B.U.I.L.D. Diagnostic Summary</div>
          <h1 style="font-size: 32px; font-weight: 900; color: #f0ece7; margin: 4px 0 0 0; text-transform: uppercase;">${piece.label}</h1>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; font-weight: 800; color: #f3a24d;">R.O.L.L. B.U.I.L.D. CARD</div>
          <div style="font-size: 11px; color: #c0b7ad; margin-top: 2px;">${stamp} · fallout76.wiki</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; flex: 1; min-height: 0;">
        <div style="background: #171a1d; border: 1px solid #2d3339; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 16px; min-height: 0;">
          <div style="font-size: 14px; font-weight: 900; color: #f3a24d; text-transform: uppercase; border-bottom: 1px solid #2d3339; padding-bottom: 8px;">Equipped Legendary Effects (${equippedLines.length})</div>
          <div style="display: flex; flex-direction: column; gap: 8px; overflow: hidden; flex: 1;">
            ${modsListHtml}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="background: #171a1d; border: 1px solid #2d3339; border-radius: 12px; padding: 16px;">
            <div style="font-size: 13px; font-weight: 900; color: #f3a24d; text-transform: uppercase; margin-bottom: 10px;">S.P.E.C.I.A.L. Totals</div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center;">
              <div style="background: #13171b; padding: 8px 4px; border-radius: 6px; border: 1px solid #2d3339;"><div style="font-size: 9px; color: #c0b7ad;">STR</div><div style="font-size: 16px; font-weight: 900; color: #4cc38a;">${totals.str}</div></div>
              <div style="background: #13171b; padding: 8px 4px; border-radius: 6px; border: 1px solid #2d3339;"><div style="font-size: 9px; color: #c0b7ad;">PER</div><div style="font-size: 16px; font-weight: 900; color: #4cc38a;">${totals.per}</div></div>
              <div style="background: #13171b; padding: 8px 4px; border-radius: 6px; border: 1px solid #2d3339;"><div style="font-size: 9px; color: #c0b7ad;">END</div><div style="font-size: 16px; font-weight: 900; color: #4cc38a;">${totals.end}</div></div>
              <div style="background: #13171b; padding: 8px 4px; border-radius: 6px; border: 1px solid #2d3339;"><div style="font-size: 9px; color: #c0b7ad;">CHA</div><div style="font-size: 16px; font-weight: 900; color: #4cc38a;">${totals.cha}</div></div>
              <div style="background: #13171b; padding: 8px 4px; border-radius: 6px; border: 1px solid #2d3339;"><div style="font-size: 9px; color: #c0b7ad;">INT</div><div style="font-size: 16px; font-weight: 900; color: #4cc38a;">${totals.int}</div></div>
              <div style="background: #13171b; padding: 8px 4px; border-radius: 6px; border: 1px solid #2d3339;"><div style="font-size: 9px; color: #c0b7ad;">AGI</div><div style="font-size: 16px; font-weight: 900; color: #4cc38a;">${totals.agi}</div></div>
              <div style="background: #13171b; padding: 8px 4px; border-radius: 6px; border: 1px solid #2d3339;"><div style="font-size: 9px; color: #c0b7ad;">LCK</div><div style="font-size: 16px; font-weight: 900; color: #4cc38a;">${totals.lck}</div></div>
            </div>
          </div>

          <div style="background: #171a1d; border: 1px solid #2d3339; border-radius: 12px; padding: 16px; flex: 1;">
            <div style="font-size: 13px; font-weight: 900; color: #f3a24d; text-transform: uppercase; margin-bottom: 10px;">Resistances & Vitals</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px; color: #f0ece7;">
              <div style="background: #13171b; padding: 10px; border-radius: 6px; border: 1px solid #2d3339;">DR: <span style="font-weight: 800; color: #f3a24d;">${totals.dr}</span></div>
              <div style="background: #13171b; padding: 10px; border-radius: 6px; border: 1px solid #2d3339;">ER: <span style="font-weight: 800; color: #f3a24d;">${totals.er}</span></div>
              <div style="background: #13171b; padding: 10px; border-radius: 6px; border: 1px solid #2d3339;">FR: <span style="font-weight: 800; color: #f3a24d;">${totals.fr}</span></div>
              <div style="background: #13171b; padding: 10px; border-radius: 6px; border: 1px solid #2d3339;">RR: <span style="font-weight: 800; color: #f3a24d;">${totals.rr}</span></div>
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
