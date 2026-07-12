import BrandStack from "@/components/brand-stack";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | R.O.L.L.",
  description: "Terms of Service for R.O.L.L. (Record Of Legendary Loadouts)"
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6 px-4 animate-in fade-in duration-200">
      {/* Retro terminal title header */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-panel p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-accent" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[0.7rem] uppercase font-mono tracking-widest text-accent font-bold">SYSTEM PROTOCOL // DOCUMENT 101</span>
            <h1 className="text-3xl font-bold tracking-tight mt-1 font-mono">Terms of Service for R.O.L.L.</h1>
            <p className="text-sm text-foreground/50 mt-1 font-mono">
              Last Updated: July 12, 2026
            </p>
          </div>
          <BrandStack />
        </div>
      </div>

      {/* Styled Text body */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-panel p-8 space-y-6 shadow-sm font-mono text-sm leading-relaxed text-foreground/80">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">1. Acceptance of Terms</h2>
          <p>
            By creating an account and using R.O.L.L. (Record Of Legendary Loadouts), you agree to be bound by these Terms of Service. If you do not agree, you may not access or use the application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">2. Purpose of Service</h2>
          <p>
            R.O.L.L. is an independent, hobbyist utility built strictly for tracking legendary video game items, gear loadouts, and performance analytics. This application is a personal passion project and is not affiliated with, endorsed by, or partnered with any game development studio or publishing entity.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">3. User Accounts</h2>
          <p>
            You are responsible for safeguarding the credentials you use to access R.O.L.L. You agree to notify the administrator immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">4. Intellectual Property</h2>
          <p>
            The underlying software framework, design orchestration, custom scripts, and system architecture of R.O.L.L. are the exclusive property of the application creator.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">5. Limitation of Liability</h2>
          <p>
            R.O.L.L. is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied. To the maximum extent permitted by law, the developer of R.O.L.L. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, profile corruption, system downtime, server malfunction, or unauthorized data exposure resulting from your use of the application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">6. Termination</h2>
          <p>
            The administrator reserves the right to terminate or suspend access to your account at any time, without prior notice, for conduct that violates these Terms or is otherwise harmful to the service or other users.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. If a revision is material, we will provide a mandatory notice upon your next login. Your continued use of the service after changes go into effect constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">8. Public Visitor Metrics</h2>
          <p>
            R.O.L.L. tracks and displays aggregate, anonymized unique visitor traffic counts in the public web UI. By using this service, you acknowledge and agree that a temporary, browser-cached indicator (via localStorage) will be utilized daily to report unique visits to the server without transmitting or storing any personal data or IP addresses, as detailed in our Privacy Policy.
          </p>
        </section>

      </div>

      <div className="flex justify-between items-center text-xs font-mono text-foreground/40 px-2">
        <Link href="/privacy" className="hover:text-accent transition-colors">
          &gt; VIEW PRIVACY POLICY
        </Link>
        <Link href="/" className="hover:text-accent transition-colors">
          &gt; RETURN TO SUMMARY
        </Link>
      </div>
    </div>
  );
}
