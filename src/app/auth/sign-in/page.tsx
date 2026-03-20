import BrandStack from "@/components/brand-stack";
import { isPublicRegistrationEnabled } from "@/lib/app-config";
import SignInForm from "@/components/sign-in-form";

export default function SignInPage() {
  const allowPublicRegistration = isPublicRegistrationEnabled();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <BrandStack align="center" className="mb-4" />
        <p className="text-sm text-foreground/70 text-center">
          {allowPublicRegistration
            ? "Sign in with your username or email and password. New accounts are created on the sign-up page."
            : "Sign in with your username or email and password. Local access is limited to existing or pre-provisioned accounts."}
        </p>
        <div className="mt-6">
          <SignInForm allowPublicRegistration={allowPublicRegistration} />
        </div>
      </div>
    </div>
  );
}
