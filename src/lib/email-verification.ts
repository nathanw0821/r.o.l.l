import { randomBytes } from "node:crypto";
import { getSiteUrl } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

type VerificationUser = {
  id: string;
  email: string;
  username?: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function buildEmailVerificationUrl(token: string) {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return null;

  const url = new URL("/auth/verify-email", siteUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

async function sendVerificationWebhook(params: {
  email: string;
  username?: string | null;
  verificationUrl: string | null;
}) {
  const webhookUrl = process.env.EMAIL_VERIFICATION_WEBHOOK_URL?.trim();
  if (!webhookUrl || !params.verificationUrl) {
    return { delivered: false } as const;
  }

  try {
    const headers: Record<string, string> = {
      "content-type": "application/json"
    };

    const token = process.env.EMAIL_VERIFICATION_WEBHOOK_TOKEN?.trim();
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        event: "email_verification",
        email: params.email,
        username: params.username ?? null,
        verificationUrl: params.verificationUrl
      }),
      signal: AbortSignal.timeout(10000)
    });

    return { delivered: response.ok } as const;
  } catch {
    return { delivered: false } as const;
  }
}

async function sendVerificationEmailViaResend(params: {
  email: string;
  username?: string | null;
  verificationUrl: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from || !params.verificationUrl) {
    return { delivered: false } as const;
  }

  const appName = "R.O.L.L";
  const displayName = params.username?.trim() || params.email;
  const replyTo = process.env.EMAIL_REPLY_TO?.trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [params.email],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: `${appName}: Verify your email`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.45;color:#111;">
            <p>Hi ${displayName},</p>
            <p>Please verify your email to finish setting up your account.</p>
            <p><a href="${params.verificationUrl}">Verify email</a></p>
          </div>
        `
      }),
      signal: AbortSignal.timeout(10000)
    });

    return { delivered: response.ok } as const;
  } catch {
    return { delivered: false } as const;
  }
}

export async function issueEmailVerification(user: VerificationUser) {
  const email = normalizeEmail(user.email);

  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  });

  const verificationUrl = buildEmailVerificationUrl(token);
  const resendDelivery = await sendVerificationEmailViaResend({
    email,
    username: user.username,
    verificationUrl
  });
  const delivery = resendDelivery.delivered
    ? resendDelivery
    : await sendVerificationWebhook({
        email,
        username: user.username,
        verificationUrl
      });

  return {
    verificationUrl,
    delivered: delivery.delivered,
    expires
  } as const;
}

export async function consumeEmailVerificationToken(token: string) {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    return { ok: false as const, reason: "missing" as const };
  }

  const verification = await prisma.verificationToken.findUnique({
    where: { token: normalizedToken }
  });

  if (!verification) {
    return { ok: false as const, reason: "invalid" as const };
  }

  if (verification.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { token: normalizedToken }
    });

    return { ok: false as const, reason: "expired" as const };
  }

  const email = normalizeEmail(verification.identifier);
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    await prisma.verificationToken.delete({
      where: { token: normalizedToken }
    });

    return { ok: false as const, reason: "missing-user" as const };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: user.emailVerified ?? new Date()
      }
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })
  ]);

  return {
    ok: true as const,
    email
  };
}
