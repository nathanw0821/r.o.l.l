import { z } from "zod";
import { requireUser } from "@/lib/api/auth";
import { badRequest, ok } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  email: z.string().trim().email()
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Enter a valid email address.");
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findFirst({
    where: {
      email,
      id: { not: auth.user.id }
    },
    select: { id: true }
  });

  if (existing) {
    return badRequest("That email is already in use.");
  }

  const updated = await prisma.user.update({
    where: { id: auth.user.id },
    data: { email, emailVerified: null },
    select: { email: true }
  });

  return ok({ email: updated.email });
}
