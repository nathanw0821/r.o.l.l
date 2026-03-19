import { z } from "zod";
import { cuidSchema } from "@/lib/validation/common";

export const syncUpdateSchema = z.object({
  id: cuidSchema,
  url: z.string().trim().url().nullable().optional(),
  enabled: z.preprocess((value) => {
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "on"].includes(normalized)) return true;
      if (["false", "0", "no", "off"].includes(normalized)) return false;
    }
    return value;
  }, z.boolean().optional()),
  format: z.string().trim().nullable().optional()
});
