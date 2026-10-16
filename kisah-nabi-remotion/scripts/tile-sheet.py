"""Susun still 360px menjadi lembar 5x2 berlabel waktu (dipanggil oleh scripts/sheet.mjs)."""
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFont

src, prefix, fps = sys.argv[1], sys.argv[2], float(sys.argv[3])
files = sorted(glob.glob(os.path.join(src, "*.png")))
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
KOLOM, BARIS = 5, 2
os.makedirs(os.path.dirname(prefix), exist_ok=True)
for lembar in range(0, len(files), KOLOM * BARIS):
    grup = files[lembar : lembar + KOLOM * BARIS]
    w, h = Image.open(grup[0]).size
    kanvas = Image.new("RGB", (KOLOM * (w + 8) + 8, BARIS * (h + 8) + 8), (40, 40, 40))
    for i, f in enumerate(grup):
        im = Image.open(f).convert("RGB")
        d = ImageDraw.Draw(im)
        detik = int(os.path.basename(f)[:-4]) / fps
        label = f"{detik:5.1f}s"
        d.rectangle([0, 0, 92, 30], fill=(0, 0, 0))
        d.text((6, 3), label, font=font, fill=(255, 220, 120))
        kanvas.paste(im, (8 + (i % KOLOM) * (w + 8), 8 + (i // KOLOM) * (h + 8)))
    out = f"{prefix}-{lembar // (KOLOM * BARIS) + 1:02d}.png"
    kanvas.save(out)
    print(out)
