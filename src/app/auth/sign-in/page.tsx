import BrandStack from "@/components/brand-stack";
import { isGoogleOAuthConfigured, isPublicRegistrationEnabled } from "@/lib/app-config";
import SignInForm from "@/components/sign-in-form";
import { getSiteUrl } from "@/lib/site-url";

export default function SignInPage() {
  const allowPublicRegistration = isPublicRegistrationEnabled();
  const googleOAuthConfigured = isGoogleOAuthConfigured();
  const oauthCallbackBase = getSiteUrl()?.origin ?? null;

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
          {googleOAuthConfigured
            ? allowPublicRegistration
              ? "Use Google or another provider below, or sign in with your username or email and password. If Google is down, use password sign-in or the email link on this page to set one. New accounts are created on the sign-up page."
              : "Use Google or another provider below if shown, or sign in with your username or email and password. If Google is down, use password sign-in or the email link on this page to set one. Local access is limited to existing or pre-provisioned accounts."
            : allowPublicRegistration
              ? "Sign in with your username or email and password. New accounts are created on the sign-up page."
              : "Sign in with your username or email and password. Local access is limited to existing or pre-provisioned accounts."}
        </p>
        <div className="mt-6">
          <SignInForm
            allowPublicRegistration={allowPublicRegistration}
            googleOAuthConfigured={googleOAuthConfigured}
            oauthCallbackBase={oauthCallbackBase}
          />
        </div>
      </div>
    </div>
  );
}
