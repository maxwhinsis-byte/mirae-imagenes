const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const A = require("./art");
const N = require("./notes.json");
const fs = require("fs");
const path = require("path");
const { applyTheme } = require("./apply_theme.js");
const ASSETS = path.join(__dirname, "..", "assets");

// Palette: pino (verde notte) · oro · pietra
const NIGHT = "0C1D18", CARD = "173A30", CARD2 = "1F4A3D", GOLD = "D4A245", GOLD2 = "E9C46A";
const STONE = "F1EFE9", WHITE = "FAF9F6", LINE = "D8D4C8", ML = "4C5A55", MD = "A9BDB5", GREY = "7F948C";
const HEAD = "Arial", BODY = "Calibri";
const W = 13.333, M = 0.7, CW = W - 2 * M;
const OUT = path.join(__dirname, "..", "Taekwondo_Songahm_Scuola_Lavoro.pptx");

const THEME = { name: "Songahm Pino e Oro", headFontFace: HEAD, bodyFontFace: BODY,
  colors: { dk1: NIGHT, lt1: WHITE, dk2: CARD, lt2: STONE, accent1: GOLD, accent2: CARD2, accent3: GOLD2, accent4: "2C5AA0", accent5: "B32B22", accent6: "6B3FA0", hlink: "2C5AA0", folHlink: "6B3FA0" } };

async function icon(Comp, color) {
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: 256 }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

// Immagini da file (assets/): data URI + proporzioni reali, per non deformare mai
async function file(rel) {
  const buf = fs.readFileSync(path.join(ASSETS, rel));
  const m = await sharp(buf).metadata();
  return { data: `image/${m.format === "jpeg" ? "jpeg" : "png"};base64,` + buf.toString("base64"), ar: m.width / m.height };
}
const BELT_KEYS = ["bianca", "arancione", "gialla", "mimetica", "verde", "viola", "blu", "marrone", "rossa"];
const TIGER_FILES = ["01_blanco", "02_naranja", "03_amarillo", "04_camuflado", "05_verde", "06_violeta", "07_azul", "08_marron", "09_rojo"];

