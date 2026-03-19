import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";
import { forbidden, unauthorized } from "@/lib/api/responses";

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

export async function requireAdmin() {
  const auth = await requireUser();
  if ("response" in auth) {
    return auth;
  }

  if (!isAdminUser(auth.user)) {
    return { response: forbidden("Admin access required.") } as const;
  }

  return auth;
}
