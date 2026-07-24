# ☢️ R.O.L.L. — Record Of Legendary Loadouts & Build Engine

[![Site](https://img.shields.io/badge/Live-fallout76.wiki-f3a24d?style=for-the-badge&logo=cloudflare)](https://fallout76.wiki)
[![Node](https://img.shields.io/badge/Node.js-24%2B-43853d?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Runtime](https://img.shields.io/badge/Runtime-Cloudflare%20Workers-f38020?style=for-the-badge&logo=cloudflareworkers)](https://workers.cloudflare.com)

**R.O.L.L.** is a high-performance, terminal-styled companion application for **Fallout 76**. Built for PC and mobile, it helps players track legendary mod crafting unlocks, run local-first OCR inventory scans, and simulate character loadouts in a real-time sandbox.

---

## ✨ Features at a Glance

| Feature | Description |
| :--- | :--- |
| **🗃️ Registry Tracker** | Track learned & seeking legendary mods across **1★ to 4★** tiers for multi-character rosters. |
| **🛠️ B.U.I.L.D. Sandbox** | Simulate full gear sets (Armor, Power Armor, Weapons, Underarmor, Mutations) with real-time DR/ER/RR & SPECIAL stats. |
| **📷 S.C.A.N. (OCR)** | Drag-and-drop Pip-Boy inventory screenshots for local in-browser OCR parsing via Tesseract.js. |
| **⚡ Auto-Pull Sync** | Daily 1:00 PM EST automated data scraping from NukaKnights with Discord Webhook notifications. |
| **🖼️ PNG Exporter** | Export single-screen **1080p/4K Summary Grids** and visual Pip-Boy build loadout cards. |
| **📱 Offline PWA** | Progressive Web App support for second-screen and offline in-game use. |

---

## ⚡ Quick Start

```bash
# 1. Clone & Install
git clone https://github.com/nathanw0821/r.o.l.l.git
cd r.o.l.l
npm ci

# 2. Setup Environment (.env)
cp .env.example .env

# 3. Push Database & Launch Dev Server
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ CLI Toolkit

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Launch Next.js local development server |
| `npm run typecheck` | Run TypeScript type checks (`tsc --noEmit`) |
| `npm run lint` | Run ESLint static analysis |
| `npm run test` | Run Vitest unit suite (24 tests) |
| `npm run build:cf` | Build production Cloudflare Worker bundle (`opennextjs-cloudflare`) |
| `npm run release:check` | Run full pre-commit verification (lint + validate + test + build) |

---

## 🏗️ Architecture

* **Framework**: Next.js 16 (App Router + Server Actions)
* **Database**: PostgreSQL (Neon Serverless) + Prisma ORM 7
* **Auth**: NextAuth.js (JWT HTTP-Only Session Cookies + Google OIDC + Password Hashing)
* **Deployment**: Cloudflare Workers (Edge Runtime) via OpenNext
* **Styling**: Vanilla CSS Design System + Tailwind Utilities + Radix Primitives

---

## 🤝 Credits & Acknowledgments

R.O.L.L. is built for the Fallout 76 community with reference data from:
* **[NukaKnights](https://nukaknights.com)** · Legendary effect descriptions, crafting costs, and patch datamines
* **Nukes & Dragons** · Character build math & SPECIAL mechanics
* **The Duchess Flame** · Registry guides and crafting component maps
* **Fallout Wiki** · Base item assets and lore reference

---

Licensed under [MIT](LICENSE) © R.O.L.L. Team
