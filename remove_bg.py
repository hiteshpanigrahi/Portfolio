import os
from pathlib import Path
from rembg import remove, new_session
from PIL import Image
from concurrent.futures import ThreadPoolExecutor

input_dir = Path("frames")
output_dir = Path("frames_nobg")
output_dir.mkdir(exist_ok=True)

# Use the lightweight bi-directional u2net model
session = new_session("u2netp")

def process_frame(file_path):
    out_path = output_dir / file_path.name
    if out_path.exists():
        return
    with Image.open(file_path) as img:
        # Removes background and outputs true RGBA transparency
        output = remove(img, session=session, alpha_matting=True)
        output.save(out_path, "WEBP", quality=85)
    print(f"Processed: {file_path.name}")

files = sorted(list(input_dir.glob("frame_*.webp")))
print(f"Found {len(files)} frames. Starting background removal...")

# Process 4 frames concurrently
with ThreadPoolExecutor(max_workers=4) as executor:
    executor.map(process_frame, files)

print("Finished processing all frames!")
