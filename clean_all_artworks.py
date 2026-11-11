import os
import json
import math
import glob
from collections import deque
from PIL import Image

def find_separator(src):
    w, h = src.size
    for x in range(1100, min(w - 200, 2100)):
        col = [src.getpixel((x, y))[:3] for y in range(100, h - 100, 25)]
        diffs = [abs(p[0]-38)+abs(p[1]-38)+abs(p[2]-38) for p in col]
        if sum(diffs)/len(diffs) < 25:
            return x
    return int(w * 0.58)

def inpaint_circle(pix, w, h, cx, cy, R):
    boundary = []
    for a_deg in range(0, 360, 8):
        rad = math.radians(a_deg)
        for dr in [4, 8]:
            bx = int(cx + (R + dr) * math.cos(rad))
            by = int(cy + (R + dr) * math.sin(rad))
            if 0 <= bx < w and 0 <= by < h:
                boundary.append((bx, by, pix[bx, by]))
                
    if not boundary:
        return
        
    for dy in range(-R - 2, R + 3):
        for dx in range(-R - 2, R + 3):
            if dx*dx + dy*dy <= (R + 2)*(R + 2):
                px, py = cx + dx, cy + dy
                if 0 <= px < w and 0 <= py < h:
                    weights = [1.0 / max(1.0, (px - bx)**2 + (py - by)**2) for bx, by, _ in boundary]
                    tw = sum(weights)
                    pix[px, py] = (
                        int(sum(w * c[0] for w, (_, _, c) in zip(weights, boundary)) / tw),
                        int(sum(w * c[1] for w, (_, _, c) in zip(weights, boundary)) / tw),
                        int(sum(w * c[2] for w, (_, _, c) in zip(weights, boundary)) / tw)
                    )

def find_components(pts_set):
    visited = set()
    components = []
    for pt in pts_set:
        if pt in visited:
            continue
        comp = []
        q = deque([pt])
        visited.add(pt)
        while q:
            cx, cy = q.popleft()
            comp.append((cx, cy))
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    nx, ny = cx + dx, cy + dy
                    if (nx, ny) in pts_set and (nx, ny) not in visited:
                        visited.add((nx, ny))
                        q.append((nx, ny))
        components.append(comp)
    return components

