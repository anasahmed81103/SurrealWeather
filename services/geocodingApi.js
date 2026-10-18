import * as Location from "expo-location";
import { fetchJson, withTimeout } from "./http";

/* ------------------------------------------------------------------
 * GEOCODING + LOCATION — all free, no API keys, no billing.
 *
 *  getDeviceCoords()           → phone GPS (never hangs, returns null on failure)
 *  searchCity(name)            → Open-Meteo Geocoding API   (name → coords)
 *  getCityNameFromCoords(...)  → phone's built-in geocoder   (coords → name),
 *                                falls back to BigDataCloud's free client
 *                                endpoint (used on web/PC, where the native
 *                                geocoder isn't available)
 * ------------------------------------------------------------------ */

const OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const BIGDATACLOUD_REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

/**
 * Ask for permission and get the phone's position.
 * @returns {Promise<{ lat, lng } | null>} null if denied / unavailable
 */
export async function getDeviceCoords() {
    const { status } = await Location.requestForegroundPermissionsAsync();
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
 * Find a city by name.
 * @returns {Promise<{ name, lat, lng, country } | null>} null if nothing matched
 */
export async function searchCity(query) {
    // Open-Meteo matches on the place name only, so drop anything after a comma
    // ("Paris, France" → "Paris")
    const name = query.split(",")[0].trim();
    if (!name) return null;

    const data = await fetchJson(
        `${OPEN_METEO_GEOCODING_URL}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
    );
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
