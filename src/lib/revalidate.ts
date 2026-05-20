import { revalidatePath as nextRevalidatePath, revalidateTag as nextRevalidateTag } from "next/cache";

/**
 * Safely calls Next.js revalidatePath, catching any unhandled exceptions
 * that can occur in read-only environments like Cloudflare Workers.
 */
export function safeRevalidatePath(path: string, type?: "layout" | "page") {
  try {
    nextRevalidatePath(path, type);
    console.log(`[Revalidation] Successfully called revalidatePath for: ${path}${type ? ` (${type})` : ""}`);
  } catch (error) {
    console.warn(
      `[Revalidation] Ignored exception during revalidatePath for ${path}:`,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Safely calls Next.js revalidateTag, catching any unhandled exceptions
 * that can occur in read-only environments like Cloudflare Workers.
 */
export function safeRevalidateTag(tag: string, options?: unknown) {
  try {
    const revalidateTagFn = nextRevalidateTag as unknown as (t: string, o?: unknown) => void;
    if (options !== undefined) {
      revalidateTagFn(tag, options);
      console.log(`[Revalidation] Successfully called revalidateTag for: ${tag} with options`);
    } else {
      revalidateTagFn(tag);
      console.log(`[Revalidation] Successfully called revalidateTag for: ${tag}`);
    }
  } catch (error) {
    console.warn(
      `[Revalidation] Ignored exception during revalidateTag for ${tag}:`,
      error instanceof Error ? error.message : String(error)
    );
  }
}
