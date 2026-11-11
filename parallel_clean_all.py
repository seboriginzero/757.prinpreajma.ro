import os
import json
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from PIL import Image
from clean_master_suite import clean_single_artwork

def process_one_item(it):
    aid = it['id']
    src_path = os.path.join('tmp-insta-posts', it['source_file'])
    if not os.path.exists(src_path):
        return aid, None, [f"missing_source_{src_path}"]
        
    clean_img, ops = clean_single_artwork(src_path, aid)
    
    # 1. Master PNG
    out_png = os.path.join('data/clean-crops', f"{aid}.png")
    clean_img.save(out_png, format="PNG", optimize=True)
    
    # 2. Web WebP Full
    out_webp = os.path.join('data/web-images', f"{aid}.webp")
    clean_img.save(out_webp, format="WEBP", quality=92, method=6)
    
    # 3. Web WebP Thumbnail
    out_thumb = os.path.join('data/web-images', f"{aid}_thumb.webp")
    tw, th = clean_img.size
    target_w = 640
    target_h = int(th * (target_w / tw))
    thumb_img = clean_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    thumb_img.save(out_thumb, format="WEBP", quality=85, method=6)
    
    meta = {
        "source_file": it['source_file'],
        "master_dimensions": f"{clean_img.size[0]}x{clean_img.size[1]}",
        "aspect_ratio": round(clean_img.size[0] / clean_img.size[1], 3),
        "operations": ops,
        "status": "clean" if not ops else "retouched"
    }
    return aid, meta, ops

def main():
    start = time.time()
    with open('data/collection-index.json') as f:
        items = json.load(f)
        
    os.makedirs('data/clean-crops', exist_ok=True)
    os.makedirs('data/web-images', exist_ok=True)
    
    restoration_log = {}
    total = len(items)
    print(f"Launching parallel master restoration on {total} artworks across 8 worker processes...")
    
    with ProcessPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(process_one_item, it): it for it in items}
        done_count = 0
        for fut in as_completed(futures):
            aid, meta, ops = fut.result()
            done_count += 1
            if meta:
                restoration_log[aid] = meta
            if done_count % 25 == 0 or done_count == total:
                print(f"Progress: [{done_count}/{total}] completed (latest: {aid} - {len(ops)} ops)")
                
    # Sort by ID
    sorted_log = {k: restoration_log[k] for k in sorted(restoration_log.keys())}
    with open('data/restoration-log.json', 'w') as f:
        json.dump(sorted_log, f, indent=2)
        
    elapsed = time.time() - start
    print(f"Definitive master restoration finished in {elapsed:.2f}s! Log saved to data/restoration-log.json.")

if __name__ == '__main__':
    main()
