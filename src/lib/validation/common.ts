import { z } from "zod";

export const trimmedString = z.string().trim();
export const nonEmptyString = trimmedString.min(1, "Required");

export const cuidSchema = z
  .string()
  .trim()
  .refine((value) => /^[a-z0-9]{25}$/i.test(value), "Invalid ID");

export const booleanish = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  }
  return value;
}, z.boolean());

export const numberish = z.preprocess((value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return value;
    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return value;
}, z.number());
