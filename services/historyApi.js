import { fetchJson } from "./http";

/* ------------------------------------------------------------------
 * HISTORY — Open-Meteo historical weather API (free, no API key).
 * Docs: https://open-meteo.com/en/docs/historical-weather-api
 *
 * ONE request per place gives ~10 years of daily:
 *   high, low, rain (mm) and mean cloud cover (%), from 1 Jan ten years
 *   ago up to yesterday.
 *   (Cloud cover, not weather_code: the archive builds weather_code from
 *   hourly data, which took the server 2–25 s; cloud cover takes ~10 ms.)
 *
 * The response repeats a date string for every day (most of its ~110 KB),
 * so we drop it: day i is simply `start + i days`. Stored size ≈ 55 KB.
 * ------------------------------------------------------------------ */

const OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const YEARS = 10;
const TIMEOUT_MS = 20000; // bigger than a forecast, give it longer

/** "2026-11-03" → "2026-11-02" */
function dayBefore(iso) {
    return new Date(Date.parse(`${iso}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
}

/**
 * Fetch daily history for a place, ending yesterday (city's local `todayIso`).
 * Returns { start, max: [], min: [], rain: [], cloud: [] } — arrays line up by day.
 */
export async function fetchHistory(lat, lng, todayIso) {
    const start = `${Number(todayIso.slice(0, 4)) - YEARS}-01-01`;
    const data = await fetchJson(
        `${OPEN_METEO_ARCHIVE_URL}?latitude=${lat}&longitude=${lng}` +
        `&start_date=${start}&end_date=${dayBefore(todayIso)}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,cloud_cover_mean&timezone=auto`,
        TIMEOUT_MS
    );

    const daily = data?.daily;
    if (!daily?.time?.length || daily.time[0] !== start) throw new Error("Invalid history response");

    return {
        start,
        max: daily.temperature_2m_max,
        min: daily.temperature_2m_min,
        rain: daily.precipitation_sum,
        cloud: daily.cloud_cover_mean,
    };
}
