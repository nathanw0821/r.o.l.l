import { z } from "zod";

const allowedExtensions = [".xlsx", ".xlsm", ".xls"];
const maxUploadBytes = 10 * 1024 * 1024;

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export const uploadFileSchema = z
  .custom<File>((value) => isFile(value), { message: "Invalid file" })
  .superRefine((file, ctx) => {
    if (!file) return;
    if (!file.name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Missing filename" });
      return;
    }
    const lower = file.name.toLowerCase();
    const matches = allowedExtensions.some((ext) => lower.endsWith(ext));
    if (!matches) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unsupported file type. Allowed: ${allowedExtensions.join(", ")}`
      });
    }
    if (file.size === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "File is empty" });
    }
    if (file.size > maxUploadBytes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "File is too large. Maximum size is 10 MB."
      });
    }
  });
