# ☢️ R.O.L.L. (Record Of Legendary Loadouts)

[![Aesthetic: CRT Green](https://img.shields.io/badge/Aesthetic-CRT%20Green-green?style=flat-square)](#)
[![Stack: Next.js + Tailwind](https://img.shields.io/badge/Stack-Next.js%20%7C%20Prisma%20%7C%20Tailwind-blueviolet?style=flat-square)](#)
[![Runtime: Cloudflare Workers](https://img.shields.io/badge/Runtime-Cloudflare%20Edge-blue?style=flat-square)](#)

A premium, terminal-styled **Fallout 76 companion application** engineered to manage legendary mod unlocks, run advanced OCR local-first scans, and simulate character loadouts in a high-fidelity sandbox environment.

Designed with a high-fidelity, glow-overlay **Pip-Boy CRT green theme**, R.O.L.L. brings the immersive aesthetic of the Wasteland directly to your desktop and mobile browser.

---

## ⚡ Core Features

### 🗃️ 1. Registry Management
Track your learned legendary mods across multiple accounts and platforms (**PC, Xbox, PlayStation**). Mark legendary effects from **1★ to 3★** as *Unlocked* or *Seeking*, sync plans, and organize your trade/craft inventory with a centralized profile dashboard.

### 📷 2. S.C.A.N. (Beta) — Local-First OCR
Skip manual input. Paste or drag-and-drop in-game screenshots of your Fallout 76 inventory or Pip-Boy screens. Our local-first OCR processing system runs completely in your browser via Tesseract.js, instantly parsing weapon and armor listings to auto-identify and sync learned mods directly to your cloud registry.

### 🛠️ 3. B.U.I.L.D. (Beta) — Interactive Sandbox
A robust, high-fidelity engineering workbench simulating real-time character loadouts.
*   **Schematic Layout Grid:** A visual chassis mapping representing individual gear slots (Helmet, Chest/Torso, Left Arm, Right Arm, Left Leg, Right Leg).
*   **Dynamic Customization:** Toggle legendary effects tier-by-tier and slot-by-slot, apply material modifications, misc mods (Targeting HUD, Jetpacks, etc.), underarmor shells, and mutations.
*   **Live SPECIAL Telemetry:** Instantly see your DR (Damage Resistance), ER (Energy Resistance), FR (Fire Resistance), CR (Cryo Resistance), PR (Poison Resistance), RR (Rad Resistance), and total SPECIAL stats recalculate as you alter your gear.
*   **Intelligent Constraints:** Automatically handles regular armor sets (5 pieces, helm lock) and Power Armor sets (6 pieces, helm misc mod support with locked legendary slots) using exact schematic payload layouts.

---

## 🚀 Quick Start & User Guide

1.  **Sync & Authenticate:** Securely register or sign in to persist your registry, progress achievements, and custom loadouts across all your devices.
2.  **All Effects Registry:** Jump into the **All Effects** or **Summary** dashboard to manually browse legendary effects, filtering by tier or slot to flag items as *Unlocked* or *Seeking*.
3.  **Process Screenshots:** Head to the **S.C.A.N.** terminal to drop or upload batch screenshots. Review OCR parsed cards, verify, and commit them directly to your active plan database.
4.  **Simulate Build Stats:** Head to the **B.U.I.L.D.** bay to select your active chassis (e.g., Secret Service Armor, Union Power Armor, or standard weapon matrix). Customize components and verify resistance metrics.

---

## 🛠️ Development & Engineering

### Requirements
*   **Node.js**: `v20.19.0` or higher
*   **Package Manager**: `npm`
*   **Database**: PostgreSQL or Prisma-compatible client

### Setup Local Environment

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/nathanw/r.o.l.l.git
    cd r.o.l.l
    ```

2.  **Configure Environment Variables:**
    Create a `.env` or `.env.local` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/roll_db"
    NEXTAUTH_SECRET="your-nextauth-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    
    # OAuth Providers
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Seed Database Catalog:**
    Set up standard builder databases, legendary mods metadata, and schema structures:
    ```bash
    npx prisma db push
    npm run db:seed
    npm run db:seed:builder
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the terminal UI in your browser.

### Key Terminal Commands

*   `npm run lint` - Execute ESLint static analysis checking.
*   `npm run typecheck` - Run TypeScript compiler checks (`tsc --noEmit`).
*   `npm run test` - Execute fast unit and integration tests using Vitest.
*   `npm run build` - Generate an optimized production build using Webpack and OpenNext.
*   `npm run release:check` - Unify linting, schema validation, tests, and production compilation to check integrity prior to commits.

---

## 🌐 Deployment Configuration

R.O.L.L. is architected to compile via **OpenNext** and deploy onto the **Cloudflare Workers / Edge Runtime** for global, low-latency execution.

### Cloudflare Compatibilities
In `wrangler.toml`, compatibility settings are configured to support outbound OIDC handshakes and secure database pools on edge platforms:
```toml
compatibility_flags = ["nodejs_compat", "enable_nodejs_http_modules"]
```
This is required to resolve NextAuth OIDC token exchanges by enabling local Node.js network streams within the edge isolates.

---

## 🤝 Acknowledgments

R.O.L.L. is proudly built with and inspired by excellent resources developed by the dedicated **Fallout 76 community**:
*   **Nuka Knights** (Datamined articles, resistance structures, and backwoods patch notes)
*   **Nukes & Dragons** (Character build calculations and overlay specifications)
*   **The Duchess Flame** (Registry maps and legendary mechanics guides)
*   **The Fallout Wiki** (General descriptions and base item assets)
