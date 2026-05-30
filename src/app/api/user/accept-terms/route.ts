import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized, internalError } from "@/lib/api/responses";

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return unauthorized("You must be logged in to accept the terms.");
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { agreedToTerms: true }
    });

    return ok({ success: true, message: "Terms accepted successfully." });
  } catch (error) {
    console.error("Failed to accept terms:", error);
    return internalError("Database error. Unable to record terms acceptance.");
  }
}
