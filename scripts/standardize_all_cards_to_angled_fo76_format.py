import urllib.request
import urllib.parse
import json
import os
import time
import re

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_official_wiki")
os.makedirs(OUT_DIR, exist_ok=True)

PERK_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "perk-cards.json")
WIKI_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "perks", "wiki-268-art-map.json")
EXACT_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "perks", "exact-268-art-map.json")

with open(PERK_JSON_PATH, "r", encoding="utf-8") as f:
    perk_cards = json.load(f)

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) R.O.L.L-FO76-Card-Standardizer/1.0"}

with open(WIKI_MAP_PATH, "r", encoding="utf-8") as f:
    wiki_map = json.load(f)

with open(EXACT_MAP_PATH, "r", encoding="utf-8") as f:
    exact_map = json.load(f)

print(f"🔍 Standardizing all {len(perk_cards)} perk cards to exact FO76 Perk <Name>.webp angled format...")

# Identify cards that don't start with fo76-perk-
non_standard_cards = []
for c in perk_cards:
    cid = c["id"]
    current_path = wiki_map.get(cid, "")
    if not current_path.startswith("/images/perks_official_wiki/fo76-perk-"):
        non_standard_cards.append(c)

print(f"⚠️ Found {len(non_standard_cards)} cards currently using flat/other format textures. Standardizing...")

updated_count = 0

for c in non_standard_cards:
    cid = c["id"]
    cname = c["name"]
    
    # Try exact title search on fallout.wiki: File:FO76 Perk <Name>.webp or File:FO76 Perk <Name>.png
    search_queries = [
        f"File:FO76 Perk {cname}.webp",
        f"File:FO76 Perk {cname}.png",
        f"File:FO76 perk {cname}.png",
        f"File:FO76 {cname} perk.png"
    ]
    
    found_url = None
    found_filename = None
    
    for sq in search_queries:
        info_url = f"https://fallout.wiki/api.php?action=query&titles={urllib.parse.quote(sq)}&prop=imageinfo&iiprop=url&format=json"
        try:
            req = urllib.request.Request(info_url, headers=headers)
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                pages = data.get("query", {}).get("pages", {})
                for pid, pdata in pages.items():
                    imageinfo = pdata.get("imageinfo", [])
                    if imageinfo and "url" in imageinfo[0]:
                        found_url = imageinfo[0]["url"]
                        ext = os.path.splitext(found_url)[1] or ".webp"
                        found_filename = f"fo76-perk-{cid}{ext}"
                        break
        except Exception:
            pass
        if found_url:
            break
        time.sleep(0.05)
        
    if not found_url:
        # Fallback search query
        s_url = f"https://fallout.wiki/api.php?action=query&list=search&srsearch={urllib.parse.quote('File:FO76 Perk ' + cname)}&srlimit=1&format=json"
        try:
            req = urllib.request.Request(s_url, headers=headers)
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                results = data.get("query", {}).get("search", [])
                if results:
                    found_title = results[0]["title"]
                    info_url = f"https://fallout.wiki/api.php?action=query&titles={urllib.parse.quote(found_title)}&prop=imageinfo&iiprop=url&format=json"
                    with urllib.request.urlopen(urllib.request.Request(info_url, headers=headers)) as resp_f:
                        data_f = json.loads(resp_f.read().decode("utf-8"))
                        pages_f = data_f.get("query", {}).get("pages", {})
                        for pf_id, pf_data in pages_f.items():
                            imageinfo = pf_data.get("imageinfo", [])
                            if imageinfo and "url" in imageinfo[0]:
                                found_url = imageinfo[0]["url"]
                                ext = os.path.splitext(found_url)[1] or ".webp"
                                found_filename = f"fo76-perk-{cid}{ext}"
                                break
        except Exception:
            pass
        time.sleep(0.05)

    if found_url and found_filename:
        out_path = os.path.join(OUT_DIR, found_filename)
        try:
            req_img = urllib.request.Request(found_url, headers=headers)
            with urllib.request.urlopen(req_img) as img_resp:
                with open(out_path, "wb") as out_f:
                    out_f.write(img_resp.read())
            wiki_map[cid] = f"/images/perks_official_wiki/{found_filename}"
            exact_map[cid] = f"/images/perks_official_wiki/{found_filename}"
            updated_count += 1
            print(f"  ✅ Updated [{cname}] -> /images/perks_official_wiki/{found_filename}")
        except Exception as e:
            print(f"  ⚠️ Error writing {cname}:", e)
    else:
        print(f"  ℹ️ Kept existing file for [{cname}]: {wiki_map.get(cid)}")

with open(WIKI_MAP_PATH, "w", encoding="utf-8") as f:
    json.dump(wiki_map, f, indent=2)

with open(EXACT_MAP_PATH, "w", encoding="utf-8") as f:
    json.dump(exact_map, f, indent=2)

print(f"🎉 STANDARDIZATION COMPLETE! Updated {updated_count} cards to FO76 Perk <Name>.webp angled format!")
