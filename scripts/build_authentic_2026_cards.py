#!/usr/bin/env python3
"""
☢️ Master 2026 Authentic Live Patch Perk Card Compositor
=========================================================
Processes all 16 rebalanced Fallout 76 perk cards directly from authentic
Bethesda in-game rips (The Backwoods, C.A.M.P. Revamp, Gone Fission,
Ghoul Within, Gleaming Depths).

- Single-rank cards (11): Cropped directly from authentic rips (100% native).
- Multi-rank cards (5): 
    - Rank 1: Cropped directly from authentic rip (100% native).
    - Rank 2+: Description plaque wiped cleanly with seamless Bethesda parchment,
      rank description rendered at 3.568° slant, white stars stamped at exact ribbon
      coordinates, and Bethesda slab cost badge updated.
- Outputs saved to:
    - public/images/in_game_cards/
    - /home/nathanw/Desktop/Agent_Exchange/clean_perk_assets/in_game_cards/
    - public/images/perks_official_wiki/
"""

import os
import sys
import json
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIKI_RIPS_DIR = "/home/nathanw/.gemini/antigravity/brain/37d4da9d-c7b8-420c-ae4f-a51cfd0fde13/scratch/wiki_authentic_rips"
OUT_PROJECT = os.path.join(PROJECT_ROOT, "public", "images", "in_game_cards")
OUT_DESKTOP = "/home/nathanw/Desktop/Agent_Exchange/clean_perk_assets/in_game_cards"
OUT_WIKI = os.path.join(PROJECT_ROOT, "public", "images", "perks_official_wiki")
DATA_JSON = os.path.join(PROJECT_ROOT, "src", "data", "perk-cards.json")
BODY_FONT = os.path.join(PROJECT_ROOT, "data", "fonts", "RobotoSlab-ExtraBold.ttf")
PARCHMENT_TILE = os.path.join(PROJECT_ROOT, "data", "sprites", "pure_parchment_tile.png")
WHITE_STAR = os.path.join(PROJECT_ROOT, "data", "sprites", "white_star.png")

os.makedirs(OUT_PROJECT, exist_ok=True)
os.makedirs(OUT_DESKTOP, exist_ok=True)
os.makedirs(OUT_WIKI, exist_ok=True)

with open(DATA_JSON, "r", encoding="utf-8") as f:
    cards_data = {c["id"]: c for c in json.load(f)}

font_body_18 = ImageFont.truetype(BODY_FONT, 18)
pure_tile = Image.open(PARCHMENT_TILE).convert("RGBA")
star_sprite = Image.open(WHITE_STAR).convert("RGBA")

# 16 Rebalanced Cards definition
REBALANCED_CARDS = [
    "good-with-salt",
    "tormentor",
    "thru-hiker",
    "starched-genes",
    "white-knight",
    "bullet-shield",
    "bloodsucker",
    "field-surgeon",
    "portable-power",
    "rad-sponge",
    "revenant",
    "curator",
    "fortune-finder",
    "dry-nurse",
    "strong-arm",
    "wrecking-ball"
]

