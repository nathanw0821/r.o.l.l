#!/usr/bin/env python3
"""
☢️ Master Standard & Reworked Perk Card Multi-Rank Compositor
=============================================================
Generates 1:1 pixel-exact, authentic Pip-Boy curved/slanted cards for all
standard Fallout 76 perk cards from SeventySix.esm.

Features:
- Native Pip-Boy +3.568° curve & slant preserved (100% parallel to parchment baseline).
- Pristine ribbon preservation & authentic donor ribbon patching for rebalanced perks.
- 100% live patch game descriptions extracted from SeventySix.esm.
- Flawless star progression with 0px shift/jitter across all rank tiers.
- Feathered cost badge inpainting (zero ghost silhouettes).
- Outputs saved to both:
    - public/images/in_game_cards/
    - /home/nathanw/Desktop/Agent_Exchange/clean_perk_assets/in_game_cards/
"""

import os
import sys
import json
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

PROJECT_ROOT = "/home/nathanw/Creative Direction/R.O.L.L"
CURVED_DIR = os.path.join(PROJECT_ROOT, "public", "images", "in_game_curved")
WIKI_DIR = os.path.join(PROJECT_ROOT, "public", "images", "perks_official_wiki")
OUT_PROJECT = os.path.join(PROJECT_ROOT, "public", "images", "in_game_cards")
OUT_DESKTOP = "/home/nathanw/Desktop/Agent_Exchange/clean_perk_assets/in_game_cards"
DATA_JSON = os.path.join(PROJECT_ROOT, "src", "data", "perk-cards.json")

os.makedirs(OUT_PROJECT, exist_ok=True)
os.makedirs(OUT_DESKTOP, exist_ok=True)

with open(DATA_JSON, "r", encoding="utf-8") as f:
    cards_data = json.load(f)

# Fonts
BODY_FONT_ROBOTO = os.path.join(PROJECT_ROOT, "data", "fonts", "RobotoSlab-ExtraBold.ttf")
BODY_FONT_DEJAVU = "/usr/share/fonts/TTF/DejaVuSerif-Bold.ttf"
BODY_FONT = BODY_FONT_ROBOTO if os.path.exists(BODY_FONT_ROBOTO) else BODY_FONT_DEJAVU
TITLE_FONT = os.path.join(PROJECT_ROOT, "data", "fonts", "RobotoCondensed-Bold.ttf")

font_body_20 = ImageFont.truetype(BODY_FONT, 20)
font_body_18 = ImageFont.truetype(BODY_FONT, 18)

def get_title_font(title, max_w=325, base_sz=42, min_sz=32):
    """Dynamically choose authentic title font matching native Bethesda Pip-Boy scale."""
    for sz in range(base_sz, min_sz - 1, -1):
        f = ImageFont.truetype(TITLE_FONT, sz)
        bb = f.getbbox(title)
        if (bb[2] - bb[0]) <= max_w:
            return f
    return ImageFont.truetype(TITLE_FONT, min_sz)

# Cost Badge Sprites (100% authentic bit-exact Bethesda Pip-Boy numerals)
COST_GLYPHS = {}
for _c in range(1, 6):
    _gp = os.path.join(PROJECT_ROOT, "data", "sprites", f"cost_glyph_{_c}.png")
    if os.path.exists(_gp):
        COST_GLYPHS[_c] = Image.open(_gp).convert("RGBA")

# Pre-computed glyph binary masks for base cost detection
GLYPH_MASKS = {
    c: (np.array(g)[:, :, 3] > 128)
    for c, g in COST_GLYPHS.items()
}

# Star Sprite (Pristine 36x36 white star extracted from native Bethesda Pip-Boy assets)
white_star = Image.open(os.path.join(PROJECT_ROOT, "data", "sprites", "white_star.png")).convert("RGBA")
ghoul_oval_star_path = os.path.join(PROJECT_ROOT, "data", "sprites", "ghoul_oval_star.png")
ghoul_oval_star = Image.open(ghoul_oval_star_path).convert("RGBA") if os.path.exists(ghoul_oval_star_path) else None

# Mappings for wiki filenames that differ from card id
WIKI_ALIASES = {
    "grim-reaper-s-sprint": "fo76-perk-grim-reapers-sprint.webp",
    "guerrilla-expert": "fo76-perk-expert-guerrilla.webp",
    "guerrilla-master": "fo76-perk-master-guerrilla.webp",
    "gunslinger-expert": "fo76-perk-expert-gunslinger.webp",
    "gunslinger-master": "fo76-perk-master-gunslinger.webp",
    "hacker-expert": "fo76-perk-expert-hacker.webp",
    "hacker-master": "fo76-perk-master-hacker.webp",
    "picklock-expert": "fo76-perk-expert-picklock.webp",
    "picklock-master": "fo76-perk-master-picklock.webp",
}

# Card aliases for backwards-compatibility or legacy routes
CARD_ALIASES = {
    "bullet-storm": ["heavy_gunner"],
    "tightly-wound": ["expert_heavy_gunner"],
    "bringing-the-big-guns": ["master_heavy_gunner"],
    "heavy-hitter": ["master_slugger"],
    "knee-capper": ["expert_slugger"],
}

