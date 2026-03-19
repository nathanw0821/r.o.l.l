"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { type SelectionSource } from "@/lib/filter-utils";

const sourceOptions: { value: SelectionSource; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "imported", label: "Imported" },
  { value: "edited", label: "Edited" }
];

const statusOptions: { value: "locked" | "unlocked"; label: string }[] = [
  { value: "unlocked", label: "Unlocked" },
  { value: "locked", label: "Locked" }
];

type FilterBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  sourceFilters: SelectionSource[];
  onToggleSource: (value: SelectionSource) => void;
  statusFilters: ("locked" | "unlocked")[];
  onToggleStatus: (value: "locked" | "unlocked") => void;
  originFilters: string[];
  onToggleOrigin: (value: string) => void;
  originOptions: string[];
  onClear: () => void;
};

function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  emptyLabel
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  emptyLabel?: string;
}) {
  const count = selected.length;
  return (
    <details className="relative">
      <summary
        className={cn(
          "list-none cursor-pointer rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-xs",
          "inline-flex items-center gap-2 text-foreground/70 hover:border-accent"
        )}
      >
        <span className="text-foreground">{label}</span>
        {count > 0 ? <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-black">{count}</span> : null}
      </summary>
      <div className="absolute left-0 z-20 mt-2 w-56 rounded-[var(--radius)] border border-border bg-panel p-2 shadow-lg">
        {options.length === 0 ? (
          <div className="px-2 py-1 text-xs text-foreground/60">{emptyLabel ?? "No options"}</div>
        ) : (
          <div className="space-y-1">
            {options.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-panel/70">
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => onToggle(option.value)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

export default function FilterBar({
  query,
  onQueryChange,
  sourceFilters,
  onToggleSource,
  statusFilters,
  onToggleStatus,
  originFilters,
  onToggleOrigin,
  originOptions,
  onClear
}: FilterBarProps) {
  const hasActiveFilters =
    query.trim().length > 0 ||
    sourceFilters.length > 0 ||
    statusFilters.length > 0 ||
    originFilters.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search effects, tiers, categories, or origins"
          className="w-full rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm md:max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Source"
            options={sourceOptions}
            selected={sourceFilters}
            onToggle={(value) => onToggleSource(value as SelectionSource)}
          />
          <FilterDropdown
            label="Status"
            options={statusOptions}
            selected={statusFilters}
            onToggle={(value) => onToggleStatus(value as "locked" | "unlocked")}
          />
          <FilterDropdown
            label="Origin"
            options={originOptions.map((origin) => ({ value: origin, label: origin }))}
            selected={originFilters}
            onToggle={(value) => onToggleOrigin(value)}
            emptyLabel="No origins detected"
          />
          <button
            type="button"
            onClick={onClear}
            disabled={!hasActiveFilters}
            className={cn(
              "rounded-[var(--radius)] border border-border px-3 py-2 text-xs transition",
              hasActiveFilters
                ? "text-foreground/70 hover:border-accent"
                : "text-foreground/40 opacity-60"
            )}
          >
            Clear
          </button>
        </div>
      </div>
      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
          {query.trim().length > 0 ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="rounded-full border border-border px-2 py-0.5 hover:border-accent"
            >
              Search: {query} x
            </button>
          ) : null}
          {sourceFilters.map((source) => (
            <button
              key={`source-${source}`}
              type="button"
              onClick={() => onToggleSource(source)}
              className="rounded-full border border-border px-2 py-0.5 hover:border-accent"
            >
              Source: {source} x
            </button>
          ))}
          {statusFilters.map((status) => (
            <button
              key={`status-${status}`}
              type="button"
              onClick={() => onToggleStatus(status)}
              className="rounded-full border border-border px-2 py-0.5 hover:border-accent"
            >
              Status: {status} x
            </button>
          ))}
          {originFilters.map((origin) => (
            <button
              key={`origin-${origin}`}
              type="button"
              onClick={() => onToggleOrigin(origin)}
              className="rounded-full border border-border px-2 py-0.5 hover:border-accent"
            >
              Origin: {origin} x
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
