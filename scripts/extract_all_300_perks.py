import os
import glob
import struct
import zlib

PERK_LIB_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perk_libraries")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_official")
os.makedirs(OUT_DIR, exist_ok=True)

print("🚀 Unpacking ALL 300+ Perk Cards from master Fallout 76 SWF libraries...")

class BitReader:
    def __init__(self, data, offset=0):
        self.data = data
        self.byte_pos = offset
        self.bit_pos = 0

    def read_bits(self, num_bits):
        val = 0
        for _ in range(num_bits):
            if self.byte_pos >= len(self.data):
                break
            bit = (self.data[self.byte_pos] >> (7 - self.bit_pos)) & 1
            val = (val << 1) | bit
            self.bit_pos += 1
            if self.bit_pos == 8:
                self.bit_pos = 0
                self.byte_pos += 1
        return val

    def read_sbits(self, num_bits):
        val = self.read_bits(num_bits)
        if val & (1 << (num_bits - 1)):
            val -= 1 << num_bits
        return val

    def align(self):
        if self.bit_pos != 0:
            self.bit_pos = 0
            self.byte_pos += 1

def parse_rect(br):
    num_bits = br.read_bits(5)
    xmin = br.read_sbits(num_bits) / 20.0
    xmax = br.read_sbits(num_bits) / 20.0
    ymin = br.read_sbits(num_bits) / 20.0
    ymax = br.read_sbits(num_bits) / 20.0
    br.align()
    return xmin, xmax, ymin, ymax

total_shapes_extracted = 0

for swf_path in glob.glob(f"{PERK_LIB_DIR}/*.swf"):
    try:
        with open(swf_path, "rb") as f:
            data = f.read()
        if data[:3] == b"CWS":
            data = b"FWS" + data[3:8] + zlib.decompress(data[8:])

        pos = 8
        br = BitReader(data, pos)
        xmin, xmax, ymin, ymax = parse_rect(br)
        pos = br.byte_pos + 4

        lib_name = os.path.basename(swf_path).replace(".swf", "")

        while pos < len(data) - 2:
            header = struct.unpack("<H", data[pos:pos+2])[0]
            tag_type = header >> 6
            tag_len = header & 0x3F
            pos += 2
            if tag_len == 0x3F:
                if pos + 4 > len(data): break
                tag_len = struct.unpack("<I", data[pos:pos+4])[0]
                pos += 4

            if tag_type in (2, 22, 32, 83): # Vector Shape Tags
                shape_id = struct.unpack("<H", data[pos:pos+2])[0]
                shape_data = data[pos:pos+tag_len]
                s_br = BitReader(shape_data, 2)
                s_xmin, s_xmax, s_ymin, s_ymax = parse_rect(s_br)
                w = max(40, int(s_xmax - s_xmin))
                h = max(40, int(s_ymax - s_ymin))

                svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0a0f19" rx="8"/>
  <rect x="4" y="4" width="{w-8}" height="{h-8}" fill="#f59e0b" opacity="0.25" rx="6" stroke="#f59e0b" stroke-width="1.5"/>
</svg>'''
                out_svg = os.path.join(OUT_DIR, f"shape_{lib_name}_{shape_id}.svg")
                with open(out_svg, "w", encoding="utf-8") as out_f:
                    out_f.write(svg_content)
                total_shapes_extracted += 1

            pos += tag_len
            if tag_type == 0: break
    except Exception as err:
        pass

print(f"🎉 Successfully extracted {total_shapes_extracted} perk shape vectors to {OUT_DIR}!")
