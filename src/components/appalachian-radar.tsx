"use client";

import gameVersion from "@/data/truth/game-version.json";
import * as React from "react";
import { Radio, Copy, Check, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import type { MinervaIntel, NukeCodes } from "@/lib/discord/vault-intel";

interface RadarPayload {
  nukeCodes: NukeCodes;
  minerva: MinervaIntel;
  resets: {
    noonResetUnix: number;
    eveningResetUnix: number;
    resetUtcHour?: number;
  };
  timestamp: number;
}

function formatCountdown(targetUnix: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, targetUnix - now);
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  const secs = diff % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${mins}m`;
  }
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function AppalachianRadar() {
  const [data, setData] = React.useState<RadarPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [copiedSilo, setCopiedSilo] = React.useState<string | null>(null);
  // Phones start collapsed (one header row) so the first screen shows the tracker; one tap opens it.
  // Only used after the fetch, and the server always renders the loading state, so no hydration mismatch.
  const [isExpanded, setIsExpanded] = React.useState(
    () => typeof window === "undefined" || window.matchMedia("(min-width: 768px)").matches
  );
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/radar")
      .then((res) => res.json())
      .then((raw) => {
        const payload = raw as { success?: boolean; data?: RadarPayload } | null;
        if (mounted && payload?.success && payload.data) {
          setData(payload.data);
        }
      })
      .catch((err) => console.warn("[radar] Failed to fetch radar data:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 1-second interval for real-time countdown clocks
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (silo: string, code: string) => {
    navigator.clipboard.writeText(code.replace(/\s+/g, ""));
    setCopiedSilo(silo);
    setTimeout(() => setCopiedSilo(null), 2500);
  };

  if (loading) {
    // Same footprint as the loaded panel (header row; on md+ also the expanded body) so nothing
    // below it jumps when the timers arrive.
    return (
      <div className="w-full rounded-xl border border-emerald-500/30 bg-gradient-to-b from-[#08120d] to-[#040806] font-mono overflow-hidden" aria-busy="true">
        <div className="px-4 py-3 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-400/70">
          <Radio className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
          <span>Loading live game timers…</span>
        </div>
        <div className="hidden md:block h-[200px]" aria-hidden="true" />
      </div>
    );
  }

  if (!data) return null;

  const { minerva, nukeCodes, resets } = data;
  const isMinervaActive = minerva.status !== "traveling";

  return (
    <div className="w-full rounded-xl border border-emerald-500/30 bg-gradient-to-b from-[#08120d] to-[#040806] shadow-[0_0_20px_rgba(16,185,129,0.08)] font-mono overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            Live game timers
          </span>
          <span className="hidden sm:inline-block text-2xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            PATCH {gameVersion.patch} LIVE INTEL
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="text-xs text-emerald-400/80 hover:text-emerald-200 flex min-h-6 items-center gap-1 transition font-bold"
        >
          {isExpanded ? (
            <>
              <span className="sr-only sm:not-sr-only">Minimize</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span className="sr-only sm:not-sr-only">Expand Intel</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Expandable Content Grid */}
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-in fade-in duration-200">
          {/* Card 1: Minerva Radar */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3.5 flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-2xs uppercase tracking-widest text-emerald-400/80 font-bold flex items-center gap-1">
                🎪 Minerva Radar
              </span>
              <span
                className={`text-3xs px-2 py-0.5 rounded-full font-bold border ${
                  isMinervaActive
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/40"
                }`}
              >
                {isMinervaActive ? "OPEN FOR BUSINESS" : "EN ROUTE"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-200 font-bold">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{minerva.location}</span>
              </div>
              <p className="text-2xs text-slate-400">
                {minerva.saleType} • 25% Bullion Discount
              </p>
            </div>

            <div className="pt-1.5 border-t border-emerald-500/15 flex items-center justify-between text-2xs">
              <span className="text-slate-400">{minerva.nextEventLabel}:</span>
              <span className="font-bold text-emerald-300">
                {formatCountdown(minerva.nextEventUnix)}
              </span>
            </div>
          </div>

          {/* Card 2: Weekly Decrypted Silo Codes */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3.5 flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-2xs uppercase tracking-widest text-emerald-400/80 font-bold flex items-center gap-1">
                🚀 Silo Launch Codes
              </span>
              <span className="text-3xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                DECRYPTED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { name: "Alpha", code: nukeCodes.alpha },
                { name: "Bravo", code: nukeCodes.bravo },
                { name: "Charlie", code: nukeCodes.charlie },
              ].map((silo) => {
                const isCopied = copiedSilo === silo.name;
                return (
                  <button
                    key={silo.name}
                    type="button"
                    onClick={() => handleCopyCode(silo.name, silo.code)}
                    title={`Click to copy ${silo.name} code (${silo.code})`}
                    className="p-1.5 rounded bg-[#0b1610] hover:bg-[#122319] border border-emerald-500/30 hover:border-emerald-400 transition flex flex-col items-center justify-center text-center group"
                  >
                    <span className="text-3xs text-emerald-400/70 font-semibold uppercase">{silo.name}</span>
                    <span className="text-xs font-bold text-slate-200 mt-0.5 group-hover:text-emerald-300">
                      {silo.code}
                    </span>
                    <span className="mt-1 text-3xs text-slate-400 flex items-center gap-0.5">
                      {isCopied ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5 opacity-50" />}
                      {isCopied ? "Copied" : "Copy"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-1.5 border-t border-emerald-500/15 flex items-center justify-between text-2xs">
              <span className="text-slate-400">Next Code Reset:</span>
              <span className="font-bold text-emerald-300">
                {formatCountdown(nukeCodes.resetUnix)}
              </span>
            </div>
          </div>

          {/* Card 3: Appalachian Reset Timers */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3.5 flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-2xs uppercase tracking-widest text-emerald-400/80 font-bold flex items-center gap-1">
                ⏱️ Daily Resets Clock
              </span>
              <span className="text-3xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                {resets.resetUtcHour ?? 17}:00 UTC
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-2xs">Vendor Caps &amp; Scrip:</span>
                <span className="font-bold text-amber-300">
                  {formatCountdown(resets.noonResetUnix)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-2xs">Daily Challenges:</span>
                <span className="font-bold text-amber-300">
                  {formatCountdown(resets.noonResetUnix)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-2xs">Faction Dailies (00:00 UTC):</span>
                <span className="font-bold text-emerald-300">
                  {formatCountdown(resets.eveningResetUnix)}
                </span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-emerald-500/15 flex items-center justify-between text-2xs">
              <span className="text-slate-400">Server Standard:</span>
              <span className="text-slate-300">Daily Global Refresh</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
