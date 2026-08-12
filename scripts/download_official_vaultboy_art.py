import os
import urllib.request

PERK_ART_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks")
os.makedirs(PERK_ART_DIR, exist_ok=True)

# Official FO76 Vault Boy Category Artwork Sources
URLS = {
    "S": "https://vault.falloutwiki.com/images/thumb/0/0f/Fo76_Strength.png/250px-Fo76_Strength.png",
    "P": "https://vault.falloutwiki.com/images/thumb/a/a2/Fo76_Perception.png/250px-Fo76_Perception.png",
    "E": "https://vault.falloutwiki.com/images/thumb/b/b3/Fo76_Endurance.png/250px-Fo76_Endurance.png",
    "C": "https://vault.falloutwiki.com/images/thumb/4/4b/Fo76_Charisma.png/250px-Fo76_Charisma.png",
    "I": "https://vault.falloutwiki.com/images/thumb/5/52/Fo76_Intelligence.png/250px-Fo76_Intelligence.png",
    "A": "https://vault.falloutwiki.com/images/thumb/6/60/Fo76_Agility.png/250px-Fo76_Agility.png",
    "L": "https://vault.falloutwiki.com/images/thumb/0/04/Fo76_Luck.png/250px-Fo76_Luck.png",
    "LEGENDARY": "https://vault.falloutwiki.com/images/thumb/0/04/Fo76_Luck.png/250px-Fo76_Luck.png",
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

print("🎨 Downloading official Vault Boy category PNGs...")
for cat, url in URLS.items():
    out_file = os.path.join(PERK_ART_DIR, f"vaultboy_{cat.lower()}.png")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(out_file, "wb") as f:
            f.write(resp.read())
        print(f"  ✅ Saved: {out_file}")
    except Exception as err:
        print(f"  ⚠️ Error downloading {cat}: {err}")

print("✨ Vault Boy artwork setup complete!")
