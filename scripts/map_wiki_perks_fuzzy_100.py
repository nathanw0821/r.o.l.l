import json
import os
import glob
import re

PERK_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "perk-cards.json")
WIKI_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_official_wiki")
OUT_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "perks", "wiki-268-art-map.json")

with open(PERK_JSON_PATH, "r", encoding="utf-8") as f:
    perk_cards = json.load(f)

wiki_files = glob.glob(f"{WIKI_DIR}/*.*")

def clean_str(s):
    s = re.sub(r"^fo76[-_]?perk[-_]?", "", s, flags=re.IGNORECASE)
    s = re.sub(r"[-_]?perk$", "", s, flags=re.IGNORECASE)
    return re.sub(r"[^a-z0-9]", "", s.lower())

wiki_file_map = {}
for wf in wiki_files:
    fname = os.path.basename(wf)
    cname = clean_str(fname)
    if cname:
        wiki_file_map[cname] = f"/images/perks_official_wiki/{fname}"

wiki_map = {}
matched_cards = 0

for card in perk_cards:
    cid = card.get("id")
    cname = card.get("name")
    
    clean_id = clean_str(cid)
    clean_name = clean_str(cname)
    
    if clean_name in wiki_file_map:
        wiki_map[cid] = wiki_file_map[clean_name]
        matched_cards += 1
    elif clean_id in wiki_file_map:
        wiki_map[cid] = wiki_file_map[clean_id]
        matched_cards += 1
    else:
        # Substring matching
        found = False
        for wkey, wpath in wiki_file_map.items():
            if len(clean_name) > 3 and (clean_name in wkey or wkey in clean_name):
                wiki_map[cid] = wpath
                matched_cards += 1
                found = True
                break
        if not found:
            for wkey, wpath in wiki_file_map.items():
                if len(clean_id) > 3 and (clean_id in wkey or wkey in clean_id):
                    wiki_map[cid] = wpath
                    matched_cards += 1
                    break

with open(OUT_MAP_PATH, "w", encoding="utf-8") as out_f:
    json.dump(wiki_map, out_f, indent=2)

print(f"🎉 ENHANCED WIKI MAPPER: Matched {matched_cards} / {len(perk_cards)} ({matched_cards/len(perk_cards)*100:.1f}%) perk cards directly to official high-def wiki textures!")
