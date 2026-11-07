import { blocks, seeded } from "./shapes";
import { minaret } from "./ornaments";
import { trees } from "./nature";

/* ------------------------------------------------------------------
 * Islamabad — Faisal Mosque in front of the Margalla Hills.
 * The tent-shaped prayer hall with its four pencil minarets, on a wide
 * terrace above the trees. Night: the mosque is floodlit warm white,
 * lamps glow along the terrace, small lights tip the minarets.
 * ------------------------------------------------------------------ */

const TERRACE_Y = 272;
const FOOT = TERRACE_Y + 2; // shapes dip into the terrace, so no seam shows

// The hall: a tent with gently curved (concave) sides, and a small finial
const hall =
    `M118,${FOOT} Q176,232 200,164 Q224,232 282,${FOOT} Z ` +
    "M199,167 L199,150 L201,150 L201,167 Z";

// Front pair (taller, wider apart) and back pair (smaller, closer in)
const minarets = [
    minaret(84, 56, FOOT, 7),
    minaret(316, 56, FOOT, 7),
    minaret(124, 76, FOOT, 6),
    minaret(276, 76, FOOT, 6),
].join(" ");

const mosque = `${hall} ${minarets}`;

const terrace = blocks([
    [50, 300, 300 - TERRACE_Y],
    [36, 328, 16],
]);

// The Margalla Hills: one soft ridge behind the city
const hills =
    "M0,214 C40,196 74,204 112,186 C150,168 186,190 228,178 C268,166 304,186 340,176 C366,170 386,182 400,178 L400,310 L0,310 Z";

// A low line of rooftops, and trees in front of the terrace
const town = blocks([
    [0, 26, 42],
    [24, 18, 52],
    [358, 22, 46],
    [378, 26, 38],
]);
const greenery = `${trees(-6, 70, 278, 5)} ${trees(330, 410, 280, 9)} ${trees(60, 340, 292, 17, { minR: 5, maxR: 9 })}`;

// Terrace lamps: a row of warm dots along the top of the terrace
const lamps = Array.from({ length: 24 }, (_, i) => ({ x: 56 + i * 12.4, y: TERRACE_Y + 3, warm: true }));
// A few lit windows in the low town at the sides
const townWindows = [
    [6, 266], [14, 280], [30, 256], [36, 270], [364, 262], [372, 276], [384, 268], [392, 282],
].map(([x, y], i) => ({ x, y, warm: seeded(i) < 0.8 }));

export default {
    far: hills,
    near: `${mosque} ${terrace} ${town} ${greenery}`,
    glow: { d: mosque, color: "#FFF1D6", opacity: 0.45 },
    windows: [...lamps, ...townWindows],
    beacons: [
        { x: 84, y: 56, color: "#FFE7B0" },
        { x: 316, y: 56, color: "#FFE7B0" },
        { x: 124, y: 76, color: "#FFE7B0" },
        { x: 276, y: 76, color: "#FFE7B0" },
    ],
};
