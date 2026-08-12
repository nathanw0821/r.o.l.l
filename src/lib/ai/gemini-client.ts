import { GoogleGenAI } from "@google/genai";

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[Gemini AI] GEMINI_API_KEY is not set.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Low-token, high-speed default models
export const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash-lite";
export const GEMINI_VISION_MODEL = "gemini-2.5-flash";
