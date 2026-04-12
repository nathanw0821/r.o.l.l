/** Primary references and attribution copy (Overview → Readme tab and root README). */

export const PRIMARY_REFERENCE_SITES: {
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

export const CREDIT_PARAGRAPHS = [
  "Express credit for data retrieval, research, verification, and compilation belongs to the people behind Nuka Knights, The Duchess Flame, the many contributors to the Fallout Wiki (Fandom), and Bethesda’s own Fallout 76 publishing—that work is what makes community tools trustworthy.",
  "R.O.L.L. does not claim authorship of that catalog. This project re-sorts and presents that knowledge in an intuitive interface so you get a clearer picture of what your build provides inside the models and totals shipped here—including the experimental loadout builder."
] as const;
