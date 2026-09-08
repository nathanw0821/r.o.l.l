---
name: fo76-perk-cards
description: >-
  Authoritative Standard Operating Procedure & Pipeline Engine for 1:1 Fallout 76 Pip-Boy Perk Cards in R.O.L.L.
  Enforces 1:1 bitmapped Pip-Boy curved/slanted textures, multi-rank star progression, authentic Bethesda cost numerals,
  Vault Boy / Vault Girl dynamic gender variants, dual-directory synchronization, and zero-breakage deployment rules.
---

# 🃏 Fallout 76 Master Pip-Boy Perk Card Skill & SOP

This skill governs the visual rendering, asset resolution, mechanical calibration, and generation pipeline of all 274+ Fallout 76 perk cards in **R.O.L.L.** (`fallout76.wiki`).

---

## 🎨 1. Master Policy: 1:1 In-Game Bitmapped Pip-Boy Cards

- **MASTER DIRECTIVE**: All perk cards rendered across the platform (**Perk Builder**, **Inspect Modal**, **Punch Card Rack**, **Truth Wiki**, and **Discord Bot**) MUST use the official 1:1 bitmapped Pip-Boy curved/slanted cards from:
  - Application Directory: `public/images/in_game_cards/` (Served at `/images/in_game_cards/`)
  - Desktop Exchange: `/home/nathanw/Desktop/Agent_Exchange/clean_perk_assets/in_game_cards/`
- **Primary Resolver**: `getInGamePerkCardImage(cardIdOrName, rank, isFemale)` in `src/lib/perks/clean-perk-assets.ts`.
- **Display Frame**: Strict `aspect-[310/490]` container framing matching native Bethesda Pip-Boy screen geometry.
- **NO SYNTHETIC OVERLAY BOXES**: Never draw flat color rectangles over title banners or badges when native Bethesda assets exist.
- **NO WEB SCRAPING**: All perk cards (578 rank tiers, 868+ PNGs) are pre-compiled locally from official datamined Bethesda assets.

---

## ⚙️ 2. Automated Python Compositor Pipeline

Perk cards are generated deterministically using two master Python compositor scripts:

| Perk Category | Compositor Script | Primary Base Assets | Target Output Formats |
| :--- | :--- | :--- | :--- |
| **Standard & Reworked** | `scripts/generate_all_standard_cards.py` | `public/images/perks_official_wiki/*.webp`<br/>`public/images/in_game_curved/*.png` | `{slug}_r{rank}.png`<br/>`{slug}.png` (alias) |
| **Legendary Cards** | `scripts/generate_all_legendary_cards.py` | `public/images/in_game_curved/legendary_*.png` | `{slug}_r{1..4}.png` |

### CLI Execution Cheat Sheet
```bash
# Generate / update all standard perk cards:
python3 scripts/generate_all_standard_cards.py

# Force re-rendering of specific perk cards (e.g. after a game balance patch):
python3 scripts/generate_all_standard_cards.py --force bullet-storm tightly-wound action-girl

# Force re-rendering of all legendary perk cards:
python3 scripts/generate_all_legendary_cards.py --force
```

---

## 📐 3. Technical Card Geometry & Anatomy

Every generated perk card strictly adheres to native Bethesda Pip-Boy specifications:

### 3.1 Slanted Baseline & Parchment Orientation
- **Angle**: $+3.568^\circ$ Pip-Boy curve and baseline rotation.
- **Parallels**: The word-wrapped description text and ribbon angle are rotated at $+3.568^\circ$ around center point `(275, 482)` to remain 100% parallel to the parchment plaque.

### 3.2 Dynamic Multi-Rank Star Progression
- **Pristine Star Asset**: 36×36 px anti-aliased white star extracted directly from Bethesda Pip-Boy binaries (`data/sprites/white_star.png`).
- **Star Slot Coordinates**: Calculated from the ribbon apex with zero pixel shift:
  ```python
  k = max_rank - s
  star_x = 456 - k * 32
  star_y = 499 + k * 2
  card.paste(white_star, (star_x, star_y), white_star)
  ```
