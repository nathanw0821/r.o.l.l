"use client";

import * as React from "react";
import { type SelectionSource } from "@/lib/filter-utils";

type StatusFilter = "locked" | "unlocked";

type StoredFilters = {
  query: string;
  sources: SelectionSource[];
  status: StatusFilter[];
  origins: string[];
  categories: string[];
};

const defaultFilters: StoredFilters = {
  query: "",
  sources: [],
  status: [],
  origins: [],
  categories: []
};

const sourceSet = new Set<SelectionSource>(["default", "imported", "edited"]);
const statusSet = new Set<StatusFilter>(["locked", "unlocked"]);

function sanitizeStored(input: unknown): StoredFilters {
  if (!input || typeof input !== "object") return defaultFilters;
  const data = input as Partial<StoredFilters>;
  const query = typeof data.query === "string" ? data.query : "";
  const sources = Array.isArray(data.sources)
    ? data.sources.filter((value): value is SelectionSource => sourceSet.has(value as SelectionSource))
    : [];
  const status = Array.isArray(data.status)
    ? data.status.filter((value): value is StatusFilter => statusSet.has(value as StatusFilter))
    : [];
  const origins = Array.isArray(data.origins)
    ? data.origins.filter((value) => typeof value === "string" && value.trim().length > 0)
    : [];
  const categories = Array.isArray(data.categories)
    ? data.categories.filter((value) => typeof value === "string" && value.trim().length > 0)
    : [];

  return { query, sources, status, origins, categories };
}

export function usePersistentFilters(storageKey: string) {
  const [query, setQuery] = React.useState(defaultFilters.query);
  const [sourceFilters, setSourceFilters] = React.useState<SelectionSource[]>(defaultFilters.sources);
  const [statusFilters, setStatusFilters] = React.useState<StatusFilter[]>(defaultFilters.status);
  const [originFilters, setOriginFilters] = React.useState<string[]>(defaultFilters.origins);
  const [categoryFilters, setCategoryFilters] = React.useState<string[]>(defaultFilters.categories);
  const hasLoaded = React.useRef(false);

  React.useEffect(() => {
    if (hasLoaded.current) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = sanitizeStored(JSON.parse(raw));
      setQuery(parsed.query);
      setSourceFilters(parsed.sources);
      setStatusFilters(parsed.status);
      setOriginFilters(parsed.origins);
      setCategoryFilters(parsed.categories);
    } catch {
      // ignore malformed storage
    } finally {
      hasLoaded.current = true;
    }
  }, [storageKey]);

  React.useEffect(() => {
    if (!hasLoaded.current) return;
    const payload: StoredFilters = {
      query,
      sources: sourceFilters,
      status: statusFilters,
      origins: originFilters,
      categories: categoryFilters
    };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }, [storageKey, query, sourceFilters, statusFilters, originFilters, categoryFilters]);

  function clearFilters() {
    setQuery("");
    setSourceFilters([]);
    setStatusFilters([]);
    setOriginFilters([]);
    setCategoryFilters([]);
  }

  return {
    query,
    setQuery,
    sourceFilters,
    setSourceFilters,
    statusFilters,
    setStatusFilters,
    originFilters,
    setOriginFilters,
    categoryFilters,
    setCategoryFilters,
    clearFilters
  };
}
