import BrandStack from "@/components/brand-stack";
import Link from "next/link";

export const metadata = {
  title: "Community Rules & Guidelines | R.O.L.L.",
  description: "Vault-Tec Community Rules & Guidelines for R.O.L.L. and Fallout 76 Discord servers."
};

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6 px-4 animate-in fade-in duration-200">
      {/* Retro terminal title header */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-panel p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-accent" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[0.7rem] uppercase font-mono tracking-widest text-accent font-bold">SYSTEM PROTOCOL // DOCUMENT 104</span>
            <h1 className="text-3xl font-bold tracking-tight mt-1 font-mono">Vault-Tec Community Rules &amp; Guidelines</h1>
            <p className="text-sm text-foreground/50 mt-1 font-mono">
              Code of Conduct for R.O.L.L. and Partnered Fallout 76 Discord Communities
            </p>
          </div>
          <BrandStack />
        </div>
      </div>

      {/* Rules body */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-panel p-8 space-y-6 shadow-sm font-mono text-sm leading-relaxed text-foreground/80">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">1. Respect Fellow Dwellers 🤝</h2>
          <p>
            Treat all Vault Dwellers and community members with courtesy and respect. We enforce a zero-tolerance policy against hate speech, harassment, personal attacks, discrimination, or targeted toxicity. Keep discussions constructive and welcoming to new and veteran players alike.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">2. Safe &amp; Legitimate Trading Etiquette 🤝</h2>
          <p>
            When trading legendary mod boxes, weapons, armor, or plans:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>No Real-Money Trading (RMT):</strong> Trading for real-world currency, gift cards, or external services is strictly prohibited. All trades must be in-game caps, junk, or items.
            </li>
            <li>
              <strong>No Scamming:</strong> Always verify item stats, star ranks, and trade parameters before confirming trades in-game. Scammers will be permanently banned.
            </li>
            <li>
              <strong>Use Trusted Couriers:</strong> For high-value legacy or god-roll trades, utilize official community couriers when available.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">3. Honest Tracking &amp; No Malicious Exploits 🛠️</h2>
          <p>
            R.O.L.L. is a safe, user-managed companion tracker built to respect Bethesda terms of service and player privacy:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              Do not attempt to reverse engineer, flood, or abuse public API endpoints, share links, or bot commands.
            </li>
            <li>
              Do not post links to dangerous executables, malware, or unauthorized third-party game modifications.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">4. Community Discord Bot Usage 🤖</h2>
          <p>
            When using the R.O.L.L. Discord Bot across community Discord servers:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              Execute bot commands (<code>/effect</code>, <code>/craft</code>, <code>/compare</code>, <code>/progress</code>, <code>/random</code>, <code>/scrip</code>, <code>/build</code>) in designated bot channels (e.g. <code>#bot-commands</code>) to prevent channel clutter.
            </li>
            <li>
              Do not spam commands repeatedly. The bot enforces fair-use rate limiting to ensure 100% uptime for all servers.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-1">5. Privacy &amp; Data Rights 🔒</h2>
          <p>
            R.O.L.L. respects your data and identity. For complete information on how your Google OAuth, Discord OAuth, and account data are protected under Limited Use policies, please review our{" "}
            <Link href="/privacy" className="text-accent underline hover:text-accent/80">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-accent underline hover:text-accent/80">
              Terms of Service
            </Link>.
          </p>
        </section>

      </div>

      <div className="flex justify-between items-center text-xs font-mono text-foreground/40 px-2">
        <Link href="/" className="hover:text-accent hover:underline">
          &larr; Back to R.O.L.L. Matrix Hub
        </Link>
        <span>R.O.L.L. Community Protocol v1.0</span>
      </div>
    </div>
  );
}
