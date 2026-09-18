import season from "@/data/truth/season.json";

export type SeasonPreference = "auto" | "on" | "off";
export const SEASON_KEY = "roll-season";
export const SEASON_LOOK = season.event.seasonalLook; // "blood-moon"

function dayUtc(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

/** True while the seasonal event window is open (UTC days, end inclusive). */
export function isSeasonWindowOpen(now: Date = new Date()): boolean {
  const t = now.getTime();
  return t >= dayUtc(season.event.start) && t < dayUtc(season.event.end) + 24 * 60 * 60 * 1000;
}

/** Resolves the html data-season attribute value ("" when the look is off). */
export function resolveSeasonAttribute(pref: SeasonPreference, now: Date = new Date()): string {
  if (pref === "on") return SEASON_LOOK;
  if (pref === "off") return "";
  return isSeasonWindowOpen(now) ? SEASON_LOOK : "";
}

/** The current event phase, or null outside the window. */
export function currentEventPhase(now: Date = new Date()) {
  if (!isSeasonWindowOpen(now)) return null;
  const t = now.getTime();
  const phases = season.event.phases;
  let current = phases[0];
  for (const p of phases) if (t >= dayUtc(p.start)) current = p;
  return { ...current, event: season.event.name, end: season.event.end, seasonNumber: season.season.number, seasonName: season.season.name };
}
