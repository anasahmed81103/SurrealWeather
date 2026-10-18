/* ------------------------------------------------------------------
 * WMO weather codes (what Open-Meteo returns) → what the UI needs.
 *
 *   kind:      which animated scene to show
 *              clear | partly | cloudy | fog | rain | snow | thunder
 *   intensity: 1 light · 2 moderate · 3 heavy (drives particle counts)
 *
 * Full code list: https://open-meteo.com/en/docs (bottom of page)
 * ------------------------------------------------------------------ */

//      code: [label,                 kind,      intensity]
const CODES = {
    0: ["Clear sky", "clear", 0],
    1: ["Mainly clear", "partly", 1],
    2: ["Partly cloudy", "partly", 2],
    3: ["Overcast", "cloudy", 3],
    45: ["Fog", "fog", 1],
    48: ["Freezing fog", "fog", 2],
    51: ["Light drizzle", "rain", 1],
    53: ["Drizzle", "rain", 1],
    55: ["Heavy drizzle", "rain", 2],
    56: ["Freezing drizzle", "rain", 1],
    57: ["Freezing drizzle", "rain", 2],
    61: ["Light rain", "rain", 1],
    63: ["Rain", "rain", 2],
    65: ["Heavy rain", "rain", 3],
    66: ["Freezing rain", "rain", 2],
    67: ["Freezing rain", "rain", 3],
    71: ["Light snow", "snow", 1],
    73: ["Snow", "snow", 2],
    75: ["Heavy snow", "snow", 3],
    77: ["Snow grains", "snow", 1],
    80: ["Rain showers", "rain", 1],
    81: ["Rain showers", "rain", 2],
    82: ["Violent showers", "rain", 3],
    85: ["Snow showers", "snow", 1],
    86: ["Heavy snow showers", "snow", 3],
    95: ["Thunderstorm", "thunder", 2],
    96: ["Thunderstorm with hail", "thunder", 3],
    99: ["Severe thunderstorm", "thunder", 3],
};

/** @returns {{ label, kind, intensity }} */
export function getWeatherInfo(code) {
    const [label, kind, intensity] = CODES[code] || ["Unknown", "cloudy", 1];
    return { label, kind, intensity };
}

// MaterialCommunityIcons names per kind: [day, night]
const ICONS = {
    clear: ["weather-sunny", "weather-night"],
    partly: ["weather-partly-cloudy", "weather-night-partly-cloudy"],
    cloudy: ["weather-cloudy", "weather-cloudy"],
    fog: ["weather-fog", "weather-fog"],
    rain: ["weather-rainy", "weather-rainy"],
    snow: ["weather-snowy", "weather-snowy"],
    thunder: ["weather-lightning-rainy", "weather-lightning-rainy"],
};

/** @returns {{ name, color }} icon for a weather code */
export function getWeatherIcon(code, isDay = true) {
    const { kind, intensity } = getWeatherInfo(code);

    // Heavier variants read better at a glance
    if (kind === "rain" && intensity === 3) return { name: "weather-pouring", color: "#BFE3FF" };
    if (kind === "snow" && intensity === 3) return { name: "weather-snowy-heavy", color: "#FFFFFF" };

    const name = ICONS[kind][isDay ? 0 : 1];
    if (kind === "clear") return { name, color: isDay ? "#FFD54F" : "#E8ECF8" };
    if (kind === "thunder") return { name, color: "#FFE082" };
    return { name, color: "#FFFFFF" };
}
