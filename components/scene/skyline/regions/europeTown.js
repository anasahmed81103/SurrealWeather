import { blocks, row, seeded, windowsFor } from "../shapes";
import { dome, finial, gothicTower, spire } from "../ornaments";

/* ------------------------------------------------------------------
 * Europe (generic) — an old town of gabled houses around a church.
 * The seed (from the city's coordinates) picks where the church
 * stands and which kind it is:
 *   gothic twin spires · one tall spire · a baroque dome
 * so neighbouring cities don't look identical.
 * ------------------------------------------------------------------ */

function church(cx, kind) {
    if (kind === 0) {
        // Gothic cathedral: nave with a pointed roof, two spired towers in front
        return [
            blocks([[cx - 8, 76, 64, "gable"]]),
            gothicTower(cx - 13, 16, 116, 54),
            gothicTower(cx + 13, 16, 116, 54),
            blocks([[cx - 5, 10, 104]]),
        ].join(" ");
    }
    if (kind === 1) {
        // Parish church: one tall tower with a needle spire, the nave beside it
        return [blocks([[cx + 4, 70, 56, "gable"]]), gothicTower(cx, 18, 128, 72)].join(" ");
    }
    // Baroque church: a dome on a drum, lantern on top, two small towers
    return [
        blocks([[cx - 34, 68, 70], [cx - 15, 30, 104]]),
        dome(cx, 197, 17, 0.08),
        blocks([[cx - 3, 6, 120]]),
        spire(cx, 181, 6, 12),
        blocks([[cx - 40, 12, 100], [cx + 28, 12, 100]]),
        dome(cx - 34, 201, 6, 0.4),
        dome(cx + 34, 201, 6, 0.4),
    ].join(" ");
}

export default function europeTown(seed) {
    const cx = 110 + seeded(seed) * 180;
    const kind = Math.floor(seeded(seed + 1) * 3);
    const houses = row(-4, 404, seed + 7, { minH: 18, maxH: 42, minW: 14, maxW: 26, roof: (i, r) => (r < 0.65 ? "gable" : "slope"), gap: 1 });
    const farRoofs = row(-6, 406, seed + 9, { minH: 30, maxH: 62, minW: 14, maxW: 30, roof: (i, r) => (r < 0.5 ? "gable" : "flat") });
    const farX = cx < 200 ? 330 : 70; // a second, distant church on the other side
    const main = church(cx, kind);

    return {
        far: `${blocks(farRoofs)} ${gothicTower(farX, 12, 96, 40)} ${finial(farX, 164, 6)}`,
        near: `${main} ${blocks(houses)}`,
        glow: { d: main, color: "#FFD7A0", opacity: 0.45 },
        windows: windowsFor(houses, seed, 0.28, { dx: 6, dy: 7 }),
    };
}
