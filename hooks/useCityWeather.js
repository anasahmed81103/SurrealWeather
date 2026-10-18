import { useState, useEffect, useCallback } from "react";
import {
    initDb,
    saveCity,
    getCityCoordinates,
    getAllCities,
    deleteCity,
    saveWeather,
    getWeather,
} from "../db/citiesDb";
import { fetchWeather, isValidWeather } from "../services/weatherApi";
import { searchCity, getCityNameFromCoords, getDeviceCoords } from "../services/geocodingApi";

/* ------------------------------------------------------------------
 * useCityWeather — all app state + data logic lives here.
 *
 *  1. On start: load the saved home city, or detect it once via GPS.
 *  2. Whenever the city changes: load weather (cache first, then network,
 *     then any old cached copy if offline).
 *  3. Manage the saved cities list (select / add / remove).
 *
 * Screens just render what this returns.
 * ------------------------------------------------------------------ */

// Used when location permission is denied or GPS fails
const FALLBACK_CITY = { name: "Karachi", lat: 24.8607, lng: 67.0011 };

export default function useCityWeather() {
    const [city, setCity] = useState(null); // { name, lat, lng }
    const [cities, setCities] = useState([]); // saved cities from the DB
    const [weather, setWeather] = useState(null);
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [refreshing, setRefreshing] = useState(false); // pull-to-refresh spinner

    const reloadCities = async () => setCities(await getAllCities());

    /* ---------- 1. Pick the starting city ---------- */
    useEffect(() => {
        (async () => {
            try {
                console.log("[init] opening database");
                await initDb();

                const saved = await getAllCities();
                if (saved.length > 0) {
                    // Returning user: load their home city (no network needed)
                    const home = saved.find((c) => c.isDefault) || saved[0];
                    console.log("[init] loaded saved city:", home.name);
                    setCities(saved);
                    setCity({ name: home.name, lat: home.lat, lng: home.lng });
                    return;
                }

                // First launch: detect the user's city once and save it as home
                let home = FALLBACK_CITY;
                try {
                    const pos = await getDeviceCoords();
                    if (pos) home = { name: await getCityNameFromCoords(pos.lat, pos.lng), ...pos };
                } catch (err) {
                    console.error("[init] location error:", err);
                }

                console.log("[init] home city:", home.name);
                await saveCity(home.name, home.lat, home.lng, true);
                await reloadCities();
                setCity(home);
            } catch (err) {
                // Something unexpected (e.g. database) — still show the fallback city
                console.error("[init] failed, using fallback city:", err);
                setCity(FALLBACK_CITY);
            }
        })();
    }, []);

    /* ---------- 2. Load weather ---------- */
    // force = true skips the cache (pull-to-refresh)
    const loadWeather = useCallback(async (force = false) => {
        if (!city) return;
        try {
            if (!force) {
                const cached = await getWeather(city.name);
                if (isValidWeather(cached)) {
                    console.log("[weather] using cache for", city.name);
                    setWeather(cached);
                    setStatus("ready");
                    return;
                }
            }

            console.log("[weather] fetching", city.name);
            const data = await fetchWeather(city.lat, city.lng);
            setWeather(data);
            setStatus("ready");
            await saveWeather(city.name, data);
        } catch (err) {
            console.error("[weather] fetch error:", err.message);

            // Offline? Show the last saved copy, however old, rather than nothing
            const stale = await getWeather(city.name, Infinity).catch(() => null);
            if (isValidWeather(stale)) {
                console.log("[weather] showing old cached data (offline)");
                setWeather(stale);
                setStatus("ready");
            } else {
                setStatus("error");
            }
        }
    }, [city]);

    useEffect(() => {
        if (!city) return;
        setStatus("loading");
        loadWeather(false);
    }, [city, loadWeather]);

    const refresh = async () => {
        setRefreshing(true);
        await loadWeather(true);
        setRefreshing(false);
    };

    /* ---------- 3. Cities ---------- */

    // Switch to a saved city, or search + save a new one.
    // Returns true on success, false if the city couldn't be found.
    const selectCity = async (input) => {
        const query = input.trim();
        if (!query) return false;

        try {
            // Already saved? Switch instantly, no network needed
            const saved = await getCityCoordinates(query);
            if (saved) {
                setCity({ name: query, ...saved });
                return true;
            }

            const place = await searchCity(query);
            if (!place) {
                console.warn("[cities] no results for:", query);
                return false;
            }

            // The search returns a clean name ("karachi" → "Karachi") that may already be saved
            if (!(await getCityCoordinates(place.name))) {
                await saveCity(place.name, place.lat, place.lng);
                await reloadCities();
            }
            setCity({ name: place.name, lat: place.lat, lng: place.lng });
            return true;
        } catch (err) {
            console.error("[cities] select failed:", err);
            return false;
        }
    };

    // Remove a saved city (the home city can't be removed — the picker hides its button)
    const removeCity = async (name) => {
        await deleteCity(name);
        const remaining = await getAllCities();
        setCities(remaining);

        // If we just removed the city on screen, go back home
        if (city?.name === name) {
            const home = remaining.find((c) => c.isDefault) || remaining[0] || FALLBACK_CITY;
            setCity({ name: home.name, lat: home.lat, lng: home.lng });
        }
    };

    const isHome = Boolean(cities.find((c) => c.name === city?.name)?.isDefault);

    return { city, isHome, cities, weather, status, refreshing, refresh, selectCity, removeCity };
}
