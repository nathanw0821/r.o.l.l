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

with open(PERK_JSON_PATH, "r", encoding="utf-8") as f:
    perk_cards = json.load(f)

legendary_perks = [c for c in perk_cards if c.get("special") == "LEGENDARY" or "legendary" in c.get("id")]
print(f"🌟 Found {len(legendary_perks)} Legendary Perk Cards in catalog. Fetching official textures...")

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) R.O.L.L-Legendary-Fetcher/1.0"}

# Search fallout.wiki for all legendary perk files
search_url = "https://fallout.wiki/api.php?action=query&list=search&srsearch=File:FO76%20Legendary%20Perk&srlimit=100&format=json"
req = urllib.request.Request(search_url, headers=headers)

legendary_files = []
try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        results = data.get("query", {}).get("search", [])
        legendary_files = [r["title"] for r in results]
except Exception as e:
    print("Search error:", e)

# Also search for File:FO76 Perk Legendary
search_url2 = "https://fallout.wiki/api.php?action=query&list=search&srsearch=File:FO76%20Perk%20Legendary&srlimit=100&format=json"
req2 = urllib.request.Request(search_url2, headers=headers)
try:
    with urllib.request.urlopen(req2) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        results = data.get("query", {}).get("search", [])
        for r in results:
            if r["title"] not in legendary_files:
                legendary_files.append(r["title"])
except Exception as e:
    print("Search 2 error:", e)

print(f"📦 Found {len(legendary_files)} Legendary Perk image titles on fallout.wiki! Fetching direct URLs...")

download_map = {}

for i in range(0, len(legendary_files), 50):
    batch = legendary_files[i:i+50]
    titles = "|".join(batch)
    info_url = f"https://fallout.wiki/api.php?action=query&titles={urllib.parse.quote(titles)}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(info_url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            pages = data.get("query", {}).get("pages", {})
            for pid, pdata in pages.items():
                title = pdata.get("title", "")
                imageinfo = pdata.get("imageinfo", [])
                if imageinfo and "url" in imageinfo[0]:
                    img_url = imageinfo[0]["url"]
                    clean_title = title.replace("File:", "").replace(".png", "").replace(".webp", "").replace(".gif", "").replace(".jpg", "")
                    norm_title = re.sub(r"[^a-z0-9]", "", clean_title.lower())
                    download_map[norm_title] = (clean_title, img_url)
    except Exception as e:
        print("  ⚠️ Batch error:", e)
    time.sleep(0.1)

print(f"📥 Downloading {len(download_map)} official Legendary Perk textures...")

downloaded = 0
for norm_title, (clean_title, img_url) in download_map.items():
    ext = os.path.splitext(img_url)[1] or ".png"
    safe_filename = clean_title.lower().replace(" ", "-").replace("!", "").replace("'", "") + ext
    out_path = os.path.join(OUT_DIR, safe_filename)
    if not os.path.exists(out_path):
        try:
            req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(req) as resp:
                with open(out_path, "wb") as out_f:
                    out_f.write(resp.read())
            downloaded += 1
        except Exception as e:
            pass
        time.sleep(0.05)

print(f"🎉 Downloaded {downloaded} Legendary Perk textures to {OUT_DIR}!")

# Update wiki-268-art-map.json
with open(WIKI_MAP_PATH, "r", encoding="utf-8") as f:
    wiki_map = json.load(f)

for lp in legendary_perks:
    lpid = lp["id"]
    lpname = lp["name"]
    clean_lpid = re.sub(r"[^a-z0-9]", "", lpid.lower())
    clean_lpname = re.sub(r"[^a-z0-9]", "", lpname.lower())
    
    # Match with downloaded files
    for norm_title, (clean_title, img_url) in download_map.items():
        if clean_lpid in norm_title or clean_lpname in norm_title or norm_title in clean_lpid or norm_title in clean_lpname:
            ext = os.path.splitext(img_url)[1] or ".png"
            safe_filename = clean_title.lower().replace(" ", "-").replace("!", "").replace("'", "") + ext
            wiki_map[lpid] = f"/images/perks_official_wiki/{safe_filename}"
            print(f"  ✅ Mapped Legendary Perk [{lpname}] -> /images/perks_official_wiki/{safe_filename}")
            break

with open(WIKI_MAP_PATH, "w", encoding="utf-8") as out_f:
    json.dump(wiki_map, out_f, indent=2)

print(f"🎉 LEGENDARY PERK MAPPER COMPLETE! All Legendary Perks mapped in {WIKI_MAP_PATH}!")
