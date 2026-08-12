import urllib.request
import urllib.parse
import json
import os
import time

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_official_wiki")
os.makedirs(OUT_DIR, exist_ok=True)

PERK_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "perk-cards.json")
with open(PERK_JSON_PATH, "r", encoding="utf-8") as f:
    perk_cards = json.load(f)

perk_ids_and_names = {c["id"]: c["name"].lower().replace(" ", "").replace("-", "").replace("!", "").replace("'", "") for c in perk_cards}

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) R.O.L.L-Wiki-Downloader/1.0"}

print("🌐 Fetching all 618 official Fallout 76 perk card image URLs from fallout.wiki API...")

all_members = []
cmcontinue = None

while True:
    api_url = "https://fallout.wiki/api.php?action=query&list=categorymembers&cmtitle=Category:Fallout_76_perk_images&cmlimit=500&format=json"
    if cmcontinue:
        api_url += f"&cmcontinue={urllib.parse.quote(cmcontinue)}"
        
    req = urllib.request.Request(api_url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        members = data.get("query", {}).get("categorymembers", [])
        all_members.extend(members)
        
        cmcontinue = data.get("continue", {}).get("cmcontinue")
        if not cmcontinue:
            break

print(f"📦 Found {len(all_members)} official perk files in category! Batch fetching direct image URLs...")

# Batch query imageinfo for direct CDN URLs
download_map = {} # norm_name -> url

for i in range(0, len(all_members), 50):
    batch = all_members[i:i+50]
    titles = "|".join(m["title"] for m in batch)
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
                    norm_title = clean_title.lower().replace(" ", "").replace("-", "").replace("!", "").replace("'", "").replace("perk", "").strip()
                    download_map[norm_title] = (clean_title, img_url)
    except Exception as e:
        print("  ⚠️ Batch query error:", e)
    time.sleep(0.1)

print(f"📥 Downloading {len(download_map)} official high-definition perk card images...")

downloaded_count = 0

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
            downloaded_count += 1
        except Exception as e:
            pass
        time.sleep(0.05)

print(f"🎉 DOWNLOAD COMPLETE! Downloaded {downloaded_count} official high-def perk card images to {OUT_DIR}!")
