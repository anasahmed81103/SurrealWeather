import * as Location from "expo-location";

/* ------------------------------------------------------------------
 * GEOCODING — all free, no API keys, no billing.
 *
 *  searchCity(name)            → Open-Meteo Geocoding API   (name → coords)
 *  getCityNameFromCoords(...)  → phone's built-in geocoder   (coords → name)
 *                                falls back to BigDataCloud's free
 *                                client endpoint (used on web/PC, where
 *                                the native geocoder isn't available)
 * ------------------------------------------------------------------ */

const OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const BIGDATACLOUD_REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

/**
 * Find a city by name.
 * @returns {Promise<{ name, lat, lng, country } | null>} null if nothing matched
 */
export async function searchCity(query) {
    // Open-Meteo matches on the place name only, so drop anything after a comma
    // ("Paris, France" → "Paris")
    const name = query.split(",")[0].trim();
    if (!name) return null;

    const res = await fetch(
        `${OPEN_METEO_GEOCODING_URL}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
    );
    if (!res.ok) throw new Error(`City search failed (${res.status})`);

    const data = await res.json();
    const place = data.results?.[0];
    if (!place) return null;

    return {
        name: place.name, // properly capitalised name, e.g. "karachi" → "Karachi"
        lat: place.latitude,
        lng: place.longitude,
        country: place.country,
    };
}

/**
 * Turn GPS coordinates into a city name.
 * Never throws — returns "My Location" if everything fails.
 */
export async function getCityNameFromCoords(lat, lng) {
    // 1) Native phone geocoder (Android/iOS) — free, doesn't touch any API quota
    try {
        const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        const name = place?.city || place?.subregion || place?.region;
        if (name) return name;
    } catch (err) {
        // Expected on web — the native geocoder only exists on phones
        console.log("Native reverse geocode unavailable, using fallback:", err.message);
    }

    // 2) Fallback: BigDataCloud free client-side endpoint
    try {
        const res = await fetch(
            `${BIGDATACLOUD_REVERSE_URL}?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        const data = await res.json();
        const name = data.city || data.locality || data.principalSubdivision;
        if (name) return name;
    } catch (err) {
        console.warn("Fallback reverse geocode failed:", err);
    }

    return "My Location";
}
