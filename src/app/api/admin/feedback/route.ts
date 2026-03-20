import { z } from "zod";
import { parseJson } from "@/lib/api/validation";
import { badRequest, ok } from "@/lib/api/responses";
import { requireAdmin } from "@/lib/api/auth";
import { prisma } from "@/lib/prisma";

const updateFeedbackSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "reviewed", "resolved"]).optional(),
  adminNotes: z.string().max(2000).optional()
});

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      submittedBy: { select: { id: true, username: true, email: true } },
      reviewedBy: { select: { id: true, username: true, email: true } }
    }
  });

  return ok({ feedback });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, updateFeedbackSchema);
  if ("response" in parsed) return parsed.response;

  if (!parsed.data.status && parsed.data.adminNotes === undefined) {
    return badRequest("Provide at least one field to update.");
  }

  const feedback = await prisma.feedback.findUnique({ where: { id: parsed.data.id } });
  if (!feedback) {
    return badRequest("Feedback item not found.");
  }

  const nextStatus = parsed.data.status ?? feedback.status;
  const reviewedState = nextStatus === "new"
    ? { reviewedAt: null, reviewedById: null }
    : { reviewedAt: new Date(), reviewedById: auth.user.id };

  const updated = await prisma.feedback.update({
    where: { id: parsed.data.id },
    data: {
      status: nextStatus,
      adminNotes: parsed.data.adminNotes ?? feedback.adminNotes,
      ...reviewedState
    }
  });

  return ok({ feedback: updated });
}