(async () => {
  const img = {};
  for (const k of BELT_KEYS) { img[k] = await file(`cinturones_hd/${k}_raccomandato.png`); img[k + "D"] = await file(`cinturones_hd/${k}_deciso.png`); }
  img.nera = await file("cinturones_hd/nera.png"); img.nera2 = await file("cinturones_hd/nera_2dan.png");
  img.rossaNera = await file("cinturones_hd/rossanera_1dan_raccomandato.png");
  img.tig = []; for (const t of TIGER_FILES) img.tig.push(await file(`cinturones_hd/tigers/animale_${t}.png`));
  img.star = await file("stella/stella_songahm_2400.png");          // logo ufficiale ATA, vettorializzato
  img.starD = await file("stella/stella_songahm_fondo_scuro_2400.png"); // con contorno oro per fondi scuri
  img.starW = await file("stella/stella_songahm_filigrana_2400.png");  // monocromatica oro, opacità 16% (filigrana)
  const RC = "#C0392B", BK = "#121212";
  img.c1 = await A.png(A.dobok([RC]), 1200); img.c2 = await A.png(A.dobok([RC, BK]), 1200);
  img.c3 = await A.png(A.dobok([RC, BK, RC]), 1200); img.c4 = await A.png(A.dobok([BK]), 1200);
  img.s1 = await A.png(A.sleeve("#2C5AA0"), 1000); img.s2 = await A.png(A.sleeve("#C0392B"), 1000); img.s3 = await A.png(A.sleeve("#151515"), 1000);

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = "Taekwondo Songahm – Scuola-Lavoro";
  pres.author = "Luciano Moreno";
  pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };

  for (const [name, bg, eyeC, titleC, numC] of [["DARK", NIGHT, GOLD, WHITE, GREY], ["LIGHT", STONE, "9A7420", NIGHT, "8A8778"]]) {
    pres.defineSlideMaster({ title: name, background: { color: bg },
      objects: [
        { placeholder: { options: { name: "eyebrow", type: "body", x: M, y: 0.5, w: CW, h: 0.32, fontFace: BODY, fontSize: 13, bold: true, color: eyeC, charSpacing: 3, margin: 0, valign: "top" }, text: "" } },
        { placeholder: { options: { name: "title", type: "title", x: M, y: 0.82, w: CW, h: 0.85, fontFace: HEAD, fontSize: 36, bold: true, color: titleC, margin: 0, valign: "top", align: "left" }, text: "" } },
      ],
      slideNumber: { x: W - M - 1, y: 6.92, w: 1, h: 0.3, fontFace: BODY, fontSize: 11, color: numC, align: "right" } });
  }

  const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: BODY, valign: "top" }, o));
  const foot = (s, text, dark) => T(s, text, { x: M, y: 6.92, w: 9.5, h: 0.3, fontSize: 11, color: dark ? GREY : "8A8778" });
  // Spazio da completare (foto/video di Lucho): bordo tratteggiato ORO, così si vede subito cosa manca
  const ph = (s, label, x, y, w, h, dark = true) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: dark ? CARD : "ECE6D3" }, line: { color: GOLD, width: 1.75, dashType: "dash" }, objectName: "Da completare" });
    T(s, label, { x: x + 0.2, y, w: w - 0.4, h, fontSize: 14, italic: true, color: dark ? GOLD2 : "8A6A1E", align: "center", valign: "middle" });
  };
  // Foto di Lucho: se esiste fotos/<chiave>.(jpg|jpeg|png|webp) nel repo la usa (ritaglio “cover”, mai deformata);
  // altrimenti lascia il riquadro oro da completare. Elenco delle chiavi in fotos/LEEME.md
  const FOTOS = path.join(__dirname, "..", "..", "fotos");
  const findFoto = (key, exts = ["jpg", "jpeg", "png", "webp"]) => {
    for (const e of exts) for (const n of [key + "." + e, key + "." + e.toUpperCase()]) { const f = path.join(FOTOS, n); if (fs.existsSync(f)) return f; }
    return null;
  };
  const used = [];
  const slot = async (s, key, label, x, y, w, h, dark = true, mode = "cover", alt = label) => {
    const f = findFoto(key);
    if (!f) return ph(s, label, x, y, w, h, dark);
    const DPI = 220, W2 = Math.round(w * DPI), H2 = Math.round(h * DPI);
    const buf = mode === "contain"
      ? await sharp(f).rotate().resize(W2, H2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
      : await sharp(f).rotate().resize(W2, H2, { fit: "cover", position: "attention" }).jpeg({ quality: 85 }).toBuffer();
    used.push(path.basename(f));
    s.addImage({ data: (mode === "contain" ? "image/png" : "image/jpeg") + ";base64," + buf.toString("base64"), x, y, w, h, altText: alt.replace(/^\[|\]$/g, "").replace(/^FOTO( GRANDE)?: /, "") });
  };
  const card = (s, x, y, w, h, fill, line) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: line ? { color: line, width: line === GOLD ? 2.5 : 0.75 } : { type: "none" } });
  const pill = (s, text, x, y, w, fill, color) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.36, rectRadius: 0.18, fill: { color: fill }, line: { type: "none" } });
    T(s, text, { x, y, w, h: 0.36, fontSize: 12, bold: true, color, align: "center", valign: "middle", charSpacing: 2 });
  };
  const head = (s, e, t) => { s.addText(e.toUpperCase(), { placeholder: "eyebrow" }); s.addText(t.toUpperCase(), { placeholder: "title" }); };
  const pic = (s, im, x, y, w, h, alt) => s.addImage({ data: im.data || im, x, y, w, h, altText: alt });
  // inserisce un'immagine centrata nel riquadro, mantenendo le proporzioni
  const fit = (s, im, x, y, w, h, alt, extra = {}) => {
    let iw = w, ih = w / im.ar; if (ih > h) { ih = h; iw = h * im.ar; }
    s.addImage(Object.assign({ data: im.data, x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih, altText: alt }, extra));
  };
  const ALT_STAR = "Stella Songahm, emblema ufficiale dell’ATA";

  // ===== 1 COVER =====
  pres.addSection({ title: "Apertura" });
  let s = pres.addSlide({ sectionTitle: "Apertura" });
  s.background = { color: NIGHT };
  fit(s, img.starW, -1.9, 4.6, 5.2, 5.2, "");
  T(s, "ESAME DI STATO · PERCORSO SCUOLA-LAVORO (EX PCTO)", { x: M, y: 0.7, w: 6.4, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 3 });
  T(s, [{ text: "TAEKWONDO", options: { color: WHITE, breakLine: true } }, { text: "SONGAHM", options: { color: GOLD } }], { x: M, y: 1.55, w: 6.4, h: 2.5, fontFace: HEAD, fontSize: 62, bold: true, valign: "middle", lineSpacingMultiple: 0.95 });
  T(s, "Dall’allievo all’istruttore: la mia esperienza di lavoro in accademia", { x: M, y: 4.15, w: 5.6, h: 1.0, fontSize: 22, color: MD });
  const logoCover = findFoto("logo_mirae", ["png"]), lx = logoCover ? M + 1.1 : M;
  if (logoCover) await slot(s, "logo_mirae", "", M, 5.25, 0.9, 0.9, true, "contain", "Logo di MIRAE Artes Marciales");
  T(s, "LUCIANO MORENO", { x: lx, y: 5.3, w: 6.2 - (lx - M), h: 0.42, fontFace: HEAD, fontSize: 20, bold: true, color: WHITE, charSpacing: 2 });
  T(s, "Scuola Italiana di Montevideo · MIRAE Artes Marciales", { x: lx, y: 5.72, w: 6.2 - (lx - M), h: 0.6, fontSize: 14, color: MD });
  await slot(s, "portada", "[FOTO GRANDE: io in dobok mentre insegno, calcio alto o posizione di guardia]", 7.3, 0, 6.033, 7.5);
  s.addNotes(N.cover);

  // ===== 2 INDICE =====
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Apertura" });
  head(s, "Il percorso di oggi", "Quattro tappe, una crescita");
  [["01", "Chi sono", "Il mio ruolo, i livelli di istruttore e di giudice"], ["02", "Il Taekwondo Songahm", "Significato, origini, filosofia, gradi e discipline"], ["03", "La mia esperienza", "MIRAE: cosa faccio e come insegno"], ["04", "Bilancio", "Competenze, cambiamento personale e collegamenti"]].forEach(([n, t, d], i) => {
    const x = M + i * ((CW - 0.75) / 4 + 0.25), w = (CW - 0.75) / 4;
    card(s, x, 2.0, w, 4.35, i === 0 ? NIGHT : WHITE, i === 0 ? null : LINE);
    T(s, n, { x: x + 0.35, y: 2.3, w: w - 0.7, h: 1.2, fontFace: HEAD, fontSize: 60, bold: true, color: i === 0 ? GOLD : "B89035" });
    T(s, t.toUpperCase(), { x: x + 0.35, y: 3.65, w: w - 0.7, h: 1.1, fontFace: HEAD, fontSize: 20, bold: true, color: i === 0 ? WHITE : NIGHT });
    T(s, d, { x: x + 0.35, y: 4.9, w: w - 0.7, h: 1.2, fontSize: 15, color: i === 0 ? MD : ML });
  });
  foot(s, "Luciano Moreno · Taekwondo Songahm · Scuola-Lavoro", false);
  s.addNotes(N.indice);

  // ===== 3 PROFILO =====
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Apertura" });
  head(s, "01 · Chi sono", "Da allievo a istruttore");
  await slot(s, "cintura_nera", "[FOTO: io con la cintura nera, con una medaglia o con la Nazionale ATA Uruguay]", M, 1.95, 3.5, 4.7, false);
  const gx = 4.6, gw = (W - M - gx - 0.3) / 2;
  [["2019", "Inizio ad allenarmi alla MIRAE"], ["5–6", "giorni di allenamento a settimana, 1–2 ore al giorno"], ["2º Dan", "Cintura nera di secondo grado"], ["Liv. 2", "Istruttore certificato · Giudice di livello 1"]].forEach(([n, l], i) => {
    const x = gx + (i % 2) * (gw + 0.3), y = 1.95 + Math.floor(i / 2) * 1.6;
    card(s, x, y, gw, 1.4, WHITE, LINE);
    T(s, n, { x: x + 0.3, y: y + 0.2, w: gw - 0.6, h: 0.65, fontFace: HEAD, fontSize: 36, bold: true, color: "9A7420" });
    T(s, l, { x: x + 0.3, y: y + 0.85, w: gw - 0.6, h: 0.45, fontSize: 14, color: ML });
    if (i === 2) fit(s, img.nera2, x + gw - 1.75, y + 0.28, 1.45, 0.5, "La mia cintura nera di 2º Dan");
  });
  card(s, gx, 5.15, W - M - gx, 1.5, NIGHT);
  s.addImage({ data: await icon(fa.FaMedal, GOLD), x: gx + 0.35, y: 5.5, w: 0.75, h: 0.75, altText: "" });
  T(s, "NAZIONALE ATA URUGUAY", { x: gx + 1.4, y: 5.35, w: 6.4, h: 0.5, fontFace: HEAD, fontSize: 24, bold: true, color: GOLD2 });
  T(s, "Gare in Uruguay, Argentina, Brasile e Cile · podi al 1º, 2º e 3º posto", { x: gx + 1.4, y: 5.9, w: 6.4, h: 0.5, fontSize: 15, color: MD });
  foot(s, "Luciano Moreno · Taekwondo Songahm · Scuola-Lavoro", false);
  s.addNotes(N.profilo);

  // ===== 4 ISTRUTTORE =====
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "Apertura" });
  head(s, "01 · Livelli di istruttore", "Il colletto racconta il ruolo");
  const lv = [[img.c1, "Livello 1", "Colletto rosso", "Primo livello: guida esercizi e parti della lezione con supervisione."],
    [img.c2, "Livello 2", "Colletto rosso-nero", "Conduce classi complete e sostituisce l’istruttore principale.", true],
    [img.c3, "Livello 3", "Colletto rosso-nero-rosso", "Livello avanzato: più esperienza e più responsabilità in accademia."],
    [img.c4, "Livello 4", "Colletto nero", "Il livello più alto di certificazione da istruttore."]];
  const lw = (CW - 4 * 0.22) / 5;
  lv.forEach(([im, t, c, d, mine], i) => {
    const x = M + i * (lw + 0.22), y = 1.95;
    card(s, x, y, lw, 4.0, mine ? CARD2 : CARD, mine ? GOLD : null);
    pic(s, im, x + (lw - 1.55) / 2, y + 0.2, 1.55, 1.36, "Dobok con " + c.toLowerCase());
    T(s, t.toUpperCase(), { x: x + 0.22, y: y + 1.7, w: lw - 0.44, h: 0.42, fontFace: HEAD, fontSize: 20, bold: true, color: WHITE });
    T(s, c, { x: x + 0.22, y: y + 2.1, w: lw - 0.44, h: 0.32, fontSize: 14, bold: true, color: GOLD2 });
    T(s, d, { x: x + 0.22, y: y + 2.62, w: lw - 0.44, h: 0.9, fontSize: 14, color: mine ? WHITE : MD });
    if (mine) pill(s, "IL MIO LIVELLO", x + 0.22, y + 3.5, lw - 0.44, GOLD, NIGHT);
  });
  const mx = M + 4 * (lw + 0.22);
  card(s, mx, 1.95, lw, 4.0, NIGHT, "3D6A5C");
  fit(s, img.starD, mx + (lw - 1.3) / 2, 2.2, 1.3, 1.3, ALT_STAR);
  T(s, "MAESTRO", { x: mx + 0.22, y: 3.65, w: lw - 0.44, h: 0.42, fontFace: HEAD, fontSize: 20, bold: true, color: GOLD });
  T(s, "Dal 6º Dan", { x: mx + 0.22, y: 4.05, w: lw - 0.44, h: 0.32, fontSize: 14, bold: true, color: GOLD2 });
  T(s, "Titolo di Maestro dopo un anno di candidatura ed esami.", { x: mx + 0.22, y: 4.4, w: lw - 0.44, h: 1.0, fontSize: 14, color: MD });
  T(s, "Per diventare istruttore certificato: 2–3 anni di formazione, almeno 300 ore di insegnamento supervisionato, primo soccorso e tutela dei minori.", { x: M, y: 6.15, w: CW, h: 0.6, fontSize: 15, color: MD });
  foot(s, "Fonte: ATA Martial Arts, Legacy Academy · colori dei colletti come in uso alla MIRAE", true);
  s.addNotes(N.istruttore);

  // ===== 5 GIUDICE =====
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Apertura" });
  head(s, "01 · Livelli di giudice", "Tre galloni sulla manica");
  const jw = (CW - 2 * 0.35) / 3;
  [[img.s1, "Livello 1", "Giudice d’angolo", "Almeno 14 anni e 1º Dan. Giudica le gare delle cinture colorate.", "Gallone blu", true],
   [img.s2, "Livello 2", "Giudice centrale", "Almeno 16 anni. Dirige il quadrato delle cinture colorate e affianca nelle gare di cinture nere.", "Gallone rosso"],
   [img.s3, "Livello 3", "Giudice capo", "Almeno 18 anni e 2º Dan. Può dirigere anche le gare di cinture nere.", "Gallone nero"]].forEach(([im, t, r, d, g, mine], i) => {
    const x = M + i * (jw + 0.35), y = 1.95;
    card(s, x, y, jw, 4.1, mine ? NIGHT : WHITE, mine ? null : LINE);
    pic(s, im, x + 0.35, y + 0.3, 1.65, 1.1, "Manica con " + g.toLowerCase());
    T(s, g.toUpperCase(), { x: x + 2.15, y: y + 0.6, w: jw - 2.4, h: 0.5, fontSize: 12, bold: true, color: mine ? GOLD2 : "9A7420", charSpacing: 2, valign: "middle" });
    T(s, t.toUpperCase(), { x: x + 0.35, y: y + 1.65, w: jw - 0.7, h: 0.55, fontFace: HEAD, fontSize: 26, bold: true, color: mine ? WHITE : NIGHT });
    T(s, r, { x: x + 0.35, y: y + 2.2, w: jw - 0.7, h: 0.42, fontSize: 18, bold: true, color: mine ? GOLD2 : NIGHT });
    T(s, d, { x: x + 0.35, y: y + 2.7, w: jw - 0.7, h: 0.9, fontSize: 14, color: mine ? MD : ML });
    if (mine) pill(s, "IL MIO LIVELLO", x + 0.35, y + 3.55, 1.9, GOLD, NIGHT);
  });
  T(s, "Ogni certificazione vale un anno: esame online con almeno l’80% e clinic pratica con un istruttore.", { x: M, y: 6.25, w: CW, h: 0.45, fontSize: 15, color: ML });
  foot(s, "Fonte: regolamento ufficiale dei tornei ATA 2023–24", false);
  s.addNotes(N.giudice);

  // ===== divider helper =====
  const divider = (sec, num, title, sub, note) => {
    pres.addSection({ title: sec });
    const d = pres.addSlide({ sectionTitle: sec });
    d.background = { color: NIGHT };
    fit(d, img.starW, 7.6, 0.9, 5.7, 5.7, "");
    T(d, num, { x: M, y: 1.6, w: 4, h: 1.6, fontFace: HEAD, fontSize: 110, bold: true, color: GOLD });
    T(d, title.toUpperCase(), { x: M, y: 3.35, w: 7.2, h: 1.6, fontFace: HEAD, fontSize: 44, bold: true, color: WHITE });
    T(d, sub, { x: M, y: 5.0, w: 6.6, h: 0.9, fontSize: 18, color: MD });
    d.addNotes(note);
    return d;
  };

  // ===== 6 DIVIDER 02 =====
  divider("Il Taekwondo Songahm", "02", "Il Taekwondo Songahm", "Che cos’è, da dove viene, come si cresce di grado", N.divider02);

  // ===== 7 COSA E =====
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "Il Taekwondo Songahm" });
  head(s, "02 · Che cos’è", "Un’arte marziale coreana");
  const cw3 = (CW - 2 * 0.4) / 3;
  const tkd = [[fa.FaShoePrints, "TAE", "il piede, colpire con i calci"], [fa.FaFistRaised, "KWON", "il pugno, colpire con le mani"], [fa.FaRoute, "DO", "la via, un modo di vivere"]];
  for (let i = 0; i < 3; i++) {
    const [Ic, w_, m] = tkd[i], x = M + i * (cw3 + 0.4);
    card(s, x, 1.95, cw3, 2.15, CARD);
    s.addImage({ data: await icon(Ic, GOLD), x: x + 0.35, y: 2.25, w: 0.5, h: 0.5, altText: "" });
    T(s, w_, { x: x + 0.35, y: 2.8, w: cw3 - 0.7, h: 0.8, fontFace: HEAD, fontSize: 48, bold: true, color: WHITE, valign: "middle" });
    T(s, m, { x: x + 0.35, y: 3.6, w: cw3 - 0.7, h: 0.4, fontSize: 17, color: MD });
  }
  card(s, M, 4.4, CW, 1.95, GOLD);
  fit(s, img.star, M + 0.35, 4.6, 1.55, 1.55, ALT_STAR);
  T(s, "SONGAHM", { x: M + 2.2, y: 4.55, w: 3.0, h: 1.65, fontFace: HEAD, fontSize: 38, bold: true, color: NIGHT, valign: "middle" });
  T(s, [{ text: "significa " }, { text: "“pino e roccia”", options: { bold: true } }, { text: ": la forza sempreverde del pino e la stabilità della roccia. È lo stile tradizionale dell’ATA, con forme, regole e gradi uguali in tutto il mondo." }], { x: M + 5.3, y: 4.55, w: CW - 5.65, h: 1.65, fontSize: 17, color: NIGHT, valign: "middle" });
  foot(s, "Il Taekwondo Songahm", true);
  s.addNotes(N.cosa);

  // ===== 8 ORIGINI =====
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Il Taekwondo Songahm" });
  head(s, "02 · Da dove viene", "Dalla Corea a Montevideo");
  const ev = [["1936", "Nasce Haeng Ung Lee, il fondatore, in Manciuria"], ["1956", "Addestra le truppe speciali dell’esercito coreano"], ["1962", "Emigra negli Stati Uniti e apre una scuola in Nebraska"], ["1969", "Fonda a Omaha l’American Taekwondo Association"], ["1977", "La sede si sposta a Little Rock, Arkansas"], ["1983", "Registra il sistema Songahm Taekwondo"], ["1984", "Nasce la federazione Songahm per il Sud America"]];
  const ew = (CW - 6 * 0.2) / 7;
  s.addShape(pres.shapes.LINE, { x: M, y: 2.08, w: CW, h: 0, line: { color: "B8B3A5", width: 1.5 } });
  ev.forEach(([y_, t], i) => {
    const x = M + i * (ew + 0.2), last = i === 6;
    s.addShape(pres.shapes.OVAL, { x, y: 1.95, w: 0.26, h: 0.26, fill: { color: last ? CARD2 : GOLD }, line: { color: STONE, width: 2 } });
    T(s, y_, { x, y: 2.35, w: ew, h: 0.5, fontFace: HEAD, fontSize: 24, bold: true, color: last ? CARD2 : "9A7420" });
    T(s, t, { x, y: 2.9, w: ew, h: 1.4, fontSize: 14, color: ML });
  });
  const stats = [["300.000+", "membri attivi nel mondo, in oltre 21 Paesi", fa.FaGlobeAmericas], ["2000", "muore H.U. Lee, poi nominato “Eterno Gran Maestro”", fa.FaStar]];
  for (let i = 0; i < 2; i++) {
    const [n, l, Ic] = stats[i], w2 = (CW - 0.35) / 2, x = M + i * (w2 + 0.35);
    card(s, x, 4.65, w2, 1.75, NIGHT);
    s.addImage({ data: await icon(Ic, GOLD), x: x + 0.4, y: 5.2, w: 0.65, h: 0.65, altText: "" });
    T(s, n, { x: x + 1.35, y: 4.85, w: w2 - 1.7, h: 0.75, fontFace: HEAD, fontSize: 36, bold: true, color: GOLD2 });
    T(s, l, { x: x + 1.35, y: 5.65, w: w2 - 1.7, h: 0.5, fontSize: 15, color: MD });
  }
  foot(s, "Fonti: ATA Martial Arts, “Full ATA International History”; Wikipedia, “Haeng Ung Lee”", false);
  s.addNotes(N.origini);

  // ===== 9 FILOSOFIA =====
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "Il Taekwondo Songahm" });
  head(s, "02 · La filosofia", "Crescere come un pino");
  const rows = [["bianca", "BIANCA", "Il seme viene piantato: deve mettere radici forti."], ["mimetica", "MIMETICA", "Il giovane pino, nascosto tra gli alberi alti, lotta per farsi spazio."], ["blu", "VIOLA, BLU", "A metà crescita il cammino si fa più ripido."], ["marrone", "MARRONE", "L’albero è ben radicato: le basi sono acquisite."], ["nera", "NERA", "L’albero maturo pianta nuovi semi. È il ruolo dell’istruttore."]];
  rows.forEach(([b, l, t], i) => {
    const y = 1.95 + i * 0.86, last = i === 4;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: y + 0.08, w: 1.15, h: 0.7, rectRadius: 0.08, fill: { color: "DCE3DF" }, line: { type: "none" } });
    fit(s, img[b], M + 0.1, y + 0.13, 0.95, 0.6, "Cintura " + l.toLowerCase());
    T(s, l, { x: M + 1.3, y, w: 1.8, h: 0.86, fontFace: HEAD, fontSize: 17, bold: true, color: last ? GOLD2 : GOLD, valign: "middle" });
    T(s, t, { x: M + 3.15, y, w: 4.6, h: 0.86, fontSize: 15, bold: last, color: last ? WHITE : MD, valign: "middle" });
    if (!last) s.addShape(pres.shapes.LINE, { x: M, y: y + 0.86, w: 7.75, h: 0, line: { color: "2A4A40", width: 0.75 } });
  });
  fit(s, img.starD, 9.0, 1.85, 3.3, 3.3, "La stella Songahm, emblema ufficiale dell’ATA: un punto centrale e otto punte esterne");
  T(s, [{ text: "La stella Songahm: ", options: { bold: true, color: WHITE } }, { text: "le 18 forme disegnano una stella con un centro e otto punte. Unendo le punte nasce un cerchio, simbolo di equilibrio." }], { x: 8.6, y: 5.35, w: 4.03, h: 1.2, fontSize: 14, color: MD, align: "center" });
  foot(s, "Il Taekwondo Songahm", true);
  s.addNotes(N.filosofia);

  // ===== 10 CINTURE =====
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Il Taekwondo Songahm" });
  head(s, "02 · I gradi · cinture colorate", "Nove cinture, nove forme");
  const bl = [["bianca", "Bianca", "Songahm 1", 18, 9], ["arancione", "Arancione", "Songahm 2", 23, 8], ["gialla", "Gialla", "Songahm 3", 28, 7], ["mimetica", "Mimetica", "Songahm 4", 31, 6], ["verde", "Verde", "Songahm 5", 34, 5], ["viola", "Viola", "In Wha 1", 44, 4], ["blu", "Blu", "In Wha 2", 42, 3], ["marrone", "Marrone", "Choong Jung 1", 44, 2], ["rossa", "Rossa", "Choong Jung 2", 46, 1]];
  const bw = (CW - 4 * 0.2) / 5;
  bl.forEach(([k, n, f, mv, g], i) => {
    const x = M + (i % 5) * (bw + 0.2), y = 1.9 + Math.floor(i / 5) * 2.45;
    card(s, x, y, bw, 2.25, WHITE, LINE);
    fit(s, img[k], x + 0.22, y + 0.3, bw - 0.44, 0.7, "Cintura " + n.toLowerCase());
    T(s, `${g}º GRADO`, { x: x + 0.22, y: y + 1.27, w: bw - 0.44, h: 0.28, fontSize: 11, bold: true, color: "9A7420", charSpacing: 2 });
    T(s, n.toUpperCase(), { x: x + 0.22, y: y + 1.53, w: bw - 0.44, h: 0.35, fontFace: HEAD, fontSize: 17, bold: true, color: NIGHT });
    T(s, `${f} · ${mv} mov.`, { x: x + 0.22, y: y + 1.88, w: bw - 0.44, h: 0.3, fontSize: 13, color: ML });
  });
  const rx = M + 4 * (bw + 0.2), ry = 1.9 + 2.45;
  card(s, rx, ry, bw, 2.25, NIGHT);
  fit(s, img.verde, rx + 0.12, ry + 0.25, 0.95, 0.5, "Cintura verde raccomandato, tinta unita");
  fit(s, img.verdeD, rx + 1.16, ry + 0.25, 0.95, 0.5, "Cintura verde deciso, con riga nera");
  T(s, "RACCOMANDATO", { x: rx + 0.05, y: ry + 0.85, w: 1.05, h: 0.25, fontSize: 9, bold: true, color: GOLD2, align: "center" });
  T(s, "DECISO", { x: rx + 1.1, y: ry + 0.85, w: 1.05, h: 0.25, fontSize: 9, bold: true, color: GOLD2, align: "center" });
  T(s, "Ogni colore ha due livelli: tinta unita, poi con riga nera al centro.", { x: rx + 0.22, y: ry + 1.2, w: bw - 0.44, h: 0.95, fontSize: 13, color: MD });
  foot(s, "Fonte: Wikipedia, “ATA Martial Arts” · immagini: ritagli di cinture di Luciano Moreno, ridisegnati in alta risoluzione", false);
  s.addNotes(N.cinture);

  // ===== 11 TIGERS =====
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "Il Taekwondo Songahm" });
  head(s, "02 · I più piccoli", "Tigers: il Taekwondo dai 4 ai 6 anni");
  const tg = [["bianca", "Tartaruga"], ["arancione", "Tigre"], ["gialla", "Ghepardo"], ["mimetica", "Mimetica", "Leone"], ["verde", "Aquila"], ["viola", "Fenice"], ["blu", "Drago"], ["marrone", "Cobra"], ["rossa", "Pantera"]].map(([k, a, b]) => [k, b || a]);
  const tw = (CW - 8 * 0.14) / 9;
  tg.forEach(([k, an], i) => {
    const x = M + i * (tw + 0.14);
    card(s, x, 1.95, tw, 1.75, CARD);
    fit(s, img.tig[i], x + 0.08, 2.1, tw - 0.16, 0.6, `Cintura Tigers ${k} con la toppa ${an.toLowerCase()}`);
    T(s, k.toUpperCase(), { x: x + 0.08, y: 2.85, w: tw - 0.16, h: 0.3, fontSize: 11, bold: true, color: MD, align: "center", charSpacing: 1 });
    T(s, an, { x: x + 0.08, y: 3.15, w: tw - 0.16, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: GOLD2, align: "center" });
  });
  const tcards = [[fa.FaPaw, "Cosa imparano", "Autodisciplina, rispetto, ascolto e coordinazione, con giochi e il giuramento dei Tigers."], [fa.FaLevelUpAlt, "Il passaggio", "Quando sono pronti passano alla classe dei ragazzi mantenendo la loro cintura."]];
  for (let i = 0; i < 2; i++) {
    const w2 = (CW - 0.3) / 2, [Ic, t, d] = tcards[i], x = M + i * (w2 + 0.3);
    card(s, x, 4.0, w2, 1.95, CARD2);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 4.3, w: 0.6, h: 0.6, fill: { color: GOLD }, line: { type: "none" } });
    s.addImage({ data: await icon(Ic, NIGHT), x: x + 0.45, y: 4.45, w: 0.3, h: 0.3, altText: "" });
    T(s, t.toUpperCase(), { x: x + 1.1, y: 4.3, w: w2 - 1.4, h: 0.6, fontFace: HEAD, fontSize: 17, bold: true, color: WHITE, valign: "middle" });
    T(s, d, { x: x + 0.3, y: 5.1, w: w2 - 0.6, h: 1.1, fontSize: 16, color: MD });
  }
  foot(s, "Fonte: ATA Martial Arts, programma “ATA Tigers” · cinture: ritagli di Luciano Moreno", true);
  s.addNotes(N.tigers);

  // ===== 12 NERE =====
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Il Taekwondo Songahm" });
  head(s, "02 · I gradi · cinture nere", "Nove Dan: la cintura nera è un inizio");
  card(s, M, 1.95, 3.3, 4.7, WHITE, LINE);
  fit(s, img.rossaNera, M + 0.35, 2.3, 2.6, 0.75, "Cintura metà nera e metà rossa: 1º Dan raccomandato");
  T(s, "1º DAN RACCOMANDATO", { x: M + 0.3, y: 3.2, w: 2.7, h: 0.3, fontSize: 12, bold: true, color: "9A7420", align: "center", charSpacing: 1 });
  fit(s, img.nera2, M + 0.35, 4.0, 2.6, 0.75, "La mia cintura nera di 2º Dan");
  T(s, "CINTURA NERA · 1º–9º DAN", { x: M + 0.3, y: 4.9, w: 2.7, h: 0.3, fontSize: 12, bold: true, color: "9A7420", align: "center", charSpacing: 1 });
  T(s, "Qui sopra, la mia: 2º Dan", { x: M + 0.3, y: 5.25, w: 2.7, h: 0.35, fontSize: 13, color: ML, align: "center" });
  T(s, "Il numero romano indica il Dan", { x: M + 0.3, y: 5.95, w: 2.7, h: 0.35, fontSize: 12, italic: true, color: "8A8778", align: "center" });
  const dans = ["Shim Jun", "Jung Yul", "Chung San", "Sok Bong", "Chung Hae", "Jhang Soo", "Chul Joon", "Jeong Seung", "Dong Seung"];
  const dmov = [81, 82, 83, 84, 95, 96, 97, 98, 99]; // Wikipedia “ATA Martial Arts” (Chung Hae = 95, non 85)
  const gx2 = 4.3, dw = (5.2 - 0.4) / 3;
  dans.forEach((f, i) => {
    const x = gx2 + (i % 3) * (dw + 0.2), y = 1.95 + Math.floor(i / 3) * 1.6, mine = i === 1;
    card(s, x, y, dw, 1.42, mine ? NIGHT : WHITE, mine ? GOLD : LINE);
    T(s, `${i + 1}º DAN`, { x: x + 0.22, y: y + 0.2, w: dw - 0.44, h: 0.45, fontFace: HEAD, fontSize: 22, bold: true, color: mine ? GOLD2 : NIGHT });
    T(s, f, { x: x + 0.22, y: y + 0.66, w: dw - 0.44, h: 0.3, fontSize: 14, bold: mine, color: mine ? WHITE : NIGHT });
    if (mine) pill(s, "IL MIO GRADO", x - 0.05, y - 0.2, dw + 0.1, GOLD, NIGHT);
    T(s, `${dmov[i]} movimenti`, { x: x + 0.22, y: y + 0.98, w: dw - 0.3, h: 0.28, fontSize: 12, bold: mine, color: mine ? GOLD : ML });
  });
  const tx = 9.8, tww = W - M - tx;
  T(s, "I TITOLI", { x: tx, y: 1.95, w: tww, h: 0.35, fontSize: 13, bold: true, color: "9A7420", charSpacing: 3 });
  [["6º", "Maestro"], ["7º", "Maestro Senior"], ["8º", "Maestro Capo"], ["9º", "Gran Maestro"], ["10º", "Eterno Gran Maestro, onorario: H.U. Lee"]].forEach(([n, t], i) => {
    const y = 2.4 + i * 0.75;
    s.addShape(pres.shapes.LINE, { x: tx, y, w: tww, h: 0, line: { color: LINE, width: 0.75 } });
    T(s, n, { x: tx, y, w: 0.6, h: 0.75, fontFace: HEAD, fontSize: 18, bold: true, color: "9A7420", valign: "middle" });
    T(s, t, { x: tx + 0.65, y, w: tww - 0.65, h: 0.75, fontSize: i === 4 ? 13 : 17, bold: i !== 4, color: i === 4 ? ML : NIGHT, valign: "middle" });
  });
  foot(s, "Fonte: Wikipedia, “ATA Martial Arts” · cinture: ritagli di Luciano Moreno", false);
  s.addNotes(N.nere);

  // ===== 13 DISCIPLINE =====
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "Il Taekwondo Songahm" });
  head(s, "02 · Le discipline", "Otto specialità di gara");
  const dis = [["Forme tradizionali", 1], ["Forme con armi", 1], ["Combattimento con armi", 1], ["Combattimento a punti", 1], ["Forme creative", 0, "Coreografia libera"], ["Armi creative", 0, "Coreografia con armi"], ["Forme Xtreme", 0, "Con acrobazie"], ["Armi Xtreme", 0, "Armi e acrobazie"]];
  const dw4 = (CW - 3 * 0.25) / 4;
  dis.forEach(([t, mine, d], i) => {
    const x = M + (i % 4) * (dw4 + 0.25), y = 1.95 + Math.floor(i / 4) * 1.6;
    card(s, x, y, dw4, 1.4, mine ? GOLD : CARD);
    T(s, t.toUpperCase(), { x: x + 0.3, y: y + 0.2, w: dw4 - 0.6, h: 0.65, fontFace: HEAD, fontSize: 17, bold: true, color: mine ? NIGHT : WHITE });
    T(s, mine ? "La pratico" : d, { x: x + 0.3, y: y + 0.9, w: dw4 - 0.6, h: 0.35, fontSize: 14, bold: !!mine, color: mine ? NIGHT : MD });
  });
  await slot(s, "gara", "[FOTO: io in gara · combattimento o forma con armi]", M, 5.2, 5.5, 1.55);
  T(s, "Nei combattimenti si usano casco, paradenti e protezioni per mani, piedi e torace. Ci sono anche gare a squadre: combattimento, sincronia e dimostrazione.", { x: 6.5, y: 5.2, w: W - M - 6.5, h: 1.55, fontSize: 15, color: MD, valign: "middle" });
  foot(s, "Fonte: regolamento ufficiale dei tornei ATA 2023–24", true);
  s.addNotes(N.discipline);

  // ===== 14 DIVIDER 03 =====
  divider("La mia esperienza", "03", "La mia esperienza alla MIRAE", "Dove lavoro, cosa faccio e come insegno", N.divider03);

  // ===== 15 MIRAE =====
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "La mia esperienza" });
  head(s, "03 · Dove lavoro", "MIRAE Artes Marciales");
  await slot(s, "logo_mirae", "[LOGO MIRAE]", M, 1.95, 1.3, 1.3, true, "contain", "Logo di MIRAE Artes Marciales");
  T(s, [{ text: "Accademia di arti marziali ATA con " }, { text: "due sedi", options: { bold: true } }, { text: " a Ciudad de la Costa, Canelones." }], { x: M + 1.55, y: 1.95, w: 5.6, h: 0.8, fontSize: 18, color: WHITE });
  T(s, "Mi alleno qui dal 2019. Oggi ci lavoro come istruttore retribuito, con classi di bambini, adolescenti e adulti.", { x: M + 1.55, y: 2.75, w: 5.6, h: 0.6, fontSize: 15, color: MD });
  const sedi = [["MIRAE · SHANGRILÁ", "Av. Calcagno, manzana 12, solar 6"], ["MIRAE · BARRA DE CARRASCO", "Tacuarí 1084 esq. Rivera"]];
  const pinIc = await icon(fa.FaMapMarkerAlt, NIGHT);
  for (let i = 0; i < 2; i++) {
    const [c, a] = sedi[i], y = 3.75 + i * 1.4;
    card(s, M, y, 7.2, 1.15, CARD);
    s.addShape(pres.shapes.OVAL, { x: M + 0.3, y: y + 0.28, w: 0.6, h: 0.6, fill: { color: GOLD }, line: { type: "none" } });
    s.addImage({ data: pinIc, x: M + 0.45, y: y + 0.43, w: 0.3, h: 0.3, altText: "" });
    T(s, c, { x: M + 1.15, y: y + 0.17, w: 5.8, h: 0.42, fontFace: HEAD, fontSize: 18, bold: true, color: GOLD2, valign: "middle" });
    T(s, a + " · Ciudad de la Costa, Canelones", { x: M + 1.15, y: y + 0.6, w: 5.8, h: 0.36, fontSize: 15, color: MD, valign: "middle" });
  }
  // Mappa OpenStreetMap con le due sedi (marcatori disegnati in tools/mappa.py)
  const MP = { x: 8.23, y: 1.95, s: 4.4 }, mj = JSON.parse(fs.readFileSync(path.join(ASSETS, "mappa", "mappa_sedi.json")));
  s.addImage({ data: (await file("mappa/mappa_sedi.png")).data, x: MP.x, y: MP.y, w: MP.s, h: MP.s, rounding: false, altText: "Mappa di Ciudad de la Costa con le due sedi MIRAE: Barra de Carrasco (Tacuarí 1084) e la zona di Shangrilá" });
  s.addShape(pres.shapes.RECTANGLE, { x: MP.x, y: MP.y, w: MP.s, h: MP.s, fill: { type: "none" }, line: { color: "3D6A5C", width: 1 } });
  const lab = (t, fx, fy, dx, dy, w) => {
    const x = MP.x + fx * MP.s + dx, y = MP.y + fy * MP.s + dy;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.36, rectRadius: 0.06, fill: { color: NIGHT }, line: { type: "none" } });
    T(s, t, { x, y, w, h: 0.36, fontSize: 12, bold: true, color: GOLD2, align: "center", valign: "middle" });
  };
  lab("MIRAE · Shangrilá", mj.shangrila[0], mj.shangrila[1], -1.3, mj.shangrila[2] * MP.s + 0.08, 2.0);
  lab("MIRAE · Barra de Carrasco", mj.bdc[0], mj.bdc[1], 0.25, -0.62, 2.45);
  T(s, "Mappa: © OpenStreetMap contributors (ODbL)", { x: MP.x, y: 6.4, w: MP.s, h: 0.28, fontSize: 10, color: GREY, align: "right" });
  foot(s, "La mia esperienza", true);
  s.addNotes(N.mirae);

  // ===== 16 RUOLO =====
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "La mia esperienza" });
  head(s, "03 · Il mio lavoro", "Cosa faccio alla MIRAE");
  const gw3 = (CW - 2 * 0.25) / 3;
  const grid6 = async (sl, items) => {
    for (let i = 0; i < items.length; i++) {
      const [Ic, t, d, sp] = items[i], x = M + (i % 3) * (gw3 + 0.25), y = 1.95 + Math.floor(i / 3) * 2.3;
      card(sl, x, y, gw3, 2.1, sp ? NIGHT : WHITE, sp ? null : LINE);
      sl.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.28, w: 0.58, h: 0.58, fill: { color: sp ? GOLD : NIGHT }, line: { type: "none" } });
      sl.addImage({ data: await icon(Ic, sp ? NIGHT : GOLD), x: x + 0.44, y: y + 0.42, w: 0.3, h: 0.3, altText: "" });
      T(sl, t.toUpperCase(), { x: x + 1.08, y: y + 0.28, w: gw3 - 1.3, h: 0.58, fontFace: HEAD, fontSize: 16, bold: true, color: sp ? GOLD2 : NIGHT, valign: "middle" });
      T(sl, d, { x: x + 0.3, y: y + 1.05, w: gw3 - 0.6, h: 0.9, fontSize: 14, color: sp ? MD : ML });
    }
  };
  await grid6(s, [[fa.FaUsers, "Insegno ogni venerdì", "Classi di bambini, adolescenti e adulti, ognuna con un ritmo diverso."], [fa.FaKey, "Sostituisco il titolare", "Quando l’istruttore principale è assente, conduco io la lezione intera."], [fa.FaGraduationCap, "Preparo agli esami", "Correggo forme e tecniche degli allievi in vista del cambio di cintura."], [fa.FaGavel, "Giudico", "Faccio da giudice in esami e tornei nazionali e internazionali."], [fa.FaInstagram, "Curo i social", "Creo i video Instagram dell’accademia: valori, eventi, esami."], [fa.FaCheck, "Un vero lavoro", "Retribuito, con orari, responsabilità e la fiducia dei genitori.", true]]);
  foot(s, "La mia esperienza", false);
  s.addNotes(N.ruolo);

  // ===== 17 LEZIONE =====
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "La mia esperienza" });
  head(s, "03 · Come insegno", "Una mia lezione, passo per passo");
  const steps = [[fa.FaSyncAlt, "Mobilità articolare", "Scaldo tutte le articolazioni per preparare il corpo e prevenire gli infortuni."], [fa.FaDumbbell, "Preparazione fisica", "A corpo libero: flessioni, plank, addominali."], [fa.FaBolt, "Taekwondo atletico", "Esercizi di reazione e calci ad alta intensità."], [fa.FaFistRaised, "Forme, sparring o combat", "La parte tecnica: forme, combattimento o combattimento con armi."]];
  const sw4 = (CW - 3 * 0.3) / 4;
  for (let i = 0; i < 4; i++) {
    const [Ic, t, d] = steps[i], x = M + i * (sw4 + 0.3), y = 1.95;
    card(s, x, y, sw4, 2.75, CARD);
    T(s, "0" + (i + 1), { x: x + 0.3, y: y + 0.22, w: 1.2, h: 0.75, fontFace: HEAD, fontSize: 40, bold: true, color: GOLD });
    s.addImage({ data: await icon(Ic, GOLD2), x: x + sw4 - 0.8, y: y + 0.35, w: 0.45, h: 0.45, altText: "" });
    T(s, t.toUpperCase(), { x: x + 0.3, y: y + 1.05, w: sw4 - 0.6, h: 0.65, fontFace: HEAD, fontSize: 16, bold: true, color: WHITE });
    T(s, d, { x: x + 0.3, y: y + 1.7, w: sw4 - 0.6, h: 0.95, fontSize: 14, color: MD });
    if (i < 3) s.addImage({ data: await icon(fa.FaChevronRight, GOLD), x: x + sw4 + 0.05, y: y + 1.22, w: 0.2, h: 0.3, altText: "" });
  }
  card(s, M, 4.95, CW, 1.45, GOLD);
  s.addImage({ data: await icon(fa.FaBullseye, NIGHT), x: M + 0.4, y: 5.4, w: 0.55, h: 0.55, altText: "" });
  T(s, "LEZIONI MONOTEMATICHE", { x: M + 1.3, y: 5.12, w: 6, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: NIGHT });
  T(s, "A volte decido di dedicare tutta la lezione a una sola disciplina, sparring, forme o combat, per lavorarla a fondo.", { x: M + 1.3, y: 5.57, w: CW - 1.7, h: 0.7, fontSize: 15, color: NIGHT });
  foot(s, "La mia esperienza", true);
  s.addNotes(N.lezione);

  // ===== 18 GALLERIA =====
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "La mia esperienza" });
  head(s, "03 · In azione", "Io in classe");
  const vid = findFoto("video_lezione", ["mp4", "m4v", "mov"]);
  if (vid) {
    const cov = findFoto("video_lezione_copertina");
    const cover = cov ? "image/jpeg;base64," + (await sharp(cov).rotate().resize(1520, 855, { fit: "cover" }).jpeg({ quality: 85 }).toBuffer()).toString("base64") : undefined;
    s.addMedia(Object.assign({ type: "video", path: vid, x: M, y: 1.95, w: 6.9, h: 3.88 }, cover ? { cover } : {}));
    used.push(path.basename(vid));
  } else ph(s, "[VIDEO: io che conduco una lezione, massimo 20 secondi]\nInserisci › Video", M, 1.95, 6.9, 3.88);
  T(s, "[Didascalia del video: classe, data, cosa si vede]", { x: M, y: 5.95, w: 6.9, h: 0.4, fontSize: 14, color: MD });
  const pxs = 7.85, pw = (W - M - pxs - 0.25) / 2;
  const gal = [["[FOTO: classe di bambini]", "Bambini"], ["[FOTO: classe di adolescenti o adulti]", "Adolescenti e adulti"], ["[FOTO: io mentre faccio da giudice]", "Da giudice"], ["[FOTO: esame di cintura o torneo]", "Esami e tornei"]];
  for (let i = 0; i < 4; i++) {
    const [p, c] = gal[i], x = pxs + (i % 2) * (pw + 0.25), y = 1.95 + Math.floor(i / 2) * 2.2;
    await slot(s, "galleria_" + (i + 1), p, x, y, pw, 1.65);
    T(s, c, { x, y: y + 1.72, w: pw, h: 0.35, fontSize: 14, color: MD });
  }
  foot(s, "La mia esperienza", true);
  s.addNotes(N.galleria);

  // ===== 19 DIVIDER 04 =====
  divider("Bilancio", "04", "Bilancio dell’esperienza", "Cosa ho imparato e come sono cambiato", N.divider04);

  // ===== 20 COMPETENZE =====
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Bilancio" });
  head(s, "04 · Competenze acquisite", "In cosa mi ha aiutato");
  await grid6(s, [[fa.FaUsers, "Leadership", "Guidare un gruppo e farmi ascoltare anche da persone più grandi di me."], [fa.FaComments, "Comunicazione", "Spiegare la stessa tecnica in modo diverso a un bambino e a un adulto."], [fa.FaShieldAlt, "Responsabilità", "La sicurezza degli allievi dipende da me, soprattutto con i più piccoli."], [fa.FaLightbulb, "Problem solving", "Cambiare piano quando una classe è stanca, agitata o di livelli misti."], [fa.FaClock, "Organizzazione", "Conciliare scuola, allenamenti quasi quotidiani, lavoro e gare."], [fa.FaBalanceScale, "Imparzialità", "Da giudice valuto con regole chiare, anche quando conosco l’atleta."]]);
  foot(s, "Bilancio dell’esperienza", false);
  s.addNotes(N.competenze);

  // ===== 21 CAMBIAMENTO =====
  s = pres.addSlide({ masterName: "DARK", sectionTitle: "Bilancio" });
  head(s, "04 · Cosa è cambiato in me", "Dall’altra parte del tatami");
  T(s, "PRIMA, DA ALLIEVO", { x: M, y: 1.95, w: 5.3, h: 0.35, fontSize: 13, bold: true, color: GREY, charSpacing: 3 });
  T(s, "OGGI, DA ISTRUTTORE", { x: 7.1, y: 1.95, w: 5.5, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 3 });
  const arrow = await icon(fa.FaArrowRight, GOLD);
  [["Pensavo solo alla mia tecnica", "Penso ai progressi degli altri"], ["Eseguivo le correzioni", "Capisco il perché di ogni correzione"], ["Parlare in pubblico mi agitava", "Guido una classe con sicurezza"]].forEach(([a, b], i) => {
    const y = 2.4 + i * 0.75;
    s.addShape(pres.shapes.LINE, { x: M, y, w: CW, h: 0, line: { color: "2A4A40", width: 0.75 } });
    T(s, a, { x: M, y, w: 5.3, h: 0.75, fontSize: 18, color: MD, valign: "middle" });
    s.addImage({ data: arrow, x: 6.35, y: y + 0.22, w: 0.32, h: 0.32, altText: "" });
    T(s, b, { x: 7.1, y, w: 5.5, h: 0.75, fontSize: 18, bold: true, color: WHITE, valign: "middle" });
  });
  s.addShape(pres.shapes.LINE, { x: M, y: 4.65, w: CW, h: 0, line: { color: "2A4A40", width: 0.75 } });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.0, w: CW, h: 1.35, rectRadius: 0.08, fill: { color: CARD2 }, line: { color: GOLD, width: 1.75, dashType: "dash" }, objectName: "Da completare" });
  s.addImage({ data: await icon(fa.FaQuoteLeft, GOLD), x: M + 0.4, y: 5.42, w: 0.5, h: 0.5, altText: "" });
  T(s, "[Scrivi qui un tuo momento: per esempio la prima volta che hai sostituito l’istruttore, o un allievo che ha passato l’esame grazie a te.]", { x: M + 1.2, y: 5.0, w: CW - 1.6, h: 1.35, fontSize: 16, italic: true, color: WHITE, valign: "middle" });
  foot(s, "Bilancio dell’esperienza", true);
  s.addNotes(N.cambiamento);

  // ===== 22 COLLEGAMENTI =====
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Bilancio" });
  head(s, "04 · Collegamenti con le materie", "Il Taekwondo a scuola");
  const subj = [[fa.FaAtom, "Fisica", "Nei calci girati la rotazione del corpo trasforma il momento angolare in energia cinetica del piede."], [fa.FaHeartbeat, "Biologia", "Muscoli, flessibilità e riscaldamento: come si prevengono gli infortuni."], [fa.FaLandmark, "Storia", "La Corea occupata dal Giappone e la guerra di Corea: il contesto in cui cresce H.U. Lee."], [fa.FaBook, "Filosofia", "Aristotele: la virtù nasce dall’abitudine, come una tecnica ripetuta mille volte."], [fa.FaHandshake, "Ed. civica", "Rispetto, inclusione e tutela dei minori: lo sport come strumento educativo."]];
  const kw = (CW - 4 * 0.2) / 5;
  for (let i = 0; i < 5; i++) {
    const [Ic, t, d] = subj[i], x = M + i * (kw + 0.2), y = 1.95, dk = i % 2 === 0;
    card(s, x, y, kw, 3.9, dk ? NIGHT : WHITE, dk ? null : LINE);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.3, w: 0.62, h: 0.62, fill: { color: GOLD }, line: { type: "none" } });
    s.addImage({ data: await icon(Ic, NIGHT), x: x + 0.46, y: y + 0.46, w: 0.3, h: 0.3, altText: "" });
    T(s, t.toUpperCase(), { x: x + 0.3, y: y + 1.15, w: kw - 0.6, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: dk ? GOLD2 : NIGHT });
    T(s, d, { x: x + 0.3, y: y + 1.65, w: kw - 0.6, h: 2.0, fontSize: 14, color: dk ? MD : ML });
  }
  foot(s, "Bilancio dell’esperienza", false);
  s.addNotes(N.collegamenti);

  // ===== 23 FINE =====
  s = pres.addSlide({ sectionTitle: "Bilancio" });
  s.background = { color: NIGHT };
  fit(s, img.starD, 8.3, 1.2, 4.6, 4.6, ALT_STAR);
  T(s, "IN CONCLUSIONE", { x: M, y: 0.7, w: CW, h: 0.35, fontSize: 13, bold: true, color: GOLD, charSpacing: 3 });
  T(s, [{ text: "INSEGNANDO,", options: { color: WHITE, breakLine: true } }, { text: "HO IMPARATO", options: { color: WHITE, breakLine: true } }, { text: "DUE VOLTE.", options: { color: GOLD } }], { x: M, y: 1.5, w: 7.6, h: 3.0, fontFace: HEAD, fontSize: 52, bold: true, valign: "middle" });
  T(s, [{ text: "“Homines, dum docent, discunt”", options: { italic: true, color: WHITE } }, { text: " — Seneca, Lettere a Lucilio, 7, 8" }], { x: M, y: 4.7, w: 7.6, h: 0.5, fontSize: 18, color: MD });
  T(s, "GRAZIE · DOMANDE?", { x: M, y: 5.85, w: 7, h: 0.7, fontFace: HEAD, fontSize: 32, bold: true, color: GOLD2, valign: "bottom" });
  T(s, "Luciano Moreno\nScuola Italiana di Montevideo", { x: W - M - 4.5, y: 5.85, w: 4.5, h: 0.7, fontSize: 14, color: MD, align: "right", valign: "bottom" });
  s.addNotes(N.fine);

  // ===== 24 FONTI E CREDITI =====
  s = pres.addSlide({ masterName: "LIGHT", sectionTitle: "Bilancio" });
  head(s, "Appendice", "Fonti e crediti");
  const colW = (CW - 0.4) / 2;
  const list = (items, x, title, Ic) => {
    card(s, x, 1.95, colW, 4.75, WHITE, LINE);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 2.2, w: 0.55, h: 0.55, fill: { color: NIGHT }, line: { type: "none" } });
    return title;
  };
  const fonti = [
    ["ATA Martial Arts, atamartialarts.com", "“About Songahm Taekwondo” · “ATA Tigers”"],
    ["Regolamento ufficiale dei tornei ATA 2023–24", "Giudici, specialità di gara, protezioni"],
    ["Wikipedia (consultata a novembre 2026)", "“ATA Martial Arts” · “Haeng Ung Lee”"],
    ["Luciano Moreno", "Colletti in uso alla MIRAE · struttura delle lezioni"],
    ["Classici", "Seneca, Lettere a Lucilio 7, 8 · Aristotele, Etica Nic. II"],
  ];
  const crediti = [
    ["Stella Songahm", "Logo ufficiale ATA (atamartialarts.com), vettorializzato"],
    ["Cinture e cinture Tigers", "Ritagli di Luciano Moreno, in alta risoluzione"],
    ["Colletti e galloni", "Illustrazioni vettoriali originali"],
    ["Icone", "Font Awesome (react-icons), licenza CC BY 4.0"],
    ["Mappa e foto", "© OpenStreetMap contributors (ODbL) · archivio di Luciano Moreno"],
  ];
  for (const [i, [ttl, Ic, items]] of [["FONTI", fa.FaBook, fonti], ["CREDITI DELLE IMMAGINI", fa.FaImage, crediti]].entries()) {
    const x = M + i * (colW + 0.4);
    list(items, x, ttl, Ic);
    s.addImage({ data: await icon(Ic, GOLD), x: x + 0.44, y: 2.34, w: 0.27, h: 0.27, altText: "" });
    T(s, ttl, { x: x + 1.05, y: 2.2, w: colW - 1.3, h: 0.55, fontFace: HEAD, fontSize: 18, bold: true, color: NIGHT, valign: "middle" });
    items.forEach(([a, b], j) => {
      const y = 3.0 + j * 0.72;
      T(s, [{ text: a, options: { bold: true, color: NIGHT, breakLine: true } }, { text: b, options: { color: ML } }], { x: x + 0.3, y, w: colW - 0.6, h: 0.66, fontSize: 14 });
    });
  }
  foot(s, "Immagini di terzi usate a solo scopo didattico per l’Esame di Stato", false);
  s.addNotes(N.fonti);

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  // Transizione “dissolvenza” discreta su ogni diapositiva (pptxgenjs non la espone)
  const JSZip = require("jszip");
  const zip = await JSZip.loadAsync(fs.readFileSync(OUT));
  for (const f of Object.keys(zip.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    let x = await zip.file(f).async("string");
    if (!x.includes("<p:transition")) x = x.replace("</p:clrMapOvr>", '</p:clrMapOvr><p:transition spd="med"><p:fade/></p:transition>');
    zip.file(f, x);
  }
  const clean = new JSZip(); // solo file, nessuna voce “cartella” (danno problemi con OneDrive/SharePoint)
  for (const [n, e] of Object.entries(zip.files)) if (!e.dir) clean.file(n, await e.async("nodebuffer"), { createFolders: false });
  fs.writeFileSync(OUT, await clean.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  console.log("done · foto usate:", used.length ? used.join(", ") : "nessuna (riquadri da completare)");
})().catch(e => { console.error(e); process.exit(1); });
