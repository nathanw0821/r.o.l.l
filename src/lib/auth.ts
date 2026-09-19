import { PrismaAdapter } from "@auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import TwitchProvider from "next-auth/providers/twitch";

import RedditProvider from "next-auth/providers/reddit";
import AzureADProvider from "next-auth/providers/azure-ad";
import { cache } from "react";
import { verifyPassword, hashPassword, isLegacyHash } from "@/lib/password-hash";
import { z } from "zod";
import { awardAchievements, awardLoginAchievement, syncUserAchievements } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { applyImportedProfileIfNeeded } from "@/lib/profile";
import { credentialFingerprint, SESSION_RECHECK_MS } from "@/lib/session-fingerprint";

if (!process.env.NEXTAUTH_URL && process.env.APP_URL) {
  process.env.NEXTAUTH_URL = process.env.APP_URL;
}
if (!process.env.APP_URL && process.env.NEXTAUTH_URL) {
  process.env.APP_URL = process.env.NEXTAUTH_URL;
}

const credentialsSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1)
});

async function applyProfile(userId: string) {
  try {
    await applyImportedProfileIfNeeded(userId);
  } catch {
    // Skip profile application errors to avoid blocking sign-in.
  }
}

function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

function normalizeIdentifier(raw: string) {
  return raw.trim().toLowerCase();
}

function isEmailIdentifier(value: string) {
  return z.string().email().safeParse(value).success;
}

