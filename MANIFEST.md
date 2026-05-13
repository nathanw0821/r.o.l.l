# 🚀 PROJECT MANIFEST: R.O.L.L. (Record Of Legendary Loadouts)
**Developer:** Nathan Lee Watson (BearOnABus)  
**Core Philosophy:** **Proscription Model** (Usage-based automated billing; sustain hosting/AI costs only; anti-profit).  
**Current Technical Goal:** Transition from manual data entry to a client-side OCR infrastructure optimized for the *Fallout 76* "Knowledge Meta."

---

## 1. TECHNICAL ARCHITECTURE & STACK
* **OCR Engine:** `Tesseract.js` (Client-side browser processing).
* **Workflow:** **"Snip, Paste, Sync."** Intercept clipboard images via Web Clipboard API.
* **Image Pipeline:** Apply HTML5 Canvas filters (Grayscale, High Contrast, Thresholding) to optimize Tesseract accuracy for monitor screenshots and mobile photos.
* **Data Validation:** Map OCR strings against a master JSON dictionary of Legendary Mods (1*, 2*, 3*), Legendary Modules, and Scrip counts.

---

## 2. CORE INFRASTRUCTURE: THE 15-CHARACTER MATRIX
* **Scaling:** Support for **3 Game Accounts** per user.
* **Structure:** **5 Character Slots** per Account = **15-Character Ecosystem**.
* **Multi-Platform Support:** Toggleable data sets for PC, Xbox, and PlayStation.
* **Global Progress Dashboard:** A unified view showing "Learned" mod status across all 15 characters to identify which character holds specific crafting knowledge.

---

## 3. FEATURES & USER SYSTEMS
### A. The "Knowledge" Tracker
* **Learned Mods:** Track which legendary recipes are unlocked per character.
* **Resource Ledger:** Track Legendary Module and Scrip quantities.
* **Targeting:** A "Wanted" flag for mods still needed, suggesting which character has the best resources to attempt the unlock.

### B. Trading & Reputation (Market76 Integration)
* **Public Knowledge Routing:** Repaired/optimized shareable URLs.
* **The "Crafting Resume":** A public-facing URL showing verified learned mods without exposing private character names (IGN Protection).
* **Trade-Gen Tool:** Export inventory/knowledge to Reddit-friendly Markdown (e.g., `H: Can craft [Unyielding] | W: [Offers]`).

### C. The Proscription Billing Engine
* **Logic:** Reusable module monitoring "Active Heartbeats."
* **The 30-Day Rule:** If "Pro" features (syncing >1 account/4+ characters) aren't used for 30+ days, auto-downgrade to Free tier and stop charges.
* **Founder Initiative:** Users in the first 6 months receive **Founder Adoption** status (1 month of free Proscribed usage).

## 5. DEPLOYMENT WORKFLOW & CI/CD
* **Primary Protocol:** **Git-Triggered Deployments Only.**
* **Rule:** Never use the Vercel CLI (`vercel --prod`) for manual deployments. All production builds must be triggered by pushing to the `main` branch.
* **Integrations:** GitHub -> Vercel (Automatic Build) & Neon (Database Migration).

---

## 6. IMMEDIATE EXECUTION TASKS for WORKSPACE AGENT
1.  **Strict Deployment Rule:** Adhere to Section 5. Only push to `main` for live updates.
2.  **OCR Refinement:** Continue optimizing the multi-pass sweep for 100% accuracy.
3.  **Beta Access:** Ensure B.U.I.L.D. and S.C.A.N. beta prompts are synchronized and premium.
