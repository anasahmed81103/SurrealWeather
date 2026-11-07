import { blocks, row, seeded, windowsFor } from "../shapes";
import { stupa } from "../ornaments";
import { palm } from "../nature";

/* ------------------------------------------------------------------
 * South-East & South Asia, Buddhist/Hindu countries (generic: Thailand,
 * Cambodia, Laos, Myanmar, Sri Lanka, Nepal...) — a temple of three
 * bell-shaped stupas with needle spires, palms all around, modern
 * towers behind. Night: the stupas glow gold.
 * ------------------------------------------------------------------ */

export default function templeCity(seed) {
    const cx = 110 + seeded(seed) * 180;
    const temple = [
        stupa(cx, 284, 28, 190),
        stupa(cx - 52, 288, 15, 120),
        stupa(cx + 52, 288, 15, 120),
        blocks([[cx - 74, 148, 14]]),
    ].join(" ");

    const towers = row(-6, 406, seed + 3, { minH: 40, maxH: 110, minW: 12, maxW: 24, roof: (i, r) => (r < 0.3 ? "step" : "flat") });
    const houses = row(-4, 404, seed + 5, { minH: 8, maxH: 24, minW: 14, maxW: 24, gap: 3 });
    const palms = [0.04, 0.16, 0.3, 0.7, 0.86, 0.97]
        .map((f, i) => palm(f * 400, 30 + seeded(seed + i) * 18, seed + i * 2))
        .join(" ");

    return {
        far: blocks(towers),
        near: `${temple} ${blocks(houses)} ${palms}`,
        glow: { d: temple, color: "#FFC766", opacity: 0.5 },
        windows: [...windowsFor(towers, seed, 0.16), ...windowsFor(houses, seed + 1, 0.3, { dx: 6, dy: 6 })],
    };
}
