import BrandStack from "@/components/brand-stack";
import ForgotPasswordForm from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <BrandStack align="center" className="mb-4" />
        <p className="text-center text-sm text-foreground/70">
          Enter the email on your R.O.L.L account. We will send a secure link to set a new password or create one if you
          only ever signed in with Google or another provider.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
