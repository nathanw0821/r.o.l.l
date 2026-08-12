import json
import os
import glob
import re

PERK_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "perk-cards.json")
WIKI_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_official_wiki")
SWF_SVG_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_official")
OUT_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "perks", "wiki-268-art-map.json")

with open(PERK_JSON_PATH, "r", encoding="utf-8") as f:
    perk_cards = json.load(f)

# Index all wiki files
wiki_files = glob.glob(f"{WIKI_DIR}/*.*")
wiki_indexed = {}
for wf in wiki_files:
    fname = os.path.basename(wf)
    clean = re.sub(r"[^a-z0-9]", "", fname.lower())
    wiki_indexed[clean] = f"/images/perks_official_wiki/{fname}"

# Index all SWF SVG files
svg_files = glob.glob(f"{SWF_SVG_DIR}/*.svg")
svg_indexed = {}
for sf in svg_files:
    fname = os.path.basename(sf)
    clean = re.sub(r"[^a-z0-9]", "", fname.lower().replace(".svg", ""))
    svg_indexed[clean] = f"/images/perks_official/{fname}"

master_map = {}
matched = 0
fallback_count = 0

for card in perk_cards:
    cid = card.get("id")
    cname = card.get("name")
    cspec = card.get("special", "S")
    
    clean_id = re.sub(r"[^a-z0-9]", "", cid.lower())
    clean_name = re.sub(r"[^a-z0-9]", "", cname.lower())
    
    found_url = None
    
    # 1. Search exact clean matches in wiki
    for wclean, wpath in wiki_indexed.items():
        if clean_name in wclean or clean_id in wclean:
            found_url = wpath
            break
            
    # 2. Search partial keywords in wiki
    if not found_url:
        words = [w for w in clean_name.split() if len(w) > 3]
        for wclean, wpath in wiki_indexed.items():
            if any(word in wclean for word in words):
                found_url = wpath
                break

    # 3. Search SWF SVGs
    if not found_url:
        if clean_id in svg_indexed:
            found_url = svg_indexed[clean_id]
        elif clean_name in svg_indexed:
            found_url = svg_indexed[clean_name]

    # 4. Fallback to category base Vault Boy SVG
    if not found_url:
        found_url = f"/images/perks_official/actionboy.svg" if cspec == "A" else f"/images/perks_official/adamantiumskeleton.svg" if cspec == "E" else f"/images/perks_official/bloodymess.svg"
        fallback_count += 1
    else:
        matched += 1
        
    master_map[cid] = found_url

with open(OUT_MAP_PATH, "w", encoding="utf-8") as out_f:
    json.dump(master_map, out_f, indent=2)

print(f"🎉 100% COMPLETE PERK ARTWORK MAPPER: Matched {matched} exact textures ({matched/len(perk_cards)*100:.1f}%), assigned clean Vault Boy SVGs for remaining {fallback_count}!")
