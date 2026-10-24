/* ------------------------------------------------------------------
 * placeName — pick a good display name from reverse-geocoder results.
 *
 * Geocoders return a bunch of optional fields, and which ones are filled
 * depends on the country. Example: Singapore (a city-state) has no "city"
 * on Android, only a region called "East" / "Central" / "North-East" —
 * so blindly falling back to the region showed the city as "East".
 *
 * Order we try (most specific real place first):
 *   city → district → subregion → region → country
 * and skip anything that's just a compass direction or a placeholder.
 * ------------------------------------------------------------------ */

// Shown when nothing works — also counts as "weak" so it gets replaced later
export const UNKNOWN_PLACE = "My Location";

// "East", "North-East", "Central Region", "West District"… are not place names
const DIRECTION_ONLY =
    /^(north|south|east|west|central|centre|center|north[\s-]?east|north[\s-]?west|south[\s-]?east|south[\s-]?west)(\s+(region|district|area|zone|side))?$/i;

/** True if a name is missing, a compass direction, a number, or our placeholder. */
export function isWeakName(name) {
    const n = (name || "").trim();
    return !n || n === UNKNOWN_PLACE || DIRECTION_ONLY.test(n) || /^\d+$/.test(n);
}

/**
 * @param {{ city, district, subregion, region, country }} parts  any may be empty
 * @returns {string | null} best name, or null if every field is weak
 */
export function pickPlaceName(parts) {
    if (!parts) return null;
    const { city, district, subregion, region, country } = parts;
    const best = [city, district, subregion, region, country].find((n) => !isWeakName(n));
    return best ? best.trim() : null;
}
