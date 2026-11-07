import { blocks, ridge, row, seeded, windowsFor } from "../shapes";
import { dome, minaret } from "../ornaments";
import { palm } from "../nature";

/* ------------------------------------------------------------------
 * Muslim-majority countries (generic) — a mosque with a pointed dome
 * and two or four minarets, flat-roofed houses (some with little
 * domes), palms, low hills behind. The seed picks the mosque's place,
 * its minaret count and the town around it.
 * Night: the mosque glows, soft green lights tip the minarets.
 * ------------------------------------------------------------------ */

export default function islamicTown(seed) {
    const cx = 110 + seeded(seed) * 180;
    const four = seeded(seed + 1) < 0.45;
    const tall = 96 + seeded(seed + 2) * 30; // minaret top y

    const tips = [[cx - 50, tall], [cx + 50, tall], ...(four ? [[cx - 70, tall + 34], [cx + 70, tall + 34]] : [])];
    const mosque = [
        blocks([[cx - 38, 76, 44], [cx - 17, 34, 60]]),
        dome(cx, 241, 21, 0.32),
        dome(cx - 28, 257, 7, 0.35),
        dome(cx + 28, 257, 7, 0.35),
        ...tips.map(([x, y]) => minaret(x, y, 302, 6)),
    ].join(" ");

    const houses = row(-4, 404, seed + 3, { minH: 12, maxH: 36, minW: 14, maxW: 26, gap: 1 });
    // A few houses get a small dome on the roof
    const roofDomes = houses
        .filter((_, i) => seeded(seed + i * 4.3) < 0.18)
        .map(([x, w, h]) => dome(x + w / 2, 300 - h, w * 0.28, 0.3))
        .join(" ");
    const palms = [0.06, 0.2, 0.82, 0.95].map((f, i) => palm(f * 400, 28 + seeded(seed + i) * 14, seed + i)).join(" ");
    const hills = ridge([[-10, 236], [90, 222], [200, 232], [300, 214], [410, 228]]);

    return {
        far: `${hills} ${blocks(row(-6, 406, seed + 5, { minH: 24, maxH: 54, minW: 16, maxW: 30 }))}`,
        near: `${mosque} ${blocks(houses)} ${roofDomes} ${palms}`,
        glow: { d: mosque, color: "#FFE6B5", opacity: 0.45 },
        windows: windowsFor(houses, seed, 0.3, { dx: 6, dy: 7 }),
        beacons: tips.map(([x, y]) => ({ x, y, color: "#A8F0C0" })),
    };
}
