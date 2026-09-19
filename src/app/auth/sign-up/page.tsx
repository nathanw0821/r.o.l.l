import { redirect } from "next/navigation";
import BrandStack from "@/components/brand-stack";
import SignUpForm from "@/components/sign-up-form";
import { isPublicRegistrationEnabled } from "@/lib/app-config";

export default function SignUpPage() {
  if (!isPublicRegistrationEnabled()) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-8 md:min-h-[70vh]">
        <BrandStack align="center" className="mb-4" />
        <h1 className="mb-2 text-center text-lg font-semibold">Create an account</h1>
        <p className="text-center text-sm text-foreground/70">
          Create your account with email, username, and password.
        </p>
        <div className="mt-6">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
