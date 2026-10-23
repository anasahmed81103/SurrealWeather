# Builds the Expo icon set (icon, adaptive-icon, splash-icon, favicon) from assets/brand/logo.webp.
# Run from the project root after changing the logo:  python scripts/buildIcons.py .  (needs Pillow + numpy)
import sys
import numpy as np
from PIL import Image, ImageFilter
root = sys.argv[1]
logo = Image.open(f"{root}/assets/brand/logo.webp").convert("RGBA")
N = 1024

def edge_fill(img):
    # paint transparent pixels with the colour of the nearest art (alpha-weighted blur, growing radius)
    a = np.asarray(img, dtype=np.float64) / 255
    out = a[..., :3] * a[..., 3:]; filled = a[..., 3:].copy()
    for r in (4, 12, 32, 80, 200, 500):
        pre = Image.fromarray((np.dstack([a[..., :3] * a[..., 3:], a[..., 3]]) * 255).astype(np.uint8), "RGBA")
        b = np.asarray(pre.filter(ImageFilter.GaussianBlur(r)), dtype=np.float64) / 255
        col = b[..., :3] / np.maximum(b[..., 3:], 1e-4)
        need = (1 - filled) * (b[..., 3:] > 0.02)
        out += col * need; filled += need
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), "RGB")

def on_canvas(size):
    # logo of `size` px centred on an N px transparent canvas, then edge-filled
    c = Image.new("RGBA", (N, N)); o = (N - size) // 2
    c.alpha_composite(logo.resize((size, size), Image.LANCZOS), (o, o))
    return edge_fill(c)

icon = on_canvas(N)
icon.save(f"{root}/assets/icon.png")
icon.resize((48, 48), Image.LANCZOS).save(f"{root}/assets/favicon.png")

# adaptive foreground: launchers show only the centre 72/108 of the canvas,
# so size the logo so ~92% of it lands inside that window
# outer margin: the square icon's edge pixels stretched outwards and blurred
k = round(N * (72/108) / 0.92); small = icon.resize((k, k), Image.LANCZOS); o = (N - k) // 2
pad = np.pad(np.asarray(small), ((o, N-k-o), (o, N-k-o), (0, 0)), mode="edge")
fg = Image.fromarray(pad).filter(ImageFilter.GaussianBlur(24)); fg.paste(small, (o, o))
fg.save(f"{root}/assets/adaptive-icon.png")

# splash: the rounded logo itself, transparency kept
logo.resize((N, N), Image.LANCZOS).save(f"{root}/assets/splash-icon.png")
print("ok")
