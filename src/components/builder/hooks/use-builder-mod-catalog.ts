import * as React from "react";
import type { BuilderModDTO } from "@/lib/builder/types";
import { INITIAL_BUILDER_MODS } from "@/lib/builder/legendary-mod-catalog-seeds";
import { BUILDER_SESSION_KEYS } from "@/lib/builder/storage-keys";
import { subscribeProgressChange } from "@/lib/progress-events";

export function useBuilderModCatalog() {
  const [mods, setMods] = React.useState<BuilderModDTO[]>(INITIAL_BUILDER_MODS);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const loadMods = React.useCallback((forceRefresh = false) => {
    const MODS_CACHE_KEY = BUILDER_SESSION_KEYS.modsCache;
    try {
      for (const legacyKey of BUILDER_SESSION_KEYS.legacyModsCaches) {
        sessionStorage.removeItem(legacyKey);
      }
    } catch {
      // Ignore storage errors
    }

    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(MODS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const isValid =
            Array.isArray(parsed) &&
            parsed.length >= 148 &&
            parsed.some((m: BuilderModDTO) => m.slug.includes("pin-pointer")) &&
            parsed.some((m: BuilderModDTO) => m.slug === "rapid") &&
            parsed.some((m: BuilderModDTO) => m.slug === "vital") &&
            parsed.some((m: BuilderModDTO) => m.slug === "vats-optimized");
          if (isValid) {
            setMods(parsed);
            setLoadError(null);
            return;
          }
          sessionStorage.removeItem(MODS_CACHE_KEY);
        }
      } catch {
        // Fall back to fetch on storage error
      }
    }

    fetch("/api/builder/mods?v=69", { cache: "no-cache" })
      .then((r) => r.json() as Promise<{ success?: boolean; data?: { mods?: BuilderModDTO[] } }>)
      .then((body) => {
        const candidate = body?.data?.mods;
        const isValid =
          Array.isArray(candidate) &&
          candidate.length >= 148 &&
          candidate.some((m: BuilderModDTO) => m.slug.includes("pin-pointer")) &&
          candidate.some((m: BuilderModDTO) => m.slug === "rapid") &&
          candidate.some((m: BuilderModDTO) => m.slug === "vital");
        const catalog = isValid ? candidate : INITIAL_BUILDER_MODS;
        setMods(catalog);
        setLoadError(null);
        if (isValid) {
          try {
            sessionStorage.setItem(MODS_CACHE_KEY, JSON.stringify(catalog));
          } catch {
            // Ignore quota errors
          }
        }
      })
      .catch(() => {
        setMods(INITIAL_BUILDER_MODS);
        setLoadError(null);
      });
  }, []);

  React.useEffect(() => {
    loadMods();
  }, [loadMods]);

  React.useEffect(() => {
    return subscribeProgressChange(() => {
      loadMods(true);
    });
  }, [loadMods]);

  return { mods, loadError, reloadMods: loadMods };
}
