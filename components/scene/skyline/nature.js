import { GROUND, poly, r1, seeded } from "./shapes";

/* ------------------------------------------------------------------
 * nature — trees for the skylines: round tree tops, palms, acacias,
 * cypresses (and the umbrella pines of Rome). Each returns a path string.
 * ------------------------------------------------------------------ */

/** A row of round tree tops (overlapping bumps) between x0 and x1 */
export function trees(x0, x1, y, seed, { minR = 6, maxR = 12 } = {}) {
    let d = "";
    for (let x = x0, i = 0; x < x1; i++) {
        const r = minR + seeded(seed + i * 2.3) * (maxR - minR);
        const top = y - seeded(seed + i * 5.9) * 6;
        d += `M${r1(x)},${GROUND} L${r1(x)},${r1(top)} A${r1(r)},${r1(r)} 0 0 1 ${r1(x + r * 2)},${r1(top)} L${r1(x + r * 2)},${GROUND} Z `;
        x += r * 1.3;
    }
    return d.trim();
}

/** Palm tree: slim leaning trunk and drooping fronds. x = foot, h = height */
export function palm(x, h, seed = 1) {
    const lean = (seeded(seed) - 0.5) * 12;
    const tx = x + lean;
    const ty = 300 - h;
    let d = poly([[x - 1.6, GROUND], [tx - 0.9, ty], [tx + 0.9, ty], [x + 1.6, GROUND]]);
    const len = 10 + h * 0.22;
    [-170, -135, -100, -70, -35, -5].forEach((deg, i) => {
        const a = ((deg + (seeded(seed + i) - 0.5) * 16) * Math.PI) / 180;
        const tip = [tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.6 + len * 0.45];
        const mid = [(tx + tip[0]) / 2, (ty + tip[1]) / 2 - len * 0.22];
        d += " " + poly([[tx, ty - 1], mid, tip, [mid[0], mid[1] + 2.2], [tx, ty + 1.5]]);
    });
    return d;
}

/** Acacia: thin forked trunk and a wide, flat umbrella crown. y = crown underside, s = half width */
export function acacia(x, y, s) {
    return [
        poly([[x - 1.4, GROUND], [x - 0.9, y + 2], [x + 0.9, y + 2], [x + 1.6, GROUND]]),
        poly([[x - 0.8, y + 10], [x - s * 0.45, y + 1], [x - s * 0.45 + 2, y + 1], [x + 0.6, y + 13]]),
        poly([
            [x - s, y], [x - s * 0.8, y - s * 0.2], [x - s * 0.3, y - s * 0.3], [x + s * 0.35, y - s * 0.28],
            [x + s * 0.85, y - s * 0.17], [x + s, y], [x + s * 0.5, y + s * 0.07], [x - s * 0.5, y + s * 0.07],
        ]),
    ].join(" ");
}

/** Cypress: tall, thin, pointed flame shape */
export const cypress = (x, h, w = 6) =>
    poly([
        [x - w * 0.35, GROUND], [x - w * 0.5, 300 - h * 0.45], [x - w * 0.3, 300 - h * 0.85], [x, 300 - h],
        [x + w * 0.3, 300 - h * 0.85], [x + w * 0.5, 300 - h * 0.45], [x + w * 0.35, GROUND],
    ]);

/** Umbrella (stone) pine: tall bare trunk with a flat cloud of a crown */
export const umbrellaPine = (x, h, s) => acacia(x, 300 - h, s);
