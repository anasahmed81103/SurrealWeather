import { blocks, row, tiers, windowsFor } from "./shapes";

/* ------------------------------------------------------------------
 * New York — the Manhattan skyline: One World Trade Center (left),
 * the Empire State Building (centre right), the Chrysler Building
 * (right), in front of a dense, paler wall of towers.
 * Night: lit windows, the Empire State's floodlit crown, red aircraft
 * beacons blinking on the tallest masts.
 * ------------------------------------------------------------------ */

const ESB = 262; // Empire State centre
const CHRYSLER = 334;

const empireState = tiers(ESB, [
    [46, 212],
    [36, 156],
    [26, 92],
    [18, 80],
    [12, 72],
    [6, 58],
    [2, 30],
]);
// The floodlit top: just the upper tiers, from the mast down to y = 100
const empireCrown = `M${ESB - 9},100 L${ESB - 9},80 L${ESB - 6},80 L${ESB - 6},72 L${ESB - 3},72 L${ESB - 3},58 L${ESB + 3},58 L${ESB + 3},72 L${ESB + 6},72 L${ESB + 6},80 L${ESB + 9},80 L${ESB + 9},100 Z`;

const chryslerShaft = tiers(CHRYSLER, [[30, 196], [22, 128]]);
// The famous crown: a curved, pointed spike
const chryslerCrown = `M${CHRYSLER - 11},130 Q${CHRYSLER - 9},106 ${CHRYSLER},62 Q${CHRYSLER + 9},106 ${CHRYSLER + 11},130 Z`;

// One World Trade Center: a tall tapering prism with a long antenna
const oneWtc = "M52,310 L52,250 L61,74 L79,74 L88,250 L88,310 Z M69,74 L69,20 L71,20 L71,74 Z";

// Lower towers filling the gaps, and a pale wall of towers behind
const fillers = [
    ...row(-4, 50, 41, { minH: 40, maxH: 90, minW: 12, maxW: 20 }),
    ...row(90, 238, 53, { minH: 34, maxH: 104, minW: 12, maxW: 22, roof: (i) => (i % 3 === 1 ? "step" : "flat") }),
    ...row(286, 318, 61, { minH: 40, maxH: 80, minW: 12, maxW: 16 }),
    ...row(350, 404, 67, { minH: 36, maxH: 96, minW: 12, maxW: 20 }),
];
const farRow = row(-6, 406, 71, {
    minH: 60,
    maxH: 168,
    minW: 10,
    maxW: 24,
    roof: (i) => (i % 5 === 2 ? "spire" : i % 4 === 1 ? "step" : "flat"),
});

const lit = [...fillers, ...empireState.slice(0, 3), ...chryslerShaft, [56, 28, 220]];

export default {
    far: blocks(farRow),
    near: `${oneWtc} ${blocks(empireState)} ${blocks(chryslerShaft)} ${chryslerCrown} ${blocks(fillers)}`,
    glow: { d: `${empireCrown} ${chryslerCrown}`, color: "#FFE2A0", opacity: 0.75 },
    windows: windowsFor(lit, 7, 0.2, { dx: 5, dy: 7 }),
    beacons: [
        { x: 70, y: 20, color: "#FF4A3D" },
        { x: ESB, y: 30, color: "#FF4A3D" },
    ],
};
