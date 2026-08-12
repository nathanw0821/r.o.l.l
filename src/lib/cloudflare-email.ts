// Unified Transactional Email Engine powered by Cloudflare Email Service & Resend Fallback

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  replyTo?: string;
}

export async function sendTransactionalEmail(params: SendEmailParams): Promise<{ delivered: boolean; provider: string }> {
  const { to, subject, html, text, fromName = "R.O.L.L", replyTo } = params;

  const fromEmail = process.env.EMAIL_FROM?.trim() || "no-reply@fallout76.wiki";
  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  const plainText = text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  // 1. Primary: Cloudflare Email Service REST API (Native Cloudflare Platform)
  if (cfAccountId && cfApiToken) {
    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/email/sending/send`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${cfApiToken}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          from: { address: fromEmail, name: fromName },
          to: [to],
          ...(replyTo ? { reply_to: replyTo } : {}),
          subject,
          html,
          text: plainText
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        return { delivered: true, provider: "cloudflare" };
      }
    } catch {
      // Fallback to Resend if Cloudflare API fails
    }
  }

  // 2. Secondary Fallback: Resend API
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${resendApiKey}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          ...(replyTo ? { reply_to: replyTo } : {}),
          subject,
          html,
          text: plainText
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        return { delivered: true, provider: "resend" };
      }
    } catch {
      // Fallback
    }
  }

  return { delivered: false, provider: "none" };
}
