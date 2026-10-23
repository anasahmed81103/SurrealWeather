import { getWeatherInfo } from "./weatherCodes";

/* ------------------------------------------------------------------
 * Which ambient sound (and, in serene moments, which tune) fits the
 * weather + time of day.
 * Returns { key, volume } — key is a file in assets/sounds/
 * (mapped in hooks/useAmbientSound.js). Tweak the mix here.
 *
 * Sounds are CC0 recordings from freesound.org (see assets/sounds/CREDITS.md).
 * ------------------------------------------------------------------ */

/**
 * Serene moments get a soft tune under the weather sound:
 * rain, sunrise, sunset and late night (11 PM – 5 AM, city time).
 * Ordinary sunny days, early evenings and storms: no tune.
 * Returns { key, volume } (file in assets/music/) or null.
 */
export function getMusic(code, phase, cityHour) {
    const { kind } = getWeatherInfo(code);
    if (kind === "thunder") return null; // storms aren't serene

    const lateNight = cityHour >= 23 || cityHour < 5;
    const serene = kind === "rain" || phase === "dawn" || phase === "dusk" || lateNight;
    return serene ? { key: "serene", volume: MUSIC_VOLUME } : null;
}

// The mix: weather sounds stay soft in the background, the tune carries the moment.
// All files are loudness-matched, so these numbers compare directly (0–1).
const MUSIC_VOLUME = 0.7;
const SOUND_VOLUME = {
    birds: 0.33,
    crickets: 0.3,
    wind: 0.25,
    wind_soft: 0.16, // fog and snow: barely there
    rain_light: 0.42,
    rain_heavy: 0.5,
    storm: 0.55,
};

export function getAmbience(code, phase) {
    const { kind, intensity } = getWeatherInfo(code);
    const night = phase === "night" || phase === "dusk";

    const sound = (key, volumeKey = key) => ({ key, volume: SOUND_VOLUME[volumeKey] });

    switch (kind) {
        case "clear":
        case "partly":
            return night ? sound("crickets") : sound("birds");
        case "cloudy":
            return sound("wind");
        case "fog":
        case "snow":
            return sound("wind", "wind_soft");
        case "rain":
            return intensity === 3 ? sound("rain_heavy") : sound("rain_light");
        case "thunder":
            return sound("storm");
        default:
            return null;
    }
}
