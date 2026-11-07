import { blocks, row, seeded, windowsFor } from "../shapes";
import { cross, onion, spire } from "../ornaments";
import { trees } from "../nature";

/* ------------------------------------------------------------------
 * Russia, Ukraine, Belarus, Moldova (generic) — an Orthodox church
 * with five onion domes and a tent-roofed bell tower, wooden houses,
 * tall apartment blocks behind. Night: the church is floodlit gold.
 * ------------------------------------------------------------------ */

export default function orthodoxTown(seed) {
    const cx = 120 + seeded(seed) * 150;
    const tower = seeded(seed + 1) < 0.5 ? cx + 54 : cx - 54;

    const church = [
        blocks([[cx - 32, 64, 66], [cx - 7, 14, 94], [cx - 25, 8, 82], [cx + 17, 8, 82]]),
        onion(cx, 207, 13),
        onion(cx - 21, 219, 7),
        onion(cx + 21, 219, 7),
        blocks([[tower - 7, 14, 112]]),
        spire(tower, 189, 14, 36),
        cross(tower, 153, 8),
    ].join(" ");

    const houses = row(-4, 404, seed + 3, { minH: 12, maxH: 28, minW: 14, maxW: 24, roof: (i, r) => (r < 0.6 ? "gable" : "flat"), gap: 2 });
    const blocksBehind = row(-6, 406, seed + 5, { minH: 40, maxH: 96, minW: 22, maxW: 40 });

    return {
        far: blocks(blocksBehind),
        near: `${church} ${blocks(houses)} ${trees(-6, 40, 286, seed + 9)} ${trees(360, 410, 286, seed + 11)}`,
        glow: { d: church, color: "#FFD38A", opacity: 0.5 },
        windows: [...windowsFor(houses, seed, 0.3, { dx: 6, dy: 6 }), ...windowsFor(blocksBehind, seed + 1, 0.16, { dx: 6, dy: 8 })],
    };
}
