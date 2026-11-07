import { blocks, row, windowsFor } from "./shapes";

/* ------------------------------------------------------------------
 * Australia — Sydney: the Opera House's white sails on the right,
 * the Harbour Bridge's great arch on the left, city towers behind.
 * Day: the sails catch the light (pale highlight).
 * Night: the sails glow, the bridge's lamps run along the deck.
 * ------------------------------------------------------------------ */

const PODIUM = 270;

/** One sail: rises on a curve to a forward-leaning tip */
const sail = (x, w, h) =>
    `M${x},${PODIUM + 1} Q${x + w * 0.15},${PODIUM - h * 0.9} ${x + w * 0.8},${PODIUM - h} Q${x + w * 0.75},${PODIUM - h * 0.4} ${x + w},${PODIUM + 1} Z`;

const sails = [
    [230, 42, 54], [258, 38, 70], [284, 34, 56], // front hall
    [304, 30, 42], [322, 26, 48], [340, 22, 36], // second hall
].map(([x, w, h]) => sail(x, w, h)).join(" ");
const opera = `${sails} ${blocks([[220, 146, 300 - PODIUM]])}`;

// Harbour Bridge: an arch band from pylon to pylon, the deck, hangers between
const archY = (x) => {
    const t = (x - 20) / 150;
    return (1 - t) ** 2 * 250 + 2 * t * (1 - t) * 142 + t ** 2 * 250;
};
let hangers = "";
for (let x = 38; x <= 152; x += 12) {
    const top = archY(x);
    if (top < 246) hangers += `M${x - 0.5},248 L${x - 0.5},${Math.round(top)} L${x + 0.5},${Math.round(top)} L${x + 0.5},248 Z `;
}
const bridge = [
    "M20,251 Q95,142 170,251 L158,251 Q95,170 32,251 Z", // the arch band
    "M-10,251 L-10,246 L196,246 L196,251 Z", // the deck
    blocks([[6, 18, 66], [166, 18, 66]]), // stone pylons
    hangers,
].join(" ");

const cbd = row(120, 300, 171, { minH: 50, maxH: 130, minW: 12, maxW: 22, roof: (i, r) => (r < 0.25 ? "step" : "flat") });
const shore = blocks([[-10, 420, 18]]);

export default {
    far: blocks([...cbd, ...row(-6, 406, 173, { minH: 20, maxH: 50, minW: 14, maxW: 26 })]),
    near: `${opera} ${bridge} ${shore}`,
    highlight: { d: sails, color: "#FFFFFF", opacity: 0.4, layer: "near" },
    glow: { d: sails, color: "#FFF0DA", opacity: 0.55 },
    windows: [
        ...windowsFor(cbd, 47, 0.16),
        ...Array.from({ length: 17 }, (_, i) => ({ x: -4 + i * 12, y: 243, warm: true })),
    ],
};
