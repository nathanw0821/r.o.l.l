#!/usr/bin/env python3
"""
☢️ Master Standard & Reworked Perk Card Multi-Rank Compositor
=============================================================
Generates 1:1 pixel-exact, authentic Pip-Boy curved/slanted cards for all
standard Fallout 76 perk cards from SeventySix.esm.

Features:
- Native Pip-Boy +3.568° curve & slant preserved (100% parallel to parchment baseline).
- Pristine ribbon preservation (never draw ugly grey eraser boxes over ribbons).
- 100% live patch game descriptions extracted from SeventySix.esm.
- Working star progression across all rank counts.
- Working rotated-flat feathered cost badge inpainting (zero ghost silhouettes).
- Clean in-place horizontal title replacement for reworked perks (Bullet Storm, Tightly Wound, etc.).
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

# Star Sprites
white_star = Image.open(os.path.join(PROJECT_ROOT, "data", "sprites", "white_star.png")).convert("RGBA")
dark_star = Image.open(os.path.join(PROJECT_ROOT, "data", "sprites", "dark_star.png")).convert("RGBA")

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

# Reworked cards that use specific base images & title replacements
SPECIAL_REWORKS = {
    "conductor": {
        "base_file": os.path.join(WIKI_DIR, "fo76-perk-science.webp"),
        "base_cost": 2,
        "title": "CONDUCTOR",
        "aliases": []
    },
    "grease-monkey": {
        "base_file": os.path.join(WIKI_DIR, "fo76-perk-fix-it-good.webp"),
        "base_cost": 1,
        "title": "GREASE MONKEY",
        "aliases": []
    },
    "light-meal": {
        "base_file": os.path.join(WIKI_DIR, "fo76-perk-slow-metabolizer.webp"),
        "base_cost": 1,
        "title": "LIGHT MEAL",
        "aliases": []
    },
    "outlaw": {
        "base_file": os.path.join(WIKI_DIR, "fo76-perk-hard-bargain.webp"),
        "base_cost": 1,
        "title": "OUTLAW",
        "aliases": []
    },
    "penetrator": {
        "base_file": os.path.join(WIKI_DIR, "fo76-perk-tank-killer.webp"),
        "base_cost": 1,
        "title": "PENETRATOR",
        "aliases": []
    }
}

def clean_card_canvas(base_im, title_override=None):
    """Inpaint parchment text and optionally title banner. Ribbons are always preserved."""
    arr = np.array(base_im)
    h, w = arr.shape[:2]

    parchment_bg = np.median(arr[480:530, 200:300, :3], axis=(0, 1))

    text_mask = np.zeros((h, w), dtype=bool)

    # 1. Parchment text mask
    # Slanted bounding polygon that covers all description lines while safely avoiding
    # the SPECIAL badge on the bottom-left and the star ribbon on the bottom-right.
    for x in range(75, 480):
        yt = int(434 - 0.0619 * (x - 65))
        if x < 135:
            yb = int(530 - 0.0619 * (x - 65))
        elif x < 375:
            yb = int(542 - 0.0619 * (x - 65))
        else:
            yb = int(506 - 0.0619 * (x - 375))

        for y in range(yt, yb):
            if arr[y, x, 0] < 165 and arr[y, x, 1] < 165 and arr[y, x, 2] < 165 and arr[y, x, 3] > 200:
                text_mask[y, x] = True

    # 2. Title banner text mask (if replacing title)
    if title_override:
        for y in range(25, 75):
            for x in range(95, 440):
                if arr[y, x, 0] > 180 and arr[y, x, 1] > 190 and arr[y, x, 2] > 165 and arr[y, x, 3] > 200:
                    text_mask[y, x] = True

    mask_im = Image.fromarray((text_mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    dilated = np.array(mask_im) > 0

    cleaned = arr.copy()

    # Inpaint parchment
    for y in range(380, 545):
        for x in range(75, 480):
            if not dilated[y, x]:
                continue
            patch = arr[max(380, y-10):min(545, y+11), max(75, x-25):min(480, x+26), :3]
            patch_mask = dilated[max(380, y-10):min(545, y+11), max(75, x-25):min(480, x+26)]
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
        for y in range(24, 76):
            for x in range(95, 440):
                if not dilated[y, x]:
                    continue
                patch = arr[max(20, y-10):min(80, y+11), max(85, x-25):min(450, x+26), :3]
                patch_mask = dilated[max(20, y-10):min(80, y+11), max(85, x-25):min(450, x+26)]
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

    # 1. Determine base image and base cost
    base_file = None
    title_override = None
    aliases = list(CARD_ALIASES.get(card_id, []))
    base_cost = ranks[0].get("cost", 1)

    if card_id in SPECIAL_REWORKS:
        rework = SPECIAL_REWORKS[card_id]
        base_file = rework["base_file"]
        base_cost = rework.get("base_cost", 1)
        title_override = rework["title"]
        aliases = list(set(aliases + rework.get("aliases", [])))
    else:
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
    bbox = raw_im.getbbox()
    base_im = raw_im.crop(bbox) if bbox else raw_im

    # 2. Clean canvas (parchment text and title banner if rework)
    clean_base = clean_card_canvas(base_im, title_override=title_override)

    for r_data in ranks:
        rank_num = r_data["rank"]
        cost_val = r_data.get("cost", base_cost)
        desc = r_data.get("description", "").strip()

        card = clean_base.copy()

        # Update cost badge
        card = update_cost_badge(card, cost_val, base_cost=base_cost)

        # Render description text
        card = render_description(card, desc)

        # Update stars if multi-rank
        if max_rank == 2:
            if rank_num == 1:
                card.paste(dark_star, (445, 502), dark_star)
            elif rank_num >= 2:
                card.paste(white_star, (451, 500), white_star)
        elif max_rank >= 3:
            if rank_num == 1:
                card.paste(dark_star, (427, 496), dark_star)
                card.paste(dark_star, (457, 492), dark_star)
            elif rank_num == 2:
                card.paste(white_star, (429, 502), white_star)
                card.paste(dark_star, (457, 492), dark_star)
            elif rank_num >= 3:
                card.paste(white_star, (429, 502), white_star)
                card.paste(white_star, (459, 499), white_star)

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

    print(f"✅ [{card_info.get('special', 'S')}] {card_info['name']} ({card_id}) -> {len(ranks)} rank(s)")
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
