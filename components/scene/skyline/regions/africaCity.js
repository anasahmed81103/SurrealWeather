import { blocks, ridge, row, seeded, windowsFor } from "../shapes";
import { acacia } from "../nature";

/* ------------------------------------------------------------------
 * Sub-Saharan Africa (generic) — a modern city of mid-rise towers on
 * the horizon, wide flat-crowned acacias in the foreground, low
 * houses between. The towers light up at night.
 * ------------------------------------------------------------------ */

export default function africaCity(seed) {
    const c0 = 70 + seeded(seed) * 120;
    const towers = row(c0, c0 + 160, seed + 3, {
        minH: 40,
        maxH: 140,
        minW: 12,
        maxW: 24,
        roof: (i, r) => (r < 0.2 ? "spire" : r < 0.4 ? "step" : "flat"),
    });
    const houses = row(-4, 404, seed + 5, { minH: 8, maxH: 22, minW: 14, maxW: 26, gap: 4 });
    const trees = [
        acacia(30 + seeded(seed + 1) * 30, 262, 30),
        acacia(330 + seeded(seed + 2) * 40, 254, 34),
        acacia(250, 274, 18),
    ].join(" ");
    const savanna = ridge([[-10, 252], [120, 244], [250, 254], [410, 240]]);

    return {
        far: `${savanna} ${blocks(towers)}`,
        near: `${blocks(houses)} ${trees}`,
        windows: [...windowsFor(towers, seed, 0.2), ...windowsFor(houses, seed + 1, 0.25, { dx: 7, dy: 6 })],
        beacons: [{ x: towers[0][0] + towers[0][1] / 2, y: 300 - towers[0][2], color: "#FF4A3D" }],
    };
}
