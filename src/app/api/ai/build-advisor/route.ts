import { NextResponse } from "next/server";
import { getGeminiClient, GEMINI_DEFAULT_MODEL } from "@/lib/ai/gemini-client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return NextResponse.json(
        { success: false, error: "Gemini API key is not configured on the server." },
        { status: 503 }
      );
    }

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

    const perkList = (perks || [])
      .map((p) => `${p.name} (Rank ${p.rank}) [${p.special}]`)
      .join(", ");

    const specialSummary = Object.entries(special)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join(" | ");

    const prompt = `You are Vault-Tec's Senior Tactical Engineer for Fallout 76 (2026 Patch Standard).
FALLOUT 76 GAME MECHANICS CONSTRAINTS:
- Maximum 15 perk card points can be equipped per S.P.E.C.I.A.L. category.
- Maximum 6 Legendary Perk Cards total (unlocked at Levels 50/100/150/200/250/300).
- Legendary SPECIAL cards (Ranks 1-3 give +1 to +3 points; Rank 4 gives +5 points).
- Uncapped S.P.E.C.I.A.L. stats (up to 30+) scale secondary attributes (Strength = Carry Weight & Melee Dmg; Perception = VATS Accuracy; Endurance = HP; Charisma = Vendor Prices; Intelligence = XP & Energy Durability; Agility = AP & Sneak; Luck = Crit Fill).

ANALYZE THIS ACTIVE BUILD:
S.P.E.C.I.A.L. Allocation: ${specialSummary}
Equipped Perks: ${perkList || "None equipped yet"}

TASK:
Provide a precise 2-sentence Vault-Tec tactical recommendation for optimizing perk card synergies, AP refresh rates, Damage Resistance (DR/ER/RR), or SPECIAL thresholds for this build. Maintain a witty, corporate Vault-Tec tone.`;

    const response = await ai.models.generateContent({
      model: GEMINI_DEFAULT_MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    });

    const advice = response.text?.trim() || "Vault-Tec recommends continuing tactical experimentation in the Wasteland.";

    return NextResponse.json({
      success: true,
      advice,
    });
  } catch (error) {
    console.error("[Build Advisor AI Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate Vault-Tec build advice." },
      { status: 500 }
    );
  }
}
