import { blocks, ridge, row, seeded, windowsFor } from "../shapes";
import { disc, finial } from "../ornaments";

/* ------------------------------------------------------------------
 * Everywhere else (generic: Canada, New Zealand, Israel, Singapore...)
 * — a modern downtown: a dense cluster of towers, one or two tall
 * landmarks with spires, sometimes a TV tower, hills behind.
 * ------------------------------------------------------------------ */

export default function modernCity(seed) {
    const towers = row(-4, 404, seed + 3, {
        minH: 30,
        maxH: 140,
        minW: 12,
        maxW: 24,
        roof: (i, r) => (r < 0.15 ? "spire" : r < 0.35 ? "step" : "flat"),
        gap: 1,
    });
    // One or two standout towers
    const tallX = 80 + seeded(seed) * 240;
    const tall = [[tallX - 12, 24, 190, "spire"], ...(seeded(seed + 1) < 0.5 ? [[tallX + 30, 20, 160, "step"]] : [])];

    const tv = seeded(seed + 2) < 0.4;
    const tvX = tallX < 200 ? 320 : 80;
    const tvTower = tv ? `${blocks([[tvX - 2.5, 5, 210]])} ${disc(tvX, 104, 9)} ${finial(tvX, 92, 40)}` : "";

    const hills = ridge([[-10, 226], [100, 206], [220, 222], [320, 200], [410, 214]]);

    return {
        far: `${hills} ${blocks(row(-6, 406, seed + 5, { minH: 40, maxH: 100, minW: 14, maxW: 26 }))}`,
        near: `${blocks([...towers, ...tall])} ${tvTower}`,
        windows: windowsFor([...towers, ...tall], seed, 0.2),
        beacons: [{ x: tallX, y: 300 - 190 - 38, color: "#FF4A3D" }, ...(tv ? [{ x: tvX, y: 52, color: "#FF4A3D" }] : [])],
    };
}
