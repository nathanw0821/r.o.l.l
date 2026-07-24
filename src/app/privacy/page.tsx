import BrandStack from "@/components/brand-stack";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | R.O.L.L.",
  description: "Privacy Policy for R.O.L.L. (Record Of Legendary Loadouts)"
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6 px-4 animate-in fade-in duration-200">
      {/* Retro terminal title header */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-panel p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-accent" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[0.7rem] uppercase font-mono tracking-widest text-accent font-bold">SYSTEM PROTOCOL // DOCUMENT 102</span>
            <h1 className="text-3xl font-bold tracking-tight mt-1 font-mono">Privacy Policy for R.O.L.L.</h1>
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
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">1. Information We Collect</h2>
          <p>We collect only the bare minimum information required to operate your account and save your legendary loadouts:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Account Information:</strong> Your chosen username and email address, which are collected strictly for authentication and account recovery purposes.
            </li>
            <li>
              <strong>Discord OAuth &amp; Bot Integration:</strong> When signing in or linking your account via Discord, we receive your basic public Discord profile (Discord User ID, username, and email) strictly to authenticate your account and award in-app achievements. The R.O.L.L. Discord Bot operates statelessly via webhook interactions to process slash commands (<code>/effect</code>, <code>/scrip</code>, <code>/build</code>); it does not read, store, or log Discord server messages, chat histories, or member lists. You can disconnect your Discord account at any time via Account Settings.
            </li>
            <li>
              <strong>Usage Logs &amp; Metrics:</strong> When enabled, we collect basic, anonymized session metrics and interaction logs strictly to debug system performance, optimize server latency, and improve database query efficiency.
            </li>
            <li>
              <strong>Unique Visit Tracking:</strong> To display aggregate site traffic stats inside the web UI, the application utilizes local client-side storage (<code>localStorage</code>) to record a stateless daily visit indicator. This is used solely to prevent duplicate counting during a 24-hour period, is automatically reset daily, and does not collect, process, or store IP addresses, cookies, or any personal data on our servers.
            </li>

          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">2. Third-Party Infrastructure</h2>
          <p>
            R.O.L.L. is hosted using direct web routing stacks provided by Cloudflare. While we do not sell or share your data with third-party advertisers, baseline network data (such as IP addresses and browser user agents) is automatically processed by Cloudflare to mitigate DDoS attacks, block automated bots, and ensure secure data routing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">3. Data Security</h2>
          <p>
            We implement standard technical safeguards, including modern cryptographic hashing for passwords, to protect your personal information against unauthorized access, loss, or disclosure. However, because this is a hobbyist platform, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">4. Data Retention and Deletion Rights</h2>
          <p>
            Your account data will be stored as long as your account remains active. You have the right to request the complete destruction of your personal data at any time. Upon receiving a deletion request, the administrator will instantly and permanently wipe your account records, username, email, and saved items from the active database.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">5. Contact Information</h2>
          <p>
            If you have any questions about this Privacy Policy or wish to request the immediate erasure of your user data, please contact the application administrator directly via the system Feedback terminal.
          </p>
        </section>
      </div>

      <div className="flex justify-between items-center text-xs font-mono text-foreground/40 px-2">
        <Link href="/terms" className="hover:text-accent transition-colors">
          &gt; VIEW TERMS OF SERVICE
        </Link>
        <Link href="/" className="hover:text-accent transition-colors">
          &gt; RETURN TO SUMMARY
        </Link>
      </div>
    </div>
  );
}
