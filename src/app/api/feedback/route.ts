import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { parseJson } from "@/lib/api/validation";
import { badRequest, internalError, ok, tooManyRequests } from "@/lib/api/responses";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const feedbackSchema = z.object({
  subject: z.string().min(1).max(120),
  message: z.string().min(1).max(500),
  replyEmail: z.string().email().optional()
});

function normalizeOptionalEmail(value?: string) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : null;
}

export async function POST(request: Request) {
  const limiter = await rateLimit("feedback", 3, 60000); // 3 per minute
  if (!limiter.success) {
    return tooManyRequests("Too many requests. Please try again later.");
  }

  const parsed = await parseJson(request, feedbackSchema);
  if ("response" in parsed) return parsed.response;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const replyEmail = normalizeOptionalEmail(parsed.data.replyEmail);
  if (!replyEmail && !userId) {
    return badRequest("Reply email is required when not signed in.");
  }

  try {
    await prisma.feedback.create({
      data: {
        userId,
        subject: parsed.data.subject.trim(),
        message: parsed.data.message.trim(),
        replyEmail
      }
    });
  } catch {
    return internalError("Feedback storage is unavailable right now. Please try again shortly.");
  }

  return ok({ submitted: true }, 201);
}
