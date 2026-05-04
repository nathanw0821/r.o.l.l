"use client";

import type { AchievementDefinition } from "@/lib/achievements";

type AchievementEvent = {
  achievement: AchievementDefinition;
};

type AchievementListener = (event: AchievementEvent) => void;

const listeners = new Set<AchievementListener>();

export function subscribeToAchievements(listener: AchievementListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitAchievementUnlocked(achievement: AchievementDefinition) {
  listeners.forEach((listener) => listener({ achievement }));
}
