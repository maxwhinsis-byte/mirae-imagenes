"""Logo MIRAE: ritaglio circolare dalla foto (fondo grigio) e vettorializzazione (bianco, nero, rosso)."""
import sys, numpy as np, potrace
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
CX, CY, R = 602.5, 559.5, 397.5          # cerchio esterno misurato sulla foto
UP = 3
im = Image.open(src).convert("RGB").crop((CX - R, CY - R, CX + R, CY + R))
D = int(round(2 * R))
big = im.resize((D * UP, D * UP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
a = np.array(big).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
yy, xx = np.mgrid[0:D * UP, 0:D * UP]
inside = (xx - D * UP / 2) ** 2 + (yy - D * UP / 2) ** 2 < (R * UP - 3 * UP) ** 2
red = (r > 140) & (g < 110) & (b < 110) & inside
black = (r + g + b < 3 * 115) & ~red & inside
def trace(m):
    pl = potrace.Bitmap(~m).trace(turdsize=30, alphamax=1.0, opticurve=True, opttolerance=0.3)
    d = []
    for c in pl:
        s = c.start_point; d.append(f"M{s.x / UP:.2f},{s.y / UP:.2f}")
        for seg in c.segments:
            if seg.is_corner:
                d.append(f"L{seg.c.x / UP:.2f},{seg.c.y / UP:.2f}L{seg.end_point.x / UP:.2f},{seg.end_point.y / UP:.2f}")
            else:
                d.append(f"C{seg.c1.x / UP:.2f},{seg.c1.y / UP:.2f} {seg.c2.x / UP:.2f},{seg.c2.y / UP:.2f} {seg.end_point.x / UP:.2f},{seg.end_point.y / UP:.2f}")
        d.append("Z")
    return "".join(d)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {D} {D}">'
       f'<circle cx="{D / 2}" cy="{D / 2}" r="{R - 0.5}" fill="#FFFFFF"/>'
       f'<path fill="#111111" fill-rule="evenodd" d="{trace(black)}"/>'
       f'<path fill="#D9261C" fill-rule="evenodd" d="{trace(red)}"/></svg>')
open(f"{out}/logo_mirae.svg", "w").write(svg)
# campionamento del rosso reale per riferimento
print("rosso medio", np.array(big)[red].mean(0).astype(int), "ok")
