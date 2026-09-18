/**
 * Major-update filter chips on /wiki (`?update=<id>`). Moved out of `src/app/wiki/page.tsx`
 * unchanged so the entity link map (`src/lib/links/entity-links.ts`) can link update names
 * to `/wiki?update=<id>` from the same list (Next page files may not export extra names).
 */
export const UPDATE_PATCHES: ReadonlyArray<{ id: string; label: string }> = [
  { id: "all", label: "All Major Updates" },
  { id: "the-pitt", label: "The Pitt (Expedition 1)" },
  { id: "atlantic-city", label: "Atlantic City (Expedition 2)" },
  { id: "skyline-valley", label: "Skyline Valley" },
  { id: "milepost-zero", label: "Milepost Zero" },
  { id: "backwoods", label: "Backwoods 2026" },
  { id: "burning-springs", label: "Burning Springs" },
  { id: "the-slasher", label: "The Slasher (Patch 70, Sep 2026)" },
  { id: "nuka-world", label: "Nuka-World on Tour" },
  { id: "invaders", label: "Invaders from Beyond" },
];

export const UPDATE_PATCH_IDS: ReadonlySet<string> = new Set(UPDATE_PATCHES.map((p) => p.id));
