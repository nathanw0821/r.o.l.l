import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import TwitchProvider from "next-auth/providers/twitch";
import DiscordProvider from "next-auth/providers/discord";
import RedditProvider from "next-auth/providers/reddit";
import AzureADProvider from "next-auth/providers/azure-ad";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { applyImportedProfileIfNeeded } from "@/lib/profile";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

async function applyProfile(userId: string) {
  try {
    await applyImportedProfileIfNeeded(userId);
  } catch (error) {
    // Skip profile application errors to avoid blocking sign-in.
  }
}

function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  callbacks: {
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
  providers: [
    CredentialsProvider({
      name: "Username",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const username = normalizeUsername(parsed.data.username);
        const password = parsed.data.password.trim();
        if (!username || !password) return null;

        const existing = await prisma.user.findUnique({
          where: { username }
        });

        if (existing?.passwordHash) {
          const valid = await bcrypt.compare(password, existing.passwordHash);
          if (!valid) return null;
          await applyProfile(existing.id);
          return existing;
        }

        if (existing && !existing.passwordHash) {
          const passwordHash = await bcrypt.hash(password, 12);
          const updated = await prisma.user.update({
            where: { id: existing.id },
            data: { passwordHash }
          });
          await applyProfile(updated.id);
          return updated;
        }

        const legacyAuthCode = username.toUpperCase();
        const legacySecondary = password.toUpperCase();

        const legacy = await prisma.user.findFirst({
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

        const legacyNoSecondary = await prisma.user.findFirst({
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

        try {
          const passwordHash = await bcrypt.hash(password, 12);
          const created = await prisma.user.create({
            data: {
              username,
              passwordHash,
              settings: {
                create: {}
              }
            }
          });

          await applyProfile(created.id);
          return created;
        } catch (error) {
          const fallback = await prisma.user.findUnique({
            where: { username }
          });
          if (fallback?.passwordHash) {
            const valid = await bcrypt.compare(password, fallback.passwordHash);
            if (valid) {
              await applyProfile(fallback.id);
              return fallback;
            }
          }
          return null;
        }
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
      : [])
    ,
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
