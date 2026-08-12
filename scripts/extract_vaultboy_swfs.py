import struct
import os
import zlib

BA2_PATH = "/home/nathanw/.local/share/Steam/steamapps/common/Fallout 76 Playtest/Data/SeventySix - Interface.ba2"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_swf")
os.makedirs(OUT_DIR, exist_ok=True)

if not os.path.exists(BA2_PATH):
    print(f"❌ Error: Master interface archive not found at {BA2_PATH}")
    exit(1)

with open(BA2_PATH, "rb") as f:
    magic = f.read(4)
    version = struct.unpack("<I", f.read(4))[0]
    type_code = f.read(4)
    num_files = struct.unpack("<I", f.read(4))[0]
    name_table_offset = struct.unpack("<Q", f.read(8))[0]
    
    file_records = []
    for i in range(num_files):
        rec = f.read(36)
        name_hash, ext, dir_hash, flags, offset, packed_sz, unpacked_sz, crc = struct.unpack("<IIIIQIII", rec)
        file_records.append({
            "offset": offset,
            "packed_sz": packed_sz,
            "unpacked_sz": unpacked_sz,
        })
    
    f.seek(name_table_offset)
    names_raw = f.read()
    names = [n.decode("latin1", errors="ignore").rstrip("\x00") for n in names_raw.split(b"\x00")]
    
    extracted_count = 0
    for idx, name in enumerate(names[:num_files]):
        clean_name = name.split("\x00")[0].strip()
        if "interface/components/vaultboys/perks/" in clean_name.lower():
            rec = file_records[idx]
            f.seek(rec["offset"])
            
            # Read file bytes
            if rec["packed_sz"] == 0:
                data = f.read(rec["unpacked_sz"])
            else:
                raw_data = f.read(rec["packed_sz"])
                data = zlib.decompress(raw_data)
                
            file_basename = os.path.basename(clean_name).split(".swf")[0] + ".swf"
            out_file = os.path.join(OUT_DIR, file_basename)
            with open(out_file, "wb") as out_f:
                out_f.write(data)
            extracted_count += 1

print(f"🎉 Extracted {extracted_count} official Bethesda Vault Boy SWF animation assets to {OUT_DIR}!")
