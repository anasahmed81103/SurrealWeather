/* ------------------------------------------------------------------
 * WEATHER — Open-Meteo forecast API (free, no API key).
 * Docs: https://open-meteo.com/en/docs
 *
 * Response shape used by the UI:
 *   current: { temperature_2m, apparent_temperature, weather_code, is_day }
 *   daily:   { time[], weather_code[], temperature_2m_max[], temperature_2m_min[] }
 * ------------------------------------------------------------------ */

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// Only ask for the fields the UI actually shows — keeps responses tiny
const CURRENT_FIELDS = "temperature_2m,apparent_temperature,weather_code,is_day";
const DAILY_FIELDS = "weather_code,temperature_2m_max,temperature_2m_min";

/** Checks the data has what the UI needs (also used to reject old cached formats). */
export const isValidWeather = (data) =>
    Boolean(data?.current && data?.daily?.time?.length);

/**
 * Fetch current weather + 7-day forecast for a location.
 * Throws on network/API errors so the caller can decide what to show.
 */
export async function fetchWeather(lat, lng) {
    const res = await fetch(
        `${OPEN_METEO_FORECAST_URL}?latitude=${lat}&longitude=${lng}` +
        `&current=${CURRENT_FIELDS}&daily=${DAILY_FIELDS}` +
        `&forecast_days=7&timezone=auto`
    );
    if (!res.ok) throw new Error(`Weather request failed (${res.status})`);

    const data = await res.json();
    if (!isValidWeather(data)) throw new Error("Invalid weather response");

    return data;
}
