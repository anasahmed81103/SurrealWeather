import { blocks, poly, r1 } from "./shapes";

/* ------------------------------------------------------------------
 * ornaments — the architectural pieces skylines are built from:
 * minarets, domes, onion domes, spires, gothic towers, pagodas, stupas,
 * crosses and see-through arches. Each returns one SVG path string.
 * Coordinates: the 400 × 300 skyline box (see shapes.js).
 * ------------------------------------------------------------------ */

const L = (x, y) => `${r1(x)},${r1(y)}`;

/** Thin pencil minaret centred on cx, from baseY up to topY, with two balconies.
 *  cap: "cone" (Ottoman / Faisal) or "dome" (Mughal kiosk top) */
export function minaret(cx, topY, baseY, w = 7, cap = "cone") {
    const h = w / 2;
    const capStart = cap === "cone" ? topY + 24 : topY + w * 1.4;
    const balconies = [topY + (baseY - topY) * 0.22, topY + (baseY - topY) * 0.5];
    let left = `M${L(cx - h, baseY)}`;
    let right = "";
    // walk up the left side and down the right side, sticking out at each balcony
    [...balconies].reverse().forEach((b) => {
        left += ` L${L(cx - h, b + 3)} L${L(cx - h - 2, b + 3)} L${L(cx - h - 2, b)} L${L(cx - h, b)}`;
    });
    balconies.forEach((b) => {
        right += ` L${L(cx + h, b)} L${L(cx + h + 2, b)} L${L(cx + h + 2, b + 3)} L${L(cx + h, b + 3)}`;
    });
    const tower = `${left} L${L(cx - h, capStart)} L${L(cx, topY)} L${L(cx + h, capStart)}${right} L${L(cx + h, baseY)} Z`;
    return cap === "dome" ? `${tower} ${dome(cx, capStart, h + 1.5, 0.4)}` : tower;
}

/** Dome sitting on baseY. pointed = how far the tip rises above a round dome (0 = round) */
export function dome(cx, baseY, r, pointed = 0.3) {
    const top = baseY - r * (1 + pointed);
    return (
        `M${L(cx - r, baseY)} C${L(cx - r, baseY - r * 0.75)} ${L(cx - r * 0.35, baseY - r)} ${L(cx, top)} ` +
        `C${L(cx + r * 0.35, baseY - r)} ${L(cx + r, baseY - r * 0.75)} ${L(cx + r, baseY)} Z ` +
        finial(cx, top, Math.max(3, r * 0.4))
    );
}

/** Russian onion dome with a cross */
export function onion(cx, baseY, r) {
    const top = baseY - r * 2;
    return (
        `M${L(cx - r * 0.55, baseY)} C${L(cx - r * 1.2, baseY - r * 0.55)} ${L(cx - r, baseY - r * 1.3)} ${L(cx, top)} ` +
        `C${L(cx + r, baseY - r * 1.3)} ${L(cx + r * 1.2, baseY - r * 0.55)} ${L(cx + r * 0.55, baseY)} Z ` +
        cross(cx, top, Math.max(6, r * 0.8))
    );
}

/** Thin pole on top of something */
export const finial = (cx, topY, h) => `M${L(cx - 0.6, topY + 1)} L${L(cx - 0.6, topY - h)} L${L(cx + 0.6, topY - h)} L${L(cx + 0.6, topY + 1)} Z`;

/** Cross: a pole and a bar */
export function cross(cx, topY, h) {
    const bar = topY - h * 0.65;
    return `${finial(cx, topY, h)} M${L(cx - h * 0.3, bar + 1)} L${L(cx - h * 0.3, bar)} L${L(cx + h * 0.3, bar)} L${L(cx + h * 0.3, bar + 1)} Z`;
}

/** Pointed spire (a tall triangle) sitting on baseY */
export const spire = (cx, baseY, w, h) => `M${L(cx - w / 2, baseY)} L${L(cx, baseY - h)} L${L(cx + w / 2, baseY)} Z`;

