import { verifyPassword, hashPassword } from "@/lib/password-hash";
import { z } from "zod";
import { newPasswordSchema } from "@/lib/password-policy";
import { requireUser } from "@/lib/api/auth";
import { badRequest, ok } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: newPasswordSchema
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Choose a stronger password.");
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
    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return badRequest("Current password is incorrect.");
    }
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: auth.user.id },
    data: { passwordHash }
  });

  // The password is part of the session fingerprint, so every session (this one too) now ends.
  return ok({ updated: true, signedOut: true });
}