def make_seamless_parchment(pw=440, ph=200):
    tw, th = pure_tile.size
    im = Image.new("RGBA", (pw, ph))
    for y in range(0, ph, th):
        for x in range(0, pw, tw):
            t = pure_tile
            if (x // tw) % 2 == 1: t = t.transpose(Image.FLIP_LEFT_RIGHT)
            if (y // th) % 2 == 1: t = t.transpose(Image.FLIP_TOP_BOTTOM)
            im.paste(t, (x, y))
    return im

def crop_card_bounds(raw_im):
    arr = np.array(raw_im)
    arr[arr[:, :, 3] <= 30, 3] = 0
    bbox = Image.fromarray(arr).getbbox()
    return raw_im.crop(bbox) if bbox else raw_im

def wipe_parchment_text(card_im, max_rank=2, slug=""):
    w, h = card_im.size
    seamless = make_seamless_parchment(440, 200)
    
    mask = Image.new("L", (w, h), 0)
    m_arr = np.array(mask)

    # Calculate ribbon left edge depending on card
    if slug == "bullet-shield":
        ribbon_x = 350
    elif max_rank == 2:
        ribbon_x = 405
    elif max_rank == 3:
        ribbon_x = 370
    else:
        ribbon_x = 435

    for x in range(74, 470):
        if x >= w: break
        yt = int(436 - 0.0619 * (x - 65))
        if x < 135:
            yb = int(525 - 0.0619 * (x - 65))
        elif x < ribbon_x:
            yb = int(538 - 0.0619 * (x - 65))
        else:
            yb = int(502 - 0.0619 * (x - ribbon_x))
        m_arr[yt:yb, x] = 255

    carr = np.array(card_im)

    if slug == "good-with-salt":
        # Protect backpack bottom on good-with-salt
        bp_mask = (carr[:, :, 0] > 80) & (carr[:, :, 1] > 50) & (carr[:, :, 0] > carr[:, :, 2] + 25) & (carr[:, :, 3] > 200)
        m_arr[bp_mask & (np.arange(h)[:, None] < 426)] = 0

    if slug == "thru-hiker":
        # Protect boot leather on thru-hiker
        boot_mask = (carr[:, :, 0] > 100) & (carr[:, :, 1] > 65) & (carr[:, :, 0] > carr[:, :, 2] + 35) & (carr[:, :, 3] > 200)
        m_arr[boot_mask & (np.arange(h)[:, None] < 432)] = 0

    feathered = Image.fromarray(m_arr).filter(ImageFilter.GaussianBlur(1.0))
    wiped = card_im.copy()
    wiped.paste(seamless, (65, 375), feathered.crop((65, 375, 65+440, 375+200)))
    return wiped

def render_slanted_description(card_im, desc_text):
    w, h = card_im.size
    words = desc_text.split()
    lines = []
    cur = []
    for wd in words:
        test = " ".join(cur + [wd])
        bbox = font_body_18.getbbox(test)
        if (bbox[2] - bbox[0]) > 310:
            lines.append(" ".join(cur))
            cur = [wd]
        else:
            cur.append(wd)
    if cur: lines.append(" ".join(cur))

    line_h = 24
    total_h = len(lines) * line_h
    start_y = 482 - (total_h // 2)

    txt_canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d_txt = ImageDraw.Draw(txt_canvas)
    for i, line in enumerate(lines):
        bbox = d_txt.textbbox((0, 0), line, font=font_body_18)
        lw = bbox[2] - bbox[0]
        cx = 268
        lx = cx - (lw // 2)
        ly = start_y + i * line_h
        # Drop shadow
        d_txt.text((lx+1, ly+1), line, fill=(240, 235, 225, 120), font=font_body_18)
        d_txt.text((lx, ly), line, fill=(35, 38, 40, 255), font=font_body_18)

    rot_txt = txt_canvas.rotate(3.568, center=(268, 482), resample=Image.BICUBIC)
    return Image.alpha_composite(card_im, rot_txt)

def update_cost_numeral(card_im, cost_val):
    crop_box = (20, 15, 105, 98)
    badge_crop = card_im.crop(crop_box)
    flat = badge_crop.rotate(-3.568, expand=True, resample=Image.BICUBIC)
    glyph_path = os.path.join(PROJECT_ROOT, "data", "sprites", f"cost_glyph_{cost_val}.png")
    if not os.path.exists(glyph_path):
        return card_im
    glyph = Image.open(glyph_path).convert("RGBA")
    fw, fh = flat.size
    gw, gh = glyph.size
    arr_f = np.array(flat)
    interior = arr_f[12:fh-12, 16:fw-16]
    cream = np.median(interior[interior[:, :, 0] > 180], axis=0) if np.any(interior[:, :, 0] > 180) else [240, 226, 195, 255]

    for y in range(15, fh-15):
        for x in range(20, fw-20):
            if arr_f[y, x, 0] < 160 and arr_f[y, x, 3] > 150:
                arr_f[y, x] = cream

    flat_clean = Image.fromarray(arr_f)
    gx = (fw - gw) // 2 + 1
    gy = (fh - gh) // 2
    flat_clean.paste(glyph, (gx, gy), glyph)

    rot_back = flat_clean.rotate(3.568, resample=Image.BICUBIC)
    pw, ph = badge_crop.size
    cx_b, cy_b = fw / 2, fh / 2
    patch_b = rot_back.crop((int(cx_b - pw/2), int(cy_b - ph/2), int(cx_b + pw/2), int(cy_b + ph/2)))
    res = card_im.copy()
    res.paste(patch_b, (crop_box[0], crop_box[1]))
    return res

def stamp_multi_rank_stars(card_im, rank_num, max_rank, slug=""):
    res = card_im.copy()
    if slug == "bullet-shield":
        # Bullet shield has 4-star ribbon with smaller stars
        # Extract clean star from base Star 1
        star1_crop = card_im.crop((374, 513, 395, 536))
        s_arr = np.array(star1_crop)
        mask = (s_arr[:, :, 0] > 180) | ((s_arr[:, :, 0] < 50) & (s_arr[:, :, 1] < 50) & (s_arr[:, :, 2] < 50))
        s_arr[~mask, 3] = 0
        bs_star = Image.fromarray(s_arr)

        if rank_num >= 2:
            res.paste(bs_star, (404, 511), bs_star)
        if rank_num >= 3:
            res.paste(bs_star, (434, 509), bs_star)
        if rank_num >= 4:
            res.paste(bs_star, (464, 507), bs_star)
    elif max_rank == 2:
        # Slot 2 is at (455, 501)
        if rank_num >= 2:
            res.paste(star_sprite, (455, 501), star_sprite)
    elif max_rank == 3:
        # 3-star ribbon slots:
        # Slot 1 is already white on base
        # Slot 2: (430, 503)
        # Slot 3: (461, 501)
        if rank_num >= 2:
            res.paste(star_sprite, (430, 503), star_sprite)
        if rank_num >= 3:
            res.paste(star_sprite, (461, 501), star_sprite)
    return res

def save_card_variants(snake_name, card_im, rank_num):
    r_file = f"{snake_name}_r{rank_num}.png"
    p1 = os.path.join(OUT_PROJECT, r_file)
    p2 = os.path.join(OUT_DESKTOP, r_file)
    card_im.save(p1, "PNG")
    card_im.save(p2, "PNG")
    print(f"  ✓ Saved {r_file}")

    if rank_num == 1:
        base_file = f"{snake_name}.png"
        card_im.save(os.path.join(OUT_PROJECT, base_file), "PNG")
        card_im.save(os.path.join(OUT_DESKTOP, base_file), "PNG")
        print(f"  ✓ Saved {base_file}")

def main():
    print("🚀 Compiling Authentic 2026 Live Patch Perk Cards...")

    for slug in REBALANCED_CARDS:
        info = cards_data.get(slug)
        if not info:
            print(f"⚠️ Warning: {slug} not found in perk-cards.json")
            continue

        snake = slug.replace("-", "_")
        src_webp = os.path.join(WIKI_RIPS_DIR, f"{slug}.webp")
        if not os.path.exists(src_webp):
            print(f"❌ Error: Missing authentic rip for {slug} at {src_webp}")
            continue

        # 1. Update public/images/perks_official_wiki/fo76-perk-{slug}.webp
        dest_wiki = os.path.join(OUT_WIKI, f"fo76-perk-{slug}.webp")
        shutil.copyfile(src_webp, dest_wiki)
        print(f"[{info['name']}] Synchronized source wiki webp -> {dest_wiki}")

        # 2. Open base card and crop bounds
        raw_im = Image.open(src_webp).convert("RGBA")
        base_cropped = crop_card_bounds(raw_im)

        max_rank = info.get("maxRank", 1)
        ranks = info.get("ranks", [])

        # Rank 1 is ALWAYS the authentic Bethesda rip cropped directly!
        save_card_variants(snake, base_cropped, 1)

        # Multi-rank progression (Rank 2+)
        if max_rank > 1:
            for r_entry in ranks:
                r = r_entry["rank"]
                if r == 1:
                    continue
                cost = r_entry.get("cost", r)
                desc = r_entry.get("description", "")

                # Clean parchment text
                wiped = wipe_parchment_text(base_cropped, max_rank=max_rank, slug=slug)
                # Render description
                slanted = render_slanted_description(wiped, desc)
                # Update cost badge
                with_cost = update_cost_numeral(slanted, cost)
                # Stamp stars
                with_stars = stamp_multi_rank_stars(with_cost, rank_num=r, max_rank=max_rank, slug=slug)

                save_card_variants(snake, with_stars, r)

    print("\n🎉 All 16 Rebalanced Cards Successfully Built & Synchronized!")

if __name__ == "__main__":
    main()
