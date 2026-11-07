import { blocks, row, seeded, windowsFor } from "../shapes";
import { disc, finial, pagoda } from "../ornaments";
import { trees } from "../nature";

/* ------------------------------------------------------------------
 * East Asia (generic: Korea, Taiwan, Vietnam, Mongolia, Hong Kong...)
 * — an old pagoda among trees and low tiled roofs, in front of a
 * modern wall of towers; sometimes a TV tower with its round pod.
 * ------------------------------------------------------------------ */

export default function eastAsiaCity(seed) {
    const px = 60 + seeded(seed) * 280;
    const levels = 4 + Math.floor(seeded(seed + 1) * 3);
    const temple = pagoda(px, 300, levels, 26, 24);

    const towers = row(-6, 406, seed + 3, {
        minH: 50,
        maxH: 130,
        minW: 12,
        maxW: 24,
        roof: (i, r) => (r < 0.2 ? "spire" : r < 0.4 ? "step" : "flat"),
    });
    const tv = seeded(seed + 2) < 0.5;
    const tvX = px < 200 ? 300 : 100;
    const tvTower = tv ? `${blocks([[tvX - 2, 4, 200]])} ${disc(tvX, 112, 8)} ${finial(tvX, 100, 34)}` : "";

    const roofs = row(-4, 404, seed + 5, { minH: 10, maxH: 26, minW: 14, maxW: 26, roof: "slope", gap: 2 });

    return {
        far: `${blocks(towers)} ${tvTower}`,
        near: `${temple} ${blocks(roofs)} ${trees(px - 70, px - 30, 284, seed + 7)} ${trees(px + 30, px + 70, 284, seed + 9)}`,
        glow: { d: temple, color: "#FFB27A", opacity: 0.45 },
        windows: [...windowsFor(towers, seed, 0.18), ...windowsFor(roofs, seed + 1, 0.3, { dx: 6, dy: 6 })],
        beacons: tv ? [{ x: tvX, y: 66, color: "#FF4A3D" }] : [],
    };
}
