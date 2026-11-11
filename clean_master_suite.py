import os
import json
import math
from collections import deque
from PIL import Image

def find_media_boundary(src):
    w, h = src.size
    # Instagram desktop layout: media on left, sidebar/comments on right
    # Scan for the dark vertical divider or background change between 1100 and w-200
    for x in range(1100, min(w - 200, 2150)):
        # Sample column
        col = [src.getpixel((x, y))[:3] for y in range(80, h - 80, 20)]
        # Check if this column is the solid dark background of sidebar (#262626 -> sum ~114 or #121212 -> sum ~54)
        diffs = [abs(p[0]-38)+abs(p[1]-38)+abs(p[2]-38) for p in col]
        if sum(diffs)/len(diffs) < 26:
            return x
            
    # Fallback: check where column variance drops to near zero
    for x in range(1200, min(w - 200, 2150)):
        col = [src.getpixel((x, y))[:3] for y in range(100, h - 100, 30)]
        var = max(sum(p) for p in col) - min(sum(p) for p in col)
        if var < 15:
            return x
            
    return int(w * 0.58)

def inpaint_circular_region(pix, w, h, cx, cy, R):
    boundary = []
    # Collect outer perimeter pixels
    for a_deg in range(0, 360, 5):
        rad = math.radians(a_deg)
        for dr in [4, 7, 11]:
            bx = int(cx + (R + dr) * math.cos(rad))
            by = int(cy + (R + dr) * math.sin(rad))
            if 0 <= bx < w and 0 <= by < h:
                boundary.append((bx, by, pix[bx, by]))
                
    if not boundary:
        return
        
    for dy in range(-R - 2, R + 3):
        for dx in range(-R - 2, R + 3):
            if dx*dx + dy*dy <= (R + 1)*(R + 1):
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

