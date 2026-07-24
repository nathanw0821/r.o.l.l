import { headers } from "next/headers";

export type TurnstileVerifyResult = {
  success: boolean;
  bypassed?: boolean;
  errorCodes?: string[];
};

/**
 * Server-side helper to verify Cloudflare Turnstile anti-bot token.
 * Passes automatically if TURNSTILE_SECRET_KEY is not configured (e.g. local dev).
 */
export async function verifyTurnstileToken(token: string | null | undefined): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Bypass gracefully if secret key is not set (e.g. local dev / environments without Turnstile)
  if (!secretKey) {
    return { success: true, bypassed: true };
  }

  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0];

    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const data = await res.json();
    return {
      success: Boolean(data.success),
      errorCodes: data["error-codes"] ?? []
    };
  } catch (error) {
    console.error("[Turnstile Verification Error]", error);
    // Return false on explicit verification failure
    return { success: false, errorCodes: ["verification-error"] };
  }
}
