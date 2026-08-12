import { NextResponse } from "next/server";
import { getGeminiClient, GEMINI_VISION_MODEL } from "@/lib/ai/gemini-client";

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
    const { imageBase64 } = body as { imageBase64?: string };

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { success: false, error: "No image payload provided." },
        { status: 400 }
      );
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `You are Vault-Tec's S.C.A.N. Optical Character Recognition system for Fallout 76.
Analyze this Fallout 76 Pip-Boy, crafting bench, or inventory screenshot.
Extract all visible Fallout 76 1-Star, 2-Star, 3-Star, and 4-Star Legendary Mod names (e.g., "Unyielding", "Bloodied", "Explosive", "VATS Enhanced", "Overeater's", "Powered", "Sentinel's", "Warming", "Arms Keeper's", "Quad", "Anti-armor", "Two Shot", "Vampire's").

Return a valid JSON object matching this schema:
{
  "matchedMods": ["Mod Name 1", "Mod Name 2"],
  "armorType": "Secret Service Armor" or null,
  "special": { "str": 15, "per": 15, "end": 1, "cha": 1, "int": 15, "agi": 15, "lck": 15 } or {}
}
Output ONLY valid raw JSON with no markdown formatting.`;

    const response = await ai.models.generateContent({
      model: GEMINI_VISION_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: 300,
        temperature: 0.2,
      },
    });

    const rawText = response.text?.trim() || "";
    const cleanJsonText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

    let parsed: {
      matchedMods?: string[];
      armorType?: string | null;
      special?: Record<string, number>;
    } = {};

    try {
      parsed = JSON.parse(cleanJsonText);
    } catch {
      console.warn("[Gemini Scan Vision] Raw non-JSON response:", rawText);
    }

    return NextResponse.json({
      success: true,
      matchedMods: parsed.matchedMods || [],
      armorType: parsed.armorType || null,
      special: parsed.special || {},
    });
  } catch (error) {
    console.error("[Gemini Scan Vision AI Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to process screenshot with Gemini Vision." },
      { status: 500 }
    );
  }
}
