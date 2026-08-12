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

/** Official Fallout 76 S.P.E.C.I.A.L. Color Palette (Matching Nukes & Dragons / In-Game Punch Card Machine) */
export const OFFICIAL_SPECIAL_THEMES: Record<SpecialCategory, SpecialTheme> = {
  S: {
    name: "Strength",
    letter: "S",
    hex: "#749B85", // Muted Sage Green
    border: "border-[#749B85]/60 hover:border-[#749B85]",
    text: "text-[#8BB39D]",
    badge: "bg-[#749B85]/20 text-[#8BB39D] border-[#749B85]/40",
    glow: "shadow-[#749B85]/30",
    cardBg: "bg-[#749B85]/20",
  },
  P: {
    name: "Perception",
    letter: "P",
    hex: "#877B56", // Muted Olive Brown
    border: "border-[#877B56]/60 hover:border-[#877B56]",
    text: "text-[#9E916B]",
    badge: "bg-[#877B56]/20 text-[#9E916B] border-[#877B56]/40",
    glow: "shadow-[#877B56]/30",
    cardBg: "bg-[#877B56]/20",
  },
  E: {
    name: "Endurance",
    letter: "E",
    hex: "#4A8FA1", // Steel Blue
    border: "border-[#4A8FA1]/60 hover:border-[#4A8FA1]",
    text: "text-[#63A7B9]",
    badge: "bg-[#4A8FA1]/20 text-[#63A7B9] border-[#4A8FA1]/40",
    glow: "shadow-[#4A8FA1]/30",
    cardBg: "bg-[#4A8FA1]/20",
  },
  C: {
    name: "Charisma",
    letter: "C",
    hex: "#C89053", // Ochre Gold / Warm Amber
    border: "border-[#C89053]/60 hover:border-[#C89053]",
    text: "text-[#DFA76A]",
    badge: "bg-[#C89053]/20 text-[#DFA76A] border-[#C89053]/40",
    glow: "shadow-[#C89053]/30",
    cardBg: "bg-[#C89053]/20",
  },
  I: {
    name: "Intelligence",
    letter: "I",
    hex: "#7E8B75", // Muted Military Green
    border: "border-[#7E8B75]/60 hover:border-[#7E8B75]",
    text: "text-[#95A28C]",
    badge: "bg-[#7E8B75]/20 text-[#95A28C] border-[#7E8B75]/40",
    glow: "shadow-[#7E8B75]/30",
    cardBg: "bg-[#7E8B75]/20",
  },
  A: {
    name: "Agility",
    letter: "A",
    hex: "#C88F7F", // Terracotta Coral-Pink
    border: "border-[#C88F7F]/60 hover:border-[#C88F7F]",
    text: "text-[#DFA696]",
    badge: "bg-[#C88F7F]/20 text-[#DFA696] border-[#C88F7F]/40",
    glow: "shadow-[#C88F7F]/30",
    cardBg: "bg-[#C88F7F]/20",
  },
  L: {
    name: "Luck",
    letter: "L",
    hex: "#928BA8", // Soft Lavender / Violet-Gray
    border: "border-[#928BA8]/60 hover:border-[#928BA8]",
    text: "text-[#A8A1BE]",
    badge: "bg-[#928BA8]/20 text-[#A8A1BE] border-[#928BA8]/40",
    glow: "shadow-[#928BA8]/30",
    cardBg: "bg-[#928BA8]/20",
  },
  LEGENDARY: {
    name: "Legendary",
    letter: "★",
    hex: "#F59E0B", // Bright Amber Gold
    border: "border-amber-400/80 hover:border-amber-300",
    text: "text-amber-300",
    badge: "bg-amber-400/20 text-amber-200 border-amber-400/50",
    glow: "shadow-amber-900/50",
    cardBg: "bg-amber-950/40",
  },
};
