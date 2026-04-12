export const ASSIST_PRESETS = ["manual", "session", "ai"] as const;

export type AssistPreset = (typeof ASSIST_PRESETS)[number];

export const assistPresetContent: Record<
  AssistPreset,
  {
    label: string;
    shortLabel: string;
    description: string;
    windowSubtitle: string;
    checklistHint: string;
    aiTitle: string;
    aiButton: string;
    analysisGuidance: string;
  }
> = {
  manual: {
    label: "Manual Review",
    shortLabel: "Manual",
    description: "You tick matches; no automation.",
    windowSubtitle: "Manual checklist beside your screenshot.",
    checklistHint: "Default: compare image to the list.",
    aiTitle: "Optional AI review",
    aiButton: "Suggest From Screenshot",
    analysisGuidance: "Be extremely conservative. Prefer no suggestion over a weak guess."
  },
  session: {
    label: "New Unlock Sweep",
    shortLabel: "Session Sweep",
    description: "Still-locked first; after a run.",
    windowSubtitle: "Quick pass for new drops this session.",
    checklistHint: "Filter to locked; confirm obvious unlocks.",
    aiTitle: "Optional AI sweep",
    aiButton: "Review Session Screenshot",
    analysisGuidance: "Focus on likely new unlocks in the shortlist. Stay conservative."
  },
  ai: {
    label: "AI Suggestions",
    shortLabel: "AI Suggestions",
    description: "BYO OpenAI key; you still confirm saves.",
    windowSubtitle: "AI suggests from a tight shortlist only.",
    checklistHint: "Narrow the list first for best results.",
    aiTitle: "AI suggestion pass",
    aiButton: "Suggest Likely Matches",
    analysisGuidance: "Return only strong shortlist matches. Include concise reasons and avoid overcalling uncertain items."
  }
};
