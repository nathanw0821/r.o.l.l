# R.O.L.L.

**Record Of Legendary Loadouts** — a Fallout 76 companion for tracking legendary unlocks, browsing effects, and (experimentally) sandboxing loadout stats. Progress is manual-first and syncs when you sign in.

## Development

- **Node:** 20.19+ (see `package.json` engines)
- **Install:** `npm install`
- **Dev server:** `npm run dev`
- **Release checks:** `npm run release:check` (lint, Prisma validate, Next build, TypeScript)

Database setup uses Prisma; production builds run `prisma migrate deploy` before `next build` (see `vercel-build` script).

## Credits & sources

Full reference links and credit copy live in the app under **Overview → Readme**. Primary references include [Nuka Knights](https://nukaknights.com/en/), [Nukes & Dragons](https://nukesdragons.com/fallout-76/character) (Fallout 76 character planner), [The Duchess Flame](https://www.theduchessflame.com/), the [Fallout 76 portal on Fandom](https://fallout.fandom.com/wiki/Category:Fallout_76_portal), and [Bethesda’s Fallout 76 site](https://fallout.bethesda.net/en). R.O.L.L. re-presents community and official material in its own UI; it does not claim authorship of the underlying data.

## Builder: Ghoul mode

When **Ghoul** is enabled on the experimental loadout builder, Live totals follow a simplified reading of **playable ghoul** rules (Ghoul Within): hunger/thirst–linked bench rows are adjusted, **RR from gear still stacks** (resist can matter even though rad *damage* works differently for ghouls), and an effective **CHA −10** is applied. See the [Fallout Wiki — playable ghoul](https://fallout.fandom.com/wiki/Fallout_76_playable_ghoul) article for in-game details; the sandbox is approximate, not a full character sim.

## Workflow Transition

As of April 2026, the development workflow for R.O.L.L. has transitioned from using Cursor to **Antigravity** for AI-assisted coding and agentic operations. This shift ensures continued integration with Vercel, Neon, and Git while leveraging Antigravity's advanced capabilities.

