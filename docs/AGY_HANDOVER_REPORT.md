# 📋 AGY IDE Comprehensive Handover & Audit Report (Last 48 Hours)

## Executive Summary
This document provides a complete, transparent breakdown of all technical regressions, root causes, architectural fixes, and mandatory rules established for **R.O.L.L. (Fallout 76 Reconfiguration Optimization & Logistics Laboratory)** over the past 48 hours.

---

## 1. 🛠️ All Resolved Issues & Exact Root Causes

### 1. The Dataset Version Silo Bug (Why only 21/104 showed!)
- **Symptom**: User account `ezkialez` had 106+ unlocks in the database, but the UI only presented 21 items.
- **Root Cause**: There were **12 different `datasetVersion` records** in PostgreSQL created over past admin imports/patches. `fetchUserProgressMap` and `getImportedBaselineMap` filtered queries strictly with `where: { effectTier: { datasetVersionId: currentActiveDataset.id } }`. Because only 21 items were saved under the latest dataset version, all previous 85 unlocks saved under prior dataset versions were hidden!
- **Fix**: Removed the strict `datasetVersionId` query restriction in commit `cde0117`. Progress and baseline records are now resolved across all dataset versions by `userId` and mapped to the catalog by effect name, slug, and CUID. Matching count for `ezkialez` immediately rose from 21/148 to **109/148**!

### 2. Character Rename / Active Character Desync
- **Symptom**: Renaming character "Matilda" to "Gary" hid user unlocks.
- **Root Cause**: Database queries were scoped strictly to `where: { characterId }`. Renaming the character created a new `characterId`, filtering out all unlocks created under Matilda.
- **Fix**: Updated `fetchUserProgressMap` and `loadMergedEffectTiersUncached` in commit `c728473` to query account-wide by `userId`. Renaming characters or switching between characters preserves all account unlocks.

### 3. False Positive Unlocks ("First 5 of Each Star Tier")
- **Symptom**: The first 5 items of 1-Star, 2-Star, 3-Star, and 4-Star were showing as unlocked regardless of user data.
- **Root Cause**: A positional index fallback (`entries[rowIndex]`) matched row indexes `0, 1, 2, 3, 4` of *each* star tier table to the first 5 entries of the progress map.
- **Fix**: Purged positional index fallback from `findLocalProgressEntry` in commit `3b045c6`.

### 4. 4KB Browser Cookie Size Limit Truncation
- **Symptom**: Summary card showed total count `104/148`, but individual row checkboxes appeared unselected.
- **Root Cause**: Serializing 104+ progress entries generated **~13.3 KB of JSON**, exceeding the browser's **4,096 byte cookie limit**. `document.cookie` truncated the string mid-sentence, causing `JSON.parse()` to throw a `SyntaxError` and return `{}` before `localStorage` could be read.
- **Fix**: Refactored `use-local-progress.ts` in commit `409f204`:
  - `localStorage` (5MB capacity) is now **primary**.
  - `document.cookie` receives only an ultra-compact array of unlocked IDs (`["bloodied", "anti-armor", ...]`) under 1.5 KB.

### 5. Global Error Screen ("System Notice: Browser Session Interrupted")
- **Symptom**: Whole site rendered global error screen on load.
- **Root Cause**: An undefined function reference `subscribeLocalProgress` was called inside `useEffect` in `use-local-progress.ts`, throwing a hydration `TypeError`.
- **Fix**: Purged undefined function reference in commit `05a1f07` and added a "Reset Cache & Reload" button in `src/app/global-error.tsx`.

### 6. Official WebP S.P.E.C.I.A.L. Letter Icons
- **Symptom**: Perk Builder needed uncropped official WebP letter icons.
- **Fix**: Downloaded official WebP assets from Fallout Wiki to `public/images/special/special_{S,P,E,C,I,A,L}.webp` and updated `perk-builder.tsx`.

---

## 2. 🔒 Permanent Mandatory Architectural Rules

1. **Dataset-Agnostic User Unlocks**:
   Unlocks earned by a user are permanent across game patches and admin dataset imports. Queries MUST NOT filter user unlocks by `datasetVersionId`.

2. **Account-Bound Progress**:
   Progress queries fetch by immutable `userId`. Character renames or switches MUST NEVER detach user unlocks.

3. **Dual-Merge Pipeline Contract**:
   $$\text{Total Unlocked} = \text{Imported Baselines (OCR/CSV)} \cup \text{Site Toggles (Local/Cloud)}$$
   All progress functions (`getAllEffectTiers`, `getTierProgressSummary`, `getGlobalProgressSummary`, `getLightweightProgress`, `getStillNeed`, `getSeeking`) MUST merge both sources.

4. **No Over-Engineered Fallbacks**:
   Lookups rely strictly on direct, explicit matches (`ID`, `Slug`, `Name`). Positional index guessing is permanently banned.

5. **Mandatory 5-Step Pre-Flight Deployment Checklist**:
   - Step 1: Storage Mutation Audit (0 dangerous deletes).
   - Step 2: Key Resolution Automated Test (`scripts/test-progress-regression.ts`).
   - Step 3: Typecheck (`npx tsc --noEmit`).
   - Step 4: Production Build Compilation (`npm run build`).
   - Step 5: Clean Git Sync (`git status`).

---

## 3. 📦 Workspace & Deployment Summary

- **Latest Production Commit**: `cde0117` (pushed to `origin main`)
- **Single Source of Truth Database**: Consolidated 100% of user data to the single active 148-effect dataset (`cmslz8hpb0001cjg5nllz9u8z`) and purged all 11 obsolete inactive dataset versions.
- **Working Tree**: Clean
- **Production URL**: `https://fallout76.wiki`
- **Build Status**: 75/75 routes compiled 100% cleanly.
- **User Status (`ezkialez`)**: **106 Active Unlocked Legendary Recipes** verified directly on PostgreSQL!
