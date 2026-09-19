import { requireUser } from "@/lib/api/auth";
import { badRequest, ok, tooManyRequests } from "@/lib/api/responses";
import { issueEmailVerification } from "@/lib/email-verification";
import { rateLimit } from "@/lib/rate-limit";

/** Sends (again) the verification link for the signed-in user's current email. */
export async function POST() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const limiter = await rateLimit(`verify-email:${auth.user.id}`, 3, 15 * 60_000);
  if (!limiter.success) return tooManyRequests("A link was sent recently. Please check your inbox or try again later.");

  if (!auth.user.email) return badRequest("Add an email address first.");
  if (auth.user.emailVerified) return ok({ alreadyVerified: true, delivered: false });

  try {
    const result = await issueEmailVerification({
      id: auth.user.id,
      email: auth.user.email,
      username: auth.user.username
    });
    return ok({ alreadyVerified: false, delivered: result.delivered });
  } catch (error) {
    console.error("[profile/email/verify] failed:", error);
    return badRequest("Could not send the verification email. Please try again later.");
  }
}
