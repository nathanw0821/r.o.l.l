import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized, internalError, badRequest } from "@/lib/api/responses";
import { z } from "zod";
import { parseJson } from "@/lib/api/validation";

const deleteAccountSchema = z.object({
  email: z.string().email(),
  verification: z.string()
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return unauthorized("You must be logged in to delete your account.");
  }

  const userId = session.user.id;

  const parsed = await parseJson(request, deleteAccountSchema);
  if ("response" in parsed) return parsed.response;

  const { email, verification } = parsed.data;

  // 1. Verify email matches current logged-in user
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      return unauthorized("User not found.");
    }

    if (user.email?.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return badRequest("The email entered does not match your registered email address.");
    }

    // 2. Verify deletion confirmation string
    if (verification !== "DELETE") {
      return badRequest("Invalid verification string. You must type DELETE in caps.");
    }

    // 3. Perform atomic cleanup and deletion
    await prisma.$transaction(async (tx) => {
      // Unlink feedback submitted by the user
      await tx.feedback.updateMany({
        where: { userId: userId },
        data: { userId: null }
      });
      
      // Unlink feedback reviewed by the user
      await tx.feedback.updateMany({
        where: { reviewedById: userId },
        data: { reviewedById: null }
      });

      // Unlink shared builds
      await tx.sharedBuild.updateMany({
        where: { userId: userId },
        data: { userId: null }
      });

      // Unlink import audits
      await tx.importAudit.updateMany({
        where: { userId: userId },
        data: { userId: null }
      });

      // Permanently delete the user record (and all cascade deleted children)
      await tx.user.delete({
        where: { id: userId }
      });
    });

    console.log(`[Security / Deletion] Permanently deleted user: ${email}`);
    return ok({ success: true, message: "Account permanently deleted." });

  } catch (error) {
    console.error("Account deletion failed:", error);
    return internalError("Database error. Unable to complete account deletion.");
  }
}
