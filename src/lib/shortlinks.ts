import { prisma } from "@/lib/prisma";

// Custom Nanoid 6-character generator
export function generateShortSlug(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create or fetch clean shortlink in Neon Postgres (100% pure direct redirect, zero affiliate tracking)
export async function createShortlink(options: {
  targetUrl?: string;
  payload?: any;
  title?: string;
  vanitySlug?: string;
  userId?: string;
}) {
  const { targetUrl, payload, title, vanitySlug, userId } = options;

  const slug = vanitySlug ? vanitySlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") : generateShortSlug(7);
  const finalTitle = title || "Shared Build Loadout";

  try {
    const sharedBuild = await prisma.sharedBuild.create({
      data: {
        slug,
        title: finalTitle,
        description: targetUrl ? `Redirect to: ${targetUrl}` : "Shared Fallout 76 Build",
        payload: payload || { redirectUrl: targetUrl },
        userId: userId || null,
        published: true
      }
    });

    return {
      success: true,
      slug: sharedBuild.slug,
      shortUrl: `${process.env.NEXTAUTH_URL || "https://fallout76.wiki"}/l/${sharedBuild.slug}`
    };
  } catch (err: any) {
    // If slug collision, retry with nanoid fallback
    if (err.code === "P2002") {
      const fallbackSlug = `${slug}-${generateShortSlug(4)}`;
      const sharedBuild = await prisma.sharedBuild.create({
        data: {
          slug: fallbackSlug,
          title: finalTitle,
          payload: payload || { redirectUrl: targetUrl },
          userId: userId || null,
          published: true
        }
      });
      return {
        success: true,
        slug: sharedBuild.slug,
        shortUrl: `${process.env.NEXTAUTH_URL || "https://fallout76.wiki"}/l/${sharedBuild.slug}`
      };
    }
    throw err;
  }
}
