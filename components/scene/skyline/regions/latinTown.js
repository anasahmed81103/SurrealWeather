import { blocks, poly, row, seeded, windowsFor } from "../shapes";
import { cross, dome } from "../ornaments";
import { palm } from "../nature";

/* ------------------------------------------------------------------
 * Latin America (generic) — a colonial church with twin bell towers
 * and a dome, low flat-roofed houses, palms, mountains behind
 * (the Andes / Sierra Madre feel). Night: the church glows warm.
 * ------------------------------------------------------------------ */

export default function latinTown(seed) {
    const cx = 110 + seeded(seed) * 180;
    const church = [
        blocks([[cx - 26, 52, 66, "gable"], [cx - 32, 14, 100], [cx + 18, 14, 100]]),
        blocks([[cx - 30, 10, 112], [cx + 20, 10, 112]]), // belfries
        dome(cx - 25, 188, 6, 0.3),
        dome(cx + 25, 188, 6, 0.3),
        cross(cx - 25, 176, 7),
        cross(cx + 25, 176, 7),
        blocks([[cx + 8, 50, 60]]), // nave behind
        dome(cx + 33, 240, 14, 0.15),
    ].join(" ");

    const houses = row(-4, 404, seed + 3, { minH: 10, maxH: 30, minW: 14, maxW: 26, gap: 1 });
    const palms = [0.05, 0.9].map((f, i) => palm(f * 400, 34 + seeded(seed + i) * 12, seed + i)).join(" ");
    // Jagged peaks (straight slopes read as mountains, smooth curves read as hills)
    const peaks = [[-10, 210], [30, 176], [52, 188], [96, 150], [140, 196], [176, 168], [200, 180], [252, 136], [300, 190], [342, 158], [370, 172], [410, 150]];
    const mountains = poly([[-10, 310], ...peaks.map(([x, y]) => [x, y + seeded(seed + x) * 16]), [410, 310]]);

    return {
        far: mountains,
        near: `${church} ${blocks(houses)} ${palms}`,
        glow: { d: church, color: "#FFD08A", opacity: 0.45 },
        windows: windowsFor(houses, seed, 0.3, { dx: 6, dy: 6 }),
    };
}
