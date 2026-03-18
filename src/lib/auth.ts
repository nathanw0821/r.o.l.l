import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  identifier: z.string().min(1)
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database"
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  },
  providers: [
    CredentialsProvider({
      name: "Local",
      credentials: {
        identifier: { label: "Email or name", type: "text" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const identifier = parsed.data.identifier.trim();
        const isEmail = identifier.includes("@");

        const existing = await prisma.user.findFirst({
          where: isEmail ? { email: identifier } : { name: identifier }
        });

        if (existing) return existing;

        const created = await prisma.user.create({
          data: {
            name: isEmail ? identifier.split("@")[0] : identifier,
            email: isEmail ? identifier : null,
            settings: {
              create: {}
            }
          }
        });

        return created;
      }
    })
  ],
  pages: {
    signIn: "/auth/sign-in"
  }
};
