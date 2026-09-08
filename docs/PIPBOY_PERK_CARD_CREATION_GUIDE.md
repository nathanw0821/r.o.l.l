# ☢️ Master Pip-Boy Perk Card Creation Guide

This document is the authoritative technical reference manual for generating, calibrating, and deploying 1:1 in-game Pip-Boy perk cards for **R.O.L.L.** (`fallout76.wiki`).

---

## 1. Overview & Architectural Directives

All perk cards across the R.O.L.L. ecosystem must render as **1:1 bitmapped, curved/slanted cards** extracted directly from Bethesda assets:
- **Zero synthetic CSS overlay boxes**: Native title banners, badges, and parchment plaques are fully intact.
- **Aspect ratio**: Locked to `aspect-[310/490]` matching Pip-Boy screen proportions.
- **Storage targets**:
  - `public/images/in_game_cards/{slug}_r{rank}.png` (Web application)
  - `/home/nathanw/Desktop/Agent_Exchange/clean_perk_assets/in_game_cards/{slug}_r{rank}.png` (Desktop exchange)

---

## 2. Directory Layout & Key File Map

```
R.O.L.L/
├── data/
│   ├── fonts/
│   │   ├── RobotoSlab-ExtraBold.ttf      # Authentic Bethesda Pip-Boy cost numeral fallback
│   │   └── RobotoCondensed-Bold.ttf      # Title & secondary card text
│   └── sprites/
│       ├── cost_glyph_1.png ... 5.png    # Extracted bit-exact Bethesda Pip-Boy numeral glyphs
│       └── white_star.png                # Pristine 36x36 white rank star
├── public/images/
│   ├── in_game_cards/                   # 870+ Production bitmapped perk cards
│   ├── in_game_curved/                  # Curved donor reference textures
│   └── perks_official_wiki/             # High-res base webp game cards
├── scripts/
│   ├── generate_all_standard_cards.py   # Master compositor for all Standard & Reworked perks
│   └── generate_all_legendary_cards.py  # Master compositor for all 29 Legendary perks
└── src/
    ├── data/perk-cards.json             # Canonical live patch perk definitions from SeventySix.esm
    └── lib/perks/
        ├── clean-perk-assets.ts         # Runtime asset resolver getInGamePerkCardImage()
        └── catalog.ts                   # Metadata engine & getGenderedPerkName()
```

---

## 3. How the Compositor Pipeline Works

### 3.1 Slanted Baseline (+3.568° Curve)
Bethesda Pip-Boy cards are tilted and bowed. The compositor uses a $+3.568^\circ$ affine rotation around center point `(275, 482)` to render text and align patches with 100% parallelism to the parchment plaque.

### 3.2 Dynamic Multi-Rank Star Ribbon Progression
1. **Base ribbon detection**: `detect_ribbon_rank(arr)` scans dark star ribbon pixels across x in [300, 460] at slope -0.0619.
2. **Donor ribbon patching**: If a base texture has more stars than a perk's live patch `maxRank`, `patch_card_ribbon()` seamlessly patches an authentic ribbon from a matching SPECIAL donor card (`DONOR_CARDS` dictionary).
3. **Star placement**: White stars are pasted at calculated offsets `(456 - k * 32, 499 + k * 2)` with **0px shift/jitter** between ranks. Rank 1 cards are never stamped over.

### 3.3 Cost Badge Inpainting & Numeral Overlay
1. **IoU Detection**: `detect_card_base_cost(base_im)` checks IoU against pre-computed masks of `cost_glyph_1`, `_2`, and `_3`.
2. **Inpainting**: When `cost != base_cost`, the badge area is rotated flat, the existing numeral is masked and inpainted with parchment cream texture and noise, the target Bethesda numeral glyph is alpha-composited, and the badge is rotated back with Gaussian-feathered blending.

### 3.4 Description Text Wrapping
`render_description(card_im, desc)` word-wraps mechanical text using `DejaVuSerif-Bold` at 18pt, centers lines optically at x = 268, and rotates the text layer $+3.568^\circ$.

---

## 4. Step-by-Step: Adding or Updating a Perk Card

When Bethesda releases a new game patch, rebalance, or season:

### Step 1: Update Perk Metadata
Open `src/data/perk-cards.json` and update the perk entry:
```json
{
  "id": "new-perk-id",
  "name": "New Perk Name",
  "special": "S",
  "minLevel": 10,
  "maxRank": 3,
  "ranks": [
    { "rank": 1, "cost": 1, "description": "Rank 1 effect description." },
    { "rank": 2, "cost": 2, "description": "Rank 2 effect description." },
    { "rank": 3, "cost": 3, "description": "Rank 3 effect description." }
  ]
}
```

### Step 2: Ensure Base Texture Exists
Place the high-resolution source texture in:
- `public/images/perks_official_wiki/fo76-perk-{id}.webp`

### Step 3: Run the Compositor
```bash
# Generate only the modified perk:
python3 scripts/generate_all_standard_cards.py --force new-perk-id
```
The script will automatically:
- Render `new_perk_id_r1.png`, `new_perk_id_r2.png`, `new_perk_id_r3.png`, and `new_perk_id.png`.
- Save all files to both `public/images/in_game_cards/` and `/home/nathanw/Desktop/Agent_Exchange/clean_perk_assets/in_game_cards/`.

### Step 4: Update Runtime Resolvers (If Aliased or Gender-Specific)
- In `src/lib/perks/clean-perk-assets.ts`:
  Add key mapping to `IN_GAME_STRAIGHT_CARDS` if the filename differs from standard slugification.
- If it is a gendered pair:
  Update `getGenderedPerkName()` in `src/lib/perks/catalog.ts` and the gender routing branch in `getInGamePerkCardImage()`.

### Step 5: Run Quality Gates
```bash
npm run test          # Verify unit tests (52+ tests)
npm run typecheck     # Verify TypeScript compilation (0 errors)
npm run lint          # Verify ESLint (0 errors)
npm run build         # Verify Next.js production build
```

---

## 5. Reworked & Rebalanced Perks Reference Table

| Game ID | Live Patch Title | Legacy Alias | Base Cost | Max Rank | Donor Ribbon Used |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `bullet-storm` | **Bullet Storm** | `heavy_gunner` | 1 | 3 | Native |
| `tightly-wound` | **Tightly Wound** | `expert_heavy_gunner` | 2 | 3 | Native |
| `bringing-the-big-guns` | **Bringing the Big Guns** | `master_heavy_gunner` | 3 | 3 | Native |
| `heavy-hitter` | **Heavy Hitter** | `master_slugger` | 3 | 3 | Native |
| `knee-capper` | **Knee-Capper** | `expert_slugger` | 2 | 3 | Native |
| `bullet-shield` | **Bullet Shield** | `bullet_shield` | 1 | 3 | Bandolier (3-rank donor) |

---

## 6. Gender Profile Swapping Reference

| Base ID | Male Title | Female Title | Male Output | Female Output |
| :--- | :--- | :--- | :--- | :--- |
| `action-boy` | Action Boy | Action Girl | `action_boy_r{1..3}.png` | `action_girl_r{1..3}.png` |
| `aquaboy` | Aquaboy | Aquagirl | `aquaboy_r1.png` | `aquagirl_r1.png` |
| `party-boy` | Party Boy | Party Girl | `party_boy_r{1..2}.png` | `party_girl_r{1..2}.png` |

Both variants are dynamically controlled by the `isFemale` boolean prop in `InGamePerkCard`, `PipBoyPerkCard`, and `PerkBuilder`.
