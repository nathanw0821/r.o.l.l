import json
import os
import glob

PERK_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "perk-cards.json")
WIKI_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_official_wiki")
OUT_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "perks", "wiki-268-art-map.json")

with open(PERK_JSON_PATH, "r", encoding="utf-8") as f:
    perk_cards = json.load(f)

wiki_files = glob.glob(f"{WIKI_DIR}/*.*")
wiki_by_norm = {}

for wf in wiki_files:
    fname = os.path.basename(wf)
    norm = fname.lower().replace(" ", "").replace("-", "").replace("!", "").replace("'", "").replace(".png", "").replace(".webp", "").replace(".gif", "").replace(".jpg", "").replace("perk", "").strip()
    wiki_by_norm[norm] = f"/images/perks_official_wiki/{fname}"

wiki_map = {}
matched = 0

for card in perk_cards:
    cid = card.get("id")
    cname = card.get("name")
    
    norm_id = cid.replace("-", "").replace("_", "").lower()
    norm_name = cname.lower().replace(" ", "").replace("-", "").replace("!", "").replace("'", "").strip()
    
    if norm_name in wiki_by_norm:
        wiki_map[cid] = wiki_by_norm[norm_name]
        matched += 1
    elif norm_id in wiki_by_norm:
        wiki_map[cid] = wiki_by_norm[norm_id]
        matched += 1
    else:
        # Fuzzy search for key terms
        for wnorm, wpath in wiki_by_norm.items():
            if norm_name in wnorm or wnorm in norm_name:
                wiki_map[cid] = wpath
                matched += 1
                break

with open(OUT_MAP_PATH, "w", encoding="utf-8") as out_f:
    json.dump(wiki_map, out_f, indent=2)

print(f"🎉 WIKI MAPPING COMPLETE: Matched {matched} / {len(perk_cards)} cards to official high-def Fallout Wiki textures!")
