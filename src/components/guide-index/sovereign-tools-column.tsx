"use client";

import * as React from "react";
import Link from "next/link";
import { Cpu, BookOpen, Boxes, ArrowRight } from "lucide-react";
import CombatMathTool from "@/components/guide-index/combat-math-tool";
import IrisBuildAuditor from "@/components/guide-index/iris-build-auditor";

export default function SovereignToolsColumn() {
  return (
    <div className="flex flex-col gap-4 font-mono">
      {/* Column Header & Data Locality Framing */}
      <div className="rounded-xl border border-cyan-500/40 bg-panel/90 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Item Database & Custom Tools
            </h2>
          </div>
          <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-3xs font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/30">
            Sovereign Core
          </span>
        </div>
        <p className="mt-2 text-2xs text-foreground/70 leading-relaxed font-sans">
          Absolute data locality. Proprietary internal calculation engines and localized build
          auditing running 100% client-side with zero external data dependencies or scraped pipelines.
        </p>

        {/* Quick Links to Internal Core Features */}
        <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-2 gap-2 text-3xs">
          <Link
            href="/wiki/glossary"
            className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 p-2 text-foreground/80 hover:border-cyan-400 hover:text-cyan-300 transition"
          >
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
              <span>Mechanics Glossary</span>
            </div>
            <ArrowRight className="h-3 w-3 text-cyan-400" />
          </Link>

          <Link
            href="/build"
            className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 p-2 text-foreground/80 hover:border-cyan-400 hover:text-cyan-300 transition"
          >
            <div className="flex items-center gap-1.5">
              <Boxes className="h-3.5 w-3.5 text-amber-400" />
              <span>B.U.I.L.D. Sandbox</span>
            </div>
            <ArrowRight className="h-3 w-3 text-amber-400" />
          </Link>
        </div>
      </div>

      {/* Internal Tool 1: Clean-room Combat Formula Calculator */}
      <CombatMathTool />

      {/* Internal Tool 2: Iris Build Auditor UI Staging Layer */}
      <IrisBuildAuditor />
    </div>
  );
}
