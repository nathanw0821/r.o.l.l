import BrandStack from "@/components/brand-stack";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | R.O.L.L.",
  description: "Terms of Service for R.O.L.L."
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6 px-4 animate-in fade-in duration-200">
      <div className="rounded-xl border border-border bg-panel p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-accent" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[0.7rem] uppercase font-mono tracking-widest text-accent font-bold">TERMS OF SERVICE</span>
            <h1 className="text-2xl font-bold tracking-tight mt-1 font-mono">Terms of Service</h1>
            <p className="text-xs text-foreground/50 mt-1 font-mono">Updated: August 2026</p>
          </div>
          <BrandStack />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-panel p-6 space-y-5 font-mono text-xs leading-relaxed text-foreground/80">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">1. Acceptance</h2>
          <p>By creating an account or using R.O.L.L., you agree to these Terms. If you disagree, do not use the app.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">2. Purpose</h2>
          <p>R.O.L.L. is an independent community tool for tracking Fallout 76 legendary loadouts and perks. It is not affiliated with, endorsed by, or partnered with Bethesda Game Studios or ZeniMax Media.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">3. User Accounts</h2>
          <p>Keep your login credentials secure. You are responsible for any activity under your account.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">4. Disclaimer &amp; Liability</h2>
          <p>R.O.L.L. is provided &quot;as is&quot; without warranties. The developer is not liable for data loss, downtime, or service interruptions.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">5. Termination</h2>
          <p>We reserve the right to suspend or delete accounts that abuse the platform, spam APIs, or violate community standards.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">6. Third-Party Auth</h2>
          <p>Google and Discord sign-ins follow their respective terms and privacy policies. Google user data strictly follows the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-accent underline">Google API Limited Use Policy</a>.</p>
        </section>
      </div>

      <div className="flex justify-between items-center text-xs font-mono text-foreground/50 px-2">
        <Link href="/privacy" className="hover:text-accent transition-colors">
          &gt; PRIVACY POLICY
        </Link>
        <Link href="/" className="hover:text-accent transition-colors">
          &gt; HOME
        </Link>
      </div>
    </div>
  );
}
