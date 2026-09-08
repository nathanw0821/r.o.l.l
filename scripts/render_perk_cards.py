#!/usr/bin/env python3
"""
☢️ R.O.L.L. Master 1:1 Fallout 76 Perk Card Compositor
======================================================
Renders authentic, pixel-exact, flat, high-resolution (600x900 2x Retina)
Perk Cards in WebP format for all ranks across all 268 official cards.

Features:
- Full-color 1:1 in-game graphics extracted from SixtySix binaries & game wiki.
- 4-point perspective homography unwarping to eliminate 3D menu tilt.
- Dynamic point cost badge (1-5) matching specific rank costs.
- Word-wrapped mechanical text on clean parchment background plaque.
- Dynamic star rank chevron banner ([★][★][☆]) matching rank and maxRank.
- Crisp WebP output (<45-80KB) for edge deployment and Discord bot embeds.
"""

import os
import sys
import glob
import json
import math
import shutil
import argparse
from concurrent.futures import ProcessPoolExecutor, as_completed
import numpy as np
from PIL import Image, ImageDraw, ImageFont

CARD_W, CARD_H = 600, 900
CORNER_RADIUS = 28

PROJECT_ROOT = "/home/nathanw/Creative Direction/R.O.L.L"
WIKI_DIR = os.path.join(PROJECT_ROOT, "public", "images", "perks_official_wiki")
PERK_JSON_PATH = os.path.join(PROJECT_ROOT, "src", "data", "perk-cards.json")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "public", "images", "perk_cards_master")
SHOWCASE_DIR = "/home/nathanw/Desktop/Agent_Exchange/perk_cards_showcase"
FONTS_DIR = os.path.join(PROJECT_ROOT, "data", "fonts")

TITLE_FONT_PATH = os.path.join(FONTS_DIR, "Oswald-Bold.ttf")
BODY_FONT_PATH = os.path.join(FONTS_DIR, "RobotoCondensed-Bold.ttf")

SPECIAL_THEMES = {
    "S": {"banner": (192, 122, 56), "border": (230, 180, 80), "bg_tint": (240, 225, 200)},
    "P": {"banner": (118, 142, 82), "border": (220, 195, 85), "bg_tint": (235, 235, 215)},
    "E": {"banner": (186, 72, 72), "border": (225, 175, 80), "bg_tint": (240, 220, 215)},
    "C": {"banner": (162, 88, 162), "border": (220, 180, 90), "bg_tint": (238, 225, 235)},
    "I": {"banner": (74, 120, 170), "border": (215, 185, 90), "bg_tint": (225, 230, 240)},
    "A": {"banner": (205, 90, 80), "border": (235, 190, 80), "bg_tint": (240, 225, 220)},
    "L": {"banner": (64, 152, 152), "border": (220, 190, 85), "bg_tint": (225, 235, 235)},
    "LEGENDARY": {"banner": (45, 55, 72), "border": (245, 190, 45), "bg_tint": (220, 225, 230)},
}

def find_homography(dst_pts, src_pts):
    """Calculate 8-coefficient perspective transformation matrix."""
    matrix = []
    for p1, p2 in zip(dst_pts, src_pts):
        matrix.append([p1[0], p1[1], 1, 0, 0, 0, -p2[0] * p1[0], -p2[0] * p1[1]])
        matrix.append([0, 0, 0, p1[0], p1[1], 1, -p2[1] * p1[0], -p2[1] * p1[1]])
    A = np.matrix(matrix, dtype=float)
    B = np.array(src_pts).reshape(8)
    res = np.dot(np.linalg.inv(A.T * A) * A.T, B)
    return np.array(res).reshape(8)

def resolve_wiki_file(cid):
    """Find authentic full-color source render in wiki library."""
    kebab = cid.replace(" ", "-")
    p1 = os.path.join(WIKI_DIR, f"fo76-perk-{kebab}.webp")
    if os.path.exists(p1):
        return p1
    kebab2 = kebab.replace("-s-", "s-")
    p2 = os.path.join(WIKI_DIR, f"fo76-perk-{kebab2}.webp")
    if os.path.exists(p2):
        return p2
    base = kebab.replace("-expert", "").replace("-master", "")
    p3 = os.path.join(WIKI_DIR, f"fo76-perk-{base}.webp")
    if os.path.exists(p3):
        return p3
    return None