def clean_image(src_path):
    src = Image.open(src_path).convert('RGB')
    w, h = src.size
    
    # 1. Split media vs comments
    sep_x = find_separator(src)
    media = src.crop((0, 0, sep_x, h))
    mw, mh = media.size
    pix = media.load()
    
    ops = []
    
    # 2. Outer dialog borders
    top_b = 0
    for y in range(min(20, mh)):
        if sum(1 for x in range(20, mw-20, 20) if sum(pix[x,y])/3 < 30) / len(range(20, mw-20, 20)) > 0.8:
            top_b = y + 1
        else: break
        
    bot_b = mh
    for y in range(mh-1, max(mh-20, 0), -1):
        if sum(1 for x in range(20, mw-20, 20) if sum(pix[x,y])/3 < 30) / len(range(20, mw-20, 20)) > 0.8:
            bot_b = y
        else: break
        
    left_b = 0
    for x in range(0, min(200, mw//3)):
        if sum(1 for y in range(top_b+20, bot_b-20, 20) if sum(pix[x,y])/3 < 30) / len(range(top_b+20, bot_b-20, 20)) > 0.95:
            left_b = x + 1
        else: break
        
    right_b = mw
    for x in range(mw-1, max(mw-200, 2*mw//3), -1):
        if sum(1 for y in range(top_b+20, bot_b-20, 20) if sum(pix[x,y])/3 < 30) / len(range(top_b+20, bot_b-20, 20)) > 0.95:
            right_b = x
        else: break
        
    cropped = media.crop((left_b, top_b, right_b, bot_b))
    cw, ch = cropped.size
    cpix = cropped.load()
    
    if left_b > 0 or top_b > 0 or right_b < mw or bot_b < mh:
        ops.append(f"crop_dialog_({left_b},{top_b},{right_b},{bot_b})")
        
    cy = ch // 2
    
    # 3. Detect and inpaint Right Navigation Button (y centered around cy +/- 85px)
    bright_pts_r = set()
    for y in range(cy - 85, cy + 85):
        for x in range(cw - 85, cw - 10):
            p = cpix[x, y]
            if (p[0] + p[1] + p[2]) / 3 > 175:
                bright_pts_r.add((x, y))
                
    r_btn_found = False
    for comp in find_components(bright_pts_r):
        xs = [pt[0] for pt in comp]
        ys = [pt[1] for pt in comp]
        wb = max(xs) - min(xs)
        hb = max(ys) - min(ys)
        if 20 <= wb <= 65 and 20 <= hb <= 65 and abs(wb - hb) <= 20:
            cx_r = (min(xs) + max(xs)) // 2
            cy_r = (min(ys) + max(ys)) // 2
            inpaint_circle(cpix, cw, ch, cx_r, cy_r, 36)
            ops.append(f"inpaint_right_nav_btn_({cx_r},{cy_r})")
            r_btn_found = True
            break
            
    if not r_btn_found:
        for test_y in range(cy - 60, cy + 60):
            for test_x in range(cw - 75, cw - 25):
                c_val = sum(cpix[test_x, test_y])/3
                surr = sum(sum(cpix[test_x + dx, test_y + dy][:3])/3 for dx in [-18, 18] for dy in [-18, 18]) / 4
                if surr - c_val > 45 and surr > 190:
                    inpaint_circle(cpix, cw, ch, test_x - 6, test_y, 36)
                    ops.append(f"inpaint_chevron_right_({test_x-6},{test_y})")
                    r_btn_found = True
                    break
            if r_btn_found: break

    # 4. Detect and inpaint Left Navigation Button (y centered around cy +/- 85px)
    bright_pts_l = set()
    for y in range(cy - 85, cy + 85):
        for x in range(10, min(85, cw // 4)):
            p = cpix[x, y]
            if (p[0] + p[1] + p[2]) / 3 > 175:
                bright_pts_l.add((x, y))
                
    for comp in find_components(bright_pts_l):
        xs = [pt[0] for pt in comp]
        ys = [pt[1] for pt in comp]
        wb = max(xs) - min(xs)
        hb = max(ys) - min(ys)
        if 20 <= wb <= 65 and 20 <= hb <= 65 and abs(wb - hb) <= 20:
            cx_l = (min(xs) + max(xs)) // 2
            cy_l = (min(ys) + max(ys)) // 2
            inpaint_circle(cpix, cw, ch, cx_l, cy_l, 36)
            ops.append(f"inpaint_left_nav_btn_({cx_l},{cy_l})")
            break

    # 5. Detect and inpaint Bottom-Right UI button (Audio/Tag icon at bottom right)
    for y in range(ch - 145, ch - 60):
        for x in range(cw - 75, cw - 15):
            if sum(cpix[x, y])/3 > 195:
                w_pts = sum(1 for dx in range(-12, 13, 3) for dy in range(-12, 13, 3) if sum(cpix[x+dx, y+dy])/3 > 180)
                if w_pts > 45:
                    inpaint_circle(cpix, cw, ch, x, y, 32)
                    ops.append(f"inpaint_bottom_right_btn_({x},{y})")
                    break
        if any('bottom_right_btn' in o for o in ops): break

    # 6. Detect and inpaint Pagination Dots (centered at cw/2, y in [ch - 75 .. ch - 25])
    dot_pts = set()
    for y in range(ch - 75, ch - 25):
        for x in range(int(cw * 0.25), int(cw * 0.75)):
            if sum(cpix[x, y])/3 > 175:
                dot_pts.add((x, y))
                
    comps = find_components(dot_pts)
    valid_dots = []
    for c in comps:
        xs = [pt[0] for pt in c]
        ys = [pt[1] for pt in c]
        wb = max(xs) - min(xs)
        hb = max(ys) - min(ys)
        if 4 <= wb <= 18 and 4 <= hb <= 18:
            valid_dots.append(((min(xs) + max(xs)) // 2, (min(ys) + max(ys)) // 2))
            
    dots_by_y = {}
    for dx, dy_val in valid_dots:
        matched = False
        for gy in dots_by_y:
            if abs(gy - dy_val) <= 3:
                dots_by_y[gy].append((dx, dy_val))
                matched = True
                break
        if not matched:
            dots_by_y[dy_val] = [(dx, dy_val)]
            
    for gy, gdots in dots_by_y.items():
        if len(gdots) >= 2:
            gdots = sorted(gdots, key=lambda d: d[0])
            spacings = [gdots[i+1][0] - gdots[i][0] for i in range(len(gdots)-1)]
            if all(15 <= sp <= 26 for sp in spacings):
                for d in gdots:
                    inpaint_circle(cpix, cw, ch, d[0], d[1], 14)
                ops.append(f"inpaint_pagination_dots_{len(gdots)}_at_y{gy}")
                break
                
    return cropped, ops

def process_all():
    with open('data/collection-index.json') as f:
        items = json.load(f)
        
    os.makedirs('data/clean-crops', exist_ok=True)
    os.makedirs('data/web-images', exist_ok=True)
    
    restoration_log = {}
    print(f"Starting definitive restoration of {len(items)} artworks...")
    
    for idx, it in enumerate(items):
        aid = it['id']
        src_path = os.path.join('tmp-insta-posts', it['source_file'])
        if not os.path.exists(src_path):
            print(f"[{idx+1}/{len(items)}] Missing source {src_path}")
            continue
            
        clean_img, ops = clean_image(src_path)
        
        # Save Master Clean PNG
        out_png = os.path.join('data/clean-crops', f"{aid}.png")
        clean_img.save(out_png, format="PNG", optimize=True)
        
        # Save Web WebP full
        out_webp = os.path.join('data/web-images', f"{aid}.webp")
        clean_img.save(out_webp, format="WEBP", quality=92, method=6)
        
        # Save Web WebP thumbnail
        out_thumb = os.path.join('data/web-images', f"{aid}_thumb.webp")
        tw, th = clean_img.size
        target_w = 640
        target_h = int(th * (target_w / tw))
        thumb_img = clean_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        thumb_img.save(out_thumb, format="WEBP", quality=85, method=6)
        
        restoration_log[aid] = {
            "source_file": it['source_file'],
            "master_dimensions": f"{clean_img.size[0]}x{clean_img.size[1]}",
            "aspect_ratio": round(clean_img.size[0] / clean_img.size[1], 3),
            "operations": ops,
            "status": "clean" if not ops else "retouched"
        }
        
        if (idx + 1) % 25 == 0 or idx == len(items) - 1:
            print(f"[{idx+1}/{len(items)}] Processed {aid} ({len(ops)} ops: {ops})")
            
    with open('data/restoration-log.json', 'w') as f:
        json.dump(restoration_log, f, indent=2)
        
    print(f"Completed! Restoration log saved to data/restoration-log.json")

if __name__ == '__main__':
    process_all()
