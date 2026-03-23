import { PrismaAdapter } from "@auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import TwitchProvider from "next-auth/providers/twitch";
import DiscordProvider from "next-auth/providers/discord";
import RedditProvider from "next-auth/providers/reddit";
import AzureADProvider from "next-auth/providers/azure-ad";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { awardLoginAchievement, syncUserAchievements } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import { applyImportedProfileIfNeeded } from "@/lib/profile";

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
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account }) {
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
      await awardLoginAchievement(user.id);
      await syncUserAchievements(user.id);
    }
  },
  providers: [
    CredentialsProvider({
      name: "Username or Email",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
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
          const valid = await bcrypt.compare(password, existing.passwordHash);
          if (!valid) return null;
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
          const passwordHash = await bcrypt.hash(password, 12);
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
          const passwordHash = await bcrypt.hash(password, 12);
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
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
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
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? [
          DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET
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
  ],
  pages: {
    signIn: "/auth/sign-in"
  }
};

export const getAppSession = cache(() => getServerSession(authOptions));
