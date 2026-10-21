import { getWeatherInfo } from "./weatherCodes";

/* ------------------------------------------------------------------
 * Which ambient sound fits the weather + time of day.
 * Returns { key, volume } — key is a file in assets/sounds/
 * (mapped in hooks/useAmbientSound.js). Tweak the mix here.
 *
 * Sounds are CC0 recordings from freesound.org (see assets/sounds/CREDITS.md).
 * ------------------------------------------------------------------ */

export function getAmbience(code, phase) {
    const { kind, intensity } = getWeatherInfo(code);
    const night = phase === "night" || phase === "dusk";

    switch (kind) {
        case "clear":
        case "partly":
            return night ? { key: "crickets", volume: 0.5 } : { key: "birds", volume: 0.55 };
        case "cloudy":
            return { key: "wind", volume: 0.4 };
        case "fog":
            return { key: "wind", volume: 0.25 };
        case "snow":
            return { key: "wind", volume: 0.3 };
        case "rain":
            return intensity === 3 ? { key: "rain_heavy", volume: 0.8 } : { key: "rain_light", volume: 0.7 };
        case "thunder":
            return { key: "storm", volume: 0.85 };
        default:
            return null;
    }
}