export const SESSION_COOKIE_NAME = "__Host-roll.session-token";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  get secret() {
    process.env.AUTH_TRUST_HOST = "true";
    return process.env.NEXTAUTH_SECRET;
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.provider === "credentials") return true;
      if (!user.email) return false;

      // Already linked to this provider account: normal sign-in.
      const linked = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider: account.provider, providerAccountId: account.providerAccountId } },
        select: { id: true }
      });
      if (linked) return true;

      // Google/Discord would be attached to an existing account with the same email. Only allow
      // that when both sides have proven the address: otherwise someone could register a victim's
      // email with a password first and keep access after the victim signs in with Google.
      const existing = await prisma.user.findUnique({
        where: { email: user.email.trim().toLowerCase() },
        select: { passwordHash: true, emailVerified: true }
      });
      if (!existing) return true;
      const p = (profile ?? {}) as { email_verified?: boolean; verified?: boolean };
      const providerVerified = p.email_verified === true || p.verified === true;
      if (!providerVerified || (existing.passwordHash && !existing.emailVerified)) {
        return "/auth/sign-in?error=VerifyEmailToLink";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // The token carries the username and email-verified state (admin checks read them) and a
      // fingerprint of the password hash + email. It is rechecked every few minutes; when the
      // password or email changed (or the user was deleted) every session of that account ends.
      const id = (token.id ?? token.sub) as string | undefined;
      const now = Date.now();
      const due = !token.checkedAt || now - token.checkedAt > SESSION_RECHECK_MS;
      if (id && (user || token.username === undefined || !token.fp || due)) {
        const row = await prisma.user.findUnique({
          where: { id },
          select: { username: true, emailVerified: true, passwordHash: true, email: true }
        });
        if (!row) throw new Error("SESSION_REVOKED");
        const fp = credentialFingerprint(row);
        if (!user && token.fp && token.fp !== fp) throw new Error("SESSION_REVOKED");
        token.fp = fp;
        token.checkedAt = now;
        token.username = row.username ?? null;
        token.emailVerified = Boolean(row.emailVerified);
      }
      return token;
    },
    async session({ session, token }) {
      const id = (token?.id ?? token?.sub) as string | undefined;
      if (session.user && id) {
        session.user.id = id;
        session.user.username = token.username ?? null;
        session.user.emailVerified = Boolean(token.emailVerified);
      }
      return session;
    }
  },
  events: {
    async signIn({ user, account }) {
      if (!user.id) return;
      try {
        await awardLoginAchievement(user.id);
        if (account?.provider === "discord") {
          await awardAchievements(user.id, ["discord_linked"]);
        }
        await syncUserAchievements(user.id);
      } catch (error) {
        console.error("Auth Event Error (Achievement Sync):", error);
        // Do not throw; we want the user to be able to sign in even if achievements fail.
      }
    },
    async linkAccount({ user, account }) {
      if (!user.id) return;
      try {
        if (account?.provider === "discord") {
          await awardAchievements(user.id, ["discord_linked"]);
        }
      } catch (error) {
        console.error("Auth Event Error (Link Account):", error);
      }
    }
  },
  get providers() {
    process.env.AUTH_TRUST_HOST = "true";
    if (!process.env.NEXTAUTH_URL && process.env.APP_URL) {
      process.env.NEXTAUTH_URL = process.env.APP_URL;
    }
    if (!process.env.APP_URL && process.env.NEXTAUTH_URL) {
      process.env.APP_URL = process.env.NEXTAUTH_URL;
    }

    return [
      CredentialsProvider({
        name: "Username or Email",
        credentials: {
          identifier: { label: "Username or Email", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          const limiter = await rateLimit("sign-in", 10, 60000); // 10 per minute
          if (!limiter.success) return null;

          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const identifier = normalizeIdentifier(parsed.data.identifier);
          const password = parsed.data.password;
          if (!identifier || !password) return null;

          const username = normalizeUsername(identifier);
          const identifierIsEmail = isEmailIdentifier(identifier);

          const existing = identifierIsEmail
            ? await prisma.user.findUnique({
                where: { email: identifier }
              })
            : await prisma.user.findUnique({
                where: { username }
              });

          if (existing?.passwordHash) {
            const valid = await verifyPassword(password, existing.passwordHash);
            if (!valid) return null;

            // Automatically upgrade legacy bcrypt hashes to high-performance Web Crypto PBKDF2 on successful login
            if (isLegacyHash(existing.passwordHash)) {
              try {
                const newHash = await hashPassword(password);
                await prisma.user.update({
                  where: { id: existing.id },
                  data: { passwordHash: newHash }
                });
                console.log(`[Security Upgrade] Upgraded password hash format for user: ${existing.email || existing.username}`);
              } catch (upgradeErr) {
                // Log and fail silently to ensure user login is not disrupted
                console.error("[Security Upgrade] Failed to upgrade legacy password hash:", upgradeErr);
              }
            }

            await applyProfile(existing.id);
            return existing;
          }

          const legacyAuthCode = identifier.toUpperCase();
          const legacySecondary = password.toUpperCase();

          const legacy = identifierIsEmail
            ? null
            : await prisma.user.findFirst({
                where: { authCode: legacyAuthCode, secondaryCode: legacySecondary }
              });

          if (legacy) {
            const passwordHash = await hashPassword(password);
            const updated = await prisma.user.update({
              where: { id: legacy.id },
              data: { username, passwordHash, authCode: null, secondaryCode: null }
            });
            await applyProfile(updated.id);
            return updated;
          }

          // Accounts with an auth code but no secondary code used to sign in with ANY password (which
          // then became their password). Production had none (checked 2026-09-18); the path is gone.

          if (existing) {
            return null;
          }
          return null;
        }
      }),
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? [
            {
              ...GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                allowDangerousEmailAccountLinking: true // Crucial for linking Google to existing email accounts
              }),
              wellKnown: undefined,
              authorization: {
                url: "https://accounts.google.com/o/oauth2/v2/auth",
                params: {
                  scope: "openid email profile"
                }
              },
              token: {
                url: "https://oauth2.googleapis.com/token"
              },
              userinfo: {
                url: "https://openidconnect.googleapis.com/v1/userinfo"
              },
              jwks_endpoint: "https://www.googleapis.com/oauth2/v3/certs",
              issuer: "https://accounts.google.com"
            }
          ]
        : []),
      ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
        ? [
            DiscordProvider({
              clientId: process.env.DISCORD_CLIENT_ID,
              clientSecret: process.env.DISCORD_CLIENT_SECRET,
              allowDangerousEmailAccountLinking: true
            })
          ]
        : []),
      ...(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET
        ? [
            TwitchProvider({
              clientId: process.env.TWITCH_CLIENT_ID,
              clientSecret: process.env.TWITCH_CLIENT_SECRET
            })
          ]
        : []),

      ...(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET
        ? [
            RedditProvider({
              clientId: process.env.REDDIT_CLIENT_ID,
              clientSecret: process.env.REDDIT_CLIENT_SECRET
            })
          ]
        : []),
      ...(process.env.AZURE_AD_CLIENT_ID &&
      process.env.AZURE_AD_CLIENT_SECRET &&
      process.env.AZURE_AD_TENANT_ID
        ? [
            AzureADProvider({
              clientId: process.env.AZURE_AD_CLIENT_ID,
              clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
              tenantId: process.env.AZURE_AD_TENANT_ID
            })
          ]
        : [])
    ];
  },
  pages: {
    signIn: "/auth/sign-in"
  },
  // Host-only cookie (no Domain), so preview.fallout76.wiki never receives production sessions.
  // The name changed from the old ".fallout76.wiki" cookie, which signed everyone out once.
  cookies: process.env.NODE_ENV === "production" ? {
    sessionToken: {
      name: SESSION_COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true
      }
    }
  } : undefined,
  logger: {
    error(code, metadata) {
      // A revoked session is expected, not an error worth a stack trace.
      if (code === "JWT_SESSION_ERROR" && String((metadata as { message?: string })?.message ?? metadata).includes("SESSION_REVOKED")) return;
      console.error(`[next-auth][error][${code}]`, metadata);
    },
    warn(code) {
      console.warn(`[next-auth][warn][${code}]`);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== "production") console.debug(`[next-auth][debug][${code}]`, metadata);
    }
  },
  debug: process.env.NODE_ENV !== "production"
};

export const getAppSession = cache(async () => {
  try {
    return await getServerSession(authOptions);
  } catch (err) {
    console.error("[NextAuth Session Error]", err);
    return null;
  }
});