/** Gothic tower: square tower + tall spire + two little pinnacles */
export function gothicTower(cx, w, h, spireH) {
    const top = 300 - h;
    return [
        blocks([[cx - w / 2, w, h]]),
        spire(cx, top + 1, w * 0.78, spireH),
        spire(cx - w / 2 + 1.5, top + 1, 3, 9),
        spire(cx + w / 2 - 1.5, top + 1, 3, 9),
    ].join(" ");
}

/** One pagoda roof: wide, swooping, tips flicked up. y = underside, w = half width */
function eave(cx, y, w) {
    return (
        `M${L(cx - w, y - 4)} Q${L(cx - w * 0.6, y - 5)} ${L(cx - w * 0.35, y - 10)} L${L(cx + w * 0.35, y - 10)} ` +
        `Q${L(cx + w * 0.6, y - 5)} ${L(cx + w, y - 4)} Q${L(cx + w * 0.7, y + 1)} ${L(cx + w * 0.4, y + 1)} ` +
        `L${L(cx - w * 0.4, y + 1)} Q${L(cx - w * 0.7, y + 1)} ${L(cx - w, y - 4)} Z`
    );
}

/** Pagoda: `levels` storeys, each a bit narrower, with a spire on top */
export function pagoda(cx, baseY, levels, w0, levelH) {
    let d = "";
    for (let i = 0; i < levels; i++) {
        const w = w0 * (1 - i * 0.12);
        const bottom = baseY - i * levelH;
        const bw = w * 0.62;
        d += `M${L(cx - bw, bottom + 1)} L${L(cx - bw, bottom - levelH + 2)} L${L(cx + bw, bottom - levelH + 2)} L${L(cx + bw, bottom + 1)} Z `;
        d += eave(cx, bottom - levelH + 4, w) + " ";
    }
    const top = baseY - levels * levelH - 6;
    return d + spire(cx, top + 1, 3, levelH * 1.2);
}

/** Bell-shaped stupa with a tall thin spire (South-East Asian temples) */
export function stupa(cx, baseY, r, h) {
    return (
        `M${L(cx - r, baseY)} C${L(cx - r, baseY - r * 1.1)} ${L(cx - r * 0.35, baseY - r * 1.05)} ${L(cx - r * 0.18, baseY - r * 1.6)} ` +
        `L${L(cx, baseY - h)} L${L(cx + r * 0.18, baseY - r * 1.6)} ` +
        `C${L(cx + r * 0.35, baseY - r * 1.05)} ${L(cx + r, baseY - r * 1.1)} ${L(cx + r, baseY)} Z ` +
        blocks([[cx - r * 1.25, r * 2.5, 300 - baseY + 1]])
    );
}

/** See-through arch (a hole: drawn the other way round). x = left edge, yb = bottom */
export function archHole(x, yb, w, h) {
    const spring = yb - h + w / 2;
    return `M${L(x + w, yb)} L${L(x + w, spring)} A${r1(w / 2)},${r1(w / 2)} 0 0 0 ${L(x, spring)} L${L(x, yb)} Z`;
}

/** See-through rectangle (a hole) */
export const rectHole = (x, y, w, h) => `M${L(x, y)} L${L(x, y + h)} L${L(x + w, y + h)} L${L(x + w, y)} Z`;

/** Round disc (clock faces, spheres) */
export const disc = (cx, cy, r) =>
    `M${L(cx - r, cy)} A${r1(r)},${r1(r)} 0 0 1 ${L(cx + r, cy)} A${r1(r)},${r1(r)} 0 0 1 ${L(cx - r, cy)} Z`;

/** Ring (London Eye): a disc with a round hole */
export const ring = (cx, cy, r, t) =>
    `${disc(cx, cy, r)} M${L(cx - r + t, cy)} A${r1(r - t)},${r1(r - t)} 0 0 0 ${L(cx + r - t, cy)} A${r1(r - t)},${r1(r - t)} 0 0 0 ${L(cx - r + t, cy)} Z`;

/** Simple tapered shape (towers, statues): bottom width → top width */
export const taper = (cx, baseY, topY, wBottom, wTop) =>
    poly([[cx - wBottom / 2, baseY], [cx - wTop / 2, topY], [cx + wTop / 2, topY], [cx + wBottom / 2, baseY]]);
