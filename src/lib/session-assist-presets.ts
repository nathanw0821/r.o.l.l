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
    description: "Use the screenshot as a reference and confirm unlocks yourself.",
    windowSubtitle: "Use the screenshot as a reference while you confirm unlocks yourself. Nothing is auto-detected or auto-saved.",
    checklistHint: "Best for steady manual entry while you compare the screenshot and shortlist side by side.",
    aiTitle: "Optional AI review",
    aiButton: "Suggest From Screenshot",
    analysisGuidance: "Be extremely conservative. Prefer no suggestion over a weak guess."
  },
  session: {
    label: "New Unlock Sweep",
    shortLabel: "Session Sweep",
    description: "Focus on still-locked effects and log what changed this session.",
    windowSubtitle: "Keep this open during a farming session and use it to confirm only the unlocks you just picked up.",
    checklistHint: "Best for post-run cleanup. Keep still-locked effects visible and save only clear new unlocks.",
    aiTitle: "Optional AI sweep",
    aiButton: "Review Session Screenshot",
    analysisGuidance: "Focus on likely newly unlocked entries from the filtered shortlist. Stay conservative."
  },
  ai: {
    label: "AI Suggestions",
    shortLabel: "AI Suggestions",
    description: "Bring your own OpenAI key for shortlist suggestions that still require review.",
    windowSubtitle: "Use your own OpenAI key for suggestion-only review. You still confirm every unlock before saving.",
    checklistHint: "Best when you have a tight shortlist and want help spotting likely matches before manual confirmation.",
    aiTitle: "AI suggestion pass",
    aiButton: "Suggest Likely Matches",
    analysisGuidance: "Return only strong shortlist matches. Include concise reasons and avoid overcalling uncertain items."
  }
};
