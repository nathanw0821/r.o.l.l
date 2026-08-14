---
name: frontend-designer
description: Standard Operating Procedure & Aesthetic Guide for R.O.L.L. Frontend Design, Visual Theme Experimentation, and UI Component Prototyping.
---

# 🎨 Frontend Appearance Designer Skill (R.O.L.L.)

## Overview
This skill provides design tokens, aesthetic principles, component guidelines, and interactive preview workflows for rapidly prototyping, styling, and testing visual appearances across the **R.O.L.L. (Resource Optimization & Legendary Loadouts)** web application.

---

## 🌟 Core Aesthetic Directives for R.O.L.L.

1. **Retro-Futuristic Tactical Utility**:
   - Inspired by authentic in-universe terminals, Pip-Boy 2000 Mk VI/3000 interfaces, and RobCo industrial OS displays.
   - High legibility, crisp contrast, functional information density, and subtle CRT scanlines.

2. **Forbidden Cliché Tropes (Strictly Prohibited)**:
   - ❌ NO generic purple-on-dark themes.
   - ❌ NO textureless flat cards without depth or subtle borders.
   - ❌ NO decorative rainbow gradients on titles.
   - ❌ NO generic icon-stuffed bento boxes without clear utility.

3. **Pixel-Perfect Fluid Responsiveness**:
   - Every badge, table, modal, and perk card must adapt seamlessly from 320px mobile viewports to 4K ultra-wide monitors without overlapping or clipping text.

---

## 🎨 Official Visual Themes

### 1. 🟢 Pip-Boy Standard Green (Default Classic)
* **Background**: `#080c09` (Deep Phosphor Black)
* **Card Surface**: `#0e1811` (Dark Emerald Glass)
* **Primary Accent / Glow**: `#10b981` / `#00ff66`
* **Text / Headers**: `#ecfdf5` / `#34d399`
* **Border Color**: `rgba(16, 185, 129, 0.25)`

### 2. 🟠 New Vegas Amber (Warm Tungsten Phosphor)
* **Background**: `#0c0906` (Deep Obsidian Ochre)
* **Card Surface**: `#1a130b` (Warm Amber Glass)
* **Primary Accent / Glow**: `#f59e0b` / `#ffb000`
* **Text / Headers**: `#fffbeb` / `#fbbf24`
* **Border Color**: `rgba(245, 158, 11, 0.25)`

### 3. 🔵 Vault-Tec Pre-War Corporate (Cobalt & Goldenrod)
* **Background**: `#060b14` (Deep Vault Navy)
* **Card Surface**: `#0b172a` (Pre-War Steel Glass)
* **Primary Accent / Glow**: `#0284c7` (Vault Blue) & `#facc15` (Vault Gold)
* **Text / Headers**: `#f0f9ff` / `#38bdf8`
* **Border Color**: `rgba(56, 189, 248, 0.3)`

### 4. ⚪ Pip-Boy 2000 Mk VI Monochrome (Appalachian Terminal)
* **Background**: `#09090b` (Matte Carbon)
* **Card Surface**: `#18181b` (High-Contrast Slate)
* **Primary Accent / Glow**: `#e2e8f0` / `#ffffff`
* **Text / Headers**: `#fafafa` / `#a1a1aa`
* **Border Color**: `rgba(255, 255, 255, 0.2)`

### 5. 🌑 Tactical Stealth / Slate Minimal
* **Background**: `#020617` (Void Slate)
* **Card Surface**: `#0f172a` (Brushed Metal)
* **Primary Accent / Glow**: `#64748b` / `#94a3b8`
* **Text / Headers**: `#f8fafc` / `#cbd5e1`
* **Border Color**: `rgba(148, 163, 184, 0.15)`

---

## 🎛️ Interactive Theme Testing Workflow

When developing or proposing new UI layouts:
1. **Use `/design-lab`**: Test components in the dedicated Theme Preview Lab.
2. **Inspect Interactive States**: Verify `:hover`, `:active`, `:focus-visible`, and disabled states.
3. **Verify CRT Effects**: Test scanlines, phosphor bloom, and grid overlays with adjustable opacity sliders.
4. **Mobile & Viewport Verification**: Ensure fluid stacking and legible font sizes across breakpoints.
