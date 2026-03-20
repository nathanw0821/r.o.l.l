import { redirect } from "next/navigation";
import BrandStack from "@/components/brand-stack";
import SignUpForm from "@/components/sign-up-form";
import { isPublicRegistrationEnabled } from "@/lib/app-config";

export default function SignUpPage() {
  if (!isPublicRegistrationEnabled()) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <BrandStack align="center" className="mb-4" />
        <p className="text-center text-sm text-foreground/70">
          Create a local account with your email, username, and password. Email verification is ready now and can be wired to automatic delivery later.
        </p>
        <div className="mt-6">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
