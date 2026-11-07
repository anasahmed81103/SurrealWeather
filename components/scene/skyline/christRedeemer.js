import { blocks, poly, ridge, row, windowsFor } from "./shapes";
import { disc } from "./ornaments";
import { palm } from "./nature";

/* ------------------------------------------------------------------
 * Brazil — Rio: Christ the Redeemer, arms open, on top of Corcovado;
 * Sugarloaf Mountain far to the left; the city along the shore below.
 * Night: the statue glows white high above the dark mountain.
 * ------------------------------------------------------------------ */

const PEAK = 251; // statue centre
const BASE = 128; // top of the mountain

const mountain = "M-10,310 L-10,280 C80,270 150,252 196,196 C218,168 234,142 245,129 L257,129 C270,150 300,204 410,230 L410,310 Z";

const statue = [
    poly([[PEAK - 3, BASE + 2], [PEAK - 3, BASE - 7], [PEAK + 3, BASE - 7], [PEAK + 3, BASE + 2]]), // pedestal
    poly([[PEAK - 3.5, BASE - 7], [PEAK - 2.2, BASE - 33], [PEAK + 2.2, BASE - 33], [PEAK + 3.5, BASE - 7]]), // robe
    poly([[PEAK - 14, BASE - 32], [PEAK + 14, BASE - 32], [PEAK + 14, BASE - 29.5], [PEAK - 14, BASE - 29.5]]), // open arms
    disc(PEAK, BASE - 36, 2.2), // head
].join(" ");

// Sugarloaf (tall rounded dome) and the smaller Urca hill
const sugarloaf = "M8,310 L8,250 C14,198 40,150 70,150 C96,150 112,196 124,236 C134,220 150,214 166,222 C178,230 190,250 198,262 L198,310 Z";
const farHills = ridge([[-10, 262], [60, 250], [200, 258], [300, 236], [410, 246]]);

const shore = row(-4, 404, 161, { minH: 10, maxH: 34, minW: 10, maxW: 20 });
const palms = [12, 120, 146, 330, 372].map((x, i) => palm(x, 24 + (i % 2) * 6, i + 21)).join(" ");

export default {
    far: `${sugarloaf} ${farHills}`,
    near: `${mountain} ${statue} ${blocks(shore)} ${palms}`,
    glow: { d: statue, color: "#F4F7FF", opacity: 0.9 },
    windows: windowsFor(shore, 43, 0.3, { dx: 5, dy: 6 }),
};
