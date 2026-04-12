import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sharedBuildTagForSlug } from "@/lib/cache-tags";

const sharedBuildSelect = {
  id: true,
  slug: true,
  title: true,
  seoTitle: true,
  description: true,
  payload: true,
  published: true
} satisfies Prisma.SharedBuildSelect;

export type CachedSharedBuildRow = Prisma.SharedBuildGetPayload<{ select: typeof sharedBuildSelect }>;
/** One Neon round-trip per slug per cache window; shared by `generateMetadata` + page in the same request. */
export function getCachedPublishedSharedBuild(slug: string) {
  const loader = unstable_cache(
    async () =>
      prisma.sharedBuild.findFirst({
        where: { slug, published: true },
        select: sharedBuildSelect
      }),
    ["shared-build-by-slug", slug],
    {
      revalidate: 900,
      tags: [sharedBuildTagForSlug(slug)]
    }
  );
  return loader();
}