def unwarp_card(source_img_path):
    """Unwarp tilted 3D in-game card render to flat 600x900 rectangle."""
    im = Image.open(source_img_path).convert("RGBA")
    
    # Calibrated source quadrilateral points for Bethesda 76 Scaleform viewport
    src_pts = [
        (116, 90),   # Top-Left card body
        (558, 116),  # Top-Right card body
        (586, 646),  # Bottom-Right card body
        (142, 728)   # Bottom-Left card body
    ]
    
    # Destination 600x900 target rectangle
    dst_pts = [
        (24, 28),
        (576, 28),
        (576, 872),
        (24, 872)
    ]
    
    coeffs = find_homography(dst_pts, src_pts)
    unwarped = im.transform((CARD_W, CARD_H), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
    return unwarped

def draw_star(draw, center, size, fill_color, outline_color=(45, 40, 35), outline_width=2):
    """Draw crisp 5-point vector star."""
    cx, cy = center
    points = []
    for i in range(10):
        angle = i * math.pi / 5 - math.pi / 2
        r = size if i % 2 == 0 else size * 0.45
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(points, fill=fill_color, outline=outline_color, width=outline_width)

def render_single_rank(card_data, rank_num, source_path, output_path):
    """Render a single star rank of a perk card to high-res WebP."""
    special = card_data.get("special", "S")
    theme = SPECIAL_THEMES.get(special, SPECIAL_THEMES["S"])
    max_rank = card_data.get("maxRank", 1)
    
    rank_info = None
    for r in card_data.get("ranks", []):
        if r.get("rank") == rank_num:
            rank_info = r
            break
    if not rank_info and card_data.get("ranks"):
        rank_info = card_data["ranks"][0]

    cost = rank_info.get("cost", 1) if rank_info else 1
    desc = rank_info.get("description", "") if rank_info else ""

    # 1. Unwarp authentic source card base
    card = unwarp_card(source_path)
    draw = ImageDraw.Draw(card)

    # 2. Perfect outer die-cut border cleanup
    border_color = theme["border"]
    draw.rounded_rectangle([(14, 14), (CARD_W - 14, CARD_H - 14)], radius=CORNER_RADIUS, outline=border_color, width=8)

    # 3. Update Point Cost Badge (Top-Left)
    badge_bg = (242, 236, 222, 255)
    draw.rounded_rectangle([(24, 44), (94, 134)], radius=12, fill=badge_bg, outline=(60, 50, 40, 220), width=3)
    
    try:
        cost_font = ImageFont.truetype(TITLE_FONT_PATH, 66)
    except Exception:
        cost_font = ImageFont.load_default()
    
    cost_str = str(cost)
    cbbox = draw.textbbox((0, 0), cost_str, font=cost_font)
    cw, ch = cbbox[2] - cbbox[0], cbbox[3] - cbbox[1]
    draw.text((24 + (70 - cw) // 2, 44 + (90 - ch) // 2 - 4), cost_str, fill=(45, 38, 30, 255), font=cost_font)

    # 4. Update Description Plaque Text
    parchment_color = (236, 228, 214, 255)
    draw.rounded_rectangle([(44, 595), (550, 755)], radius=8, fill=parchment_color)

    # Format text with word wrap
    try:
        desc_font_size = 28
        if len(desc) > 75:
            desc_font_size = 24
        if len(desc) > 120:
            desc_font_size = 21
        body_font = ImageFont.truetype(BODY_FONT_PATH, desc_font_size)
    except Exception:
        body_font = ImageFont.load_default()

    words = desc.split()
    lines = []
    curr_line = []
    max_w = 480
    for w in words:
        test_line = " ".join(curr_line + [w])
        tb = draw.textbbox((0, 0), test_line, font=body_font)
        if (tb[2] - tb[0]) <= max_w:
            curr_line.append(w)
        else:
            if curr_line:
                lines.append(" ".join(curr_line))
            curr_line = [w]
    if curr_line:
        lines.append(" ".join(curr_line))

    line_h = desc_font_size + 7
    total_h = len(lines) * line_h
    start_y = 595 + (160 - total_h) // 2
    for idx, line in enumerate(lines):
        tb = draw.textbbox((0, 0), line, font=body_font)
        lw = tb[2] - tb[0]
        draw.text((44 + (506 - lw) // 2, start_y + idx * line_h), line, fill=(35, 30, 25, 255), font=body_font)

    # 5. Composite Dynamic Star Rating Ribbon (Pennant Chevron)
    ribbon_x0 = 310
    ribbon_x1 = 554
    ribbon_y0 = 764
    ribbon_y1 = 828
    ribbon_bg = theme["banner"] + (255,)
    
    notch = 14
    ribbon_poly = [
        (ribbon_x0 + notch, ribbon_y0),
        (ribbon_x1 - 8, ribbon_y0),
        (ribbon_x1, ribbon_y0 + 8),
        (ribbon_x1, ribbon_y1 - 8),
        (ribbon_x1 - 8, ribbon_y1),
        (ribbon_x0 + notch, ribbon_y1),
        (ribbon_x0, (ribbon_y0 + ribbon_y1) // 2)
    ]
    draw.polygon(ribbon_poly, fill=ribbon_bg, outline=(45, 40, 35, 240))

    star_area_w = ribbon_x1 - (ribbon_x0 + notch + 8)
    star_pitch = star_area_w / max(1, max_rank)
    for i in range(max_rank):
        st_cx = (ribbon_x0 + notch + 8) + star_pitch * (i + 0.5)
        st_cy = (ribbon_y0 + ribbon_y1) // 2
        is_filled = (i < rank_num)
        
        if is_filled:
            # Active star: pure white with crisp outline
            draw_star(draw, (st_cx, st_cy), size=14, fill_color=(255, 255, 255), outline_color=(45, 40, 35), outline_width=2)
        else:
            # Unearned star: dark charcoal
            draw_star(draw, (st_cx, st_cy), size=13, fill_color=(50, 42, 38), outline_color=(45, 40, 35), outline_width=2)

    # 6. Save as high-performance WebP
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    card.save(output_path, "WEBP", quality=92, method=6)
    return output_path

def process_card_job(args):
    card_data, rank_num, source_path, output_path = args
    try:
        render_single_rank(card_data, rank_num, source_path, output_path)
        return True, output_path, os.path.getsize(output_path)
    except Exception as e:
        return False, output_path, str(e)

def main():
    parser = argparse.ArgumentParser(description="Render 1:1 Fallout 76 Perk Cards")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of cards processed")
    parser.add_argument("--ids", type=str, nargs="+", default=None, help="Specific card IDs to render")
    args = parser.parse_args()

    with open(PERK_JSON_PATH, "r", encoding="utf-8") as f:
        cards = json.load(f)

    if args.ids:
        cards = [c for c in cards if c["id"] in args.ids]
    elif args.limit:
        cards = cards[:args.limit]

    print(f"==================================================")
    print(f"☢️ R.O.L.L. Perk Card Master Compositor")
    print(f"Targeting {len(cards)} cards...")
    print(f"==================================================")

    jobs = []
    for c in cards:
        source_path = resolve_wiki_file(c["id"])
        if not source_path:
            print(f"[!] Warning: No source found for {c['id']}, skipping...")
            continue
        max_rank = c.get("maxRank", 1)
        for r in range(1, max_rank + 1):
            out_p = os.path.join(OUTPUT_DIR, f"{c['id']}_rank_{r}.webp")
            jobs.append((c, r, source_path, out_p))

    print(f"[+] Total individual rank images queued: {len(jobs)}")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(SHOWCASE_DIR, exist_ok=True)

    success_count = 0
    total_bytes = 0

    with ProcessPoolExecutor(max_workers=os.cpu_count() or 4) as executor:
        futures = [executor.submit(process_card_job, job) for job in jobs]
        for future in as_completed(futures):
            ok, path, val = future.result()
            if ok:
                success_count += 1
                total_bytes += val
            else:
                print(f"[-] Error rendering {path}: {val}")

    print(f"\n[🎉] Render Complete!")
    print(f"Successfully rendered: {success_count} / {len(jobs)} cards")
    print(f"Total size: {total_bytes / (1024 * 1024):.2f} MB (Average: {total_bytes / max(1, success_count) / 1024:.1f} KB per card)")

    # Copy showcase set for Nathan's desktop review
    sample_ids = ["action-boy", "commando", "ironclad", "heavy-gunner", "batteries-included", "lone-wanderer", "bloody-mess", "ammo-factory"]
    for sid in sample_ids:
        for r in range(1, 6):
            f = os.path.join(OUTPUT_DIR, f"{sid}_rank_{r}.webp")
            if os.path.exists(f):
                shutil.copy2(f, os.path.join(SHOWCASE_DIR, f"{sid}_rank_{r}.webp"))
    print(f"[✔] Showcase sample gallery mirrored to: {SHOWCASE_DIR}")

if __name__ == "__main__":
    main()
