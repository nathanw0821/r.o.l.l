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
BODY_FONT = "/usr/share/fonts/TTF/DejaVuSerif-Bold.ttf"
TITLE_FONT = os.path.join(PROJECT_ROOT, "data", "fonts", "RobotoCondensed-Bold.ttf")
NUM_FONT = os.path.join(PROJECT_ROOT, "data", "fonts", "RobotoCondensed-Bold.ttf")

font_body_18 = ImageFont.truetype(BODY_FONT, 18)
font_title_34 = ImageFont.truetype(TITLE_FONT, 34)
font_title_28 = ImageFont.truetype(TITLE_FONT, 28)
font_title_24 = ImageFont.truetype(TITLE_FONT, 24)
font_num_54 = ImageFont.truetype(NUM_FONT, 54)

# Star Sprite (Pristine 36x36 white star extracted from native Bethesda Pip-Boy assets)
white_star = Image.open(os.path.join(PROJECT_ROOT, "data", "sprites", "white_star.png")).convert("RGBA")

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

# Authentic Bethesda reference donor cards by SPECIAL and target rank tier
DONOR_CARDS = {
    ("S", 1): "blood-luster",
    ("S", 2): "bandolier",
    ("S", 3): "blocker",

    ("P", 1): "awareness",
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
    ("I", 3): "power-user",

    ("A", 1): "escape-artist",
    ("A", 2): "ammosmith",
    ("A", 3): "action-boy",

    ("L", 1): "woodchucker",
    ("L", 2): "starched-genes",
    ("L", 3): "better-criticals",
}

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

