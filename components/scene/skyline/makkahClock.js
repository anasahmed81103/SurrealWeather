import { blocks, ridge, windowsFor } from "./shapes";
import { disc, finial, minaret, taper } from "./ornaments";

/* ------------------------------------------------------------------
 * Saudi Arabia — the Makkah Royal Clock Tower (Abraj Al-Bait): a huge
 * tower with its great clock and tapering crown, flanked by hotel
 * towers and the minarets of the Grand Mosque, rocky hills behind.
 * Night: the clock face glows white-green, the crown is lit.
 * ------------------------------------------------------------------ */

const CX = 236;

const clockTower = [
    blocks([[CX - 21, 42, 300 - 126], [CX - 24, 48, 300 - 76]]), // shaft + clock section
    taper(CX, 77, 40, 32, 8), // the crown
    finial(CX, 40, 22),
    disc(CX, 18, 3.4), // crescent finial, simplified to a ball
].join(" ");

const hotels = [
    [140, 34, 120, "step"],
    [176, 30, 160, "step"],
    [270, 30, 150, "step"],
    [302, 36, 112, "step"],
    [124, 172, 64], // podium
];

const minarets = [70, 100, 360, 386].map((x, i) => minaret(x, 130 + (i % 2) * 14, 302, 7)).join(" ");

const hills = ridge([[-10, 220], [40, 200], [90, 214], [150, 186], [210, 206], [280, 180], [340, 204], [410, 192]]);

export default {
    far: hills,
    near: `${clockTower} ${blocks(hotels)} ${minarets}`,
    glow: { d: `${disc(CX, 100, 16)} ${taper(CX, 77, 40, 32, 8)}`, color: "#E6FFEE", opacity: 0.6 },
    windows: windowsFor(hotels, 23, 0.26),
    beacons: [70, 100, 360, 386].map((x, i) => ({ x, y: 130 + (i % 2) * 14, color: "#A8F0C0" })),
};
