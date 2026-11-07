# Informe – Presentación Taekwondo Songahm (Scuola-Lavoro)

**Entregables:** `Taekwondo_Songahm_Scuola_Lavoro.pptx` (24 diapositivas, 2,1 MB, valida sin errores y abre en LibreOffice), `Taekwondo_Songahm_Scuola_Lavoro.pdf`, `assets/` (+ `INVENTARIO.md`, `CREDITI.md`), `build.js` → `src/build.js` (para regenerar: `cd salida/src && npm install && node build.js`).

## De dónde salió cada imagen
- **Repo de Lucho** (`cinturones/`): todos los cinturones de color, "raccomandato/deciso", rojo-negro, negros con Dan y los Tigers. Eran recortes de 115 px (muy chicos). Los **cinturones lisos y con franja se redibujaron** a 1200 px con el mismo diseño y los colores medidos en sus recortes; la textura del camuflado sale del recorte original limpiada; los **Tigers se ampliaron** (×5–×6) con nitidez porque los dibujos de animales no se pueden redibujar fielmente.
- **Web (atamartialarts.com):** la **estrella Songahm real** (logo oficial ATA). Solo estaba a 497 px, así que la **vectoricé** (SVG + PNG 2400 px) y hice 3 versiones: color, color con borde dorado para fondos oscuros y dorada para marca de agua. Reemplaza todas las estrellas dibujadas.
- **Dibujo propio (art.js):** collares de instructor y galones de juez (no hay fotos accesibles). Ahora a doble resolución.
- **No encontrado:** logo de MIRAE y fachadas de Shangrilá y Barra de Carrasco. MIRAE casi no aparece en buscadores (solo un directorio que dice "MIRAE ARTES MARCIALES ATA", Canelones, sin dirección) y no tengo acceso a Instagram ni Google Maps desde este entorno. Quedan como recuadros.

## Datos verificados / corregidos
- **Chung Hae (5º Dan) = 95 movimientos** (no 85). Agregué los movimientos de los 9 Dan: 81, 82, 83, 84, 95, 96, 97, 98, 99 (Wikipedia; los 3 últimos sin cita allí).
- **Tigers:** la página oficial ATA confirma los animales (Tartaruga, Tigre, Ghepardo, Leone, Aquila, Fenice, Drago, Cobra, Pantera) y la edad **4–6 años**. Los nombres "Ara, Baeoh, Cheeri, Raon, Suri, Choa, Mir, Narsha, Baron" **no son otro sistema**: según Wikipedia son los nombres de esas mismas mascotas. Wikipedia dice 3–6 años; usé 4–6 (fuente oficial). Los recortes de Lucho muestran los mismos animales.
- **Estrella:** centro + **8 puntas** exteriores que forman un círculo (texto oficial ATA). Ajusté la frase de la diapositiva 9.
- Omaha 1969, sede en Little Rock desde 1977, federación sudamericana de 1984 y más de 300.000 miembros en más de 21 países: confirmado.
- **Grand Master actual:** no lo puse. Wikipedia dice que M.K. Lee preside la ATA desde 2022, pero no lo crucé con una fuente oficial.
- **Guion:** el original tenía ~1.900 palabras (≈13 min). Lo reduje a **1.200 palabras ≈ 8,6 min** sin quitar diapositivas. El original queda en `src/notes_orig.json`.

## Huecos para Lucho (recuadros con borde dorado discontinuo)
1. Foto grande de portada (dobok, dando clase o con patada).
2. Foto con cinturón negro / medalla / Selección ATA Uruguay (diap. 3).
3. Foto de la clase de Tigers (diap. 11) y **confirmar que MIRAE usa el programa Tigers** con estos animales.
4. Foto en competencia (diap. 13).
5. **Logo de MIRAE** (PNG transparente) y **fotos de las 2 sedes** (diap. 15).
6. **Video de una clase, ≤20 s** (diap. 18: Insertar › Video) + pie de video + 4 fotos de galería.
7. **Anécdota personal** (diap. 21) y frase final en las notas.

## Conflictos de fuentes
- Edad de Tigers: 4–6 (ATA) vs 3–6 (Wikipedia) → usé ATA.
- Asignación de colores de collar por nivel: viene de Lucho (el reglamento no la especifica). Se cita como "colori dei colletti come in uso alla MIRAE".