- **Rank 1 Invariant**: NEVER stamp stars on Rank 1 cards. Native Rank 1 base assets already have 1 white star and dark unearned stars on their ribbons.

### 3.3 Authentic Bethesda Slab-Serif Cost Numeral Inpainting
- **Glyph Sprites**: Extracted bit-exact Bethesda Pip-Boy slab numerals stored in `data/sprites/cost_glyph_{1..5}.png` (calibrated at 57px height, 42px width).
- **Intelligent Base Cost Detection**: `detect_card_base_cost(base_im)` checks IoU overlap against existing card numerals. If `cost == base_cost`, the native Bethesda art is untouched.
- **Feathered Mask Blending**: When `cost != base_cost`, the badge numeral is inpainted with parchment texture and noise, and the calibrated glyph sprite is alpha-composited and re-rotated at $+3.568^\circ$ with Gaussian-feathered mask blending (zero ghost silhouettes).

### 3.4 Authentic Donor Ribbon Patching
- When a game patch reduces a perk's maximum rank (e.g. from 3 ranks to 1 or 2), the base texture's ribbon is replaced with an authentic Bethesda ribbon from a matching SPECIAL donor card (`DONOR_CARDS` mapping):
  ```python
  crop_x = 220 if max_rank == 1 else (280 if max_rank == 2 else 310)
  crop_box = (crop_x, 450, 498, 565)  # Stops at 498px to protect recipient border
  ```

---

## ⚧ 4. Dynamic Gender Variants (Vault Boy <-> Vault Girl)

Fallout 76 includes three gender-specific perk cards that dynamically swap between Vault Boy and Vault Girl profiles:

| Base Game ID | Vault Boy Variant (Male) | Vault Girl Variant (Female) | SPECIAL | Ranks | Costs |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `action-boy` | **Action Boy** (`action_boy_r1..r3.png`) | **Action Girl** (`action_girl_r1..r3.png`) | A | 3 | 1, 2, 3 |
| `aquaboy` | **Aquaboy** (`aquaboy_r1.png`) | **Aquagirl** (`aquagirl_r1.png`) | E | 1 | 1 |
| `party-boy` | **Party Boy** (`party_boy_r1..r2.png`) | **Party Girl** (`party_girl_r1..r2.png`) | C | 2 | 2, 3 |

### Implementation Rules:
1. **Asset Resolver**: `getInGamePerkCardImage(cardId, rank, isFemale)` dynamically routes to the female filenames when `isFemale === true` and male filenames when `isFemale === false`.
2. **Title Resolver**: `getGenderedPerkName(name, isFemale)` dynamically converts names bidirectionally (e.g. "Action Boy" -> "Action Girl" and vice-versa).
3. **Inspector Modal**: Modal header and card `alt` tags must display `displayName`, not raw `name`.

---

## 📂 5. Dual-Directory Synchronization Rule

Both asset directories must remain 100% identical at all times:
1. `public/images/in_game_cards/` (Web application production assets)
2. `/home/nathanw/Desktop/Agent_Exchange/clean_perk_assets/in_game_cards/` (Desktop agent exchange)

Whenever a new card is generated or updated, write to both locations simultaneously:
```python
card.save(proj_path, format="PNG", optimize=True)
shutil.copyfile(proj_path, desk_path)
```

---

## 🚀 6. Verification & Deployment Rules

Before pushing changes to GitHub:
1. **Automated Unit Tests**: `npm run test` (must pass 100%, including `src/lib/perks/catalog.test.ts`).
2. **TypeScript Validation**: `npm run typecheck` (0 errors).
3. **ESLint Linting**: `npm run lint` (0 errors, 0 warnings).
4. **Production Build**: `npm run build` (0 compilation errors).
5. **Deployment Pacing Rule**: NEVER push a commit to `origin main` or trigger a new deployment while a previous Cloudflare or GitHub Actions workflow is still running or pending. Always verify completion before pushing subsequent updates.
