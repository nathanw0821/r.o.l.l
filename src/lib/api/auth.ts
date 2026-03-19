import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorized } from "@/lib/api/responses";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { response: unauthorized("Unauthorized") } as const;
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return { response: unauthorized("Session expired. Please sign in again.") } as const;
  }

  return { session, user } as const;
}
