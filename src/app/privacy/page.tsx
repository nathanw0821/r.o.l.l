import BrandStack from "@/components/brand-stack";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | R.O.L.L.",
  description: "Privacy Policy for R.O.L.L."
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6 px-4 animate-in fade-in duration-200">
      <div className="rounded-xl border border-border bg-panel p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-accent" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[0.7rem] uppercase font-mono tracking-widest text-accent font-bold">PRIVACY POLICY</span>
            <h1 className="text-2xl font-bold tracking-tight mt-1 font-mono">Privacy Policy</h1>
            <p className="text-xs text-foreground/50 mt-1 font-mono">Updated: August 2026</p>
          </div>
          <BrandStack />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-panel p-6 space-y-5 font-mono text-xs leading-relaxed text-foreground/80">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">1. Information We Collect</h2>
          <p>We collect minimal data needed to save your loadouts and run your account:</p>
          <ul className="list-disc pl-5 space-y-1.5 mt-1">
            <li><strong>Account Data:</strong> Username and email address for sign-in and account recovery.</li>
            <li>
              <strong>Google &amp; Discord Sign-In:</strong> Basic public profile info (name, email, profile picture/ID). Used only to log you in and show your profile. Complies with <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-accent underline">Google Limited Use requirements</a>. We never sell, share, or advertise with your data.
            </li>
            <li><strong>Local Visit Count:</strong> Client-side <code>localStorage</code> flag to count daily unique visits. No IP addresses or tracking cookies are stored on our servers.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">2. Infrastructure &amp; Security</h2>
          <p>Hosted on Cloudflare Workers and Neon. Technical safeguards like password hashing protect your account. As a hobby project, we take security seriously but cannot guarantee 100% security against all web threats.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">3. Data Control &amp; Deletion</h2>
          <p>You own your data. You can delete your account and all saved items at any time in Account Settings or by sending feedback.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">4. Contact</h2>
          <p>Questions or data removal requests? Use the Feedback form in the app navigation.</p>
        </section>
      </div>

      <div className="flex justify-between items-center text-xs font-mono text-foreground/50 px-2">
        <Link href="/terms" className="hover:text-accent transition-colors">
          &gt; TERMS OF SERVICE
        </Link>
        <Link href="/" className="hover:text-accent transition-colors">
          &gt; HOME
        </Link>
      </div>
    </div>
  );
}
