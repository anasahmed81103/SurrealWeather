import { fetchJson } from "./http";

/* ------------------------------------------------------------------
 * WEATHER — Open-Meteo forecast API (free, no API key).
 * Docs: https://open-meteo.com/en/docs
 *
 * ONE request per city gives everything the screen shows:
 *   current: temperature_2m, apparent_temperature, weather_code, is_day,
 *            relative_humidity_2m, wind_speed_10m, wind_direction_10m
 *   hourly:  next 24 hours of temperature, weather_code, is_day, rain chance
 *   daily:   7 days of weather_code, min/max temp, sunrise, sunset,
 *            rain chance, UV index
 *   utc_offset_seconds: used to show the city's local time
 * ------------------------------------------------------------------ */

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// Only ask for the fields the UI actually shows — keeps responses small
const CURRENT_FIELDS =
    "temperature_2m,apparent_temperature,weather_code,is_day,relative_humidity_2m," +
    "wind_speed_10m,wind_direction_10m";
const HOURLY_FIELDS = "temperature_2m,weather_code,is_day,precipitation_probability";
const DAILY_FIELDS =
    "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset," +
    "precipitation_probability_max,uv_index_max";

/** Checks the data has what the UI needs (also rejects old cached formats). */
export const isValidWeather = (data) =>
    Boolean(data?.current && data?.hourly?.time?.length && data?.daily?.time?.length);

/**
 * Fetch current weather + 24h hourly + 7-day forecast for a location.
 * Throws on network/API errors so the caller can decide what to show.
 */
export async function fetchWeather(lat, lng) {
    const data = await fetchJson(
        `${OPEN_METEO_FORECAST_URL}?latitude=${lat}&longitude=${lng}` +
        `&current=${CURRENT_FIELDS}&hourly=${HOURLY_FIELDS}&daily=${DAILY_FIELDS}` +
        `&forecast_hours=24&forecast_days=7&timezone=auto`
    );
    if (!isValidWeather(data)) throw new Error("Invalid weather response");

    return data;
}
