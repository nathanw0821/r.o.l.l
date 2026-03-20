import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { parseJson } from "@/lib/api/validation";
import { badRequest, ok, unauthorized } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9._-]+$/i, "Username can use letters, numbers, dots, underscores, and dashes only.")
    .optional(),
  mode: z.enum(["default"]).optional()
});

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "")
    .slice(0, 24);
}

async function generateDefaultUsername(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true }
  });

  const baseRaw = user?.email?.split("@")[0] ?? user?.name ?? "vaultdweller";
  const base = slugify(baseRaw) || "vaultdweller";

  for (let i = 0; i < 100; i += 1) {
    const candidate = i === 0 ? base : `${base}-${Math.floor(Math.random() * 9000) + 1000}`;
    const existing = await prisma.user.findUnique({ where: { username: candidate } });
    if (!existing) {
      return candidate;
    }
  }

  return `vaultdweller-${Date.now().toString().slice(-6)}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, email: true }
  });

  return ok({
    username: user?.username ?? null,
    email: user?.email ?? null,
    needsUsername: !user?.username
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return unauthorized();

  const parsed = await parseJson(request, usernameSchema);
  if ("response" in parsed) return parsed.response;

  let username: string;

  if (parsed.data.mode === "default" || !parsed.data.username?.trim()) {
    username = await generateDefaultUsername(session.user.id);
  } else {
    username = normalizeUsername(parsed.data.username);
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== session.user.id) {
      return badRequest("That username is already taken.");
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username }
  });

  return ok({ username });
}
