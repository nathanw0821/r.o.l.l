import SignInForm from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <h1 className="text-2xl font-semibold">R.O.L.L. Sign In</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Use a name or email. This is a lightweight local sign-in for the MVP.
        </p>
        <div className="mt-6">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
