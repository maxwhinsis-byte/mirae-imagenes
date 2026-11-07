"""Vettorizza il logo ufficiale della stella Songahm (PNG 497px di atamartialarts.com) in SVG pulito."""
import sys, numpy as np, potrace
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
a = np.array(Image.open(src).convert("RGBA")).astype(int)
r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3] > 128
masks = [
    ("#231F20", al),
    ("#0066B3", (b > 150) & (r < 50)),
    ("#ED1C24", (r > 200) & (g < 60) & (b < 80)),
    ("#FFF200", (r > 200) & (g > 200) & (b < 60)),
    ("#00A651", (g > 130) & (r < 50) & (b < 120)),
    ("#FFFFFF", (r > 225) & (g > 225) & (b > 225) & al),
]
H, W = al.shape
paths = []
for col, m in masks:
    bmp = potrace.Bitmap(~m)
    pl = bmp.trace(turdsize=8, alphamax=0.0, opticurve=False)
    d = []
    for c in pl:
        s = c.start_point; d.append(f"M{s.x:.2f},{s.y:.2f}")
        for seg in c.segments:
            if seg.is_corner:
                d.append(f"L{seg.c.x:.2f},{seg.c.y:.2f}L{seg.end_point.x:.2f},{seg.end_point.y:.2f}")
            else:
                d.append(f"C{seg.c1.x:.2f},{seg.c1.y:.2f} {seg.c2.x:.2f},{seg.c2.y:.2f} {seg.end_point.x:.2f},{seg.end_point.y:.2f}")
        d.append("Z")
    paths.append(f'<path fill="{col}" fill-rule="evenodd" d="{"".join(d)}"/>')
open(out, "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">' + "".join(paths) + "</svg>")
print("ok", out)
