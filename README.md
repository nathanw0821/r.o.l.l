# R.O.L.L. (Record Of Legendary Loadouts)

A premium Fallout 76 companion for managing legendary mod unlocks and simulating character loadouts.

## Core Features

- **Registry Management**: Track your learned legendary mods across multiple accounts and platforms (PC, Xbox, PlayStation).
- **S.C.A.N. (Beta)**: Local-first OCR analysis. Paste or upload in-game screenshots to automatically identify and sync your learned mods.
- **B.U.I.L.D. (Beta)**: A high-fidelity sandbox for simulating the impact of legendary mods, underarmor, and mutations on your live character stats.

## Quick Start

1. **Sync**: Sign in to persist your registry across devices.
2. **Track**: Use the **All Effects** or **Summary** tabs to mark mods as 'Unlocked' or 'Seeking'.
3. **Scan**: Head to the **S.C.A.N.** tab to batch-process screenshots and update your registry instantly.
4. **Simulate**: Use the **B.U.I.L.D.** tab to experiment with gear combinations and see their mathematical impact on your DR, ER, and SPECIAL stats.

## Development

- **Requirements**: Node 20.19+, Prisma-compatible database.
- **Commands**:
  - `npm install` - Install dependencies.
  - `npm run dev` - Start the local development server.
  - `npm run release:check` - Run full validation suite (Lint, Prisma, Build, Typecheck).
  - `npm run db:seed:builder` - Seed the builder mod catalog.

## Acknowledgments
R.O.L.L. utilizes data and inspirations from the Fallout 76 community, including **Nuka Knights**, **Nukes & Dragons**, **The Duchess Flame**, and the **Fallout Wiki**.
