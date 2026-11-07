import { blocks, ridge, row, windowsFor } from "./shapes";
import { dome, minaret } from "./ornaments";

/* ------------------------------------------------------------------
 * Turkey — the Blue Mosque (Sultan Ahmed): domes cascading down from
 * the great central dome, ringed by six pencil minarets.
 * Night: the whole mosque glows warm gold.
 * ------------------------------------------------------------------ */

const mosque = [
    blocks([[116, 168, 300 - 254], [146, 108, 300 - 224], [172, 56, 300 - 198]]), // hall, upper hall, drum
    dome(200, 199, 30, 0.12), // the great dome
    dome(166, 225, 18, 0.1), // half domes stepping down
    dome(234, 225, 18, 0.1),
    dome(132, 255, 10, 0.1),
    dome(268, 255, 10, 0.1),
    dome(150, 225, 7, 0.2),
    dome(250, 225, 7, 0.2),
].join(" ");

// Six minarets: four close, two further out (the far pair a little lower)
const minarets = [
    minaret(98, 66, 302, 6),
    minaret(302, 66, 302, 6),
    minaret(126, 96, 302, 5),
    minaret(274, 96, 302, 5),
    minaret(58, 112, 302, 5),
    minaret(342, 112, 302, 5),
].join(" ");

const old = row(-4, 404, 111, { minH: 12, maxH: 30, minW: 12, maxW: 24, roof: (i, r) => (r < 0.4 ? "slope" : "flat") });
const hills = ridge([[-10, 230], [80, 214], [170, 226], [260, 206], [340, 222], [410, 212]]);

export default {
    far: hills,
    near: `${mosque} ${minarets} ${blocks(old)}`,
    glow: { d: `${mosque} ${minarets}`, color: "#FFD49A", opacity: 0.45 },
    windows: windowsFor(old, 29, 0.28, { dx: 6, dy: 6 }),
    beacons: [98, 302].map((x) => ({ x, y: 66, color: "#FFE7B0" })),
};
