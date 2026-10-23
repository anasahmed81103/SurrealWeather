import { initDb, getAllCities, getWeather, saveWeather } from "../db/citiesDb";
import { fetchWeather, isValidWeather } from "../services/weatherApi";

/* ------------------------------------------------------------------
 * getHomeWeather — the data the home-screen widget shows.
 *
 * Reads the home city + its cached weather from the phone's database
 * (the same one the app uses). Only hits the network if the cache is
 * older than the widget's refresh window, so the widget and the app
 * never fetch the same weather twice.
 *
 * Always resolves: { city, weather } — weather may be null if there's
 * no data at all (app never opened yet, or offline with no cache).
 * ------------------------------------------------------------------ */

// Android refreshes the widget every 30 min, so data up to 30 min old is fine
const WIDGET_MAX_AGE_MS = 30 * 60 * 1000;

export async function getHomeWeather() {
    try {
        await initDb(); // the widget can run while the app is closed
        const cities = await getAllCities();
        const home = cities.find((c) => c.isDefault) || cities[0];
        if (!home) {
            console.log("[widget] no home city yet");
            return { city: null, weather: null };
        }

        const cached = await getWeather(home.name, WIDGET_MAX_AGE_MS);
        if (isValidWeather(cached)) {
            console.log("[widget] using cache for", home.name);
            return { city: home.name, weather: cached };
        }

        try {
            console.log("[widget] fetching", home.name);
            const fresh = await fetchWeather(home.lat, home.lng);
            await saveWeather(home.name, fresh);
            return { city: home.name, weather: fresh };
        } catch (err) {
            // Offline: show the last saved copy, however old
            console.warn("[widget] fetch failed:", err.message);
            const stale = await getWeather(home.name, Infinity).catch(() => null);
            return { city: home.name, weather: isValidWeather(stale) ? stale : null };
        }
    } catch (err) {
        console.error("[widget] failed to load:", err);
        return { city: null, weather: null };
    }
}
