export type SpecialCategory = "S" | "P" | "E" | "C" | "I" | "A" | "L" | "LEGENDARY";

export type SpecialTheme = {
  name: string;
  letter: string;
  hex: string;
  border: string;
  text: string;
  badge: string;
  glow: string;
  cardBg: string;
};

/** Official Fallout 76 S.P.E.C.I.A.L. Color Palette (Matching Punch Card Machine) */
export const OFFICIAL_SPECIAL_THEMES: Record<SpecialCategory, SpecialTheme> = {
  S: {
    name: "Strength",
    letter: "S",
    hex: "#4E7A4A",
    border: "border-emerald-500/50 hover:border-emerald-500",
    text: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    glow: "shadow-emerald-950/40",
    cardBg: "bg-emerald-950/40",
  },
  P: {
    name: "Perception",
    letter: "P",
    hex: "#C94A46",
    border: "border-rose-500/50 hover:border-rose-500",
    text: "text-rose-400",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    glow: "shadow-rose-950/40",
    cardBg: "bg-rose-950/40",
  },
  E: {
    name: "Endurance",
    letter: "E",
    hex: "#2B8C96",
    border: "border-cyan-500/50 hover:border-cyan-500",
    text: "text-cyan-400",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    glow: "shadow-cyan-950/40",
    cardBg: "bg-cyan-950/40",
  },
  C: {
    name: "Charisma",
    letter: "C",
    hex: "#DAA520",
    border: "border-amber-500/50 hover:border-amber-500",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    glow: "shadow-amber-950/40",
    cardBg: "bg-amber-950/40",
  },
  I: {
    name: "Intelligence",
    letter: "I",
    hex: "#7A5C99",
    border: "border-purple-500/50 hover:border-purple-500",
    text: "text-purple-400",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    glow: "shadow-purple-950/40",
    cardBg: "bg-purple-950/40",
  },
  A: {
    name: "Agility",
    letter: "A",
    hex: "#E07034",
    border: "border-orange-500/50 hover:border-orange-500",
    text: "text-orange-400",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    glow: "shadow-orange-950/40",
    cardBg: "bg-orange-950/40",
  },
  L: {
    name: "Luck",
    letter: "L",
    hex: "#3B7EA1",
    border: "border-blue-500/50 hover:border-blue-500",
    text: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    glow: "shadow-blue-950/40",
    cardBg: "bg-blue-950/40",
  },
  LEGENDARY: {
    name: "Legendary",
    letter: "★",
    hex: "#F59E0B",
    border: "border-amber-400/80 hover:border-amber-300",
    text: "text-amber-300",
    badge: "bg-amber-400/20 text-amber-200 border-amber-400/50",
    glow: "shadow-amber-900/50",
    cardBg: "bg-amber-950/40",
  },
};
