import { PrismaAdapter } from "@auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import TwitchProvider from "next-auth/providers/twitch";

import RedditProvider from "next-auth/providers/reddit";
import AzureADProvider from "next-auth/providers/azure-ad";
import { cache } from "react";
import { verifyPassword, hashPassword, isLegacyHash } from "@/lib/password-hash";
import { z } from "zod";
import { awardLoginAchievement, syncUserAchievements } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { applyImportedProfileIfNeeded } from "@/lib/profile";

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
    async signIn({ user, account }) {
      // Basic validation
      if (account?.provider !== "credentials" && !user.email) {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const id = (token?.id ?? token?.sub) as string | undefined;
      if (session.user && id) {
        session.user.id = id;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return;
      try {
        await awardLoginAchievement(user.id);
        await syncUserAchievements(user.id);
      } catch (error) {
        console.error("Auth Event Error (Achievement Sync):", error);
        // Do not throw; we want the user to be able to sign in even if achievements fail.
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

    console.log("[NextAuth get providers] process.env check:", {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "defined" : "undefined",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "defined" : "undefined",
      TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID ? "defined" : "undefined",
      REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID ? "defined" : "undefined",
      AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID ? "defined" : "undefined",
    });

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
          const password = parsed.data.password.trim();
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

          const legacyNoSecondary = identifierIsEmail
            ? null
            : await prisma.user.findFirst({
                where: { authCode: legacyAuthCode, secondaryCode: null }
              });

          if (legacyNoSecondary) {
            const passwordHash = await hashPassword(password);
            const updated = await prisma.user.update({
              where: { id: legacyNoSecondary.id },
              data: { username, passwordHash, authCode: null, secondaryCode: null }
            });
            await applyProfile(updated.id);
            return updated;
          }

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
  cookies: process.env.NODE_ENV === "production" ? {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: ".fallout76.wiki"
      }
    }
  } : undefined,
  debug: true
};

export const getAppSession = cache(() => getServerSession(authOptions));