# Explicit female Vault Girl variant cards
FEMALE_CARDS = [
    {
        "id": "action-girl",
        "name": "Action Girl",
        "special": "A",
        "minLevel": 2,
        "maxRank": 3,
        "ranks": [
            {"rank": 1, "cost": 1, "description": "Action Points regenerate 15% faster."},
            {"rank": 2, "cost": 2, "description": "Action Points regenerate 30% faster."},
            {"rank": 3, "cost": 3, "description": "Action Points regenerate 45% faster."}
        ]
    },
    {
        "id": "aquagirl",
        "name": "Aquagirl",
        "special": "E",
        "minLevel": 26,
        "maxRank": 1,
        "ranks": [
            {"rank": 1, "cost": 1, "description": "You no longer take Rad damage from swimming and can breathe underwater."}
        ]
    },
    {
        "id": "party-girl",
        "name": "Party Girl",
        "special": "C",
        "minLevel": 24,
        "maxRank": 2,
        "ranks": [
            {"rank": 1, "cost": 2, "description": "The positive effects of pre-war alcohol are doubled."},
            {"rank": 2, "cost": 3, "description": "The positive effects of pre-war alcohol are tripled."}
        ]
    }
]

GHOUL_PERK_IDS = {
    "action-ghoul", "arms-of-steel", "battle-genes", "bomb-scientist",
    "bone-shatterer", "breathe-it-in", "brick-wall", "chem-diet", "eye-of-the-hunter",
    "faulty-spots", "feral-presence", "glowing-criticals", "glowing-gut",
    "glowing-hunter", "glowing-one", "gun-tricks", "hyper-reflexes", "jaguar-speed",
    "mad-scientist", "moral-support", "rad-specialist", "rad-reaver", "radiation-power",
    "radioactive-strength", "science-monster", "thick-skin", "united-ordeal", "wild-west-hands"
}

def is_ghoul_card(card_id: str) -> bool:
    clean = card_id.lower().strip().replace(" ", "-")
    unhyphenated = clean.replace("-", "")
    return clean in GHOUL_PERK_IDS or unhyphenated in GHOUL_PERK_IDS or any(clean == g.replace("-", "") for g in GHOUL_PERK_IDS)

# Authentic Bethesda reference donor cards by SPECIAL and target rank tier
DONOR_CARDS = {
    ("S", 1): "blood-luster",
    ("S", 2): "bandolier",
    ("S", 3): "blocker",

    ("P", 1): "picklock",
    ("P", 2): "grenadier",
    ("P", 3): "commando",

    ("E", 1): "aquaboy",
    ("E", 2): "chem-resistant",
    ("E", 3): "ghoulish",

    ("C", 1): "e-m-t",
    ("C", 2): "anti-epidemic",
    ("C", 3): "animal-friend",

    ("I", 1): "chemist",
    ("I", 2): "contractor",
    ("I", 3): "power-patcher",

    ("A", 1): "escape-artist",
    ("A", 2): "ammosmith",
    ("A", 3): "action-boy",

    ("L", 1): "woodchucker",
    ("L", 2): "luck-of-the-draw",
    ("L", 3): "better-criticals",
}

# Perks previously migrated across SPECIAL categories now have authentic native 2026 Bethesda rips in perks_official_wiki
RETHEMED_CARDS = {}

