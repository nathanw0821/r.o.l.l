import BrandStack from "@/components/brand-stack";
import ForgotPasswordForm from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-8 md:min-h-[70vh]">
        <BrandStack align="center" className="mb-4" />
        <h1 className="mb-2 text-center text-lg font-semibold">Set or reset your password</h1>
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
