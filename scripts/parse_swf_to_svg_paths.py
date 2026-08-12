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

def decode_shape_to_svg(shape_bytes, is_shape3=True):
    br = BitReader(shape_bytes, 2)
    xmin, xmax, ymin, ymax = parse_rect(br)
    
    # Parse FillStyles
    count = br.data[br.byte_pos]
    br.byte_pos += 1
    if count == 0xFF:
        count = struct.unpack("<H", br.data[br.byte_pos:br.byte_pos+2])[0]
        br.byte_pos += 2
        
    fill_colors = []
    for i in range(count):
        ftype = br.data[br.byte_pos]
        br.byte_pos += 1
        if ftype == 0: # Solid fill
            if is_shape3:
                r, g, b, a = br.data[br.byte_pos:br.byte_pos+4]
                br.byte_pos += 4
                if r > 230 and g > 200 and b > 160:
                    fill_colors.append("#ffe4c4") # Skin Tone
                elif r > 230 and g > 200 and b < 100:
                    fill_colors.append("#ffe359") # Blonde Hair
                elif b > 120 and r < 100:
                    fill_colors.append("#1e56a0") # Vault Suit Blue
                elif r < 50 and g < 50 and b < 50:
                    fill_colors.append("#0f172a") # Black Outlines
                else:
                    fill_colors.append(f"rgba({r},{g},{b},{a/255.0:.2f})")
            else:
                r, g, b = br.data[br.byte_pos:br.byte_pos+3]
                br.byte_pos += 3
                fill_colors.append(f"rgb({r},{g},{b})")
        else:
            fill_colors.append("#ffe359")
            
    # Parse LineStyles
    line_count = br.data[br.byte_pos]
    br.byte_pos += 1
    if line_count == 0xFF:
        line_count = struct.unpack("<H", br.data[br.byte_pos:br.byte_pos+2])[0]
        br.byte_pos += 2
        
    line_colors = []
    for _ in range(line_count):
        br.byte_pos += 2
        if is_shape3:
            r, g, b, a = br.data[br.byte_pos:br.byte_pos+4]
            br.byte_pos += 4
            line_colors.append(f"rgba({r},{g},{b},{a/255.0:.2f})")
        else:
            r, g, b = br.data[br.byte_pos:br.byte_pos+3]
            br.byte_pos += 3
            line_colors.append(f"rgb({r},{g},{b})")

    num_fill_bits = br.read_bits(4)
    num_line_bits = br.read_bits(4)
    
    curr_x = 0
    curr_y = 0
    paths = []
    curr_path = []
    curr_fill_idx = 0
    curr_line_idx = 0
    
    while True:
        type_flag = br.read_bits(1)
        if type_flag == 0: # StyleChangeRecord
            flags = br.read_bits(5)
            if flags == 0: break
                
            state_move_to = flags & 1
            state_fill_0 = (flags >> 1) & 1
            state_fill_1 = (flags >> 2) & 1
            state_line = (flags >> 3) & 1
            state_new_styles = (flags >> 4) & 1
            
            if state_move_to:
                move_bits = br.read_bits(5)
                curr_x = br.read_sbits(move_bits) / 20.0
                curr_y = br.read_sbits(move_bits) / 20.0
                if curr_path:
                    if curr_fill_idx > 0 and curr_fill_idx <= len(fill_colors):
                        color = fill_colors[curr_fill_idx - 1]
                        paths.append(f'<path d="{" ".join(curr_path)}" fill="{color}" stroke="#0f172a" stroke-width="1.2" />')
                    else:
                        paths.append(f'<path d="{" ".join(curr_path)}" fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" />')
                    curr_path = []
                curr_path.append(f"M {curr_x:.2f} {curr_y:.2f}")
                
            if state_fill_0: curr_fill_idx = br.read_bits(num_fill_bits)
            if state_fill_1: curr_fill_idx = br.read_bits(num_fill_bits)
            if state_line: curr_line_idx = br.read_bits(num_line_bits)
            if state_new_styles: break
        else: # EdgeRecord
            straight_flag = br.read_bits(1)
            num_bits = br.read_bits(4) + 2
            if straight_flag == 1:
                gen_flag = br.read_bits(1)
                if gen_flag == 1:
                    dx = br.read_sbits(num_bits) / 20.0
                    dy = br.read_sbits(num_bits) / 20.0
                else:
                    vert_flag = br.read_bits(1)
                    if vert_flag == 0:
                        dx = br.read_sbits(num_bits) / 20.0
                        dy = 0
                    else:
                        dx = 0
                        dy = br.read_sbits(num_bits) / 20.0
                curr_x += dx
                curr_y += dy
                curr_path.append(f"L {curr_x:.2f} {curr_y:.2f}")
            else: # Curved Edge
                cx = curr_x + br.read_sbits(num_bits) / 20.0
                cy = curr_y + br.read_sbits(num_bits) / 20.0
                ax = cx + br.read_sbits(num_bits) / 20.0
                ay = cy + br.read_sbits(num_bits) / 20.0
                curr_x = ax
                curr_y = ay
                curr_path.append(f"Q {cx:.2f} {cy:.2f} {ax:.2f} {ay:.2f}")
                
    if curr_path:
        if curr_fill_idx > 0 and curr_fill_idx <= len(fill_colors):
            color = fill_colors[curr_fill_idx - 1]
            paths.append(f'<path d="{" ".join(curr_path)}" fill="{color}" stroke="#0f172a" stroke-width="1.2" />')
        else:
            paths.append(f'<path d="{" ".join(curr_path)}" fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" />')

    width = max(100, int(xmax - xmin))
    height = max(100, int(ymax - ymin))
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{xmin:.2f} {ymin:.2f} {width} {height}" width="100%" height="100%">
  <g>
    {"".join(paths)}
  </g>
</svg>'''
    return svg, len(paths)

print("🎨 Parsing SWF Flash Bezier curves into rich full-color Vault Boy SVG vector artwork with line art...")
swf_files = glob.glob(f"{SWF_DIR}/*.swf")
parsed_count = 0

for swf_path in swf_files:
    try:
        with open(swf_path, "rb") as f:
            data = f.read()
        if data[:3] == b"CWS":
            data = b"FWS" + data[3:8] + zlib.decompress(data[8:])

        pos = 8
        br = BitReader(data, pos)
        xmin, xmax, ymin, ymax = parse_rect(br)
        pos = br.byte_pos + 4

        svg_content = None
        best_paths = 0

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
                shape_bytes = data[pos:pos+tag_len]
                svg_str, path_cnt = decode_shape_to_svg(shape_bytes, is_shape3=(tag_type in (32, 83)))
                if path_cnt > best_paths:
                    best_paths = path_cnt
                    svg_content = svg_str

            pos += tag_len
            if tag_type == 0: break

        if svg_content and best_paths > 0:
            clean_name = os.path.basename(swf_path).lower().replace(" ", "").replace("_", "").replace("-", "").replace(".swf", ".svg")
            out_file = os.path.join(OUT_DIR, clean_name)
            with open(out_file, "w", encoding="utf-8") as out_f:
                out_f.write(svg_content)
            parsed_count += 1
    except Exception as err:
        pass

print(f"🎉 Successfully decoded {parsed_count} rich full-color Vault Boy SWF vector graphics to {OUT_DIR}!")
