import { NextResponse } from "next/server";
import { getGeminiClient, GEMINI_DEFAULT_MODEL } from "@/lib/ai/gemini-client";
import { getLocalTacticalAdvice } from "@/lib/ai/local-tactics";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let specialPayload: Record<string, number> = {};
  let perksPayload: Array<{ name: string; rank: number; special: string }> = [];

  try {
    const body = await req.json();
    const { special, perks } = body as {
      special?: Record<string, number>;
      perks?: Array<{ name: string; rank: number; special: string }>;
    };

    if (!special || typeof special !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid SPECIAL stats provided." },
        { status: 400 }
      );
    }

    specialPayload = special;
    perksPayload = perks || [];

    const ai = getGeminiClient();
    if (!ai) {
      const localAdvice = getLocalTacticalAdvice({ special: specialPayload, perks: perksPayload });
      return NextResponse.json({
        success: true,
        advice: localAdvice || "Vault-Tec recommends continuing tactical experimentation in the Wasteland.",
        source: "local-tactics",
      });
    }

    const perkList = perksPayload
      .map((p) => `${p.name} (Rank ${p.rank}) [${p.special}]`)
      .join(", ");

    const specialSummary = Object.entries(specialPayload)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join(" | ");

    const prompt = `You are Vault-Tec's Senior Tactical AI Advisor for Fallout 76 (2026 Patch & PTS Standard).
FALLOUT 76 GAME MECHANICS & R.O.L.L. PLATFORM FEATURES:
- Live Mode: Maximum 15 perk card points per S.P.E.C.I.A.L. category.
- PTS Ghoul Mode: Maximum 20 perk card points per category for Playable Ghouls with Feral Gauge mechanics.
- Logarithmic Damage Formula Audit: min(0.99, (Damage / Enemy DR)^0.366).
- Direct SeventySix.esm Binary Extraction: 100% FormID parity for all 1★–4★ legendary mods.
- Expeditions: Complete drop tables for The Pitt (Union Dues, From Ashes to Fire) and Atlantic City (Tax Evasion, Sensational Game, Human Condition).
- Legendary Perks & Serum Suppression: Maximum 6 Legendary Perk Cards; Mutation food multipliers scale 2.5x with Herbivore/Carnivore and 1x under Serum Suppression.

ANALYZE THIS ACTIVE BUILD:
S.P.E.C.I.A.L. Allocation: ${specialSummary}
Equipped Perks: ${perkList || "None equipped yet"}

TASK:
Provide a precise, encouraging 2-sentence Vault-Tec tactical recommendation for optimizing perk synergies, AP refresh rates, damage multipliers, or PTS Ghoul 20-Cap potential for this build. Maintain a witty, corporate Vault-Tec tone.`;

    const response = await ai.models.generateContent({
      model: GEMINI_DEFAULT_MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    });

    const advice = response.text?.trim() || getLocalTacticalAdvice({ special: specialPayload, perks: perksPayload }) || "Vault-Tec recommends continuing tactical experimentation in the Wasteland.";

    return NextResponse.json({
      success: true,
      advice,
      source: "gemini-ai",
    });
  } catch (error: unknown) {
    console.error("[Build Advisor AI Error]", error);
    const localAdvice = getLocalTacticalAdvice({ special: specialPayload, perks: perksPayload });
    if (localAdvice) {
      return NextResponse.json({
        success: true,
        advice: localAdvice,
        source: "local-tactics",
      });
    }

    return NextResponse.json(
      { success: false, error: "Vault-Tec Advisor is currently offline. Your loadout tools remain 100% functional." },
      { status: 500 }
    );
  }
}
