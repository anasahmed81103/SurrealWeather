import { blocks, poly, row, tiers, windowsFor } from "./shapes";
import { disc, finial, pagoda, rectHole } from "./ornaments";

/* ------------------------------------------------------------------
 * China — Shanghai's Pudong skyline with an old pagoda in front:
 * the Oriental Pearl Tower (spheres on a tripod), the "bottle opener"
 * (World Financial Center), the twisting Shanghai Tower and the
 * pagoda-like Jin Mao. Night: the Pearl's spheres glow pink.
 * ------------------------------------------------------------------ */

const PEARL = 150;
const pearlSpheres = `${disc(PEARL, 192, 16)} ${disc(PEARL, 112, 10)} ${disc(PEARL, 82, 4.5)}`;
const pearl = [
    poly([[PEARL - 22, 310], [PEARL - 4, 200], [PEARL - 1, 200], [PEARL - 16, 310]]), // tripod legs
    poly([[PEARL + 22, 310], [PEARL + 4, 200], [PEARL + 1, 200], [PEARL + 16, 310]]),
    blocks([[PEARL - 3, 6, 300 - 90]]), // central column
    pearlSpheres,
    finial(PEARL, 78, 30),
].join(" ");

// World Financial Center: a tall blade with the hole at the top
const swfc = `M196,310 L196,120 Q200,76 206,64 L220,64 Q226,76 228,120 L228,310 Z ${rectHole(206, 80, 12, 12)}`;
// Shanghai Tower: tapering and twisting, the top cut on a slant
const shanghaiTower = "M232,310 L232,250 Q236,150 245,46 L257,52 Q263,150 270,250 L270,310 Z";
const jinMao = blocks(tiers(300, [[26, 162], [22, 130], [18, 106], [14, 90], [10, 78], [6, 68]])) + " " + finial(300, 68, 26);

const fill = [
    ...row(-4, 128, 141, { minH: 30, maxH: 80, minW: 12, maxW: 20 }),
    ...row(318, 404, 143, { minH: 36, maxH: 104, minW: 12, maxW: 22, roof: (i, r) => (r < 0.3 ? "step" : "flat") }),
    [172, 22, 70],
];

export default {
    far: blocks(row(-6, 406, 147, { minH: 50, maxH: 130, minW: 12, maxW: 24, roof: (i, r) => (r < 0.2 ? "spire" : "flat") })),
    near: `${pearl} ${swfc} ${shanghaiTower} ${jinMao} ${blocks(fill)} ${pagoda(46, 300, 6, 16, 16)}`,
    glow: { d: pearlSpheres, color: "#FF8FC4", opacity: 0.6 },
    windows: windowsFor([...fill, [196, 32, 170], [232, 38, 200], [287, 26, 138]], 37, 0.2),
    beacons: [{ x: 251, y: 46, color: "#FF4A3D" }, { x: 210, y: 64, color: "#FF4A3D" }],
};
