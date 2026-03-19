import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncUserAchievements } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const payloadSchema = z.object({
  entries: z.array(
    z.object({
      effectTierId: z.string().min(1),
      unlocked: z.boolean()
    })
  ).min(1).max(2000)
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: { code: "INVALID_JSON", message: "Invalid JSON body." } }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid progress entries.", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const { entries } = parsed.data;
  await prisma.$transaction(
    entries.map((entry) =>
      prisma.userProgress.upsert({
        where: {
          userId_effectTierId: {
            userId: session.user.id,
            effectTierId: entry.effectTierId
          }
        },
        update: { unlocked: entry.unlocked },
        create: {
          userId: session.user.id,
          effectTierId: entry.effectTierId,
          unlocked: entry.unlocked
        }
      })
    )
  );

  await syncUserAchievements(session.user.id);
  return NextResponse.json({ success: true });
}
