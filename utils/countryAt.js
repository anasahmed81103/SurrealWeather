import { CITIES } from "../data/worldCities";

/* ------------------------------------------------------------------
 * countryAt — which country a point is in, offline.
 *
 * Uses the nearest of the ~11,500 bundled cities (data/worldCities.js)
 * and takes its country. Good enough to pick a skyline: borders can be
 * off by a few km, which doesn't matter here. One pass ≈ 1–3 ms;
 * the last answer is remembered, so re-renders cost nothing.
 * ------------------------------------------------------------------ */

const FAR = 9; // (3°)² ≈ 300 km: farther than this from any town → open sea / wilderness

let last = { key: null, cc: null };

/** (lat, lng) → ISO country code like "PK", or null */
export function countryAt(lat, lng) {
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    if (last.key === key) return last.cc;

    const cosLat = Math.cos((lat * Math.PI) / 180); // a degree of longitude shrinks towards the poles
    let best = Infinity;
    let cc = null;
    for (const [, , code, cLat, cLng] of CITIES) {
        const dLat = cLat - lat;
        const dLng = (cLng - lng) * cosLat;
        const d = dLat * dLat + dLng * dLng;
        if (d < best) {
            best = d;
            cc = code;
        }
    }

    last = { key, cc: best > FAR ? null : cc };
    return last.cc;
}
