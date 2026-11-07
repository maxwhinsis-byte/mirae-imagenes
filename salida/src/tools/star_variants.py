"""Dal tracciato vettoriale crea: stella a colori, versione per fondi scuri (contorno oro), versione monocromatica oro."""
import sys, re
svg = open(sys.argv[1]).read()
out = sys.argv[2]
dot = '<circle cx="249.3" cy="245.2" r="10.2" fill="#231F20"/>'
paths = re.findall(r'<path [^>]+/>', svg)
head = re.match(r'<svg[^>]+>', svg).group(0)
def build(cols, base_extra=""):
    ps = []
    for i, p in enumerate(paths):
        p = re.sub(r'fill="[^"]+"', f'fill="{cols[i]}"', p)
        if i == 0 and base_extra: p = p.replace("<path ", f"<path {base_extra} ")
        ps.append(p)
    d = dot.replace("#231F20", cols[6])
    return head + "".join(ps) + d + "</svg>"
std = ["#231F20", "#0066B3", "#ED1C24", "#FFF200", "#00A651", "#FFFFFF", "#231F20"]
open(f"{out}/stella_songahm.svg", "w").write(build(std))
open(f"{out}/stella_songahm_fondo_scuro.svg", "w").write(build(std, 'stroke="#D4A245" stroke-width="4" stroke-linejoin="miter"'))
gold = ["#6E5523", "#D4A245", "#D4A245", "#D4A245", "#D4A245", "#F4E4B8", "#6E5523"]
open(f"{out}/stella_songahm_oro.svg", "w").write(build(gold))
print("ok")
