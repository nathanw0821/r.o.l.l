import BrandStack from "@/components/brand-stack";
import ResetPasswordForm from "@/components/reset-password-form";

type SearchParams = Promise<{ token?: string }>;

export default async function ResetPasswordPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const token = searchParams.token?.trim() ?? "";

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-8 md:min-h-[70vh]">
        <BrandStack align="center" className="mb-4" />
        <h1 className="mb-2 text-center text-lg font-semibold">Choose a new password</h1>
        <p className="text-center text-sm text-foreground/70">
          Choose a password for your account. After saving, sign in with this email address and password.
        </p>
        <div className="mt-6">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
