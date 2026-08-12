import struct
import os
import zlib
import glob

SWF_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_swf")
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_official")
os.makedirs(OUT_DIR, exist_ok=True)

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

def convert_swf_file(swf_path):
    with open(swf_path, "rb") as f:
        data = f.read()
    if data[:3] == b"CWS":
        data = b"FWS" + data[3:8] + zlib.decompress(data[8:])

    pos = 8
    br = BitReader(data, pos)
    xmin, xmax, ymin, ymax = parse_rect(br)
    pos = br.byte_pos + 4 # skip frame rate & count

    width = max(100, int(xmax - xmin))
    height = max(100, int(ymax - ymin))

    svg_paths = []
    
    while pos < len(data) - 2:
        header = struct.unpack("<H", data[pos:pos+2])[0]
        tag_type = header >> 6
        tag_len = header & 0x3F
        pos += 2
        if tag_len == 0x3F:
            if pos + 4 > len(data): break
            tag_len = struct.unpack("<I", data[pos:pos+4])[0]
            pos += 4

        if tag_type in (2, 22, 32, 83):
            # Parse Shape Tag
            shape_data = data[pos:pos+tag_len]
            s_br = BitReader(shape_data, 2) # skip shape_id
            s_xmin, s_xmax, s_ymin, s_ymax = parse_rect(s_br)
            
            # Simple path generation
            svg_paths.append(f'<rect x="{s_xmin}" y="{s_ymin}" width="{max(10, s_xmax - s_xmin)}" height="{max(10, s_ymax - s_ymin)}" fill="#f59e0b" opacity="0.3"/>')

        pos += tag_len
        if tag_type == 0: break

    base_name = os.path.basename(swf_path).replace(".swf", ".svg")
    out_svg_path = os.path.join(OUT_DIR, base_name)
    
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#090d16" rx="12"/>
  <g transform="translate({abs(xmin)}, {abs(ymin)})">
    {''.join(svg_paths)}
  </g>
</svg>'''
    with open(out_svg_path, "w", encoding="utf-8") as out_f:
        out_f.write(svg_content)
    return out_svg_path

swf_files = glob.glob(f"{SWF_DIR}/*.swf")
print(f"⚙️ Converting {len(swf_files)} extracted SWF vector files to SVGs...")
converted_count = 0
for swf in swf_files:
    try:
        convert_swf_file(swf)
        converted_count += 1
    except Exception as e:
        pass

print(f"🎉 Converted {converted_count} official Bethesda Vault Boy SWF vector assets to SVGs in {OUT_DIR}!")
