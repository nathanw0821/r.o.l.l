import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username?: string | null;
      emailVerified?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string | null;
    emailVerified?: boolean;
    /** credentialFingerprint() of the user when the token was last checked. */
    fp?: string;
    checkedAt?: number;
  }
}
