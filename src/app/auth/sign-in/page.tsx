import BrandStack from "@/components/brand-stack";
import { isPublicRegistrationEnabled } from "@/lib/app-config";
import SignInForm from "@/components/sign-in-form";

export default function SignInPage() {
  const allowPublicRegistration = isPublicRegistrationEnabled();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
        <BrandStack
          align="center"
          variant="auth"
          className="mb-5"
          subtitleSlot={
            <span className="brand-stack__subtitle-acronym" aria-label="Record Of Legendary Loadouts">
              <span className="brand-stack__subtitle-word">
                <span className="brand-stack__subtitle-initial">R</span>
                <span className="brand-stack__subtitle-rest">ecord</span>
              </span>{" "}
              <span className="brand-stack__subtitle-word">
                <span className="brand-stack__subtitle-initial">O</span>
                <span className="brand-stack__subtitle-rest">f</span>
              </span>{" "}
              <span className="brand-stack__subtitle-word">
                <span className="brand-stack__subtitle-initial">L</span>
                <span className="brand-stack__subtitle-rest">egendary</span>
              </span>{" "}
              <span className="brand-stack__subtitle-word">
                <span className="brand-stack__subtitle-initial">L</span>
                <span className="brand-stack__subtitle-rest">oadouts</span>
              </span>
            </span>
          }
        />
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
