import { blocks, lamps, poly, ridge, row } from "./shapes";
import { minaret } from "./ornaments";
import { palm } from "./nature";

/* ------------------------------------------------------------------
 * Egypt — the Pyramids of Giza over desert dunes, palms on the left,
 * Cairo's rooftops and minarets far behind.
 * Day: the sunlit (right) faces are lighter, so they look solid.
 * Night: a soft gold glow, like the sound-and-light show.
 * ------------------------------------------------------------------ */

// [centre, half width, apex y, base y]
const PYRAMIDS = [
    [118, 74, 132, 286],
    [246, 90, 120, 292],
    [344, 40, 214, 290],
    [376, 14, 262, 292],
];

const shapes = PYRAMIDS.map(([cx, hw, top, base]) => poly([[cx - hw, base + 2], [cx, top], [cx + hw, base + 2]])).join(" ");
// The right-hand face of each pyramid (lit by the sun)
const sunlit = PYRAMIDS.map(([cx, hw, top, base]) => poly([[cx, top], [cx + hw, base + 2], [cx + hw * 0.18, base + 2]])).join(" ");

const dunes = ridge([[-10, 292], [70, 286], [160, 296], [260, 290], [340, 296], [410, 290]]);
const palms = [8, 26, 44].map((x, i) => palm(x, 34 + i * 6, i + 11)).join(" ");

const cairo = row(-4, 404, 121, { minH: 16, maxH: 40, minW: 12, maxW: 24 });

export default {
    far: `${blocks(cairo)} ${minaret(60, 220, 302, 4)} ${minaret(300, 214, 302, 4)} ${minaret(332, 226, 302, 4)}`,
    near: `${shapes} ${dunes} ${palms}`,
    highlight: { d: sunlit, color: "#FFE2B0", opacity: 0.28, layer: "near" },
    glow: { d: shapes, color: "#FFC27E", opacity: 0.3 },
    windows: lamps(70, 330, 296, 18),
};