def clean_single_artwork(src_path, aid):
    src = Image.open(src_path).convert('RGB')
    w, h = src.size
    
    # 1. Isolate media
    sep_x = find_media_boundary(src)
    media = src.crop((0, 0, sep_x, h))
    mw, mh = media.size
    mpix = media.load()
    ops = []
    
    # 2. Trim dialog top and bottom black letterboxing if present
    top_b = 0
    for y in range(min(25, mh)):
        if sum(1 for x in range(30, mw-30, 20) if sum(mpix[x, y])/3 < 32) / len(range(30, mw-30, 20)) > 0.85:
            top_b = y + 1
        else: break
        
    bot_b = mh
    for y in range(mh-1, max(mh-25, 0), -1):
        if sum(1 for x in range(30, mw-30, 20) if sum(mpix[x, y])/3 < 32) / len(range(30, mw-30, 20)) > 0.85:
            bot_b = y
        else: break
        
    left_b = 0
    for x in range(0, min(180, mw//4)):
        if sum(1 for y in range(top_b+30, bot_b-30, 25) if sum(mpix[x, y])/3 < 32) / len(range(top_b+30, bot_b-30, 25)) > 0.96:
            left_b = x + 1
        else: break
        
    right_b = mw
    for x in range(mw-1, max(mw-180, 3*mw//4), -1):
        if sum(1 for y in range(top_b+30, bot_b-30, 25) if sum(mpix[x, y])/3 < 32) / len(range(top_b+30, bot_b-30, 25)) > 0.96:
            right_b = x
        else: break
        
    cropped = media.crop((left_b, top_b, right_b, bot_b))
    cw, ch = cropped.size
    cpix = cropped.load()
    
    if left_b > 0 or top_b > 0 or right_b < mw or bot_b < mh:
        ops.append(f"crop_dialog_({left_b},{top_b},{right_b},{bot_b})")
        
    # 3. Detect and inpaint Right Carousel Navigation Button (White Circle or Chevron)
    # Search along the right margin: x in [cw - 85 .. cw - 8], y in [int(ch * 0.2) .. int(ch * 0.85)]
    r_btn_found = False
    bright_pts_r = set()
    for y in range(int(ch * 0.2), int(ch * 0.85)):
        for x in range(cw - 85, cw - 8):
            p = cpix[x, y]
            if (p[0] + p[1] + p[2]) / 3 > 175:
                bright_pts_r.add((x, y))
                
    for comp in find_components(bright_pts_r):
        xs = [pt[0] for pt in comp]
        ys = [pt[1] for pt in comp]
        wb = max(xs) - min(xs)
        hb = max(ys) - min(ys)
        if 18 <= wb <= 70 and 18 <= hb <= 70 and abs(wb - hb) <= 22:
            cx_r = (min(xs) + max(xs)) // 2
            cy_r = (min(ys) + max(ys)) // 2
            inpaint_circular_region(cpix, cw, ch, cx_r, cy_r, 36)
            ops.append(f"inpaint_right_nav_btn_({cx_r},{cy_r})")
            r_btn_found = True
            break
            
    # If not found via bright component, search for chevron on bright wall
    if not r_btn_found:
        for test_y in range(int(ch * 0.25), int(ch * 0.8)):
            for test_x in range(cw - 75, cw - 20):
                c_val = sum(cpix[test_x, test_y])/3
                surr = sum(sum(cpix[test_x + dx, test_y + dy][:3])/3 for dx in [-18, 18] for dy in [-18, 18]) / 4
                if surr - c_val > 40 and surr > 185:
                    inpaint_circular_region(cpix, cw, ch, test_x - 6, test_y, 36)
                    ops.append(f"inpaint_chevron_right_({test_x-6},{test_y})")
                    r_btn_found = True
                    break
            if r_btn_found: break

    # 4. Detect and inpaint Left Carousel Navigation Button
    bright_pts_l = set()
    for y in range(int(ch * 0.2), int(ch * 0.85)):
        for x in range(8, min(85, cw // 4)):
            p = cpix[x, y]
            if (p[0] + p[1] + p[2]) / 3 > 175:
                bright_pts_l.add((x, y))
                
    for comp in find_components(bright_pts_l):
        xs = [pt[0] for pt in comp]
        ys = [pt[1] for pt in comp]
        wb = max(xs) - min(xs)
        hb = max(ys) - min(ys)
        if 18 <= wb <= 70 and 18 <= hb <= 70 and abs(wb - hb) <= 22:
            cx_l = (min(xs) + max(xs)) // 2
            cy_l = (min(ys) + max(ys)) // 2
            inpaint_circular_region(cpix, cw, ch, cx_l, cy_l, 36)
            ops.append(f"inpaint_left_nav_btn_({cx_l},{cy_l})")
            break

    # 5. Detect and inpaint Bottom-Right UI button (Audio/Tag icon)
    for y in range(ch - 150, ch - 40):
        for x in range(cw - 85, cw - 12):
            if sum(cpix[x, y])/3 > 190:
                w_pts = sum(1 for dx in range(-12, 13, 3) for dy in range(-12, 13, 3) if sum(cpix[x+dx, y+dy])/3 > 175)
                if w_pts > 45:
                    inpaint_circular_region(cpix, cw, ch, x, y, 32)
                    ops.append(f"inpaint_bottom_right_btn_({x},{y})")
                    break
        if any('bottom_right_btn' in o for o in ops): break

    # 6. Detect and inpaint Pagination Dots
    dot_pts = set()
    for y in range(ch - 85, ch - 15):
        for x in range(int(cw * 0.2), int(cw * 0.8)):
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
            if abs(gy - dy_val) <= 4:
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
                    inpaint_circular_region(cpix, cw, ch, d[0], d[1], 15)
                ops.append(f"inpaint_pagination_dots_{len(gdots)}_at_y{gy}")
                break
                
    return cropped, ops

print("clean_master_suite loaded successfully.")
