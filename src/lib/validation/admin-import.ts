import { z } from "zod";
import { uploadFileSchema } from "@/lib/validation/files";

export const importWorkbookSchema = z.object({
  file: uploadFileSchema
});
