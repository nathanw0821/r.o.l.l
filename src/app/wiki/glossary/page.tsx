import type { Metadata } from "next";
import Link from "next/link";
import HashAnchorScroll from "@/components/hash-anchor-scroll";
import LinkifiedText from "@/components/linkified-text";
import { normalizeEntityKey } from "@/lib/links/entity-links";
import { getSiteUrl } from "@/lib/site-url";
import {
  GLOSSARY_PATCH,
  GLOSSARY_TERMS,
  GLOSSARY_VERIFIED_AT,
  groupGlossaryByLetter,
  seeAlsoLabel
} from "@/lib/truth/mechanics-glossary";

/**
 * Mechanics glossary (WS5 "Hyperlinking" item 5). Static server component: every term comes from
 * `src/data/truth/mechanics-glossary.json`, each with the patch it was checked against. Terms in a
 * definition link to their tool or to another entry; an entry never links to itself.
 */

const PAGE_PATH = "/wiki/glossary";
const PAGE_TITLE = "Mechanics glossary";
const PAGE_DESCRIPTION = `${GLOSSARY_TERMS.length} Fallout 76 combat and crafting terms in plain words, from Onslaught and Kill Streak to Vault Steel and the damage curve. Checked against Patch ${GLOSSARY_PATCH}.`;

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | R.O.L.L`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: { title: `${PAGE_TITLE} | R.O.L.L`, description: PAGE_DESCRIPTION, url: PAGE_PATH, type: "website" }
};

const ALPHABET = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

function letterId(letter: string): string {
  return letter === "#" ? "letter-0-9" : `letter-${letter.toLowerCase()}`;
}

function breadcrumbJsonLd(): string {
  const origin = getSiteUrl()?.origin;
  const abs = (path: string) => (origin ? new URL(path, origin).toString() : path);
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "R.O.L.L", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: abs("/wiki") },
      { "@type": "ListItem", position: 3, name: PAGE_TITLE, item: abs(PAGE_PATH) }
    ]
  };
  // Escape "<" so the payload can never close the script tag (Next.js JSON-LD guide).
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const LINK_CLASS = "text-[var(--color-accent)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--color-accent)]";

export default function GlossaryPage() {
  const groups = groupGlossaryByLetter();
  const present = new Set(groups.map((g) => g.letter));

  return (
    <div className="guides-page mx-auto max-w-4xl space-y-8 py-3 text-[var(--text-primary)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd() }} />
      <HashAnchorScroll />

      <header className="space-y-3">
        <nav aria-label="Breadcrumb" className="guides-mono text-prose text-[var(--text-soft)]">
          <ol className="flex flex-wrap items-center gap-x-2">
            <li>
              <Link href="/wiki" className={LINK_CLASS}>
                Guides
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Glossary</li>
          </ol>
        </nav>
        <h1 className="guides-display guides-heading text-[32px] leading-none text-[var(--color-accent)]">{PAGE_TITLE}</h1>
        <p className="guides-prose max-w-[70ch] text-[15px] leading-relaxed text-[var(--text-muted)]">
          {GLOSSARY_TERMS.length} terms that come up in builds and guides, each in a sentence or two. Numbers are the ones
          the site&apos;s tools use, checked against Patch {GLOSSARY_PATCH} on {GLOSSARY_VERIFIED_AT}.
        </p>
      </header>

      <nav aria-label="Glossary index" className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
        <ol className="guides-mono flex flex-wrap gap-x-1 gap-y-1 text-[15px]">
          {ALPHABET.map((letter) => (
            <li key={letter}>
              {present.has(letter) ? (
                <a
                  href={`#${letterId(letter)}`}
                  aria-label={letter === "#" ? "Numbers" : `Letter ${letter}`}
                  className="inline-block min-w-[1.75rem] rounded px-1.5 py-1 text-center text-[var(--color-accent)] hover:bg-[var(--control-hover)]"
                >
                  {letter}
                </a>
              ) : (
                <span aria-hidden="true" className="inline-block min-w-[1.75rem] px-1.5 py-1 text-center text-[var(--text-soft)] opacity-50">
                  {letter}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.letter} aria-labelledby={letterId(group.letter)} className="space-y-4">
            <h2
              id={letterId(group.letter)}
              className="guides-heading guides-mono guides-anchor border-b border-[var(--border)] pb-1 text-[24px] text-[var(--color-accent)]"
            >
              {group.letter === "#" ? "0–9" : group.letter}
            </h2>
            <dl className="space-y-6">
              {group.terms.map((entry) => (
                <div key={entry.slug} data-glossary-term={entry.slug} className="space-y-1.5">
                  <dt id={entry.slug} className="guides-anchor guides-mono text-[18px] leading-snug text-[var(--text-primary)]">
                    <a href={`#${entry.slug}`} className="hover:text-[var(--color-accent)]">
                      {entry.term}
                    </a>
                  </dt>
                  <dd className="guides-prose max-w-[70ch] space-y-1.5 text-[15px] leading-[1.6] text-[var(--text-muted)]">
                    <p>
                      <LinkifiedText text={entry.definition} skipKeys={new Set([normalizeEntityKey(entry.term)])} />
                    </p>
                    {entry.seeAlso.length > 0 ? (
                      <p className="guides-mono text-prose">
                        <span className="text-[var(--text-soft)]">See also: </span>
                        {entry.seeAlso.map((href, i) => (
                          <span key={href}>
                            {i > 0 ? <span className="text-[var(--text-soft)]"> · </span> : null}
                            <Link href={href} className={LINK_CLASS}>
                              {seeAlsoLabel(href)}
                            </Link>
                          </span>
                        ))}
                      </p>
                    ) : null}
                    <p className="guides-mono text-[12px] text-[var(--text-soft)]">
                      Checked against Patch {entry.verifiedPatch}. Source: {entry.source}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="guides-mono text-prose text-[var(--text-soft)]">
        <Link href="/wiki" className={LINK_CLASS}>
          Back to guides
        </Link>
      </p>
    </div>
  );
}
