import struct
import os
import glob

DATA_DIR = "/home/nathanw/.local/share/Steam/steamapps/common/Fallout 76 Playtest/Data"

print("🔍 Searching all FO76 texture archives for Perk Card DDS textures...")
all_ba2 = glob.glob(f"{DATA_DIR}/*.ba2")

matches_by_archive = {}

for ba2_path in all_ba2:
    try:
        with open(ba2_path, "rb") as f:
            magic = f.read(4)
            if magic != b"BTDX":
                continue
            version = struct.unpack("<I", f.read(4))[0]
            type_code = f.read(4)
            num_files = struct.unpack("<I", f.read(4))[0]
            name_table_offset = struct.unpack("<Q", f.read(8))[0]
            if name_table_offset > 0:
                f.seek(name_table_offset)
                names_raw = f.read()
                file_list = [n.decode("latin1", errors="ignore").rstrip("\x00") for n in names_raw.split(b"\x00")]
                
                perk_dds = [
                    n for n in file_list
                    if n.endswith(".dds") and any(k in n.lower() for k in ["perk", "card", "vats", "special", "vaultboy", "pipboy"])
                ]
                if perk_dds:
                    matches_by_archive[os.path.basename(ba2_path)] = perk_dds
    except Exception as err:
        pass

for ba2, files in matches_by_archive.items():
    print(f"\n📦 [{ba2}] ({len(files)} matches):")
    for f in files[:8]:
        print(f"  - {f}")

print("\n✨ Search complete!")
