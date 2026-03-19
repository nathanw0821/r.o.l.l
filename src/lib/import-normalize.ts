export type ImportCellValue = string | number | boolean | null | undefined;

function normalizeRaw(value: ImportCellValue) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value).trim();
}

export function parseUnlockedValue(value: ImportCellValue): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  const raw = normalizeRaw(value);
  if (!raw) return null;

  const normalized = raw.toLowerCase();

  const checkmarks = ["✓", "✔", "✅", "☑", "☑️", "✔️"];
  if (checkmarks.includes(raw)) return true;

  const truthy = ["yes", "y", "true", "1", "checked", "enabled", "unlocked", "active", "on", "x"];
  const falsy = ["no", "n", "false", "0", "unchecked", "disabled", "locked", "inactive", "off"];

  if (truthy.includes(normalized)) return true;
  if (falsy.includes(normalized)) return false;

  const simplified = normalized.replace(/[^a-z0-9]+/g, " ").trim();
  if (truthy.includes(simplified)) return true;
  if (falsy.includes(simplified)) return false;

  if (/(^|\s)(yes|true|checked|enabled|unlocked|active|on)(\s|$)/.test(normalized)) return true;
  if (/(^|\s)(no|false|unchecked|disabled|locked|inactive|off)(\s|$)/.test(normalized)) return false;

  const numeric = Number.parseFloat(normalized);
  if (!Number.isNaN(numeric)) {
    if (numeric === 1) return true;
    if (numeric === 0) return false;
  }

  return null;
}

export function normalizeNoteValue(value: ImportCellValue): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    if (value === 0) return null;
    return String(value);
  }

  const raw = normalizeRaw(value);
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  const zeroLike = /^0+(\.0+)?$/;
  if (zeroLike.test(trimmed)) return null;

  return trimmed;
}

export function dedupeNoteSegments(note: string | null): string | null {
  if (!note) return null;
  const parts = note
    .replace(/\r?\n/g, " ")
    .split(/[|•â€¢,;]/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length <= 1) return note;
  const seen = new Set<string>();
  const deduped = [] as string[];
  for (const part of parts) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(part);
  }
  return deduped.join(" • ");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildOriginRegex(origin: string) {
  const tokens = origin.trim().split(/\s+/).filter((token) => token.length > 0);
  if (tokens.length === 0) return null;
  const pattern = tokens.map(escapeRegex).join("\\s+");
  return new RegExp(`\\b${pattern}\\b`, "gi");
}

export function stripOriginsFromNotes(note: string | null | undefined, origins: string[]): string | null {
  if (!note) return null;
  if (!origins || origins.length === 0) return note;

  const originRegexes = origins
    .map((origin) => buildOriginRegex(origin))
    .filter((regex): regex is RegExp => regex !== null);
  if (originRegexes.length === 0) return note;

  const cleaned = note
    .replace(/\r?\n/g, " ")
    .replace(/â€¢|•/g, "|")
    .replace(/[/]/g, "|")
    .replace(/[;]/g, "|")
    .replace(/[,]/g, "|");

  const segments = cleaned
    .split("|")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const kept: string[] = [];
  for (const segment of segments) {
    let nextSegment = segment;
    for (const regex of originRegexes) {
      nextSegment = nextSegment.replace(regex, " ");
    }

    nextSegment = nextSegment
      .replace(/\s{2,}/g, " ")
      .replace(/^[\s:,-]+|[\s:,-]+$/g, "")
      .replace(/\(\s*\)/g, "")
      .trim();

    if (!nextSegment) continue;
    kept.push(nextSegment);
  }

  const result = kept.join(" • ").trim();
  if (!result) return null;
  return result;
}

export function normalizeDisplayNotes(value: ImportCellValue, origins?: string[]): string | null {
  const normalized = normalizeNoteValue(value);
  if (!normalized) return null;
  const deduped = dedupeNoteSegments(normalized) ?? normalized;
  if (!origins || origins.length === 0) return deduped;
  const stripped = stripOriginsFromNotes(deduped, origins);
  const cleaned = dedupeNoteSegments(stripped ?? "") ?? stripped;
  return cleaned ?? null;
}

export function extractOriginsFromNotes(value: ImportCellValue): string[] {
  const normalized = normalizeNoteValue(value);
  if (!normalized) return [];

  const cleaned = normalized
    .replace(/\r?\n/g, " ")
    .replace(/â€¢|•/g, "|")
    .replace(/[/]/g, "|")
    .replace(/[;]/g, "|")
    .replace(/[,]/g, "|");

  const segments = cleaned
    .split("|")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  const origins = new Set<string>();
  for (const segment of segments) {
    const withoutParens = segment.replace(/\([^)]*\)/g, "").trim();
    if (!withoutParens) continue;

    const parts = withoutParens.split(":");
    const candidate = parts.length > 1 ? parts.slice(1).join(":").trim() : withoutParens;
    if (!candidate) continue;

    const normalizedCandidate = candidate.replace(/\s+/g, " ").trim();
    if (!normalizedCandidate) continue;

    origins.add(normalizedCandidate);
  }

  return Array.from(origins).sort((a, b) => a.localeCompare(b));
}
