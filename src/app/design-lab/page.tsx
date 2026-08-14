"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Palette, 
  Sparkles, 
  Sliders, 
  Monitor, 
  Layers, 
  Check, 
  Copy, 
  ExternalLink,
  Shield,
  Zap,
  Star,
  RefreshCw,
  Search
} from "lucide-react";

type ThemePreset = {
  id: string;
  name: string;
  tagline: string;
  primaryGlow: string;
  accent: string;
  accentHover: string;
  bgDark: string;
  cardBg: string;
  border: string;
  textPrimary: string;
  textMuted: string;
  badgeBg: string;
};

const THEMES: ThemePreset[] = [
  {
    id: "pipboy-green",
    name: "Pip-Boy Green",
    tagline: "Classic Vault-Tec Phosphor CRT",
    primaryGlow: "#10b981",
    accent: "#00ff66",
    accentHover: "#34d399",
    bgDark: "#080c09",
    cardBg: "rgba(14, 24, 17, 0.85)",
    border: "rgba(16, 185, 129, 0.3)",
    textPrimary: "#ecfdf5",
    textMuted: "#6ee7b7",
    badgeBg: "rgba(16, 185, 129, 0.15)"
  },
  {
    id: "new-vegas-amber",
    name: "New Vegas Amber",
    tagline: "Warm Wasteland Tungsten Glow",
    primaryGlow: "#f59e0b",
    accent: "#ffb000",
    accentHover: "#fbbf24",
    bgDark: "#0c0906",
    cardBg: "rgba(26, 19, 11, 0.85)",
    border: "rgba(245, 158, 11, 0.3)",
    textPrimary: "#fffbeb",
    textMuted: "#fcd34d",
    badgeBg: "rgba(245, 158, 11, 0.15)"
  },
  {
    id: "vault-tec-blue",
    name: "Vault-Tec Corporate",
    tagline: "Pre-War Cobalt & Goldenrod",
    primaryGlow: "#0284c7",
    accent: "#facc15",
    accentHover: "#fde047",
    bgDark: "#060b14",
    cardBg: "rgba(11, 23, 42, 0.85)",
    border: "rgba(56, 189, 248, 0.35)",
    textPrimary: "#f0f9ff",
    textMuted: "#93c5fd",
    badgeBg: "rgba(2, 132, 199, 0.2)"
  },
  {
    id: "pipboy-mono",
    name: "Pip-Boy 2000 Mk VI",
    tagline: "Appalachian Monochromatic High-Contrast",
    primaryGlow: "#e2e8f0",
    accent: "#ffffff",
    accentHover: "#f8fafc",
    bgDark: "#09090b",
    cardBg: "rgba(24, 24, 27, 0.9)",
    border: "rgba(255, 255, 255, 0.25)",
    textPrimary: "#fafafa",
    textMuted: "#a1a1aa",
    badgeBg: "rgba(255, 255, 255, 0.1)"
  },
  {
    id: "tactical-slate",
    name: "Tactical Stealth",
    tagline: "Matte Metal & Brushed Slate",
    primaryGlow: "#64748b",
    accent: "#94a3b8",
    accentHover: "#cbd5e1",
    bgDark: "#020617",
    cardBg: "rgba(15, 23, 42, 0.9)",
    border: "rgba(148, 163, 184, 0.2)",
    textPrimary: "#f8fafc",
    textMuted: "#94a3b8",
    badgeBg: "rgba(148, 163, 184, 0.12)"
  }
];

