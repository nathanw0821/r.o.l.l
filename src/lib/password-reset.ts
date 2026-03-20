import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { getSiteUrl } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildPasswordResetUrl(token: string) {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return null;

  const url = new URL("/auth/reset-password", siteUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

async function sendPasswordResetWebhook(params: {
  email: string;
  username?: string | null;
  resetUrl: string | null;
}) {
  const webhookUrl = process.env.PASSWORD_RESET_WEBHOOK_URL?.trim();
  if (!webhookUrl || !params.resetUrl) {
    return { delivered: false } as const;
  }

  try {
    const headers: Record<string, string> = {
      "content-type": "application/json"
    };

    const token = process.env.PASSWORD_RESET_WEBHOOK_TOKEN?.trim();
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        event: "password_reset",
        email: params.email,
        username: params.username ?? null,
        resetUrl: params.resetUrl
      }),
      signal: AbortSignal.timeout(10000)
    });

    return { delivered: response.ok } as const;
  } catch {
    return { delivered: false } as const;
  }
}

async function sendPasswordResetEmailViaResend(params: {
  email: string;
  username?: string | null;
  resetUrl: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from || !params.resetUrl) {
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
        subject: `${appName}: Reset your password`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.45;color:#111;">
            <p>Hi ${displayName},</p>
            <p>We received a request to reset your password.</p>
            <p><a href="${params.resetUrl}">Reset password</a></p>
            <p>If you did not request this, you can safely ignore this email.</p>
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

export async function requestPasswordReset(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, username: true }
  });

  // Always return a generic result to avoid account enumeration.
  if (!user?.email) {
    return { accepted: true as const, delivered: false, resetUrl: null as string | null };
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id }
  });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt
    }
  });

  const resetUrl = buildPasswordResetUrl(rawToken);
  const resendDelivery = await sendPasswordResetEmailViaResend({
    email: user.email,
    username: user.username,
    resetUrl
  });
  const delivery = resendDelivery.delivered
    ? resendDelivery
    : await sendPasswordResetWebhook({
        email: user.email,
        username: user.username,
        resetUrl
      });

  return {
    accepted: true as const,
    delivered: delivery.delivered,
    resetUrl
  };
}

export async function resetPasswordByToken(rawToken: string, nextPassword: string) {
  const token = rawToken.trim();
  if (!token) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const tokenHash = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { ok: false as const, reason: "expired-or-invalid" as const };
  }

  const passwordHash = await bcrypt.hash(nextPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetToken.userId,
        id: { not: resetToken.id }
      }
    })
  ]);

  return { ok: true as const };
}
