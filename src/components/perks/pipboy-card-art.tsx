"use client";

import * as React from "react";
import { SpecialCategory } from "@/lib/perks/catalog";
import {
  Dumbbell,
  Eye,
  Heart,
  Users,
  Brain,
  Zap,
  Star,
  ShieldAlert,
  Skull,
  Dna,
  FlaskConical,
  Wrench,
  Shield,
  Crosshair,
  Bomb,
  Battery,
  Pill,
  Crown,
  Lock,
  Flame,
  Radio,
  Sparkles,
  Sword,
  Footprints,
  Compass,
  Beef,
  Coffee,
  Package,
  Layers,
  Sparkle,
  ZapOff,
  Cross,
  Target,
  Hammer,
  RotateCcw,
  Gauge,
  Key,
} from "lucide-react";

interface PipBoyCardArtProps {
  special: SpecialCategory;
  name: string;
  className?: string;
}

export default function PipBoyCardArt({ special, name, className = "" }: PipBoyCardArtProps) {
  const normName = name.toLowerCase().trim();

  // Smart Icon Resolution based on card name & keywords
  const renderSpecificIcon = () => {
    // 1. Specific High-Profile Card Matches
    if (normName.includes("bloody mess")) return <Skull className="h-10 w-10 text-red-500 drop-shadow-md" />;
    if (normName.includes("starched genes") || normName.includes("class freak")) return <Dna className="h-10 w-10 text-emerald-400 drop-shadow-md" />;
    if (normName.includes("nerd rage")) return <Flame className="h-10 w-10 text-rose-500 drop-shadow-md" />;
    if (normName.includes("adrenaline")) return <Zap className="h-10 w-10 text-purple-400 drop-shadow-md" />;
    if (normName.includes("lone wanderer")) return <Compass className="h-10 w-10 text-amber-400 drop-shadow-md" />;
    if (normName.includes("mad scientist") || normName.includes("chemist")) return <FlaskConical className="h-10 w-10 text-cyan-400 drop-shadow-md" />;
    if (normName.includes("lucky break") || normName.includes("luck of the draw")) return <Wrench className="h-10 w-10 text-amber-400 drop-shadow-md" />;
    if (normName.includes("master infiltrator") || normName.includes("lockpick") || normName.includes("hacker")) return <Lock className="h-10 w-10 text-yellow-400 drop-shadow-md" />;
    if (normName.includes("commando") || normName.includes("rifleman") || normName.includes("concentrated fire")) return <Crosshair className="h-10 w-10 text-red-400 drop-shadow-md" />;
    if (normName.includes("heavy gunner") || normName.includes("demolition")) return <Bomb className="h-10 w-10 text-orange-400 drop-shadow-md" />;
    if (normName.includes("fireproof")) return <Shield className="h-10 w-10 text-orange-400 drop-shadow-md" />;
    if (normName.includes("super duper")) return <Sparkles className="h-10 w-10 text-amber-300 drop-shadow-md" />;
    if (normName.includes("batteries included")) return <Battery className="h-10 w-10 text-blue-400 drop-shadow-md" />;
    if (normName.includes("pharmacy") || normName.includes("stimpak") || normName.includes("first aid")) return <Pill className="h-10 w-10 text-emerald-400 drop-shadow-md" />;
    if (normName.includes("cola nut")) return <Coffee className="h-10 w-10 text-red-400 drop-shadow-md" />;
    if (normName.includes("cannibal") || normName.includes("carnivore")) return <Beef className="h-10 w-10 text-amber-500 drop-shadow-md" />;
    if (normName.includes("action boy") || normName.includes("action girl") || normName.includes("marathoner")) return <Footprints className="h-10 w-10 text-purple-400 drop-shadow-md" />;
    if (normName.includes("inspirational") || normName.includes("magnetic personality")) return <Crown className="h-10 w-10 text-yellow-300 drop-shadow-md" />;
    if (normName.includes("gunsmith") || normName.includes("armorer") || normName.includes("fixer")) return <Hammer className="h-10 w-10 text-slate-300 drop-shadow-md" />;

    // 2. Keyword Fallbacks
    if (normName.includes("shotgun") || normName.includes("pistol") || normName.includes("gun")) return <Target className="h-10 w-10 text-red-400 drop-shadow-md" />;
    if (normName.includes("melee") || normName.includes("sword") || normName.includes("fist")) return <Sword className="h-10 w-10 text-amber-400 drop-shadow-md" />;
    if (normName.includes("armor") || normName.includes("shield") || normName.includes("resist")) return <Shield className="h-10 w-10 text-blue-400 drop-shadow-md" />;
    if (normName.includes("rad") || normName.includes("ghoul") || normName.includes("mutation")) return <Dna className="h-10 w-10 text-lime-400 drop-shadow-md" />;
    if (normName.includes("weight") || normName.includes("pack") || normName.includes("bandolier")) return <Package className="h-10 w-10 text-amber-500 drop-shadow-md" />;

    // 3. SPECIAL Category Default Icon
    switch (special) {
      case "S":
        return <Dumbbell className="h-10 w-10 text-amber-400 drop-shadow-md" />;
      case "P":
        return <Eye className="h-10 w-10 text-cyan-400 drop-shadow-md" />;
      case "E":
        return <Heart className="h-10 w-10 text-emerald-400 drop-shadow-md" />;
      case "C":
        return <Users className="h-10 w-10 text-yellow-400 drop-shadow-md" />;
      case "I":
        return <Brain className="h-10 w-10 text-indigo-400 drop-shadow-md" />;
      case "A":
        return <Zap className="h-10 w-10 text-purple-400 drop-shadow-md" />;
      case "L":
        return <Star className="h-10 w-10 text-amber-300 drop-shadow-md" />;
      case "LEGENDARY":
        return <ShieldAlert className="h-10 w-10 text-amber-400 drop-shadow-md" />;
      default:
        return <Star className="h-10 w-10 text-amber-400 drop-shadow-md" />;
    }
  };

  return (
    <div className={`relative w-full h-full rounded-lg bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center p-2 overflow-hidden ${className}`}>
      {/* Pip-Boy Terminal Radar Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px] opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-black/40 pointer-events-none" />

      {/* Center Icon & Unique Card Badge */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-1 group-hover:scale-105 transition-transform duration-200">
        <div className="p-2 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner">
          {renderSpecificIcon()}
        </div>
        <span className="text-[0.62rem] font-black uppercase font-mono tracking-widest text-amber-400/90 text-center truncate max-w-[140px]">
          {name}
        </span>
        <span className="text-[0.55rem] font-mono uppercase text-slate-500 tracking-wider">
          VAULT-TEC SPEC · {special}
        </span>
      </div>
    </div>
  );
}
