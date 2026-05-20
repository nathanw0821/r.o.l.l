import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: Request, ctx: any) {
  console.log("[NextAuth GET] Environment check:", {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    APP_URL: process.env.APP_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "defined" : "undefined",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "defined" : "undefined",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    NODE_ENV: process.env.NODE_ENV,
  });
  return NextAuth(authOptions)(req, ctx);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: Request, ctx: any) {
  console.log("[NextAuth POST] Environment check:", {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    APP_URL: process.env.APP_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "defined" : "undefined",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "defined" : "undefined",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    NODE_ENV: process.env.NODE_ENV,
  });
  return NextAuth(authOptions)(req, ctx);
}

