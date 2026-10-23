import { getWeatherInfo } from "./weatherCodes";
import { formatHour, parseCityTime } from "./time";

/* ------------------------------------------------------------------
 * getSummary — one friendly line about the next 12 hours, e.g.
 *   "Rain likely around 4 PM" · "Drying up around 7 PM"
 *   "Warming up to 35° by 2 PM" · "Steady weather ahead"
 * Simple rules, read top to bottom.
 * ------------------------------------------------------------------ */

const LOOK_AHEAD_HOURS = 12;
const WET_KINDS = ["rain", "snow", "thunder"];
const WET_WORDS = { rain: "Rain", snow: "Snow", thunder: "Storms" };

export function getSummary({ current, hourly }) {
    const hours = Math.min(LOOK_AHEAD_HOURS, hourly.time.length);
    const at = (i) => formatHour(parseCityTime(hourly.time[i]));
    const kindAt = (i) => getWeatherInfo(hourly.weather_code[i]).kind;
    const isWet = (i) => WET_KINDS.includes(kindAt(i)) || (hourly.precipitation_probability?.[i] ?? 0) >= 60;

    const wetNow = WET_KINDS.includes(getWeatherInfo(current.weather_code).kind);

    // 1. Is rain/snow starting or stopping soon?
    for (let i = 1; i < hours; i++) {
        if (isWet(i) !== wetNow) {
            if (wetNow) return `Drying up around ${at(i)}`;
            return `${WET_WORDS[kindAt(i)] || "Rain"} likely around ${at(i)}`;
        }
    }
    if (wetNow) return "Wet weather for the next few hours";

    // 2. Otherwise, a noticeable temperature change?
    const temps = hourly.temperature_2m.slice(0, hours);
    const now = current.temperature_2m;
    const max = Math.max(...temps);
    const min = Math.min(...temps);
    if (max >= now + 3) return `Warming up to ${Math.round(max)}° by ${at(temps.indexOf(max))}`;
    if (min <= now - 3) return `Cooling to ${Math.round(min)}° by ${at(temps.indexOf(min))}`;

    return "Steady weather ahead";
}
