// SVG illustrations: belts, dobok collars, sleeve chevrons, star
const sharp = require("sharp");
const png = async (svg, w) => "image/png;base64," + (await sharp(Buffer.from(svg)).resize({ width: w }).png().toBuffer()).toString("base64");

function belt({ base, stripe, split, camo, outline }) {
  const fillA = camo ? "url(#camo)" : base;
  const sc = outline ? "#B9B2A3" : "rgba(0,0,0,0.35)";
  const camoDef = camo ? `<pattern id="camo" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#55663A"/><path d="M5 10 q10-8 20 2 t15 10 q-8 10-20 4 t-15-16z" fill="#2F3A22"/><path d="M35 35 q12-6 20 4 q-4 12-16 8 q-10-2-4-12z" fill="#8A7650"/><path d="M0 45 q8-6 14 2 q-2 9-10 8z" fill="#8A7650"/><path d="M40 0 q8 4 4 12 q-8 2-10-4z" fill="#2F3A22"/></pattern>` : "";
  const band = `<rect x="0" y="45" width="400" height="46" rx="6" fill="${fillA}" stroke="${sc}" stroke-width="2"/>`;
  const lt = [[172, 88], [206, 88], [150, 240], [112, 232]], rt = [[196, 88], [230, 88], [292, 232], [254, 240]];
  const poly = (p, f) => `<polygon points="${p.map(q => q.join(",")).join(" ")}" fill="${f}" stroke="${sc}" stroke-width="2" stroke-linejoin="round"/>`;
  let s = band + poly(lt, fillA) + poly(rt, fillA);
  if (split) {
    s += `<rect x="1" y="68" width="398" height="22" fill="${split}"/>`;
    s += poly([[189, 88], [206, 88], [150, 240], [131, 236]], split) + poly([[213, 88], [230, 88], [292, 232], [273, 236]], split);
  }
  if (stripe) {
    s += `<rect x="1" y="61" width="398" height="14" fill="${stripe}"/>`;
    s += `<line x1="189" y1="90" x2="131" y2="236" stroke="${stripe}" stroke-width="13"/><line x1="213" y1="90" x2="273" y2="236" stroke="${stripe}" stroke-width="13"/>`;
  }
  // shading
  s += `<rect x="1" y="48" width="398" height="6" fill="rgba(255,255,255,0.22)"/><rect x="1" y="80" width="398" height="10" fill="rgba(0,0,0,0.14)"/>`;
  // knot
  s += `<rect x="160" y="32" width="80" height="72" rx="12" fill="${fillA}" stroke="${sc}" stroke-width="2"/>`;
  if (split) s += `<path d="M161 68 h78 v24 q0 11-12 11 h-54 q-12 0-12-11z" fill="${split}"/>`;
  if (stripe) s += `<rect x="161" y="61" width="78" height="14" fill="${stripe}"/>`;
  s += `<path d="M168 40 L232 96 M232 40 L168 96" stroke="rgba(0,0,0,0.22)" stroke-width="5" stroke-linecap="round"/><rect x="160" y="32" width="80" height="72" rx="12" fill="none" stroke="${sc}" stroke-width="2"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="800" height="500"><defs>${camoDef}</defs>${s}</svg>`;
}

// polyline offset (for side-by-side collar stripes)
function offset(pts, d) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const n = [];
    for (const j of [i - 1, i]) {
      if (j < 0 || j + 1 >= pts.length) continue;
      const [x1, y1] = pts[j], [x2, y2] = pts[j + 1], L = Math.hypot(x2 - x1, y2 - y1);
      n.push([-(y2 - y1) / L, (x2 - x1) / L]);
    }
    let nx = n.reduce((a, b) => a + b[0], 0) / n.length, ny = n.reduce((a, b) => a + b[1], 0) / n.length;
    const L = Math.hypot(nx, ny); nx /= L; ny /= L;
    const k = n.length === 2 ? 1 / (n[0][0] * nx + n[0][1] * ny) : 1;
    out.push([pts[i][0] + nx * d * k, pts[i][1] + ny * d * k]);
  }
  return out;
}
function dobok(stripes) {
  // stripes: array of colors from outer edge to inner edge
  const body = `<path d="M150 40 L60 70 L16 210 L66 228 L92 150 L92 340 L308 340 L308 150 L334 228 L384 210 L340 70 L250 40 Z" fill="#F7F6F1" stroke="#C9C4B8" stroke-width="3" stroke-linejoin="round"/>
  <path d="M200 175 L262 340" stroke="#D9D5CB" stroke-width="3"/><path d="M92 250 L308 250" stroke="#E4E0D6" stroke-width="2"/>`;
  const V = [[143, 42], [200, 190], [257, 42]];
  const W = 34, n = stripes.length, sw = W / n;
  let c = "";
  stripes.forEach((col, i) => {
    const d = -W / 2 + sw * (i + 0.5);
    const p = offset(V, d);
    c += `<polyline points="${p.map(q => q.map(v => v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${col}" stroke-width="${sw + 0.6}" stroke-linejoin="miter" stroke-miterlimit="10"/>`;
  });
  const neck = `<path d="M143 42 Q200 8 257 42" fill="none" stroke="${stripes[0]}" stroke-width="${W}" stroke-linecap="butt"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 350" width="800" height="700">${body}${neck}${c}<polyline points="${offset(V, -W / 2).map(q => q.join(",")).join(" ")}" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/></svg>`;
}
function sleeve(col) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="600" height="400"><path d="M20 30 L250 10 Q290 100 250 190 L20 170 Q0 100 20 30 Z" fill="#F7F6F1" stroke="#C9C4B8" stroke-width="3"/><path d="M150 18 L170 16 Q205 100 170 184 L150 182 Q185 100 150 18 Z" fill="${col}" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/><path d="M240 12 Q275 100 240 188" stroke="#D9D5CB" stroke-width="3" fill="none"/></svg>`;
}
function star(stroke, fill, dot) {
  const pts = "300.0,50.0 345.9,189.1 476.8,123.2 410.9,254.1 550.0,300.0 410.9,345.9 476.8,476.8 345.9,410.9 300.0,550.0 254.1,410.9 123.2,476.8 189.1,345.9 50.0,300.0 189.1,254.1 123.2,123.2 254.1,189.1";
  const outer = [[300, 50], [476.8, 123.2], [550, 300], [476.8, 476.8], [300, 550], [123.2, 476.8], [50, 300], [123.2, 123.2]];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="1200" height="1200"><circle cx="300" cy="300" r="250" fill="none" stroke="${stroke}" stroke-width="5"/><polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/><circle cx="300" cy="300" r="13" fill="${dot}"/>${outer.map(([a, b]) => `<circle cx="${a}" cy="${b}" r="10" fill="${dot}"/>`).join("")}</svg>`;
}
module.exports = { png, belt, dobok, sleeve, star };