def create_special_background(special, w, h):
    """Generate authentic procedural SPECIAL illustration background with parchment noise."""
    im = Image.new("RGBA", (w, h), (235, 226, 206, 255))
    d = ImageDraw.Draw(im)
    if special == "S": # Strength: olive-green radiant sunburst rays
        cx, cy = int(w * 0.5), h + 40
        c_green = (155, 185, 145, 255)
        for deg in range(0, 180, 15):
            rad1 = np.radians(180 + deg)
            rad2 = np.radians(180 + deg + 8)
            p1 = (cx + int(600 * np.cos(rad1)), cy + int(600 * np.sin(rad1)))
            p2 = (cx + int(600 * np.cos(rad2)), cy + int(600 * np.sin(rad2)))
            d.polygon([(cx, cy), p1, p2], fill=c_green)
    elif special == "P": # Perception: concentric circular radar/target rings
        cx, cy = int(w * 0.54), int(h * 0.40)
        c_ring1 = (190, 158, 120, 255)
        c_ring2 = (212, 192, 162, 255)
        for r in range(360, 20, -35):
            col = c_ring1 if (r // 35) % 2 == 0 else c_ring2
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
    elif special == "E": # Endurance: steel blue pulse horizontal bands
        c_teal1 = (120, 165, 180, 255)
        c_teal2 = (185, 210, 218, 255)
        for y in range(0, h, 20):
            col = c_teal1 if (y // 20) % 2 == 0 else c_teal2
            d.rectangle([0, y, w, y + 20], fill=col)
    elif special == "C": # Charisma: golden amber radiant starburst
        cx, cy = int(w * 0.5), int(h * 0.45)
        c_gold = (226, 180, 108, 255)
        for deg in range(0, 360, 20):
            rad1 = np.radians(deg)
            rad2 = np.radians(deg + 10)
            p1 = (cx + int(500 * np.cos(rad1)), cy + int(500 * np.sin(rad1)))
            p2 = (cx + int(500 * np.cos(rad2)), cy + int(500 * np.sin(rad2)))
            d.polygon([(cx, cy), p1, p2], fill=c_gold)
    elif special == "I": # Intelligence: diagonal pastel bands
        c_sage = (195, 208, 185, 255)
        c_blue = (180, 200, 208, 255)
        c_tan = (226, 202, 172, 255)
        for i in range(-300, w + 400, 80):
            d.polygon([(i, 0), (i + 40, 0), (i + 40 - 180, h), (i - 180, h)], fill=c_sage)
            d.polygon([(i + 40, 0), (i + 60, 0), (i + 60 - 180, h), (i + 40 - 180, h)], fill=c_blue)
            d.polygon([(i + 60, 0), (i + 80, 0), (i + 80 - 180, h), (i + 60 - 180, h)], fill=c_tan)
    elif special == "A": # Agility: coral terracotta speed swooshes
        c_coral = (216, 144, 128, 255)
        for i in range(-150, w + 200, 50):
            d.polygon([(i, 0), (i + 25, 0), (i + 100, h), (i + 75, h)], fill=c_coral)
    elif special == "L": # Luck: lavender slate diamond starburst
        cx, cy = int(w * 0.5), int(h * 0.45)
        c_lav = (210, 195, 225, 255)
        d.polygon([(cx, cy - 180), (cx + 180, cy), (cx, cy + 180), (cx - 180, cy)], fill=c_lav)

    arr = np.array(im, dtype=np.float32)
    noise = np.random.normal(0, 3.0, (h, w, 3))
    arr[:, :, :3] = np.clip(arr[:, :, :3] + noise, 0, 255)
    return Image.fromarray(arr.astype(np.uint8))
ART_WINDOW_POLY = [(42, 98), (105, 98), (105, 87), (480, 87), (480, 395), (42, 430)]
ART_CROP_BOX = (42, 72, 480, 430)

def extract_character(src_im, source_special="L", mask_art=None):
    """Extract character illustration from base artwork, protecting ink outlines, fills, and natural ribbon overlap."""
    art = np.array(src_im.crop(ART_CROP_BOX))
    ah, aw = art.shape[:2]

    # Explicit spatial mask: protect cost badge (left), ribbon margins, and right card rim
    allowed_mask = np.ones((ah, aw), dtype=bool)
    allowed_mask[:26, :63] = False   # protects cost badge (card y < 98, x < 105)
    allowed_mask[:15, :68] = False   # protects upper left banner (card y < 87, x < 110)
    allowed_mask[:15, 418:] = False  # protects upper right banner (card x > 460)
    allowed_mask[:, 430:] = False   # protects right card border (card x > 472)

    def is_barrier(y, x):
        if not allowed_mask[y, x]: return False
        r, g, b = [int(v) for v in art[y, x, :3]]
        mean = (r + g + b) / 3
        if mean < 122: return True # ink linework
        if r > 150 and g > 130 and b < 135 and (r - b) > 40 and (g - b) > 30: return True # yellow hair / belt
        if b > 90 and b > r + 25 and b > g + 5: return True # blue vault suit
        if source_special != "A":
            if r > 130 and r > g + 30 and r > b + 30: return True # red meat / laser
        else:
            if r > 180 and g < 50 and b < 50: return True # blood
        if g > 100 and g > r + 20 and g > b + 20: return True # green mutant
        if r > 90 and g > 70 and b < 65 and (r - b) > 35: return True # leather / straps
        return False

    visited = np.zeros((ah, aw), dtype=bool)
    bg_mask = np.zeros((ah, aw), dtype=bool)

    seeds = []
    for x in range(aw):
        seeds.append((0, x))
        seeds.append((ah - 1, x))
    for y in range(ah):
        seeds.append((y, 0))
        seeds.append((y, aw - 1))
    for p in [(10, 10), (10, aw-10), (ah-10, 10), (ah-10, aw-10), (int(ah*0.5), 10), (int(ah*0.5), aw-10)]:
        seeds.append(p)

    queue = [s for s in set(seeds) if not is_barrier(s[0], s[1])]
    for y, x in queue:
        visited[y, x] = True

    idx = 0
    while idx < len(queue):
        cy, cx = queue[idx]
        idx += 1
        bg_mask[cy, cx] = True
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < ah and 0 <= nx < aw and not visited[ny, nx]:
                visited[ny, nx] = True
                if not is_barrier(ny, nx):
                    queue.append((ny, nx))

    # Catch any remaining enclosed background colors matching source special
    for y in range(ah):
        for x in range(aw):
            if not bg_mask[y, x] and not is_barrier(y, x):
                r, g, b = [int(v) for v in art[y, x, :3]]
                if source_special == "L":
                    if abs(r - b) < 25 and r > 140 and g > 140 and b > 140:
                        bg_mask[y, x] = True
                elif source_special == "C":
                    if r > 185 and g > 155 and b < 150:
                        bg_mask[y, x] = True
                elif source_special == "A":
                    if (r > 170 and g < 130 and b < 130) or (abs(r - g) < 15 and abs(r - b) < 15 and r < 160):
                        bg_mask[y, x] = True
                elif source_special == "S":
                    if g > 140 and r < 170 and b < 160:
                        bg_mask[y, x] = True
                elif source_special == "I":
                    if (g > r + 5 and g > 175 and b > 160) or (b > r + 10 and g > 175 and b > 180):
                        bg_mask[y, x] = True
                elif source_special == "P":
                    if r > 160 and g > 130 and b < 140 and r > b + 25:
                        bg_mask[y, x] = True
                elif source_special == "E":
                    if b > 140 and g > 130 and r < 160:
                        bg_mask[y, x] = True

    fg_raw = (~bg_mask) & allowed_mask
    fg_alpha = Image.fromarray((fg_raw * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))
    fg = Image.fromarray(art)
    fg.putalpha(fg_alpha)
    return fg

def render_rotated_title(card_im, title):
    """Render title text parallel to authentic Pip-Boy banner slant (-0.65°)."""
    w, h = card_im.size
    t_font = get_title_font(title)
    txt_im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(txt_im)
    bbox = d.textbbox((0, 0), title, font=t_font)
    cx = 292
    cy = 56
    tx = cx - (bbox[2] + bbox[0]) // 2
    ty = cy - (bbox[3] + bbox[1]) // 2
    d.text((tx + 1, ty + 1), title, fill=(35, 30, 25, 90), font=t_font)
    d.text((tx, ty), title, fill=(236, 227, 205, 255), font=t_font)
    rot_txt = txt_im.rotate(-0.65, center=(cx, cy), resample=Image.BICUBIC)
    return Image.alpha_composite(card_im, rot_txt)

def build_rethemed_card(card_id, target_special, max_rank, title, donor_id, source_special="L"):
    """
    Constructs a pristine 1:1 Pip-Boy card for rebalanced cards whose SPECIAL category changed.
    Uses the target SPECIAL donor card for authentic banner color, bottom parchment, ribbon,
    and letter badge. Erases the donor character by filling the art window with authentic
    procedural target SPECIAL background patterns, and extracts the character artwork from
    the source card cleanly, allowing natural overlap onto the title banner ribbon.
    """
    donor_file = None
    if donor_id in WIKI_ALIASES:
        donor_file = os.path.join(WIKI_DIR, WIKI_ALIASES[donor_id])
    else:
        w_path = os.path.join(WIKI_DIR, f"fo76-perk-{donor_id}.webp")
        if os.path.exists(w_path):
            donor_file = w_path
        else:
            c_path = os.path.join(CURVED_DIR, f"{donor_id.replace('-', '_')}.png")
            if os.path.exists(c_path):
                donor_file = c_path

    if not donor_file or not os.path.exists(donor_file):
        raise FileNotFoundError(f"Donor image not found for {donor_id}")

    donor_raw = Image.open(donor_file).convert("RGBA")
    donor_arr = np.array(donor_raw)
    donor_arr[donor_arr[:, :, 3] <= 30, 3] = 0
    donor_bbox = Image.fromarray(donor_arr).getbbox()
    donor_im = donor_raw.crop(donor_bbox) if donor_bbox else donor_raw

    # Clean donor canvas: inpaint text and clean title banner (without drawing new title yet)
    donor_clean = clean_card_canvas(donor_im, max_rank=max_rank, inpaint_title=True)

    # Erase donor character art with procedural target SPECIAL background
    mask_art = Image.new("L", donor_im.size, 0)
    d_mask = ImageDraw.Draw(mask_art)
    d_mask.polygon(ART_WINDOW_POLY, fill=255)

    full_bg = create_special_background(target_special, donor_im.width, donor_im.height)
    donor_clean.paste(full_bg, (0, 0), mask_art)

    # Load source card image
    src_file = None
    if card_id in WIKI_ALIASES:
        src_file = os.path.join(WIKI_DIR, WIKI_ALIASES[card_id])
    else:
        w_path = os.path.join(WIKI_DIR, f"fo76-perk-{card_id}.webp")
        if os.path.exists(w_path):
            src_file = w_path
        else:
            c_path = os.path.join(CURVED_DIR, f"{card_id.replace('-', '_')}.png")
            if os.path.exists(c_path):
                src_file = c_path

    if not src_file or not os.path.exists(src_file):
        raise FileNotFoundError(f"Source image not found for {card_id}")

    src_raw = Image.open(src_file).convert("RGBA")
    src_arr = np.array(src_raw)
    src_arr[src_arr[:, :, 3] <= 30, 3] = 0
    src_bbox = Image.fromarray(src_arr).getbbox()
    src_im = src_raw.crop(src_bbox) if src_bbox else src_raw

    # Extract character cutout from source card (with natural banner overlap)
    cutout = extract_character(src_im, source_special=source_special)

    # Paste cutout into art window (starts at y=72 allowing character to overlap banner ribbon)
    donor_clean.paste(cutout, (ART_CROP_BOX[0], ART_CROP_BOX[1]), cutout)

    # Render new title on top in authentic Bethesda ALL CAPS
    donor_clean = render_rotated_title(donor_clean, title.upper())

    return donor_clean


RIBBON_X_BY_RANK = {
    1: 448,
    2: 414,
    3: 380,
    4: 348,
    5: 316,
}

def detect_ribbon_rank(arr):
    """Detect how many stars exist on the base card ribbon."""
    for x in range(300, 460):
        y = int(525 - 0.0619 * (x - 300))
        if y >= arr.shape[0]:
            continue
        col = arr[max(0, y-3):min(arr.shape[0], y+4), x]
        is_dark = np.any((col[:, 3] > 200) & (np.mean(col[:, :3], axis=1) < 80))
        if is_dark:
            if x < 330: return 5
            if x < 365: return 4
            if x < 398: return 3
            if x < 430: return 2
            return 1
    return 1

def patch_card_ribbon(card_im, special, max_rank):
    """Replace an oversized ribbon with an authentic Bethesda ribbon from a matching SPECIAL donor card."""
    donor_id = DONOR_CARDS.get((special, max_rank))
    if not donor_id:
        return card_im
    donor_path = os.path.join(WIKI_DIR, f"fo76-perk-{donor_id}.webp")
    if not os.path.exists(donor_path):
        return card_im

    donor_raw = Image.open(donor_path).convert("RGBA")
    donor_arr = np.array(donor_raw)
    donor_arr[donor_arr[:, :, 3] <= 30, 3] = 0
    donor_im = donor_raw.crop(Image.fromarray(donor_arr).getbbox())
    donor_clean = clean_card_canvas(donor_im, max_rank=max_rank)

    crop_x = 220 if max_rank == 1 else (280 if max_rank == 2 else 310)
    # Stop at x=498 so patch stays inside the card and never touches the recipient card frame at x >= 501
    crop_box = (crop_x, 450, 498, 565)
    patch = donor_clean.crop(crop_box)

    res = card_im.copy()
    res.paste(patch, (crop_box[0], crop_box[1]))
    return res

def clean_card_canvas(base_im, max_rank=None, title_override=None, inpaint_title=False, is_ghoul=False):
    """Inpaint parchment text and optionally title banner. Ribbons are always preserved."""
    arr = np.array(base_im)
    h, w = arr.shape[:2]

    parchment_bg = np.median(arr[480:530, 200:300, :3], axis=(0, 1))

    text_mask = np.zeros((h, w), dtype=bool)

    ribbon_x = RIBBON_X_BY_RANK.get(max_rank, 380) if max_rank else 380

    # 1. Parchment text mask
    # Slanted bounding polygon that covers all description lines while safely avoiding
    # the SPECIAL badge on the bottom-left and the star ribbon on the bottom-right.
    for x in range(75, 485):
        if x >= w: break
        if is_ghoul:
            # Ghoul card parchment box top border line: y = 435 - 0.08055 * (x - 90)
            b_y = int(435 - 0.08055 * (x - 90))
            yt = b_y + 3
            if x < 145:
                yb = 540
            elif x < ribbon_x:
                yb = 575
            else:
                yb = int(507 - 0.08055 * (x - ribbon_x))
        else:
            yt = int(434 - 0.0619 * (x - 65))
            if x < 135:
                yb = int(530 - 0.0619 * (x - 65))
            elif x < ribbon_x:
                yb = int(542 - 0.0619 * (x - 65))
            else:
                yb = int(509 - 0.0619 * (x - ribbon_x))

        for y in range(max(0, yt), min(h, yb)):
            if arr[y, x, 0] < 185 and arr[y, x, 1] < 185 and arr[y, x, 2] < 185 and arr[y, x, 3] > 200:
                text_mask[y, x] = True

    # 2. Title banner text mask (if replacing title or requested to inpaint title)
    do_banner = bool(title_override or inpaint_title)
    if do_banner:
        left_banner = arr[45:60, 115:130, :3]
        right_banner = arr[45:60, 435:460, :3]
        banner_samples = np.vstack([left_banner.reshape(-1, 3), right_banner.reshape(-1, 3)])
        banner_bg = np.median(banner_samples, axis=0)

        # Strictly detect letters and drop shadows within letter bounds y in [33, 77], x in [125, 435]
        for y in range(33, 77):
            for x in range(125, 435):
                if x < w and y < h:
                    diff = np.linalg.norm(arr[y, x, :3].astype(float) - banner_bg)
                    mean_col = np.mean(arr[y, x, :3])
                    if diff > 22 and (mean_col > 208 or mean_col < 95):
                        text_mask[y, x] = True

        # Also clean any donor character art that protruded into lower banner
        for y in range(77, 88):
            for x in range(125, 435):
                if x < w and y < h:
                    diff = np.linalg.norm(arr[y, x, :3].astype(float) - banner_bg)
                    if diff > 24:
                        text_mask[y, x] = True

    mask_im = Image.fromarray((text_mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))
    mask_arr = np.array(mask_im)
    if is_ghoul:
        # Strictly ensure dilated mask NEVER touches or erodes the top border line
        for x in range(75, 485):
            if x < w:
                b_y = int(435 - 0.08055 * (x - 90))
                mask_arr[:b_y + 2, x] = 0

    # Ensure banner inpaint strictly protects top ribbon bevel (y <= 31), bottom shadow (y >= 89),
    # cost badge zone (x <= 120), and right card frame (x >= 445)
    if do_banner:
        mask_arr[:32, :] = 0
        mask_arr[89:, :] = 0
        mask_arr[:, :120] = 0
        mask_arr[:, 445:] = 0
    else:
        mask_arr[:90, :110] = 0

    dilated = mask_arr > 0
    mask_im = Image.fromarray(mask_arr)

    cleaned = arr.copy()

    # Inpaint parchment
    max_inpaint_y = min(h, 585 if is_ghoul else 545)
    for y in range(380, max_inpaint_y):
        for x in range(75, min(w, 485)):
            if not dilated[y, x]:
                continue
            patch = arr[max(380, y-10):min(max_inpaint_y, y+11), max(75, x-25):min(min(w, 485), x+26), :3]
            patch_mask = dilated[max(380, y-10):min(max_inpaint_y, y+11), max(75, x-25):min(min(w, 485), x+26)]
            bg = patch[(~patch_mask) & (patch[:, :, 0] > 175) & (patch[:, :, 1] > 170)]
            if len(bg) > 5:
                bg_col = np.median(bg, axis=0)
            else:
                bg_col = parchment_bg
            noise = np.random.normal(0, 1.2, 3)
            cleaned[y, x, :3] = np.clip(bg_col + noise, 0, 255)

    # Inpaint banner if needed
    if do_banner:
        for y in range(32, 89):
            for x in range(120, min(w, 445)):
                if not dilated[y, x]:
                    continue
                patch = arr[max(28, y-6):min(88, y+7), max(115, x-20):min(min(w, 445), x+21), :3]
                patch_mask = dilated[max(28, y-6):min(88, y+7), max(115, x-20):min(min(w, 445), x+21)]
                bg = patch[~patch_mask]
                if len(bg) > 5:
                    bg_col = np.median(bg, axis=0)
                else:
                    bg_col = banner_bg
                noise = np.random.normal(0, 1.0, 3)
                cleaned[y, x, :3] = np.clip(bg_col + noise, 0, 255)

    clean_im = Image.fromarray(cleaned)
    final_mask = mask_im.filter(ImageFilter.GaussianBlur(0.6))
    result = base_im.copy()
    result.paste(clean_im, (0, 0), final_mask)

    # Render new title if specified and not in inpaint-only mode
    if title_override and not inpaint_title:
        result = render_rotated_title(result, title_override)

    return result

def detect_card_base_cost(card_im):
    """Detect the numeral currently printed on the card's cost badge."""
    crop_box = (20, 15, 105, 98)
    badge_crop = card_im.crop(crop_box)
    flat = badge_crop.rotate(-3.568, expand=True, resample=Image.BICUBIC)
    f_arr = np.array(flat)
    if f_arr.shape[:2] != (89, 91):
        return 1
    dark = (np.mean(f_arr[:, :, :3], axis=2) < 130) & (f_arr[:, :, 3] > 200)

    ious = []
    for c_val in [1, 2, 3]:
        g_mask = GLYPH_MASKS.get(c_val)
        if g_mask is not None:
            inter = np.logical_and(dark, g_mask).sum()
            union = np.logical_or(dark, g_mask).sum()
            iou = inter / max(1, union)
            ious.append((iou, c_val))

    if not ious:
        return 1
    best_iou, best_cost = max(ious, key=lambda x: x[0])
    return best_cost if best_iou > 0.35 else 1

def update_cost_badge(card_im, cost, base_cost=1):
    """Inpaint existing cost number and composite authentic Bethesda cost glyph."""
    if cost == base_cost:
        return card_im

    glyph_im = COST_GLYPHS.get(cost)
    if not glyph_im:
        return card_im

    crop_box = (20, 15, 105, 98)
    badge_crop = card_im.crop(crop_box)
    flat = badge_crop.rotate(-3.568, expand=True, resample=Image.BICUBIC)
    fw, fh = flat.size
    arr = np.array(flat)

    # Detect the existing numeral inside the cream interior
    # The numeral (and its antialiasing/shadow) has y in 14..fh-6 and x in 22..fw-18
    num_mask = np.zeros((fh, fw), dtype=bool)
    for y in range(14, fh - 6):
        for x in range(22, fw - 18):
            if np.mean(arr[y, x, :3]) < 185 and arr[y, x, 3] > 200:
                num_mask[y, x] = True

    mask_im = Image.fromarray((num_mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    dilated = np.array(mask_im) > 0

    cleaned = arr.copy()
    # Inpaint by sampling local neighborhood cream pixels within 14px
    for y in range(fh):
        for x in range(fw):
            if not dilated[y, x]: continue
            sub = arr[max(0, y-14):min(fh, y+15), max(0, x-14):min(fw, x+15), :3]
            sub_mask = dilated[max(0, y-14):min(fh, y+15), max(0, x-14):min(fw, x+15)]
            valid = sub[(~sub_mask) & (np.mean(sub, axis=2) > 195)]
            if len(valid) > 0:
                col = np.median(valid, axis=0)
            else:
                col = np.array([235, 220, 192])
            noise = np.random.normal(0, 1.2, 3)
            cleaned[y, x, :3] = np.clip(col + noise, 0, 255)

    clean_flat = Image.fromarray(cleaned)
    combined_flat = Image.alpha_composite(clean_flat, glyph_im)
    change_flat = np.maximum(dilated.astype(np.uint8) * 255, np.array(glyph_im)[:, :, 3])
    change_flat_im = Image.fromarray(change_flat).filter(ImageFilter.GaussianBlur(1.2))

    rot_back_img = combined_flat.rotate(3.568, resample=Image.BICUBIC)
    rot_back_mask = change_flat_im.rotate(3.568, resample=Image.BICUBIC)

    pw, ph = badge_crop.size
    cx, cy = fw / 2, fh / 2
    final_patch = rot_back_img.crop((int(cx - pw / 2), int(cy - ph / 2), int(cx + pw / 2), int(cy + ph / 2)))
    final_mask = rot_back_mask.crop((int(cx - pw / 2), int(cy - ph / 2), int(cx + pw / 2), int(cy + ph / 2)))

    res = card_im.copy()
    res.paste(final_patch, (crop_box[0], crop_box[1]), final_mask)
    return res

def render_description(card_im, desc, is_ghoul=False):
    """Render word-wrapped description text centered at authentic Pip-Boy angle (+3.568° or +4.6° for Ghoul)."""
    if not desc or not desc.strip():
        return card_im
    w, h = card_im.size
    words = desc.split()

    max_w = 320 if is_ghoul else 330
    rot_angle = 4.6 if is_ghoul else 3.568
    rot_center = (268, 480) if is_ghoul else (268, 482)

    # Try fitting with standard 20px font first
    lines = []
    cur_line = []
    for wd in words:
        test = " ".join(cur_line + [wd])
        bbox = font_body_20.getbbox(test)
        if (bbox[2] - bbox[0]) > max_w:
            lines.append(" ".join(cur_line))
            cur_line = [wd]
        else:
            cur_line.append(wd)
    if cur_line:
        lines.append(" ".join(cur_line))

    # If text is long (3+ lines) or exceeds comfortable height, use 18px font
    if len(lines) > 2:
        lines_18 = []
        cur_line_18 = []
        for wd in words:
            test = " ".join(cur_line_18 + [wd])
            bbox = font_body_18.getbbox(test)
            if (bbox[2] - bbox[0]) > max_w:
                lines_18.append(" ".join(cur_line_18))
                cur_line_18 = [wd]
            else:
                cur_line_18.append(wd)
        if cur_line_18:
            lines_18.append(" ".join(cur_line_18))
        lines = lines_18
        active_font = font_body_18
        line_h = 23 if is_ghoul else 24
    else:
        active_font = font_body_20
        line_h = 25 if is_ghoul else 26

    total_h = len(lines) * line_h
    start_y = (488 if is_ghoul else 482) - (total_h // 2)

    txt_canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(txt_canvas)
    for i, line in enumerate(lines):
        bbox = d.textbbox((0, 0), line, font=active_font)
        lw = bbox[2] - bbox[0]
        cx = 268
        lx = cx - (lw // 2)
        ly = start_y + i * line_h
        d.text((lx, ly), line, fill=(35, 38, 40, 255), font=active_font)

    rot_txt = txt_canvas.rotate(rot_angle, center=rot_center, resample=Image.BICUBIC)
    return Image.alpha_composite(card_im, rot_txt)

def get_ghoul_star_coords(card_id, max_rank, s):
    """Return exact, calibrated star slot coordinates for multi-rank Ghoul perk cards."""
    if max_rank == 2:
        if card_id == "arms-of-steel":
            return 461, 507
        elif card_id == "battle-genes":
            return 460, 507
        return 460, 507
    elif max_rank == 3:
        if s == 2:
            return 430, 508
        else:
            return 460, 506
    elif max_rank == 4:
        if s == 2:
            return 265, 494
        elif s == 3:
            return 295, 490
        else:
            return 324, 487
    k = max_rank - s
    return 456 - k * 32, 499 + k * 2

def process_card(card_info, force=False):
    card_id = card_info["id"]
    snake = card_id.replace("-", "_")
    ranks = card_info.get("ranks", [])
    if not ranks:
        ranks = [{"rank": 1, "cost": 1, "description": ""}]

    if not force:
        all_exist = True
        for r_entry in ranks:
            r = r_entry.get("rank", 1)
            f_proj = os.path.join(OUT_PROJECT, f"{snake}_r{r}.png")
            f_desk = os.path.join(OUT_DESKTOP, f"{snake}_r{r}.png")
            if not (os.path.exists(f_proj) and os.path.exists(f_desk)):
                all_exist = False
                break
        if all_exist:
            return True

    max_rank = card_info.get("maxRank", len(ranks))
    special = card_info.get("special", "S")
    aliases = list(CARD_ALIASES.get(card_id, []))
    is_ghoul = is_ghoul_card(card_id) or card_info.get("ghoulOnly", False)

    if card_id in RETHEMED_CARDS:
        cfg = RETHEMED_CARDS[card_id]
        target_special = cfg["target_special"]
        source_special = cfg.get("source_special", "L")
        donor_id = cfg.get("donor") or DONOR_CARDS.get((target_special, max_rank), "blocker")
        clean_base = build_rethemed_card(
            card_id=card_id,
            target_special=target_special,
            max_rank=max_rank,
            title=card_info["name"].upper(),
            donor_id=donor_id,
            source_special=source_special
        )
        detected_cost = detect_card_base_cost(clean_base)
    else:
        # 1. Determine base image
        base_file = None
        # Check wiki dir first for high-res clean webp
        if card_id in WIKI_ALIASES:
            base_file = os.path.join(WIKI_DIR, WIKI_ALIASES[card_id])
        else:
            wiki_path = os.path.join(WIKI_DIR, f"fo76-perk-{card_id}.webp")
            if os.path.exists(wiki_path):
                base_file = wiki_path
            else:
                curved_path = os.path.join(CURVED_DIR, f"{snake}.png")
                if os.path.exists(curved_path):
                    base_file = curved_path

        if not base_file or not os.path.exists(base_file):
            print(f"⚠️ Missing base image for {card_id}, skipping.")
            return False

        raw_im = Image.open(base_file).convert("RGBA")
        raw_arr = np.array(raw_im)
        raw_arr[raw_arr[:, :, 3] <= 30, 3] = 0
        bbox = Image.fromarray(raw_arr).getbbox()
        base_im = raw_im.crop(bbox) if bbox else raw_im

        # Detect if ribbon rank exceeds target live patch maxRank (standard cards only; ghoul cards have native 1:1 ribbons)
        if not is_ghoul:
            detected_ribbon = detect_ribbon_rank(np.array(base_im))
            if detected_ribbon > max_rank:
                base_im = patch_card_ribbon(base_im, special, max_rank)

        # Detect base cost from unadulterated base image
        detected_cost = detect_card_base_cost(base_im)

        # 2. Clean canvas (parchment text)
        clean_base = clean_card_canvas(base_im, max_rank=max_rank, is_ghoul=is_ghoul)

    for r_data in ranks:
        rank_num = r_data["rank"]
        cost_val = r_data.get("cost", 1)
        desc = r_data.get("description", "").strip()

        card = clean_base.copy()

        # Update cost badge
        card = update_cost_badge(card, cost_val, base_cost=detected_cost)

        # Render description text
        card = render_description(card, desc, is_ghoul=is_ghoul)

        # Update stars if multi-rank
        # NEVER stamp stars on rank 1 (native rank 1 already has 1 white star and remaining dark stars)
        # For rank 2 and above, stamp pristine clean white_star at exact calculated slot coordinates
        if max_rank >= 2 and rank_num >= 2:
            for s in range(2, min(rank_num + 1, max_rank + 1)):
                if is_ghoul:
                    star_x, star_y = get_ghoul_star_coords(card_id, max_rank, s)
                    active_star = ghoul_oval_star if (max_rank == 4 and ghoul_oval_star is not None) else white_star
                else:
                    k = max_rank - s
                    star_x = 456 - k * 32
                    star_y = 499 + k * 2
                    active_star = white_star
                card.paste(active_star, (star_x, star_y), active_star)

        # Save rank image and aliases
        target_names = [snake] + aliases
        for name in target_names:
            rank_filename = f"{name}_r{rank_num}.png"
            proj_path = os.path.join(OUT_PROJECT, rank_filename)
            desk_path = os.path.join(OUT_DESKTOP, rank_filename)

            card.save(proj_path, format="PNG", optimize=True)
            shutil.copyfile(proj_path, desk_path)

            if rank_num == 1:
                base_filename = f"{name}.png"
                proj_base = os.path.join(OUT_PROJECT, base_filename)
                desk_base = os.path.join(OUT_DESKTOP, base_filename)
                shutil.copyfile(proj_path, proj_base)
                shutil.copyfile(proj_path, desk_base)

    print(f"✅ [{special}] {card_info["name"]} ({card_id}) -> {len(ranks)} rank(s)")
    return True

def main():
    args = sys.argv[1:]
    force = ("--force" in args)
    filter_ids = [a for a in args if not a.startswith("--")]

    standard_cards = [c for c in cards_data if c.get("special") != "LEGENDARY"] + FEMALE_CARDS
    if filter_ids:
        standard_cards = [c for c in standard_cards if c["id"] in filter_ids]

    print(f"🚀 Processing {len(standard_cards)} Standard Perk Cards from SeventySix.esm...")

    processed = 0
    skipped = 0
    for card in standard_cards:
        success = process_card(card, force=force)
        if success:
            processed += 1
        else:
            skipped += 1

    print(f"\n🎉 Finished rendering standard cards! Processed: {processed}, Skipped: {skipped}")

if __name__ == "__main__":
    main()
