import { z } from "zod";
import { requireUser } from "@/lib/api/auth";
import { badRequest, ok, tooManyRequests } from "@/lib/api/responses";
import { issueEmailVerification } from "@/lib/email-verification";
import { verifyPassword } from "@/lib/password-hash";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const payloadSchema = z.object({
  email: z.string().trim().email(),
  currentPassword: z.string().max(256).optional()
});

/**
 * Changes the account email. Accounts with a password must confirm it; the new address starts
 * unverified and gets a verification link. The change ends every session (the session
 * fingerprint includes the email), so the user signs in again.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const limiter = await rateLimit(`profile-email:${auth.user.id}`, 5, 10 * 60_000);
  if (!limiter.success) return tooManyRequests("Too many attempts. Please try again later.");

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Enter a valid email address.");
  }

  if (auth.user.passwordHash) {
    const current = parsed.data.currentPassword ?? "";
    if (!current || !(await verifyPassword(current, auth.user.passwordHash))) {
      return badRequest("Enter your current password to change your email.");
    }
  }

  const email = parsed.data.email.toLowerCase();
  if (email === auth.user.email) {
    return ok({ email, verificationSent: false });
  }

  const existing = await prisma.user.findFirst({
    where: { email, id: { not: auth.user.id } },
    select: { id: true }
  });
  if (existing) {
    return badRequest("That email can't be used. Try another address.");
  }

  const updated = await prisma.user.update({
    where: { id: auth.user.id },
    data: { email, emailVerified: null },
    select: { email: true, username: true }
  });

  let verificationSent = false;
  try {
    const result = await issueEmailVerification({ id: auth.user.id, email, username: updated.username });
    verificationSent = result.delivered;
  } catch (error) {
    console.error("[profile/email] verification email failed:", error);
  }

  return ok({ email: updated.email, verificationSent, signedOut: true });
}
