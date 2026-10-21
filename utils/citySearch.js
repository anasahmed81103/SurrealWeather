import { CITIES, COUNTRIES } from "../data/worldCities";

/* ------------------------------------------------------------------
 * Offline city search over data/worldCities.js (no network).
 *
 * Results are ranked in tiers, biggest cities first inside each tier:
 *   1. name starts with the query        "lah"    → Lahore
 *   2. a word in the name starts with it "york"   → New York
 *   3. close typo (1–2 letters off)      "karchi" → Karachi
 *
 * A "place" everywhere in the app looks like:
 *   { name, region, country, lat, lng }
 * ------------------------------------------------------------------ */

const clean = (s) => s.toLowerCase().trim();

// Lowercased names, built once on first search (not at app start)
let index = null;
function getIndex() {
    if (!index) {
        index = CITIES.map(([name, ascii, cc, lat, lng]) => ({
            keys: ascii ? [clean(ascii), clean(name)] : [clean(name)], // match "sao" and "são"
            place: { name, region: "", country: COUNTRIES[cc] || cc, lat, lng },
        }));
    }
    return index;
}

/** Number of single-letter edits to turn a into b (Levenshtein). */
function editDistance(a, b) {
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
        const row = [i];
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
        }
        prev = row;
    }
    return prev[b.length];
}

/** Is `q` a near-miss of `key`? Compares to the whole name and to its start. */
function isTypoMatch(q, key) {
    if (q.length < 4) return false; // too short to guess what was meant
    if (q[0] !== key[0]) return false; // people rarely mistype the first letter — and this keeps it fast
    const allowed = q.length >= 7 ? 2 : 1;
    return (
        editDistance(q, key) <= allowed ||
        editDistance(q, key.slice(0, q.length)) <= allowed
    );
}

/** Search the offline list. Returns up to `limit` places. */
export function searchLocalCities(query, limit = 8) {
    const q = clean(query.split(",")[0]); // "Paris, France" → "paris"
    if (q.length < 2) return [];

    const starts = [];
    const words = [];
    for (const { keys, place } of getIndex()) {
        if (keys.some((k) => k.startsWith(q))) starts.push(place);
        else if (keys.some((k) => k.split(/[\s-]/).some((w) => w.startsWith(q)))) words.push(place);
        if (starts.length >= limit) break; // list is biggest-first, so we have the best ones
    }

    const results = [...starts, ...words];
    if (results.length >= limit) return results.slice(0, limit);

    // Not enough direct hits → try typo matching (second pass, only when needed)
    for (const { keys, place } of getIndex()) {
        if (results.length >= limit) break;
        if (!results.includes(place) && keys.some((k) => isTypoMatch(q, k))) results.push(place);
    }
    return results;
}

/** Same city? (same name, roughly the same spot) — used to remove duplicates. */
export function isSamePlace(a, b) {
    return (
        clean(a.name) === clean(b.name) &&
        Math.abs(a.lat - b.lat) < 0.3 &&
        Math.abs(a.lng - b.lng) < 0.3
    );
}
