import os
import json
import math
import glob
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
    # Sample boundary at R + 3 to R + 7
    boundary = []
    for a_deg in range(0, 360, 5):
        rad = math.radians(a_deg)
        for dr in [3, 6]:
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

def inpaint_vertical_span(pix, w, h, x_min, x_max, y_min, y_max):
    y_top = max(0, y_min - 2)
    y_bot = min(h - 1, y_max + 2)
    if y_bot <= y_top:
        return
    for py in range(y_min, y_max + 1):
        t = (py - y_top) / (y_bot - y_top)
        for px in range(max(0, x_min), min(w, x_max + 1)):
            tp = pix[px, y_top]
            bp = pix[px, y_bot]
            pix[px, py] = (
                int(tp[0] * (1 - t) + bp[0] * t),
                int(tp[1] * (1 - t) + bp[1] * t),
                int(tp[2] * (1 - t) + bp[2] * t)
            )

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
    
    # 3. Detect and inpaint Right Button
    # Search cx in [cw - 95 .. cw - 10], cy in [cy - 85 .. cy + 85]
    right_btn = None
    bright_pts_r = []
    for dy in range(-80, 81, 2):
        test_y = cy + dy
        if test_y < 30 or test_y >= ch - 30: continue
        for test_x in range(cw - 85, cw - 8, 2):
            p = cpix[test_x, test_y]
            if sum(p)/3 > 165:
                bright_pts_r.append((test_x, test_y))
                
    if len(bright_pts_r) >= 120:
        xs = [pt[0] for pt in bright_pts_r]
        ys = [pt[1] for pt in bright_pts_r]
        span_x = max(xs) - min(xs)
        span_y = max(ys) - min(ys)
        if 20 <= span_x <= 75 and 20 <= span_y <= 75:
            cx_r = sum(xs) // len(xs)
            cy_r = sum(ys) // len(ys)
            right_btn = (cx_r, cy_r, max(36, max(span_x, span_y) // 2 + 5))
            
    if not right_btn:
        # Check chevron contrast on light background
        for dy in range(-70, 71, 3):
            test_y = cy + dy
            if test_y < 30 or test_y >= ch - 30: continue
            for test_x in range(cw - 75, cw - 15, 3):
                inner = [cpix[test_x + int(12*math.cos(a)), test_y + int(12*math.sin(a))] for a in [0, 1.57, 3.14, 4.71]]
                avg_in = sum(sum(p)/3 for p in inner) / 4
                if avg_in > 120:
                    c_samples = [cpix[test_x+dx, test_y+dy_c] for dx in [-3, 0, 3] for dy_c in [-4, 0, 4]]
                    min_c = min(sum(p)/3 for p in c_samples)
                    outer = [cpix[test_x + int(32*math.cos(a)), test_y + int(32*math.sin(a))] for a in [0, 1.57, 3.14, 4.71] if 0<=test_x+int(32*math.cos(a))<cw and 0<=test_y+int(32*math.sin(a))<ch]
                    if outer and (sum(sum(p)/3 for p in outer)/len(outer)) - min_c > 45:
                        right_btn = (test_x, test_y, 36)
                        break
            if right_btn: break
            
    if right_btn:
        inpaint_circle(cpix, cw, ch, right_btn[0], right_btn[1], right_btn[2])
        ops.append(f"inpaint_right_button_at_({right_btn[0]},{right_btn[1]})")
        
    # 4. Detect and inpaint Left Button
    left_btn = None
    bright_pts_l = []
    for dy in range(-80, 81, 2):
        test_y = cy + dy
        if test_y < 30 or test_y >= ch - 30: continue
        for test_x in range(8, min(85, cw // 4), 2):
            p = cpix[test_x, test_y]
            if sum(p)/3 > 165:
                bright_pts_l.append((test_x, test_y))
                
    if len(bright_pts_l) >= 120:
        xs = [pt[0] for pt in bright_pts_l]
        ys = [pt[1] for pt in bright_pts_l]
        span_x = max(xs) - min(xs)
        span_y = max(ys) - min(ys)
        if 20 <= span_x <= 75 and 20 <= span_y <= 75:
            cx_l = sum(xs) // len(xs)
            cy_l = sum(ys) // len(ys)
            left_btn = (cx_l, cy_l, max(36, max(span_x, span_y) // 2 + 5))
            
    if not left_btn:
        for dy in range(-70, 71, 3):
            test_y = cy + dy
            if test_y < 30 or test_y >= ch - 30: continue
            for test_x in range(15, min(75, cw // 4), 3):
                inner = [cpix[test_x + int(12*math.cos(a)), test_y + int(12*math.sin(a))] for a in [0, 1.57, 3.14, 4.71]]
                avg_in = sum(sum(p)/3 for p in inner) / 4
                if avg_in > 120:
                    c_samples = [cpix[test_x+dx, test_y+dy_c] for dx in [-3, 0, 3] for dy_c in [-4, 0, 4]]
                    min_c = min(sum(p)/3 for p in c_samples)
                    outer = [cpix[test_x + int(32*math.cos(a)), test_y + int(32*math.sin(a))] for a in [0, 1.57, 3.14, 4.71] if 0<=test_x+int(32*math.cos(a))<cw and 0<=test_y+int(32*math.sin(a))<ch]
                    if outer and (sum(sum(p)/3 for p in outer)/len(outer)) - min_c > 45:
                        left_btn = (test_x, test_y, 36)
                        break
            if left_btn: break
            
    if left_btn:
        inpaint_circle(cpix, cw, ch, left_btn[0], left_btn[1], left_btn[2])
        ops.append(f"inpaint_left_button_at_({left_btn[0]},{left_btn[1]})")
        
    # 5. Detect and inpaint Pagination Dots
    dots_y = None
    for y in range(ch - 70, ch - 15, 2):
        row = [cpix[x, y] for x in range(cw // 4, 3 * cw // 4, 3)]
        brights = [i for i, p in enumerate(row) if sum(p)/3 > 185]
        if len(brights) >= 4:
            dots_y = y
            break
            
    if dots_y:
        row_full = [sum(cpix[x, dots_y])/3 for x in range(cw)]
        bright_xs = [x for x, val in enumerate(row_full) if val > 175 and cw//4 < x < 3*cw//4]
        if bright_xs:
            min_x = max(0, min(bright_xs) - 20)
            max_x = min(cw - 1, max(bright_xs) + 20)
            inpaint_vertical_span(cpix, cw, ch, min_x, max_x, dots_y - 12, dots_y + 12)
            ops.append(f"inpaint_dots_at_y{dots_y}")
            
    return cropped, ops

def process_all():
    with open('data/collection-index.json') as f:
        items = json.load(f)
        
    os.makedirs('data/clean-crops', exist_ok=True)
    os.makedirs('data/web-images', exist_ok=True)
    
    restoration_log = {}
    print(f"Starting restoration of {len(items)} artworks...")
    
    for idx, it in enumerate(items):
        aid = it['id']
        sfile = it['source_file']
        src_path = os.path.join('tmp-insta-posts', sfile)
        
        cleaned_im, ops = clean_image(src_path)
        
        # Save clean master PNG
        png_path = os.path.join('data/clean-crops', f"{aid}.png")
        cleaned_im.save(png_path, format='PNG')
        
        # Save WebP full (max 1600px)
        cw, ch = cleaned_im.size
        scale = min(1.0, 1600 / max(cw, ch))
        if scale < 1.0:
            full_w, full_h = int(cw * scale), int(ch * scale)
            full_im = cleaned_im.resize((full_w, full_h), Image.Resampling.LANCZOS)
        else:
            full_im = cleaned_im
        webp_path = os.path.join('data/web-images', f"{aid}.webp")
        full_im.save(webp_path, format='WEBP', quality=90)
        
        # Save WebP thumb (max 520px)
        t_scale = min(1.0, 520 / max(cw, ch))
        tw, th = int(cw * t_scale), int(ch * t_scale)
        thumb_im = cleaned_im.resize((tw, th), Image.Resampling.LANCZOS)
        thumb_path = os.path.join('data/web-images', f"{aid}_thumb.webp")
        thumb_im.save(thumb_path, format='WEBP', quality=84)
        
        # Update metadata
        it['width'] = cw
        it['height'] = ch
        it['aspect_ratio'] = round(cw / ch, 3)
        it['cleaning_status'] = 'clean' if not ops else 'retouched'
        it['cleaning_operations'] = ops
        it['cleaning_notes'] = f"Curățare prudentă efectuată: {', '.join(ops) if ops else 'decupaj curat'}"
        
        restoration_log[aid] = {
            'id': aid,
            'source_file': sfile,
            'size': (cw, ch),
            'operations': ops
        }
        
        if (idx + 1) % 25 == 0 or idx == len(items) - 1:
            print(f"[{idx+1}/{len(items)}] Processed {aid} ({cw}x{ch}) - ops: {len(ops)}")
            
    # Save updated metadata
    with open('data/collection-index.json', 'w') as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
        
    with open('data/restoration-log.json', 'w') as f:
        json.dump(restoration_log, f, indent=2)
        
    print("All 167 artworks cleaned and WebP files regenerated successfully!")

if __name__ == '__main__':
    process_all()
