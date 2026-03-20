import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireUser } from "@/lib/api/auth";
import { badRequest, ok } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).max(128)
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("New password must be at least 8 characters.");
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { passwordHash: true }
  });

  if (!user) {
    return badRequest("Account not found.");
  }

  if (user.passwordHash) {
    if (!parsed.data.currentPassword) {
      return badRequest("Current password is required.");
    }
    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return badRequest("Current password is incorrect.");
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: auth.user.id },
    data: { passwordHash }
  });

  return ok({ updated: true });
}
