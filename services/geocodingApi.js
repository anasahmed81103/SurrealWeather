import * as Location from "expo-location";
import { fetchJson, withTimeout } from "./http";

/* ------------------------------------------------------------------
 * GEOCODING + LOCATION — all free, no API keys, no billing.
 *
 *  getDeviceCoords()           → phone GPS (never hangs, returns null on failure)
 *  searchCities(name)          → Open-Meteo Geocoding API   (name → places)
 *  searchCity(name)            → best single match of the above
 *  getCityNameFromCoords(...)  → phone's built-in geocoder   (coords → name),
 *                                falls back to BigDataCloud's free client
 *                                endpoint (used on web/PC, where the native
 *                                geocoder isn't available)
 * ------------------------------------------------------------------ */

const OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const BIGDATACLOUD_REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

// GeoNames feature codes that are real towns/cities (PPL = "populated place").
// Everything else is dropped: countries (PCLI), regions (ADM1…), city districts (PPLX),
// abandoned/historical places (PPLQ, PPLH, PPLW), mountains, airports, etc.
const CITY_CODES = new Set([
    "PPL", "PPLA", "PPLA2", "PPLA3", "PPLA4", "PPLA5", "PPLC", "PPLG", "PPLL", "PPLS", "PPLF", "PPLR",
]);

/**
 * Get the phone's position. With ask = false it only uses permission the user
 * already gave (no popup) — used for the quiet "did you move?" check on each open.
 * @returns {Promise<{ lat, lng } | null>} null if denied / unavailable
 */
export async function getDeviceCoords({ ask = true } = {}) {
    const { status } = ask
        ? await Location.requestForegroundPermissionsAsync()
        : await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
        console.warn("[location] permission denied");
        return null;
    }

    // 1) Last known position is instant and good enough for picking a city
    const last = await Location.getLastKnownPositionAsync().catch(() => null);
    if (last) {
        console.log("[location] using last known position");
        return { lat: last.coords.latitude, lng: last.coords.longitude };
    }

    // 2) Otherwise get a fresh fix — but don't wait forever (can hang indoors on Android)
    try {
        const loc = await withTimeout(
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            15000,
            "GPS"
        );
        console.log("[location] got fresh position");
        return { lat: loc.coords.latitude, lng: loc.coords.longitude };
    } catch (err) {
        console.warn("[location] failed:", err.message);
        return null;
    }
}

/**
 * Search cities by name (online). Used as a backup for small towns that
 * aren't in the offline list (utils/citySearch.js).
 * @returns {Promise<Array<{ name, region, country, lat, lng }>>} biggest first
 */
export async function searchCities(query, limit = 6) {
    // Open-Meteo matches on the place name only, so drop anything after a comma
    // ("Paris, France" → "Paris")
    const name = query.split(",")[0].trim();
    if (name.length < 2) return [];

    // Ask for more than we need, then clean up: the raw list has lots of tiny villages
    const data = await fetchJson(
        `${OPEN_METEO_GEOCODING_URL}?name=${encodeURIComponent(name)}&count=20&language=en&format=json`
    );
    const all = (data.results || []).filter((p) => CITY_CODES.has(p.feature_code)); // cities only
    const populated = all.filter((p) => p.population > 0);

    const seen = new Set();
    return (populated.length ? populated : all) // keep villages only if nothing bigger exists
        .sort((a, b) => (b.population || 0) - (a.population || 0))
        .filter((p) => {
            const key = `${p.name}|${p.admin1}|${p.country_code}`; // drop duplicates
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, limit)
        .map((p) => ({
            name: p.name,
            region: p.admin1 || "",
            country: p.country || "",
            lat: p.latitude,
            lng: p.longitude,
        }));
}

/** Best single match for a name, or null. */
export async function searchCity(query) {
    const [best] = await searchCities(query, 1);
    return best || null;
}

/**
 * Turn GPS coordinates into a city name.
 * Never throws — returns "My Location" if everything fails.
 */
export async function getCityNameFromCoords(lat, lng) {
    // 1) Native phone geocoder (Android/iOS) — free, doesn't touch any API quota
    try {
        const [place] = await withTimeout(
            Location.reverseGeocodeAsync({ latitude: lat, longitude: lng }),
            8000,
            "Reverse geocode"
        );
        const name = place?.city || place?.subregion || place?.region;
        if (name) return name;
    } catch (err) {
        // Expected on web — the native geocoder only exists on phones
        console.log("[geocode] native unavailable, using fallback:", err.message);
    }

    // 2) Fallback: BigDataCloud free client-side endpoint
    try {
        const data = await fetchJson(
            `${BIGDATACLOUD_REVERSE_URL}?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        const name = data.city || data.locality || data.principalSubdivision;
        if (name) return name;
    } catch (err) {
        console.warn("[geocode] fallback failed:", err.message);
    }

    return "My Location";
}
