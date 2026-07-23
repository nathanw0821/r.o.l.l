"use client";

import type { BaseGearPiece } from "@/lib/builder/base-gear";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import type { BuilderEffectTotals, BuilderSpecialKey } from "@/lib/builder/compatibility";

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
}) {
  const { piece, totals, groupedEffects } = params;
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
        <div style="background: rgba(18, 24, 30, 0.85); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 10px; padding: 12px 16px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; items-center: center; gap: 8px;">
              <span style="font-size: 15px; font-weight: 900; color: #4cc38a; text-transform: uppercase; tracking: 0.05em;">${mod.name}</span>
              ${count > 1 ? `<span style="background: rgba(76, 195, 138, 0.15); border: 1px solid rgba(76, 195, 138, 0.3); color: #4cc38a; border-radius: 999px; padding: 1px 8px; font-size: 12px; font-weight: 900;">×${count}</span>` : ""}
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.05em;">
              ${benchLabels.join(" · ")}
            </div>
          </div>
          ${mod.description ? `<div style="font-size: 12px; color: rgba(240, 236, 231, 0.75); font-style: italic; margin-top: 2px;">${mod.description}</div>` : ""}
        </div>
      `).join("")
      : `<div style="color: rgba(240, 236, 231, 0.4); font-style: italic; font-size: 13px;">No legendary effects installed on chassis.</div>`;

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
      <div style="background: rgba(18, 24, 30, 0.9); padding: 10px 6px; border-radius: 8px; border: 1px solid rgba(76, 195, 138, 0.2); text-align: center;">
        <div style="font-size: 10px; font-weight: 800; color: #a0aec0; letter-spacing: 0.1em;">${label}</div>
        <div style="font-size: 18px; font-weight: 900; color: #4cc38a; margin-top: 2px;">${totals[key] ?? 0}</div>
      </div>
    `).join("");

    // Resistance HTML
    const resistsHtml = `
      <div style="background: rgba(18, 24, 30, 0.9); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(76, 195, 138, 0.2); display: flex; justify-content: space-between;">
        <span style="font-size: 12px; font-weight: 700; color: #a0aec0;">DR (DAMAGE)</span>
        <span style="font-size: 14px; font-weight: 900; color: #4cc38a;">${totals.dr}</span>
      </div>
      <div style="background: rgba(18, 24, 30, 0.9); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(76, 195, 138, 0.2); display: flex; justify-content: space-between;">
        <span style="font-size: 12px; font-weight: 700; color: #a0aec0;">ER (ENERGY)</span>
        <span style="font-size: 14px; font-weight: 900; color: #4cc38a;">${totals.er}</span>
      </div>
      <div style="background: rgba(18, 24, 30, 0.9); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(76, 195, 138, 0.2); display: flex; justify-content: space-between;">
        <span style="font-size: 12px; font-weight: 700; color: #a0aec0;">FR (FIRE)</span>
        <span style="font-size: 14px; font-weight: 900; color: #4cc38a;">${totals.fr}</span>
      </div>
      <div style="background: rgba(18, 24, 30, 0.9); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(76, 195, 138, 0.2); display: flex; justify-content: space-between;">
        <span style="font-size: 12px; font-weight: 700; color: #a0aec0;">RR (RADIATION)</span>
        <span style="font-size: 14px; font-weight: 900; color: #4cc38a;">${totals.rr}</span>
      </div>
    `;

    const inner = document.createElement("div");
    inner.style.backgroundColor = "#0e1216";
    inner.style.border = "2px solid rgba(76, 195, 138, 0.35)";
    inner.style.borderRadius = "16px";
    inner.style.padding = "28px";
    inner.style.height = "100%";
    inner.style.display = "flex";
    inner.style.flexDirection = "column";
    inner.style.gap = "20px";
    inner.style.boxSizing = "border-box";
    inner.style.fontFamily = "monospace, system-ui, sans-serif";

    inner.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(76, 195, 138, 0.4); padding-bottom: 14px;">
        <div>
          <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: #4cc38a; text-transform: uppercase;">&gt; SYSTEM DIAGNOSTICS: B.U.I.L.D. SPEC CARD</div>
          <h1 style="font-size: 28px; font-weight: 900; color: #f0ece7; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em;">${piece.label}</h1>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; font-weight: 900; color: #4cc38a; letter-spacing: 0.1em;">FALLOUT 76 R.O.L.L. HUB</div>
          <div style="font-size: 11px; color: #a0aec0; margin-top: 2px;">${stamp} · fallout76.wiki</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; flex: 1; min-height: 0;">
        <div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 12px; min-height: 0;">
          <div style="font-size: 12px; font-weight: 900; color: #4cc38a; text-transform: uppercase; letter-spacing: 0.15em; border-bottom: 1px solid rgba(76, 195, 138, 0.2); padding-bottom: 8px;">[ ACTIVE LEGENDARY MATRICES ]</div>
          <div style="display: flex; flex-direction: column; gap: 8px; overflow-y: auto; flex: 1;">
            ${modsListHtml}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 12px; padding: 16px;">
            <div style="font-size: 12px; font-weight: 900; color: #4cc38a; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 10px;">[ S.P.E.C.I.A.L. TELEMETRY ]</div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
              ${specialHtml}
            </div>
          </div>

          <div style="background: rgba(14, 18, 22, 0.95); border: 1px solid rgba(76, 195, 138, 0.25); border-radius: 12px; padding: 16px; flex: 1;">
            <div style="font-size: 12px; font-weight: 900; color: #4cc38a; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 10px;">[ RESISTANCE RATINGS ]</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
              ${resistsHtml}
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
