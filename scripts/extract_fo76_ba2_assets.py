#!/usr/bin/env python3
"""
☢️ Fallout 76 Interface BA2 Asset Extractor & Audit Engine
Extracts master Scaleform SWFs and component vector files from SeventySix - Interface.ba2
and audits all symbols against R.O.L.L.'s existing 319-SVG catalog.
"""

import os
import sys
import struct
import zlib

BA2_PATH = "/home/nathanw/.local/share/Steam/steamapps/common/Fallout 76/Data/SeventySix - Interface.ba2"
OUTPUT_DIR = "/home/nathanw/Creative Direction/R.O.L.L/data/extracted_swfs"
EXISTING_SVG_DIR = "/home/nathanw/Creative Direction/R.O.L.L/public/images/perks_official"
REPORT_PATH = "/home/nathanw/Creative Direction/R.O.L.L/docs/PERK_CARD_AUDIT_REPORT.md"

def extract_ba2_assets():
    if not os.path.exists(BA2_PATH):
        print(f"[-] Game archive not found: {BA2_PATH}")
        return False

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, "standalone_perks"), exist_ok=True)

    with open(BA2_PATH, "rb") as f:
        # 1. Read Header
        header = f.read(24)
        magic, version, type_code, num_files, name_offset = struct.unpack('<4sI4sIQ', header)
        print(f"[+] Loaded {magic.decode()} Archive v{version} ({num_files} files listed)")

        # 2. Read Name Table
        f.seek(name_offset)
        names = []
        for _ in range(num_files):
            nl = struct.unpack('<H', f.read(2))[0]
            names.append(f.read(nl).decode('utf-8', errors='ignore'))

        # 3. Read File Table & Extract Perk SWFs
        f.seek(24)
        extracted_count = 0
        extracted_files = []

        for i in range(num_files):
            rec = f.read(36)
            name_hash, ext, dir_hash, flags, offset, packed_sz, real_sz, pad = struct.unpack('<I4sIIQIII', rec)
            name = names[i]

            # Targets: master libraries and individual perk files
            is_target = (
                name in [
                    'interface/perkslibrary_small.swf',
                    'interface/legendaryperkslibrary.swf',
                    'interface/perksmenu.swf',
                    'interface/legendaryperksmenu.swf'
                ] or ('vaultboys/perks' in name and name.endswith('.swf'))
            )

            if is_target:
                curr_pos = f.tell()
                f.seek(offset)
                raw = f.read(packed_sz if packed_sz > 0 else real_sz)
                data = zlib.decompress(raw) if packed_sz > 0 else raw

                # If SWF is CWS (zlib compressed internally), decompress to FWS for clean editing
                if data[:3] == b'CWS':
                    version_byte = data[3]
                    uncomp_body = zlib.decompress(data[8:])
                    data = b'FWS' + bytes([version_byte]) + data[4:8] + uncomp_body

                out_filename = os.path.basename(name)
                if 'vaultboys/perks' in name:
                    out_path = os.path.join(OUTPUT_DIR, "standalone_perks", out_filename)
                else:
                    out_path = os.path.join(OUTPUT_DIR, out_filename)

                with open(out_path, "wb") as out_f:
                    out_f.write(data)

                extracted_count += 1
                extracted_files.append((out_filename, len(data)))
                f.seek(curr_pos)

        print(f"[✔] Successfully extracted {extracted_count} pristine Scaleform SWFs to {OUTPUT_DIR}")
        return True

def audit_catalog():
    print("[+] Auditing extracted assets against existing SVGs...")
    existing_svgs = {os.path.splitext(f)[0].lower() for f in os.listdir(EXISTING_SVG_DIR) if f.endswith('.svg')}

    # Parse symbols from perkslibrary_small.swf
    swf_path = os.path.join(OUTPUT_DIR, "perkslibrary_small.swf")
    if not os.path.exists(swf_path):
        return

    with open(swf_path, "rb") as f:
        data = f.read()
        nbits = data[8] >> 3
        pos = 8 + ((5 + nbits * 4 + 7) // 8) + 4

        symbols = []
        while pos < len(data):
            tag_header = struct.unpack('<H', data[pos:pos+2])[0]
            tag_type = tag_header >> 6
            tag_len = tag_header & 0x3F
            pos += 2
            if tag_len == 0x3F:
                tag_len = struct.unpack('<I', data[pos:pos+4])[0]
                pos += 4
            tag_data = data[pos:pos+tag_len]
            pos += tag_len

            if tag_type in [56, 76]:
                count = struct.unpack('<H', tag_data[:2])[0]
                tpos = 2
                for _ in range(count):
                    char_id = struct.unpack('<H', tag_data[tpos:tpos+2])[0]
                    tpos += 2
                    name_end = tag_data.find(b'\x00', tpos)
                    sym_name = tag_data[tpos:name_end].decode('utf-8', errors='ignore')
                    tpos = name_end + 1
                    symbols.append(sym_name)

    filtered_symbols = [
        s for s in symbols 
        if not any(ign in s.lower() for ign in ['banner', 'effect', 'bg', 'animated', 'static', 'button', 'clip', 'fla.'])
    ]

    matched = []
    unmatched = []

    for s in sorted(filtered_symbols):
        clean = s.lower().replace('_', '').replace(' ', '').replace('-', '')
        if clean in existing_svgs or any(clean in es for es in existing_svgs):
            matched.append(s)
        else:
            unmatched.append(s)

    report_content = f"""# 🃏 Fallout 76 Live Perk Card Audit Report
*Generated from live SixtySix - Interface.ba2 Scaleform binaries.*

## 📊 Summary Metrics
* **Total Symbols in Game Master Library**: `{len(symbols)}`
* **Perk Character Symbols Evaluated**: `{len(filtered_symbols)}`
* **Verified Matched with Existing SVGs**: `{len(matched)}`
* **Missing or Aliased Symbols**: `{len(unmatched)}`

---

## 🔍 Unmatched / Newly Added Symbols Requiring Ingestion
The following symbols exist in the game's latest master SWF library (`perkslibrary_small.swf`) but do not have an exact matching SVG in `public/images/perks_official/`:

| Symbol Name in Game Binary | Status | Recommended Resolution |
| :--- | :--- | :--- |
"""
    for u in unmatched:
        report_content += f"| `{u}` | Missing/Variant | Map alias or extract vector sprite directly |\n"

    report_content += """
---
*Audit completed by Antigravity Phase 1 Pipeline*
"""
    with open(REPORT_PATH, "w", encoding="utf-8") as rf:
        rf.write(report_content)

    print(f"[✔] Audit report generated at: {REPORT_PATH}")
    print(f"    Matched: {len(matched)} | Missing/Aliased: {len(unmatched)}")

if __name__ == "__main__":
    if extract_ba2_assets():
        audit_catalog()
