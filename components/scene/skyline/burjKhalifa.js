import { blocks, poly, row, tiers, windowsFor } from "./shapes";
import { finial } from "./ornaments";
import { palm } from "./nature";

/* ------------------------------------------------------------------
 * UAE — Dubai: the Burj Khalifa's stepped needle rising far above
 * a cluster of towers, the Burj Al Arab's sail in the distance,
 * palms along the front. Night: the needle glows, a red beacon on top.
 * ------------------------------------------------------------------ */

const BURJ = 206;

// Setbacks get narrower all the way up (a slight left/right shift makes it spiral)
const burj = tiers(BURJ, [
    [44, 250], [36, 216], [30, 182], [25, 148], [20, 116], [15, 88], [11, 64], [7, 44], [4, 28],
]).map(([x, w, h], i) => [x + (i % 2 ? 1.5 : -1.5), w, h]);
const needle = `${blocks(burj)} ${finial(BURJ, 28, 22)}`;

// Burj Al Arab: a sail with a mast, far left
const sail = `${poly([[22, 300], [24, 190], [34, 196], [52, 240], [58, 300]])} ${blocks([[20, 3, 116]])}`;

const towers = [
    ...row(-4, 176, 101, { minH: 40, maxH: 128, minW: 12, maxW: 22, roof: (i, r) => (r < 0.25 ? "spire" : r < 0.5 ? "step" : "flat") }),
    ...row(236, 404, 103, { minH: 40, maxH: 136, minW: 12, maxW: 22, roof: (i, r) => (r < 0.25 ? "spire" : r < 0.5 ? "step" : "flat") }),
];
const palms = [16, 40, 66, 300, 330, 362, 388].map((x, i) => palm(x, 26 + (i % 3) * 5, i + 3)).join(" ");

export default {
    far: `${sail} ${blocks(row(-6, 406, 107, { minH: 50, maxH: 110, minW: 14, maxW: 26 }))}`,
    near: `${needle} ${blocks(towers)} ${palms}`,
    glow: { d: blocks(burj.slice(3)), color: "#DCE8FF", opacity: 0.38 },
    windows: windowsFor([...towers, ...burj.slice(0, 4)], 19, 0.22),
    beacons: [{ x: BURJ, y: 6, color: "#FF4A3D" }],
};
