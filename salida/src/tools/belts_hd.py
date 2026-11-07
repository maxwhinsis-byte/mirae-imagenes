"""Ricostruisce in alta risoluzione (1200 px, PNG trasparente) i ritagli di cinture del repo di Lucho.
Le cinture a tinta unita/con riga sono ridisegnate (stesso disegno e colori campionati dai ritagli);
la mimetica usa la texture originale ingrandita e ripulita; i Tigers sono ingranditi con Lanczos + nitidezza."""
import sys, os, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

REPO, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SS = 4                      # supersampling
W, H = 1200, 290            # output
w, h = W * SS, H * SS
BORDER = 7 * SS
R = 14 * SS

COL = {"bianca": "#FEFEFE", "arancione": "#FD661A", "gialla": "#FFF565", "mimetica": "#646D4A",
       "verde": "#03A74D", "viola": "#762995", "blu": "#0153A8", "marrone": "#834B1F", "rossa": "#FD1624",
       "nera": "#121215"}
SRC = {"bianca": "01_blanco", "arancione": "02_naranja", "gialla": "03_amarillo", "mimetica": "04_camuflado",
       "verde": "05_verde", "viola": "06_violeta", "blu": "07_azul", "marrone": "08_marron", "rossa": "09_rojo"}

def hx(c): return tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
def shade(c, f): return tuple(max(0, min(255, int(v * f))) for v in c)

def camo_texture():
    a = Image.open(f"{REPO}/cinturones/colores/04_camuflado_liso.png").convert("RGB")
    a = a.crop((3, 6, a.width - 4, a.height - 6))
    big = a.resize((w, h), Image.LANCZOS).filter(ImageFilter.MedianFilter(9 * 1))
    # posterizza ai 4 colori della mimetica per bordi puliti
    pal = np.array([[47, 58, 34], [96, 106, 66], [198, 173, 140], [70, 46, 40]])
    arr = np.array(big.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(3))).astype(int)
    d = ((arr[:, :, None, :] - pal[None, None]) ** 2).sum(-1)
    idx = d.argmin(-1)
    img = Image.fromarray(pal[idx].astype(np.uint8)).filter(ImageFilter.ModeFilter(7))
    return img.resize((w, h), Image.NEAREST).filter(ImageFilter.GaussianBlur(SS * 0.8))

def belt(name, kind="liso", dan=None):
    base = hx(COL.get(name, "#121215"))
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), R, fill=255)
    body = Image.new("RGBA", (w, h), base + (255,))
    if name == "mimetica":
        body = camo_texture().convert("RGBA")
    if name == "rossanera":
        body = Image.new("RGBA", (w, h), hx("#121215") + (255,))
        ImageDraw.Draw(body).rectangle((0, h // 2, w, h), fill=hx("#DB121F") + (255,))
    d = ImageDraw.Draw(body)
    if kind == "liso" and name not in ("nera", "rossanera"):
        lc = shade(base, 0.72) if name != "bianca" else (200, 198, 192)
        for k in (1, 2):
            y = int(h * k / 3)
            d.rectangle((0, y - 3 * SS, w, y + 3 * SS), fill=lc + (255,))
    if kind == "riga":
        d.rectangle((0, int(h / 3), w, int(2 * h / 3)), fill=(14, 14, 17, 255))
    if name == "nera":
        for k in (1, 2):
            y = int(h * k / 3)
            d.rectangle((0, y - 2 * SS, w, y + 2 * SS), fill=(4, 4, 6, 255))
    # lucentezza leggera
    hl = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(hl).rectangle((0, 0, w, int(h * 0.18)), fill=(255, 255, 255, 34))
    ImageDraw.Draw(hl).rectangle((0, int(h * 0.82), w, h), fill=(0, 0, 0, 40))
    body = Image.alpha_composite(body, hl)
    if dan:
        g = (232, 190, 40, 255)
        sq = int(h * 0.56); x0 = int(w * 0.76); y0 = (h - sq) // 2
        d = ImageDraw.Draw(body)
        d.rectangle((x0, y0, x0 + sq, y0 + sq), outline=g, width=5 * SS)
        try:
            f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", int(sq * 0.62))
        except OSError:
            f = ImageFont.load_default()
        txt = "I" * dan if dan <= 3 else ["IV", "V", "VI", "VII", "VIII", "IX"][dan - 4]
        bb = d.textbbox((0, 0), txt, font=f)
        d.text((x0 + (sq - (bb[2] - bb[0])) / 2 - bb[0], y0 + (sq - (bb[3] - bb[1])) / 2 - bb[1]), txt, font=f, fill=g)
    im.paste(body, (0, 0), mask)
    # contorno
    oc = (60, 58, 54, 255) if name == "bianca" else (10, 10, 12, 255)
    ImageDraw.Draw(im).rounded_rectangle((0, 0, w - 1, h - 1), R, outline=oc, width=BORDER)
    return im.resize((W, H), Image.LANCZOS)

made = []
for n in list(SRC) :
    for k in ("liso", "riga"):
        p = f"{OUT}/{n}_{'raccomandato' if k == 'liso' else 'deciso'}.png"
        belt(n, k).save(p, optimize=True); made.append(p)
belt("rossanera").save(f"{OUT}/rossanera_1dan_raccomandato.png", optimize=True)
belt("nera").save(f"{OUT}/nera.png", optimize=True)
for n in (1, 2, 3):
    belt("nera", dan=n).save(f"{OUT}/nera_{n}dan.png", optimize=True)
# Tigers: upscale dei ritagli originali
os.makedirs(f"{OUT}/tigers", exist_ok=True)
for f in sorted(glob.glob(f"{REPO}/cinturones/tigers/completos/*.png")):
    a = Image.open(f).convert("RGBA")
    big = a.resize((a.width * 5, a.height * 5), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2.5, percent=110, threshold=2))
    big.save(f"{OUT}/tigers/{os.path.basename(f)}", optimize=True)
for f in sorted(glob.glob(f"{REPO}/cinturones/tigers/animal_y_linea_lisa/*.png")):
    a = Image.open(f).convert("RGBA")
    big = a.resize((a.width * 6, a.height * 6), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2.5, percent=110, threshold=2))
    big.save(f"{OUT}/tigers/animale_{os.path.basename(f)}", optimize=True)
print("ok")
