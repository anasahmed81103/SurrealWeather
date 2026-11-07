import { blocks, lamps, row, windowsFor } from "./shapes";
import { dome, minaret, finial } from "./ornaments";
import { cypress } from "./nature";

/* ------------------------------------------------------------------
 * India — the Taj Mahal: the bulb dome on its drum, two small kiosks,
 * four minarets on the plinth, cypresses lining the garden in front.
 * White marble: a pale highlight by day, cool moonlit white at night.
 * ------------------------------------------------------------------ */

const PLINTH = 262;

// The big bulb dome (wider than its drum, narrowing to a pointed tip)
const bulb = "M172,199 C163,182 166,161 185,150 C194,145 198,138 200,127 C202,138 206,145 215,150 C234,161 237,182 228,199 Z";

const tomb = [
    blocks([[136, 128, 300 - 212], [176, 48, 300 - 196]]), // main hall + drum
    bulb,
    finial(200, 128, 18),
    blocks([[150, 16, 300 - 197], [234, 16, 300 - 197]]), // kiosks on the roof
    dome(158, 197, 8, 0.5),
    dome(242, 197, 8, 0.5),
    minaret(92, 150, PLINTH + 2, 8, "dome"),
    minaret(308, 150, PLINTH + 2, 8, "dome"),
].join(" ");

const plinth = blocks([[76, 248, 300 - PLINTH]]);
const garden = [64, 82, 100, 118, 282, 300, 318, 336].map((x, i) => cypress(x, 28 + (i % 2) * 6)).join(" ");

const town = row(-4, 404, 81, { minH: 18, maxH: 44, minW: 14, maxW: 26 });

export default {
    far: blocks(town),
    near: `${tomb} ${plinth} ${garden}`,
    highlight: { d: tomb, color: "#FFFFFF", opacity: 0.32, layer: "near" },
    glow: { d: tomb, color: "#EEF0FF", opacity: 0.42 },
    windows: [...lamps(84, 316, PLINTH + 4, 14), ...windowsFor(town, 13, 0.12)],
    beacons: [{ x: 200, y: 110, color: "#FFE7B0" }],
};
