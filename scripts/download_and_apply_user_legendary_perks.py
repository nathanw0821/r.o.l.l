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

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) R.O.L.L-User-Legendary-Fetcher/1.0"}

legendary_perks = [c for c in perk_cards if c.get("special") == "LEGENDARY" or "legendary" in c.get("id")]
print(f"🌟 Downloading exact FO76 Perk <Name>.webp files for {len(legendary_perks)} Legendary Perks from fallout.wiki...")

download_map = {}

for lp in legendary_perks:
    lpname = lp["name"]
    lpid = lp["id"]
    # Formulate file title: e.g. File:FO76 Perk Ammo Factory.webp
    file_title = f"File:FO76 Perk {lpname}.webp"
    if lpname == "What Rads?":
        file_title = "File:FO76 Perk What Rads.webp"
    
    info_url = f"https://fallout.wiki/api.php?action=query&titles={urllib.parse.quote(file_title)}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(info_url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            pages = data.get("query", {}).get("pages", {})
            for pid, pdata in pages.items():
                imageinfo = pdata.get("imageinfo", [])
                if imageinfo and "url" in imageinfo[0]:
                    img_url = imageinfo[0]["url"]
                    safe_filename = f"fo76-perk-{lpid}.webp"
                    out_path = os.path.join(OUT_DIR, safe_filename)
                    req_img = urllib.request.Request(img_url, headers=headers)
                    with urllib.request.urlopen(req_img) as img_resp:
                        with open(out_path, "wb") as out_f:
                            out_f.write(img_resp.read())
                    download_map[lpid] = f"/images/perks_official_wiki/{safe_filename}"
                    print(f"  ✅ Downloaded & Mapped [{lpname}] -> /images/perks_official_wiki/{safe_filename}")
                else:
                    print(f"  ⚠️ No URL found for {file_title}, searching fallout.wiki...")
                    # Fallback search
                    search_url = f"https://fallout.wiki/api.php?action=query&list=search&srsearch={urllib.parse.quote('File:FO76 Perk ' + lpname)}&srlimit=1&format=json"
                    req_s = urllib.request.Request(search_url, headers=headers)
                    with urllib.request.urlopen(req_s) as resp_s:
                        data_s = json.loads(resp_s.read().decode("utf-8"))
                        results = data_s.get("query", {}).get("search", [])
                        if results:
                            found_title = results[0]["title"]
                            info_url_found = f"https://fallout.wiki/api.php?action=query&titles={urllib.parse.quote(found_title)}&prop=imageinfo&iiprop=url&format=json"
                            with urllib.request.urlopen(urllib.request.Request(info_url_found, headers=headers)) as resp_f:
                                data_f = json.loads(resp_f.read().decode("utf-8"))
                                pages_f = data_f.get("query", {}).get("pages", {})
                                for pf_id, pf_data in pages_f.items():
                                    img_info_f = pf_data.get("imageinfo", [])
                                    if img_info_f and "url" in img_info_f[0]:
                                        img_url_f = img_info_f[0]["url"]
                                        safe_filename = f"fo76-perk-{lpid}.webp"
                                        out_path = os.path.join(OUT_DIR, safe_filename)
                                        with urllib.request.urlopen(urllib.request.Request(img_url_f, headers=headers)) as f_resp:
                                            with open(out_path, "wb") as out_f:
                                                out_f.write(f_resp.read())
                                        download_map[lpid] = f"/images/perks_official_wiki/{safe_filename}"
                                        print(f"  ✅ Downloaded & Mapped via search [{lpname}] -> /images/perks_official_wiki/{safe_filename}")
    except Exception as e:
        print(f"  ⚠️ Error downloading {lpname}:", e)
    time.sleep(0.1)

# Apply Curator fix
info_url_curator = f"https://fallout.wiki/api.php?action=query&titles=File:FO76%20Perk%20Curator.webp|File:FO76%20Curator%20perk.png&prop=imageinfo&iiprop=url&format=json"
try:
    with urllib.request.urlopen(urllib.request.Request(info_url_curator, headers=headers)) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        pages = data.get("query", {}).get("pages", {})
        for pid, pdata in pages.items():
            imageinfo = pdata.get("imageinfo", [])
            if imageinfo and "url" in imageinfo[0]:
                img_url = imageinfo[0]["url"]
                safe_filename = "fo76-perk-curator.webp"
                out_path = os.path.join(OUT_DIR, safe_filename)
                with urllib.request.urlopen(urllib.request.Request(img_url, headers=headers)) as img_resp:
                    with open(out_path, "wb") as out_f:
                        out_f.write(img_resp.read())
                download_map["curator"] = f"/images/perks_official_wiki/{safe_filename}"
                print(f"  ✅ Curator Card Downloaded -> /images/perks_official_wiki/{safe_filename}")
except Exception as e:
    print("  ⚠️ Curator error:", e)

# Update wiki-268-art-map.json and exact-268-art-map.json
with open(WIKI_MAP_PATH, "r", encoding="utf-8") as f:
    wiki_map = json.load(f)

with open(EXACT_MAP_PATH, "r", encoding="utf-8") as f:
    exact_map = json.load(f)

for k, v in download_map.items():
    wiki_map[k] = v
    exact_map[k] = v

with open(WIKI_MAP_PATH, "w", encoding="utf-8") as f:
    json.dump(wiki_map, f, indent=2)

with open(EXACT_MAP_PATH, "w", encoding="utf-8") as f:
    json.dump(exact_map, f, indent=2)

print("🎉 USER LEGENDARY & CURATOR MAPPER COMPLETE!")
