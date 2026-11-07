import { blocks, ridge, row, windowsFor } from "./shapes";
import { pagoda } from "./ornaments";
import { trees } from "./nature";

/* ------------------------------------------------------------------
 * Japan — Mount Fuji with its snow cap, behind a five-storey pagoda
 * on a wooded hill and a low town (the famous Chureito view).
 * The snow cap stays pale by day and turns faint at night.
 * ------------------------------------------------------------------ */

const fuji = "M-10,310 L-10,262 C60,250 150,222 238,92 L262,92 C350,222 440,250 410,262 L410,310 Z";
// Snow cap with a ragged lower edge
const snow = "M238,92 L262,92 L290,134 L280,130 L272,141 L262,131 L252,144 L242,132 L232,141 L222,129 L210,136 Z";

const PAGODA_X = 92;
const tower = pagoda(PAGODA_X, 244, 5, 22, 17);
const hill = ridge([[-10, 236], [40, 226], [110, 240], [170, 262], [240, 272], [410, 276]]);
const woods = `${trees(-6, 60, 236, 41)} ${trees(120, 190, 258, 43, { minR: 5, maxR: 9 })}`;
const town = row(150, 404, 131, { minH: 10, maxH: 30, minW: 12, maxW: 22, roof: (i, r) => (r < 0.6 ? "slope" : "flat") });

export default {
    far: fuji,
    near: `${tower} ${hill} ${woods} ${blocks(town)}`,
    highlight: { d: snow, color: "#FFFFFF", opacity: 0.7, layer: "far" },
    glow: { d: tower, color: "#FFB27A", opacity: 0.4 },
    windows: windowsFor(town, 31, 0.3, { dx: 5, dy: 6 }),
};
