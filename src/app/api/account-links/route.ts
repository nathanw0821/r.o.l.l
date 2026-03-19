import { requireUser } from "@/lib/api/auth";
import { ok } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const accounts = await prisma.account.findMany({
    where: { userId: auth.session.user.id },
    select: { provider: true }
  });

  return ok({ providers: accounts.map((account) => account.provider) });
}
