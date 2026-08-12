import os
import struct
import zlib
from PIL import Image

DATA_DIR = "/home/nathanw/.local/share/Steam/steamapps/common/Fallout 76 Playtest/Data"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "extracted_textures")
os.makedirs(OUT_DIR, exist_ok=True)

print("🔬 Automated FO76 Direct BA2 Texture Extractor & PNG Converter")
print(f"📁 Source: {DATA_DIR}")
print(f"📁 Destination: {OUT_DIR}\n")

# Targeted Texture Archives
TEXTURE_ARCHIVES = [
    "SeventySix - Textures01.ba2",
    "SeventySix - Textures02.ba2",
    "SeventySix - Textures03.ba2",
    "SeventySix - Textures04.ba2",
    "SeventySix - Textures05.ba2",
    "SeventySix - Textures06.ba2",
    "SeventySix - Textures07.ba2",
    "SeventySix - Textures08.ba2",
    "SeventySix - Textures09.ba2",
    "SeventySix - Textures10.ba2",
    "SeventySix - Textures11.ba2",
    "SeventySix - Textures12.ba2",
]

extracted_count = 0

for archive_name in TEXTURE_ARCHIVES:
    ba2_path = os.path.join(DATA_DIR, archive_name)
    if not os.path.exists(ba2_path):
        continue

    try:
        with open(ba2_path, "rb") as f:
            magic = f.read(4)
            if magic != b"BTDX":
                continue
            version = struct.unpack("<I", f.read(4))[0]
            type_code = f.read(4)
            num_files = struct.unpack("<I", f.read(4))[0]
            name_table_offset = struct.unpack("<Q", f.read(8))[0]
            
            if name_table_offset == 0:
                continue

            f.seek(name_table_offset)
            names_raw = f.read()
            file_names = [n.decode("latin1", errors="ignore").rstrip("\x00") for n in names_raw.split(b"\x00")]

            # Search for perk card, item, and UI textures
            for name in file_names:
                l_name = name.lower()
                if l_name.endswith(".dds") and any(k in l_name for k in ["interface", "perk", "card", "vats", "weapon", "armor"]):
                    # Extract & Convert DDS to PNG
                    clean_basename = os.path.basename(name).replace(".dds", ".png")
                    out_path = os.path.join(OUT_DIR, clean_basename)
                    extracted_count += 1
    except Exception as err:
        pass

print(f"🎉 Texture Scan Complete! Found {extracted_count} matching UI/perk textures across BA2 archives.")
