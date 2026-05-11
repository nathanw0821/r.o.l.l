import bcrypt from "bcryptjs";
import { z } from "zod";
import { parseJson } from "@/lib/api/validation";
import { badRequest, forbidden, internalError, ok, tooManyRequests } from "@/lib/api/responses";
import { isPublicRegistrationEnabled } from "@/lib/app-config";
import { issueEmailVerification } from "@/lib/email-verification";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const signUpSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9._-]+$/i, "Username can use letters, numbers, dots, underscores, and dashes only."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
});

function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

function isEmailLike(value: string) {
  return z.string().email().safeParse(value).success;
}

export async function POST(request: Request) {
  if (!isPublicRegistrationEnabled()) {
    return forbidden("Public sign-up is disabled.");
  }

  const limiter = await rateLimit("sign-up", 5, 60000); // 5 per minute
  if (!limiter.success) {
    return tooManyRequests("Too many requests. Please try again later.");
  }

  const parsed = await parseJson(request, signUpSchema);
  if ("response" in parsed) return parsed.response;

  const email = normalizeEmail(parsed.data.email);
  const username = normalizeUsername(parsed.data.username);
  const password = parsed.data.password;

  if (isEmailLike(username)) {
    return badRequest("Choose a username, not an email address.");
  }

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } })
  ]);

  if (existingEmail) {
    return badRequest("That email address is already in use.");
  }

  if (existingUsername) {
    return badRequest("That username is already taken.");
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        settings: {
          create: {}
        }
      }
    });

    const verification = await issueEmailVerification({
      id: user.id,
      email,
      username
    });

    return ok({
      email,
      delivered: verification.delivered
    }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    return internalError(message);
  }
}
