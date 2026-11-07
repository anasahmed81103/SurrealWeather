import { countryAt } from "../../../utils/countryAt";
import { regionOf } from "./regions/regionOf";

import faisalMosque from "./faisalMosque";
import eiffelTower from "./eiffelTower";
import manhattan from "./manhattan";
import tajMahal from "./tajMahal";
import bigBen from "./bigBen";
import burjKhalifa from "./burjKhalifa";
import makkahClock from "./makkahClock";
import blueMosque from "./blueMosque";
import pyramids from "./pyramids";
import mountFuji from "./mountFuji";
import shanghai from "./shanghai";
import colosseum from "./colosseum";
import christRedeemer from "./christRedeemer";
import sydneyOpera from "./sydneyOpera";
import hills from "./hills";

import europeTown from "./regions/europeTown";
import orthodoxTown from "./regions/orthodoxTown";
import islamicTown from "./regions/islamicTown";
import eastAsiaCity from "./regions/eastAsiaCity";
import templeCity from "./regions/templeCity";
import latinTown from "./regions/latinTown";
import africaCity from "./regions/africaCity";
import modernCity from "./regions/modernCity";

/* ------------------------------------------------------------------
 * Skyline registry — which drawing each place gets.
 *
 *   1. its country has a landmark (BY_COUNTRY)  → that landmark
 *   2. otherwise its region's style (regions/regionOf.js), varied per
 *      city by a seed from the coordinates (where the church stands...)
 *   3. no country at all (open sea, wilderness) → quiet hills
 *
 * A drawing = { far, near, highlight?, glow?, windows?, sparkles?, beacons? }.
 * To add a landmark: one file like eiffelTower.js + one line in each table.
 * ------------------------------------------------------------------ */

// Fixed drawings
const LANDMARKS = {
    faisalMosque, eiffelTower, manhattan, tajMahal, bigBen, burjKhalifa, makkahClock,
    blueMosque, pyramids, mountFuji, shanghai, colosseum, christRedeemer, sydneyOpera, hills,
};

// Drawings made from a seed
const REGIONS = { europeTown, orthodoxTown, islamicTown, eastAsiaCity, templeCity, latinTown, africaCity, modernCity };

const BY_COUNTRY = {
    PK: "faisalMosque",
    FR: "eiffelTower",
    US: "manhattan",
    IN: "tajMahal",
    GB: "bigBen",
    AE: "burjKhalifa",
    SA: "makkahClock",
    TR: "blueMosque",
    EG: "pyramids",
    JP: "mountFuji",
    CN: "shanghai",
    IT: "colosseum",
    BR: "christRedeemer",
    AU: "sydneyOpera",
};

/** Place → { id, seed } (null while there's no place yet). Pure, offline. */
export function pickLandmark(lat, lng) {
    if (lat == null || lng == null) return null;
    const cc = countryAt(lat, lng);
    const id = !cc ? "hills" : BY_COUNTRY[cc] || regionOf(cc);
    // Same city → same seed → same town every time; a neighbouring city gets another
    const seed = Math.round((lat + 90) * 20) * 7 + Math.round((lng + 180) * 20);
    console.log("[skyline]", cc ?? "no country", "→", id, seed);
    return { id, seed };
}

// Regional drawings are built once per city and kept (they're small)
const cache = new Map();

/** { id, seed } → drawing */
export function getDrawing({ id, seed = 1 }) {
    if (LANDMARKS[id]) return LANDMARKS[id];
    const make = REGIONS[id];
    if (!make) return LANDMARKS.hills;
    const key = `${id}:${seed}`;
    if (!cache.has(key)) cache.set(key, make(seed));
    return cache.get(key);
}
