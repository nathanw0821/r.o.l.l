import urllib.request
import urllib.parse
import json
import os
import time

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_official_wiki")
os.makedirs(OUT_DIR, exist_ok=True)
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) R.O.L.L-Legendary-Downloader/1.0"}

categories = [
    "Category:Fallout_76_legendary_perk_card_images",
    "Category:Fallout_76_legendary_perk_images",
    "Category:Fallout_76_perk_card_images",
    "Category:Fallout_76_perk_images"
]

all_members = []
for cat in categories:
    url = f"https://fallout.wiki/api.php?action=query&list=categorymembers&cmtitle={urllib.parse.quote(cat)}&cmlimit=500&format=json"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            members = data.get("query", {}).get("categorymembers", [])
            all_members.extend(members)
    except Exception as e:
        print("Error fetching category:", cat, e)

print(f"📦 Found {len(all_members)} total card files across categories. Batch fetching direct image URLs...")

download_map = {}
for i in range(0, len(all_members), 50):
    batch = all_members[i:i+50]
    titles = "|".join(m["title"] for m in batch)
    info_url = f"https://fallout.wiki/api.php?action=query&titles={urllib.parse.quote(titles)}&prop=imageinfo&iiprop=url&format=json"
    try:
        req = urllib.request.Request(info_url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            pages = data.get("query", {}).get("pages", {})
            for pid, pdata in pages.items():
                title = pdata.get("title", "")
                imageinfo = pdata.get("imageinfo", [])
                if imageinfo and "url" in imageinfo[0]:
                    img_url = imageinfo[0]["url"]
                    clean_title = title.replace("File:", "").replace(".png", "").replace(".webp", "").replace(".gif", "").replace(".jpg", "")
                    safe_filename = clean_title.lower().replace(" ", "-").replace("!", "").replace("'", "") + os.path.splitext(img_url)[1]
                    download_map[safe_filename] = img_url
    except Exception as e:
        print("Batch query error:", e)
    time.sleep(0.1)

print(f"📥 Downloading {len(download_map)} direct 1:1 perk card image assets...")
count = 0
for filename, img_url in download_map.items():
    out_path = os.path.join(OUT_DIR, filename)
    if not os.path.exists(out_path):
        try:
            req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(req) as resp:
                with open(out_path, "wb") as f:
                    f.write(resp.read())
            count += 1
        except Exception as e:
            pass
        time.sleep(0.04)

print(f"🎉 DOWNLOAD COMPLETE! Downloaded {count} 1:1 perk card images to {OUT_DIR}!")
