import { revalidatePath as nextRevalidatePath, revalidateTag as nextRevalidateTag } from "next/cache";

/**
 * Safely calls Next.js revalidatePath, catching any unhandled exceptions
 * that can occur in read-only environments like Cloudflare Workers.
 */
export function safeRevalidatePath(path: string, type?: "layout" | "page") {
  if (process.env.NODE_ENV === "production") {
    console.log(`[Revalidation] Bypassed revalidatePath for ${path} in production edge.`);
    return;
  }

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
  if (process.env.NODE_ENV === "production") {
    console.log(`[Revalidation] Bypassed revalidateTag for ${tag} in production edge.`);
    return;
  }

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
