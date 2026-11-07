import { blocks, row, seeded, windowsFor } from "./shapes";

/* ------------------------------------------------------------------
 * Paris — the Eiffel Tower over rows of mansard rooftops.
 * Night: the tower glows gold and sparkles (like its hourly light show),
 * with a beacon on top.
 * ------------------------------------------------------------------ */

const CX = 128; // tower centre (left third: a calmer picture than dead centre)

// The tower, in four stacked pieces + holes between the legs.
// Written relative to its centre (u = x - CX) so it's easy to move.
const TOWER = [
    // legs + first platform; the arch between the legs is the open bottom
    "M-49,310 L-49,300 Q-36,282 -30,262 L-34,262 L-34,256 L34,256 L34,262 L30,262 Q36,282 49,300 L49,310 L36,310 L36,300 C30,284 14,272 0,272 C-14,272 -30,284 -36,300 L-36,310 Z",
    // between first and second platform (with an opening)
    "M-27,257 L-16,213 L-20,213 L-20,209 L20,209 L20,213 L16,213 L27,257 Z",
    "M-12,257 L12,257 L0,226 Z",
    // the long taper up to the top platform (with a small opening at its foot)
    "M-15,210 Q-7,150 -4,90 L-6,90 L-6,85 L6,85 L6,90 L4,90 Q7,150 15,210 Z",
    "M-8,210 L8,210 L0,184 Z",
    // top and antenna
    "M-4,86 L-3,64 L-1,58 L-1,40 L1,40 L1,58 L3,64 L4,86 Z",
];

/** Move "u,y" pairs by CX → real coordinates */
const place = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, u, y) => `${Number(u) + CX},${y}`);
const tower = TOWER.map(place).join(" ");

/** Half the tower's width at height y (for scattering sparkles on it) */
function halfWidth(y) {
    if (y < 86) return (4 * (y - 40)) / 46;
    if (y < 210) return 4 + 11 * ((y - 86) / 124) ** 2;
    if (y < 256) return 15 + ((y - 210) / 46) * 12;
    return 27 + ((y - 256) / 44) * 20;
}

const sparkles = Array.from({ length: 42 }, (_, i) => {
    const y = 48 + seeded(i * 4.1) * 222;
    return { x: CX + (seeded(i * 9.3) * 2 - 1) * halfWidth(y) * 0.9, y };
});

// Rooftops: a faint far row, and a nearer row of low Haussmann blocks
const farRow = [
    ...row(0, 400, 11, { minH: 24, maxH: 46, minW: 12, maxW: 26, roof: "slope" }),
    [300, 16, 112], // Tour Montparnasse, far away
];
const nearRow = row(-4, 404, 23, { minH: 14, maxH: 30, minW: 16, maxW: 34, roof: "slope", gap: 1 });

export default {
    far: blocks(farRow),
    near: `${tower} ${blocks(nearRow)}`,
    glow: { d: tower, color: "#FFB84A", opacity: 0.55 },
    windows: windowsFor(nearRow, 3, 0.3, { dx: 6, dy: 6 }),
    sparkles,
    beacons: [{ x: CX, y: 40, color: "#FFF4D6" }],
};
