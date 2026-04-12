const PRIMARY_SOURCES: {
  title: string;
  href: string;
  description: string;
  secondary?: { label: string; href: string };
}[] = [
  {
    title: "Nuka Knights",
    href: "https://nukaknights.com/en/",
    description: "Guides and datamine-style articles used for legendary context and armor tables.",
    secondary: {
      label: "Backwoods armor resist article (builder / full-set math)",
      href: "https://nukaknights.com/articles/expected-changes-for-the-backwoods-update-on-3rd-march-2026.html#armor"
    }
  },
  {
    title: "The Duchess Flame",
    href: "https://www.theduchessflame.com/",
    description: "Build and legendary reference material aligned with community research workflows."
  },
  {
    title: "Fallout Wiki — Fandom (Fallout 76 portal)",
    href: "https://fallout.fandom.com/wiki/Category:Fallout_76_portal",
    description: "Effect names, descriptions, categories, and cross-patch wiki context."
  },
  {
    title: "Bethesda — Fallout 76",
    href: "https://fallout.bethesda.net/en",
    description: "Official site for announcements, updates, and first-party framing against patch notes."
  }
];

export default function OverviewSources() {
  return (
    <section
      className="mb-6 rounded-[var(--radius)] border border-border bg-panel px-4 py-4 md:px-5 md:py-5"
      aria-labelledby="overview-sources-heading"
    >
      <h2 id="overview-sources-heading" className="text-sm font-semibold text-foreground">
        Sources &amp; credit
      </h2>
      <div className="mt-3 rounded-[var(--radius)] border border-border border-l-[3px] border-l-accent/60 bg-background/35 px-3 py-3 md:px-4 md:py-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-foreground/55">Credit</div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          <span className="font-medium text-foreground/90">Express credit</span> for data retrieval, research,
          verification, and compilation belongs to the people behind{" "}
          <span className="font-medium text-foreground/85">Nuka Knights</span>,{" "}
          <span className="font-medium text-foreground/85">The Duchess Flame</span>, the many contributors to the{" "}
          <span className="font-medium text-foreground/85">Fallout Wiki (Fandom)</span>, and{" "}
          <span className="font-medium text-foreground/85">Bethesda</span>&apos;s own Fallout 76 publishing—that work is
          what makes community tools trustworthy.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75">
          <span className="font-medium text-foreground/85">R.O.L.L.</span> does not claim authorship of that catalog.
          This project <span className="font-medium text-foreground/85">re-sorts and presents</span> that knowledge in
          an <span className="font-medium text-foreground/85">intuitive, user-friendly interface</span> so you get a
          clearer, more realistic picture of what your build actually provides inside the models and totals shipped
          here—including the experimental loadout builder.
        </p>
      </div>
      <p className="mt-4 text-xs text-foreground/60">
        Reference links below point to the primary sites used when shaping R.O.L.L.&apos;s UI, copy, and sandbox math.
        R.O.L.L. is not affiliated with these sites; they are credited for attribution and further reading.
      </p>
      <ul className="mt-3 space-y-3 text-sm text-foreground/80">
        {PRIMARY_SOURCES.map((s) => (
          <li key={s.href}>
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
            >
              {s.title}
            </a>
            <span className="text-foreground/65"> — {s.description}</span>
            {s.secondary ? (
              <div className="mt-1.5 pl-0 text-xs text-foreground/60">
                <a
                  href={s.secondary.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent underline decoration-accent/35 underline-offset-2 hover:decoration-accent"
                >
                  {s.secondary.label}
                </a>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
