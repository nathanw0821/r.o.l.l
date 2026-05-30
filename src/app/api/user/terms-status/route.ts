import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized } from "@/lib/api/responses";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    // If not signed in, they are a guest. No popup needed.
    return ok({ agreedToTerms: true, email: null });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { agreedToTerms: true, email: true }
    });

    if (!user) {
      return unauthorized("User session is invalid.");
    }

    return ok({
      agreedToTerms: user.agreedToTerms,
      email: user.email
    });
  } catch (error) {
    console.error("Failed to fetch terms status:", error);
    // If database is down, fail safely to not block the user
    return ok({ agreedToTerms: true, email: null });
  }
}
