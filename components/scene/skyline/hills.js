import { blocks } from "./shapes";
import { trees } from "./nature";

/* ------------------------------------------------------------------
 * Hills — the quiet fallback for places without a landmark yet:
 * two rolling ridges, a line of trees, and a few small houses whose
 * windows light up in the evening.
 * ------------------------------------------------------------------ */

const farRidge =
    "M0,236 C50,214 96,226 140,210 C188,192 226,214 268,204 C312,194 356,212 400,200 L400,310 L0,310 Z";
const nearRidge =
    "M0,268 C60,252 118,262 170,254 C232,244 288,262 342,252 C368,248 388,254 400,252 L400,310 L0,310 Z";

const houses = [
    [72, 14, 30],
    [88, 10, 24],
    [246, 16, 32],
    [264, 12, 26],
    [330, 12, 28],
];

export default {
    far: farRidge,
    near: `${nearRidge} ${blocks(houses)} ${trees(0, 60, 262, 31)} ${trees(150, 230, 262, 37)} ${trees(350, 410, 258, 43)}`,
    windows: [
        { x: 77, y: 278, warm: true },
        { x: 92, y: 282, warm: true },
        { x: 251, y: 276, warm: true },
        { x: 258, y: 284, warm: true },
        { x: 268, y: 280, warm: false },
        { x: 335, y: 280, warm: true },
    ],
};
