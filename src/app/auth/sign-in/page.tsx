import BrandStack from "@/components/brand-stack";
import SignInForm from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <BrandStack align="center" className="mb-4" />
        <p className="text-sm text-foreground/70 text-center">
          Enter your username and password. If the combination does not exist yet, it will be created.
        </p>
        <div className="mt-6">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