def clean_card_canvas(base_im, max_rank=None, title_override=None):
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
        yt = int(434 - 0.0619 * (x - 65))
        if x < 135:
            yb = int(530 - 0.0619 * (x - 65))
        elif x < ribbon_x:
            yb = int(542 - 0.0619 * (x - 65))
        else:
            yb = int(509 - 0.0619 * (x - ribbon_x))

        for y in range(max(0, yt), min(h, yb)):
            if arr[y, x, 0] < 165 and arr[y, x, 1] < 165 and arr[y, x, 2] < 165 and arr[y, x, 3] > 200:
                text_mask[y, x] = True

    # 2. Title banner text mask (if replacing title)
    if title_override:
        for y in range(25, 75):
            for x in range(95, 440):
                if x < w and y < h:
                    if arr[y, x, 0] > 180 and arr[y, x, 1] > 190 and arr[y, x, 2] > 165 and arr[y, x, 3] > 200:
                        text_mask[y, x] = True

    mask_im = Image.fromarray((text_mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    dilated = np.array(mask_im) > 0

    cleaned = arr.copy()

    # Inpaint parchment
    for y in range(380, min(h, 545)):
        for x in range(75, min(w, 485)):
            if not dilated[y, x]:
                continue
            patch = arr[max(380, y-10):min(min(h, 545), y+11), max(75, x-25):min(min(w, 485), x+26), :3]
            patch_mask = dilated[max(380, y-10):min(min(h, 545), y+11), max(75, x-25):min(min(w, 485), x+26)]
            bg = patch[(~patch_mask) & (patch[:, :, 0] > 175) & (patch[:, :, 1] > 170)]
            if len(bg) > 5:
                bg_col = np.median(bg, axis=0)
            else:
                bg_col = parchment_bg
            noise = np.random.normal(0, 1.2, 3)
            cleaned[y, x, :3] = np.clip(bg_col + noise, 0, 255)

    # Inpaint banner if needed
    if title_override:
        banner_bg = np.median(arr[45:65, 150:250, :3], axis=(0, 1))
        for y in range(24, min(h, 76)):
            for x in range(95, min(w, 440)):
                if not dilated[y, x]:
                    continue
                patch = arr[max(20, y-10):min(min(h, 80), y+11), max(85, x-25):min(min(w, 450), x+26), :3]
                patch_mask = dilated[max(20, y-10):min(min(h, 80), y+11), max(85, x-25):min(min(w, 450), x+26)]
                bg = patch[(~patch_mask) & (patch[:, :, 1] > 130) & (patch[:, :, 1] < 175)]
                if len(bg) > 5:
                    bg_col = np.median(bg, axis=0)
                else:
                    bg_col = banner_bg
                noise = np.random.normal(0, 1.2, 3)
                cleaned[y, x, :3] = np.clip(bg_col + noise, 0, 255)

    clean_im = Image.fromarray(cleaned)
    final_mask = mask_im.filter(ImageFilter.GaussianBlur(0.8))
    result = base_im.copy()
    result.paste(clean_im, (0, 0), final_mask)

    # Render new title if specified (level banner orientation)
    if title_override:
        if len(title_override) <= 12:
            t_font = font_title_34
        elif len(title_override) <= 18:
            t_font = font_title_28
        else:
            t_font = font_title_24

        d = ImageDraw.Draw(result)
        bbox = d.textbbox((0, 0), title_override, font=t_font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        tx = 270 - (tw // 2)
        ty = 47 - (th // 2)
        d.text((tx + 1, ty + 1), title_override, fill=(45, 60, 45, 180), font=t_font)
        d.text((tx, ty), title_override, fill=(245, 242, 230, 255), font=t_font)

    return result

def update_cost_badge(card_im, cost, base_cost=1):
    """Inpaint existing cost number and render new cost (rotated level, feathered fill)."""
    if cost == base_cost:
        return card_im

    crop_box = (20, 15, 105, 98)
    badge_crop = card_im.crop(crop_box)
    flat = badge_crop.rotate(-3.568, expand=True, resample=Image.BICUBIC)
    fw, fh = flat.size
    arr = np.array(flat)

    num_mask = np.zeros((fh, fw), dtype=bool)
    for y in range(12, fh - 12):
        for x in range(16, fw - 16):
            if np.mean(arr[y, x, :3]) < 175 and arr[y, x, 3] > 200:
                num_mask[y, x] = True

    mask_im = Image.fromarray((num_mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))
    dilated = np.array(mask_im) > 0

    interior_bg = arr[12:fh - 12, 16:fw - 16, :3]
    interior_mask = dilated[12:fh - 12, 16:fw - 16]
    cream_pixels = interior_bg[~interior_mask]
    cream_med = np.median(cream_pixels, axis=0) if len(cream_pixels) > 0 else np.array([240, 226, 195])

    cleaned = arr.copy()
    noise = np.random.normal(0, 1.5, (fh, fw, 3))
    for y in range(fh):
        for x in range(fw):
            if dilated[y, x]:
                cleaned[y, x, :3] = np.clip(cream_med + noise[y, x], 0, 255)

    clean_flat = Image.fromarray(cleaned)

    num_layer = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
    draw = ImageDraw.Draw(num_layer)
    bbox = draw.textbbox((0, 0), str(cost), font=font_num_54)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = int((fw - tw) / 2)
    ty = int((fh - th) / 2) - 4
    draw.text((tx, ty), str(cost), fill=(45, 48, 45, 255), font=font_num_54)

    combined_flat = Image.alpha_composite(clean_flat, num_layer)
    change_flat = np.maximum(dilated.astype(np.uint8) * 255, np.array(num_layer)[:, :, 3])
    change_flat_im = Image.fromarray(change_flat).filter(ImageFilter.GaussianBlur(1.5))

    rot_back_img = combined_flat.rotate(3.568, resample=Image.BICUBIC)
    rot_back_mask = change_flat_im.rotate(3.568, resample=Image.BICUBIC)

    pw, ph = badge_crop.size
    cx, cy = fw / 2, fh / 2
    final_patch = rot_back_img.crop((int(cx - pw / 2), int(cy - ph / 2), int(cx + pw / 2), int(cy + ph / 2)))
    final_mask = rot_back_mask.crop((int(cx - pw / 2), int(cy - ph / 2), int(cx + pw / 2), int(cy + ph / 2)))

    res = card_im.copy()
    res.paste(final_patch, (crop_box[0], crop_box[1]), final_mask)
    return res

def render_description(card_im, desc):
    """Render word-wrapped description text centered at authentic Pip-Boy angle (+3.568°)."""
    if not desc or not desc.strip():
        return card_im
    w, h = card_im.size
    words = desc.split()
    lines = []
    cur_line = []
    for wd in words:
        test = " ".join(cur_line + [wd])
        bbox = font_body_18.getbbox(test)
        if (bbox[2] - bbox[0]) > 325:
            lines.append(" ".join(cur_line))
            cur_line = [wd]
        else:
            cur_line.append(wd)
    if cur_line:
        lines.append(" ".join(cur_line))

    line_h = 24
    total_h = len(lines) * line_h
    start_y = 482 - (total_h // 2)

    txt_canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(txt_canvas)
    for i, line in enumerate(lines):
        bbox = d.textbbox((0, 0), line, font=font_body_18)
        lw = bbox[2] - bbox[0]
        cx = 268
        lx = cx - (lw // 2)
        ly = start_y + i * line_h
        d.text((lx, ly), line, fill=(35, 38, 40, 255), font=font_body_18)

    rot_txt = txt_canvas.rotate(3.568, center=(275, 482), resample=Image.BICUBIC)
    return Image.alpha_composite(card_im, rot_txt)

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

    # 1. Determine base image
    base_file = None
    aliases = list(CARD_ALIASES.get(card_id, []))

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

    # Detect if ribbon rank exceeds target live patch maxRank
    detected_ribbon = detect_ribbon_rank(np.array(base_im))
    if detected_ribbon > max_rank:
        base_im = patch_card_ribbon(base_im, special, max_rank)

    # 2. Clean canvas (parchment text)
    clean_base = clean_card_canvas(base_im, max_rank=max_rank)

    for r_data in ranks:
        rank_num = r_data["rank"]
        cost_val = r_data.get("cost", 1)
        desc = r_data.get("description", "").strip()

        card = clean_base.copy()

        # Update cost badge (base cost is 1 in all original card artwork)
        card = update_cost_badge(card, cost_val, base_cost=1)

        # Render description text
        card = render_description(card, desc)

        # Update stars if multi-rank
        # NEVER stamp stars on rank 1 (native rank 1 already has 1 white star and remaining dark stars)
        # For rank 2 and above, stamp pristine clean white_star at exact calculated slot coordinates
        if max_rank >= 2 and rank_num >= 2:
            for s in range(2, min(rank_num + 1, max_rank + 1)):
                k = max_rank - s
                star_x = 456 - k * 32
                star_y = 499 + k * 2
                card.paste(white_star, (star_x, star_y), white_star)

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

    standard_cards = [c for c in cards_data if c.get("special") != "LEGENDARY"]
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
