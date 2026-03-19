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
            ? "Enter your username and password. New local accounts can be created automatically."
            : "Enter your username and password. Local username access is limited to existing or pre-provisioned accounts."}
        </p>
        <div className="mt-6">
          <SignInForm allowPublicRegistration={allowPublicRegistration} />
        </div>
      </div>
    </div>
  );
}
