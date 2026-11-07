import { blocks, row, windowsFor } from "./shapes";
import { archHole, dome, rectHole, spire } from "./ornaments";
import { cypress, umbrellaPine } from "./nature";

/* ------------------------------------------------------------------
 * Italy — Rome: the Colosseum with its rows of open arches (you see
 * the sky through them) and its broken, stepped right side, between
 * cypresses and umbrella pines; St Peter's dome far behind.
 * Night: warm floodlight on the stone.
 * ------------------------------------------------------------------ */

// Outline: full height on the left, crumbling down in steps on the right
const outline = "M88,310 L88,170 L232,170 L238,177 L254,177 L260,191 L282,193 L288,207 L312,209 L318,215 L334,217 L334,310 Z";

/** One storey of arches between x0 and x1 */
const arches = (x0, x1, yb, h) => {
    let d = "";
    for (let x = x0; x + 11 <= x1; x += 19) d += archHole(x, yb, 11, h) + " ";
    return d;
};
// Top storey: small square windows instead of arches
let attic = "";
for (let x = 100; x + 6 <= 226; x += 19) attic += rectHole(x + 2, 176, 6, 7) + " ";

const colosseum = [
    outline,
    arches(96, 330, 296, 28),
    arches(96, 316, 258, 25),
    arches(96, 262, 222, 23),
    attic,
].join(" ");

const roofs = row(-4, 404, 151, { minH: 14, maxH: 40, minW: 14, maxW: 28, roof: (i, r) => (r < 0.5 ? "slope" : "flat") });
const far = [
    blocks(roofs),
    blocks([[352, 30, 64]]),
    dome(367, 237, 17, 0.25), // St Peter's
    blocks([[20, 10, 92]]),
    spire(25, 209, 10, 14), // a bell tower
].join(" ");

const greenery = [
    cypress(36, 70), cypress(50, 58), cypress(66, 76),
    cypress(350, 64), cypress(364, 80),
    umbrellaPine(16, 52, 18), umbrellaPine(384, 58, 20),
].join(" ");

export default {
    far,
    near: `${colosseum} ${greenery}`,
    glow: { d: colosseum, color: "#FFC27A", opacity: 0.5 },
    windows: windowsFor(roofs, 41, 0.18),
};
