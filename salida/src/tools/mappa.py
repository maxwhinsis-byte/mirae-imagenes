"""Mappa delle due sedi MIRAE da tile OpenStreetMap (© OpenStreetMap contributors, ODbL).
Uscita: assets/mappa/mappa_sedi.png (1320x1320) + mappa_sedi.json (posizioni dei marcatori in frazioni 0..1)."""
import math, io, json, time, sys, urllib.request
from PIL import Image, ImageDraw, ImageEnhance, ImageOps
OUT = sys.argv[1]
Z, SIZE = 15, 1320
UA = "MiraePresentazioneScolastica/1.0 (educational school project)"
SEDI = {"bdc": (-34.8753106, -56.0294706),   # Tacuarí 1084 esq. Rivera (Nominatim + localizzatore ATA)
        "shangrila": (-34.8482832, -56.0032513)}  # Av. Calcagno M12 S6 (scheda Google Maps “ATA Mirae artes marciales shangrila”)
def px(lat, lon):
    n = 2 ** Z * 256
    x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y
pts = {k: px(*v) for k, v in SEDI.items()}
cx = sum(p[0] for p in pts.values()) / 2; cy = sum(p[1] for p in pts.values()) / 2
x0, y0 = cx - SIZE / 2, cy - SIZE / 2
canvas = Image.new("RGB", (SIZE, SIZE))
for tx in range(int(x0 // 256), int((x0 + SIZE) // 256) + 1):
    for ty in range(int(y0 // 256), int((y0 + SIZE) // 256) + 1):
        req = urllib.request.Request(f"https://tile.openstreetmap.org/{Z}/{tx}/{ty}.png", headers={"User-Agent": UA})
        tile = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=30).read())).convert("RGB")
        canvas.paste(tile, (int(tx * 256 - x0), int(ty * 256 - y0)))
        time.sleep(0.15)
canvas.save(f"{OUT}/mappa_sedi_originale.png")
# stile: desaturato e intonato alla palette “pino e oro”
g = ImageOps.grayscale(canvas)
duo = ImageOps.colorize(g, black="#0C1D18", white="#F1EFE9", mid="#9DB0A8")
img = Image.blend(duo, canvas, 0.25)
img = ImageEnhance.Contrast(img).enhance(1.05)
# marcatori (supersampling per bordi puliti)
S = 3
ov = Image.new("RGBA", (SIZE * S, SIZE * S), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
gold, night = (212, 162, 69, 255), (12, 29, 24, 255)
def pin(d, bx, by, R):
    d.ellipse((bx - R, by - 2.6 * R, bx + R, by - 0.6 * R), fill=gold, outline=night, width=4 * S)
    d.polygon([(bx - R * 0.78, by - 1.25 * R), (bx + R * 0.78, by - 1.25 * R), (bx, by)], fill=gold)
    d.line([(bx - R * 0.78, by - 1.25 * R), (bx, by), (bx + R * 0.78, by - 1.25 * R)], fill=night, width=4 * S)
    d.ellipse((bx - R * 0.38, by - 1.98 * R, bx + R * 0.38, by - 1.22 * R), fill=night)
pin(d, (pts["shangrila"][0] - x0) * S, (pts["shangrila"][1] - y0) * S, 30 * S)
bx, by = (pts["bdc"][0] - x0) * S, (pts["bdc"][1] - y0) * S
pin(d, bx, by, 30 * S)
ov = ov.resize((SIZE, SIZE), Image.LANCZOS)
img = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")
img.save(f"{OUT}/mappa_sedi.png", optimize=True)
json.dump({"shangrila": [(pts["shangrila"][0] - x0) / SIZE, (pts["shangrila"][1] - y0) / SIZE, 30 * 2.6 / SIZE],
           "bdc": [(pts["bdc"][0] - x0) / SIZE, (pts["bdc"][1] - y0) / SIZE, 30 * 2.6 / SIZE]},
          open(f"{OUT}/mappa_sedi.json", "w"), indent=1)
print("ok")

# --- primo piano (zoom 18) di ogni sede, da usare come “foto” della sede quando manca la foto reale
def closeup(key, W=1520, H=970, Zc=18):
    global Z
    Zs, Z = Z, Zc
    x, y = px(*SEDI[key]); X0, Y0 = x - W / 2, y - H * 0.58
    c = Image.new("RGB", (W, H))
    for tx in range(int(X0 // 256), int((X0 + W) // 256) + 1):
        for ty in range(int(Y0 // 256), int((Y0 + H) // 256) + 1):
            req = urllib.request.Request(f"https://tile.openstreetmap.org/{Zc}/{tx}/{ty}.png", headers={"User-Agent": UA})
            t = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=30).read())).convert("RGB")
            c.paste(t, (int(tx * 256 - X0), int(ty * 256 - Y0))); time.sleep(0.15)
    Z = Zs
    g2 = ImageOps.colorize(ImageOps.grayscale(c), black="#0C1D18", white="#F1EFE9", mid="#9DB0A8")
    m = Image.blend(g2, c, 0.25).convert("RGBA")
    o = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0)); dd = ImageDraw.Draw(o)
    pin(dd, (x - X0) * S, (y - Y0) * S, 46 * S)
    m = Image.alpha_composite(m, o.resize((W, H), Image.LANCZOS)).convert("RGB")
    m.save(f"{OUT}/primo_piano_{key}.jpg", quality=90)
for k in SEDI: closeup(k)
print("primi piani ok")
