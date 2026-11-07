"""Mappa delle due sedi MIRAE da tile OpenStreetMap (© OpenStreetMap contributors, ODbL).
Uscita: assets/mappa/mappa_sedi.png (1320x1320) + mappa_sedi.json (posizioni dei marcatori in frazioni 0..1)."""
import math, io, json, time, sys, urllib.request
from PIL import Image, ImageDraw, ImageEnhance, ImageOps
OUT = sys.argv[1]
Z, SIZE = 15, 1320
UA = "MiraePresentazioneScolastica/1.0 (educational school project)"
SEDI = {"bdc": (-34.8753106, -56.0294706),   # Tacuarí 1084 esq. Rivera (Nominatim + localizzatore ATA)
        "shangrila": (-34.8474788, -55.9979273)}  # centro del barrio (indirizzo esatto non noto)
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
sx, sy = (pts["shangrila"][0] - x0) * S, (pts["shangrila"][1] - y0) * S
r = 120 * S
d.ellipse((sx - r, sy - r, sx + r, sy + r), fill=(212, 162, 69, 60))
for a in range(0, 360, 12):   # cerchio tratteggiato
    d.arc((sx - r, sy - r, sx + r, sy + r), a, a + 7, fill=gold, width=6 * S)
d.ellipse((sx - 16 * S, sy - 16 * S, sx + 16 * S, sy + 16 * S), fill=gold, outline=night, width=4 * S)
bx, by = (pts["bdc"][0] - x0) * S, (pts["bdc"][1] - y0) * S
R = 30 * S   # spillo
d.ellipse((bx - R, by - 2.6 * R, bx + R, by - 0.6 * R), fill=gold, outline=night, width=4 * S)
d.polygon([(bx - R * 0.78, by - 1.25 * R), (bx + R * 0.78, by - 1.25 * R), (bx, by)], fill=gold)
d.line([(bx - R * 0.78, by - 1.25 * R), (bx, by), (bx + R * 0.78, by - 1.25 * R)], fill=night, width=4 * S)
d.ellipse((bx - R * 0.38, by - 1.98 * R, bx + R * 0.38, by - 1.22 * R), fill=night)
ov = ov.resize((SIZE, SIZE), Image.LANCZOS)
img = Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB")
img.save(f"{OUT}/mappa_sedi.png", optimize=True)
json.dump({"shangrila": [(pts["shangrila"][0] - x0) / SIZE, (pts["shangrila"][1] - y0) / SIZE, 120 / SIZE],
           "bdc": [(pts["bdc"][0] - x0) / SIZE, (pts["bdc"][1] - y0) / SIZE, 30 * 2.6 / SIZE]},
          open(f"{OUT}/mappa_sedi.json", "w"), indent=1)
print("ok")
