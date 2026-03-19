"use client";

import * as React from "react";
import { type SelectionSource } from "@/lib/filter-utils";
import { usePersistentFilters } from "@/components/use-persistent-filters";

type StatusFilter = "locked" | "unlocked";

type FilterContextValue = {
  query: string;
  setQuery: (value: string) => void;
  sourceFilters: SelectionSource[];
  setSourceFilters: React.Dispatch<React.SetStateAction<SelectionSource[]>>;
  statusFilters: StatusFilter[];
  setStatusFilters: React.Dispatch<React.SetStateAction<StatusFilter[]>>;
  originFilters: string[];
  setOriginFilters: React.Dispatch<React.SetStateAction<string[]>>;
  categoryFilters: string[];
  setCategoryFilters: React.Dispatch<React.SetStateAction<string[]>>;
  originOptions: string[];
  setOriginOptions: (options: string[]) => void;
  clearFilters: () => void;
  toggleSource: (value: SelectionSource) => void;
  toggleStatus: (value: StatusFilter) => void;
  toggleOrigin: (value: string) => void;
  toggleCategory: (value: string) => void;
};

const FilterContext = React.createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const {
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
  } = usePersistentFilters("roll.filters.v1");
  const [originOptions, setOriginOptions] = React.useState<string[]>([]);

  const toggleSource = React.useCallback((value: SelectionSource) => {
    setSourceFilters((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }, [setSourceFilters]);

  const toggleStatus = React.useCallback((value: StatusFilter) => {
    setStatusFilters((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }, [setStatusFilters]);

  const toggleOrigin = React.useCallback((value: string) => {
    setOriginFilters((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }, [setOriginFilters]);

  const toggleCategory = React.useCallback((value: string) => {
    setCategoryFilters((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }, [setCategoryFilters]);

  const value = React.useMemo(
    () => ({
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
      originOptions,
      setOriginOptions,
      clearFilters,
      toggleSource,
      toggleStatus,
      toggleOrigin,
      toggleCategory
    }),
    [
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
      originOptions,
      clearFilters,
      toggleSource,
      toggleStatus,
      toggleOrigin,
      toggleCategory
    ]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const context = React.useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
}
