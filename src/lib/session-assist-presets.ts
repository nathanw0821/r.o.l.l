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
    description: "Manual checklist; you look and tick.",
    windowSubtitle: "Manual checklist beside your screenshot.",
    checklistHint: "Default: compare image to the list.",
    aiTitle: "OCR matched",
    aiButton: "Run Tesseract Scan",
    analysisGuidance: "Standard scan for matching mod names."
  },
  session: {
    label: "New Unlock Sweep",
    shortLabel: "Session Sweep",
    description: "Optimized for confirming new drops.",
    windowSubtitle: "Quick pass for new drops this session.",
    checklistHint: "Filter to locked; confirm obvious unlocks.",
    aiTitle: "OCR sweep",
    aiButton: "Scan For Unlocks",
    analysisGuidance: "Focus on likely new unlocks in the shortlist."
  },
  ai: {
    label: "OCR Discovery",
    shortLabel: "OCR Discovery",
    description: "Scan & auto-select in multiple languages.",
    windowSubtitle: "OCR suggests from a tight shortlist only.",
    checklistHint: "Narrow the list first for best results.",
    aiTitle: "Multi-language scan",
    aiButton: "Recognize Matches",
    analysisGuidance: "Extract mod names from the screenshot using the selected OCR language."
  }
};