export default function ThemePreviewLabPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(THEMES[0]);
  const [scanlinesOpacity, setScanlinesOpacity] = useState<number>(20);
  const [glowIntensity, setGlowIntensity] = useState<number>(12);
  const [borderRadius, setBorderRadius] = useState<number>(8);
  const [copied, setCopied] = useState<boolean>(false);

  const copyTokens = () => {
    const tokens = `/* ${selectedTheme.name} Theme CSS Tokens */
:root {
  --theme-bg: ${selectedTheme.bgDark};
  --theme-card: ${selectedTheme.cardBg};
  --theme-border: ${selectedTheme.border};
  --theme-accent: ${selectedTheme.accent};
  --theme-glow: ${selectedTheme.primaryGlow};
  --theme-text-main: ${selectedTheme.textPrimary};
  --theme-text-muted: ${selectedTheme.textMuted};
  --theme-badge-bg: ${selectedTheme.badgeBg};
  --theme-border-radius: ${borderRadius}px;
  --theme-glow-size: ${glowIntensity}px;
}`;
    navigator.clipboard.writeText(tokens);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050806] text-white p-4 md:p-8 font-sans">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/40 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Palette className="w-3.5 h-3.5" />
              R.O.L.L. Appearance Studio
            </span>
            <span className="text-xs text-zinc-500 font-mono">Interactive Design Lab</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3 font-mono">
            Site Appearance & Theme Visualizer
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Test and preview live visual themes, CRT scanline intensity, and component styling in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyTokens}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Tokens Copied!" : "Export Theme Tokens"}
          </button>
          <Link
            href="/mods"
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            Return to App
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Preset Selector */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Theme Presets
            </h2>
            <div className="space-y-2.5">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`w-full text-left p-3.5 rounded-lg border transition flex items-center justify-between ${
                    selectedTheme.id === theme.id
                      ? "border-white/40 bg-white/5 shadow-md ring-1 ring-white/20"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.accent, boxShadow: `0 0 8px ${theme.primaryGlow}` }}
                    />
                    <div>
                      <div className="text-sm font-bold text-white font-mono">{theme.name}</div>
                      <div className="text-xs text-zinc-400">{theme.tagline}</div>
                    </div>
                  </div>
                  {selectedTheme.id === theme.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Shader & FX Controls */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Display & Shader Tuning
            </h2>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-zinc-400">CRT Scanline Opacity</span>
                <span className="text-white font-bold">{scanlinesOpacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={scanlinesOpacity}
                onChange={(e) => setScanlinesOpacity(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-zinc-400">Phosphor Glow Radius</span>
                <span className="text-white font-bold">{glowIntensity}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={glowIntensity}
                onChange={(e) => setGlowIntensity(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-zinc-400">Corner Radius</span>
                <span className="text-white font-bold">{borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right Sandbox Container */}
        <div className="lg:col-span-8">
          <div
            className="relative rounded-2xl border p-6 md:p-8 transition-all overflow-hidden shadow-2xl"
            style={{
              backgroundColor: selectedTheme.bgDark,
              borderColor: selectedTheme.border,
              boxShadow: `0 0 ${glowIntensity * 2}px ${selectedTheme.primaryGlow}22`
            }}
          >
            {/* Scanline Overlay */}
            {scanlinesOpacity > 0 && (
              <div
                className="pointer-events-none absolute inset-0 z-10"
                style={{
                  opacity: scanlinesOpacity / 100,
                  backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.75) 50%)",
                  backgroundSize: "100% 4px"
                }}
              />
            )}

            {/* Sandbox Content */}
            <div className="relative z-20 space-y-8">
              {/* Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: selectedTheme.border }}>
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase border"
                    style={{
                      backgroundColor: selectedTheme.badgeBg,
                      borderColor: selectedTheme.border,
                      color: selectedTheme.accent,
                      borderRadius: `${borderRadius}px`
                    }}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    RobCo OS v4.2 // Active Terminal
                  </span>
                  <h3
                    className="text-xl md:text-2xl font-black tracking-tight mt-2 font-mono"
                    style={{
                      color: selectedTheme.textPrimary,
                      textShadow: `0 0 ${glowIntensity}px ${selectedTheme.primaryGlow}88`
                    }}
                  >
                    Appalachian Catalog System
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="px-3 py-1.5 text-xs font-mono border"
                    style={{
                      backgroundColor: selectedTheme.cardBg,
                      borderColor: selectedTheme.border,
                      color: selectedTheme.textMuted,
                      borderRadius: `${borderRadius}px`
                    }}
                  >
                    Status: <span style={{ color: selectedTheme.accent }} className="font-bold">OPTIMIZED</span>
                  </div>
                </div>
              </div>

              {/* Legendary Mod Badges Showcase */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: selectedTheme.textMuted }}>
                  Legendary Mod Tier Badges (1★–4★)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { stars: "1★", name: "Bloodied", desc: "+95% Dmg at low HP" },
                    { stars: "2★", name: "Explosive", desc: "+20% Area Dmg" },
                    { stars: "3★", name: "V.A.T.S. Enhanced", desc: "-25% AP Cost" },
                    { stars: "4★", name: "Conductor's", desc: "+50% Cryo Burst" }
                  ].map((mod, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 border transition-all"
                      style={{
                        backgroundColor: selectedTheme.cardBg,
                        borderColor: selectedTheme.border,
                        borderRadius: `${borderRadius}px`
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="font-mono text-xs font-bold px-1.5 py-0.5"
                          style={{
                            backgroundColor: selectedTheme.badgeBg,
                            color: selectedTheme.accent,
                            borderRadius: `${borderRadius / 2}px`
                          }}
                        >
                          {mod.stars}
                        </span>
                        <Star className="w-3.5 h-3.5" style={{ color: selectedTheme.accent }} />
                      </div>
                      <div className="font-bold text-sm" style={{ color: selectedTheme.textPrimary }}>
                        {mod.name}
                      </div>
                      <div className="text-xs mt-1" style={{ color: selectedTheme.textMuted }}>
                        {mod.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perk Card & Table Row Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Simulated Perk Card */}
                <div
                  className="p-4 border space-y-3"
                  style={{
                    backgroundColor: selectedTheme.cardBg,
                    borderColor: selectedTheme.border,
                    borderRadius: `${borderRadius}px`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold" style={{ color: selectedTheme.accent }}>
                      LUCK // RANK 3/3
                    </span>
                    <span className="text-xs font-mono" style={{ color: selectedTheme.textMuted }}>
                      COST: 3
                    </span>
                  </div>

                  <div
                    className="h-44 border flex items-center justify-center relative overflow-hidden"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderColor: selectedTheme.border,
                      borderRadius: `${borderRadius}px`
                    }}
                  >
                    <Image
                      src="/images/perks_official/fo76-perk-class-freak.svg"
                      alt="Class Freak"
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  </div>

                  <div>
                    <div className="font-bold text-base" style={{ color: selectedTheme.textPrimary }}>
                      Class Freak
                    </div>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: selectedTheme.textMuted }}>
                      The negative effects of your mutations are reduced by 75%.
                    </p>
                  </div>
                </div>

                {/* Simulated Controls & Table */}
                <div className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: selectedTheme.textMuted }} />
                    <input
                      type="text"
                      readOnly
                      value="Search legendary effects or weapon mods..."
                      className="w-full pl-9 pr-4 py-2 text-xs font-mono border bg-black/40 focus:outline-none"
                      style={{
                        borderColor: selectedTheme.border,
                        color: selectedTheme.textPrimary,
                        borderRadius: `${borderRadius}px`
                      }}
                    />
                  </div>

                  {/* Buttons Group */}
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      className="px-4 py-2 text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-md"
                      style={{
                        backgroundColor: selectedTheme.accent,
                        color: selectedTheme.bgDark,
                        borderRadius: `${borderRadius}px`,
                        boxShadow: `0 0 ${glowIntensity}px ${selectedTheme.primaryGlow}66`
                      }}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Primary Action
                    </button>
                    <button
                      className="px-4 py-2 text-xs font-mono font-bold border transition"
                      style={{
                        borderColor: selectedTheme.border,
                        backgroundColor: selectedTheme.cardBg,
                        color: selectedTheme.textPrimary,
                        borderRadius: `${borderRadius}px`
                      }}
                    >
                      Secondary Outline
                    </button>
                    <button
                      className="px-4 py-2 text-xs font-mono font-bold border border-rose-500/40 text-rose-300 bg-rose-950/30 transition"
                      style={{ borderRadius: `${borderRadius}px` }}
                    >
                      Danger Reset
                    </button>
                  </div>

                  {/* Data Rows */}
                  <div
                    className="border p-3 space-y-2 font-mono text-xs"
                    style={{
                      backgroundColor: selectedTheme.cardBg,
                      borderColor: selectedTheme.border,
                      borderRadius: `${borderRadius}px`
                    }}
                  >
                    <div className="flex justify-between border-b pb-1.5" style={{ borderColor: selectedTheme.border }}>
                      <span style={{ color: selectedTheme.textMuted }}>Base Ballistic DPS</span>
                      <span className="font-bold" style={{ color: selectedTheme.accent }}>428.5 / sec</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5" style={{ borderColor: selectedTheme.border }}>
                      <span style={{ color: selectedTheme.textMuted }}>V.A.T.S. Hit Probability</span>
                      <span className="font-bold" style={{ color: selectedTheme.accent }}>95% (Max Cap)</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: selectedTheme.textMuted }}>Armor Penetration</span>
                      <span className="font-bold" style={{ color: selectedTheme.accent }}>+50% (Anti-Armor)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
