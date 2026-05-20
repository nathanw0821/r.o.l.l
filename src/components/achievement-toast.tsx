"use client";

import * as React from "react";
import { Trophy, X, Sparkles } from "lucide-react";
import { AchievementDefinition } from "@/lib/achievements";

export type ToastItem = {
  id: string;
  achievement: AchievementDefinition;
};

export function AchievementToast({ 
  achievement, 
  onClose 
}: { 
  achievement: AchievementDefinition;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="group relative w-full max-w-[320px] overflow-hidden rounded-xl border border-accent/40 bg-panel/95 p-4 shadow-2xl backdrop-blur-md animate-achievement-in">
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(255,255,255,1)_1px,rgba(255,255,255,1)_2px)]" />
      
      {/* Glow Header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
      
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
          {achievement.group === "easterEgg" ? (
            <Sparkles className="h-6 w-6 animate-pulse" />
          ) : (
            <Trophy className="h-6 w-6" />
          )}
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] font-bold uppercase tracking-[0.2em] text-accent">
              Achievement Unlocked
            </span>
            <button 
              onClick={onClose}
              className="rounded-full p-1 text-foreground/40 hover:bg-foreground/5 hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          
          <h4 className="font-vt323 text-lg leading-none tracking-tight text-foreground">
            {achievement.name}
          </h4>
          
          <p className="text-xs text-foreground/60 leading-tight">
            {achievement.description}
          </p>
        </div>
      </div>
      
      {/* Progress Bar (Visual only) */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-accent/30 animate-achievement-progress" />
    </div>
  );
}
