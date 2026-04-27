import Link from "next/link";
import BrandStack from "@/components/brand-stack";
import { consumeEmailVerificationToken } from "@/lib/email-verification";



type SearchParams = Promise<{
  token?: string;
}>;

export default async function VerifyEmailPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const token = searchParams.token?.trim() ?? "";

  const result = token ? await consumeEmailVerificationToken(token) : { ok: false as const, reason: "missing" as const };

  const title = result.ok ? "Email verified" : "Verification failed";
  const description = result.ok
    ? "Your email is confirmed. You can sign in now."
    : result.reason === "expired"
      ? "That verification link has expired. Create a new account or request a fresh verification email later."
      : "That verification link is missing or invalid.";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <BrandStack align="center" className="mb-4" />
        <div className="rounded-[var(--radius-lg)] border border-border bg-panel/70 p-5">
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-foreground/70">{description}</p>
          <div className="mt-4 text-sm">
            <Link href="/auth/sign-in" className="text-accent hover:underline">
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
