import { randomBytes } from "node:crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sharedBuildTagForSlug } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { badRequest, ok, validationError } from "@/lib/api/responses";
import type { BuilderPayload } from "@/lib/builder/types";

export const dynamic = "force-dynamic";

const underarmorSchema = z.object({
  shellId: z.string().min(1),
  liningId: z.string().nullable(),
  styleId: z.string().nullable()
});

const armorCraftingRowSchema = z.object({
  materialModId: z.string().min(1),
  miscModId: z.string().min(1)
});

const payloadSchema = z.object({
  version: z.literal(4),
  basePieceId: z.string().min(1),
  equipmentKind: z.enum(["armor", "powerArmor", "weapon", "underarmor"]),
  weaponSub: z.enum(["melee", "ranged", "energy"]).nullable(),
  legendaryModIds: z.array(z.string().nullable()).length(4),
  armorLegendaryModIds: z.array(z.array(z.string().nullable()).length(4)).length(5),
  armorPieceCrafting: z.array(armorCraftingRowSchema).length(5),
  ghoul: z.boolean(),
  underarmor: underarmorSchema
});

const bodySchema = z.object({
  title: z.string().min(2).max(120),
  seoTitle: z.string().max(140).optional(),
  description: z.string().max(500).optional(),
  payload: payloadSchema
});

function makeSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const suffix = randomBytes(3).toString("hex");
  return `${base || "build"}-${suffix}`;
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return badRequest("Invalid JSON.");
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return validationError(parsed.error, "Invalid build payload.");
  }

  const session = await getServerSession(authOptions);
  const slug = makeSlug(parsed.data.title);
  const payload = parsed.data.payload as BuilderPayload;

  const record = await prisma.sharedBuild.create({
    data: {
      slug,
      title: parsed.data.title,
      seoTitle: parsed.data.seoTitle ?? null,
      description: parsed.data.description ?? null,
      payload,
      userId: session?.user?.id ?? null
    }
  });

  revalidateTag(sharedBuildTagForSlug(record.slug), { expire: 0 });

  return ok({ slug: record.slug, path: `/l/${record.slug}` });
}
