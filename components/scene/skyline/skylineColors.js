import { getSkyColors } from "../skyThemes";

/* ------------------------------------------------------------------
 * skylineColors — how the city looks for this weather + time of day.
 *
 * The city is never given fixed colours: it's the sky's horizon colour
 * mixed towards a dark "ink". The more ink, the darker the silhouette:
 *   day   → about half: soft, bluish, hazy (like real distance)
 *   dawn / dusk → almost all ink: a dark cut-out against the sun
 *   night → dark, with the lights on
 * Haze (fog, rain, snow) pulls it back towards the sky, so it fades away.
 * Because it starts from the sky, it always matches every sky we have.
 * ------------------------------------------------------------------ */

const INK = { day: "#24364C", dawn: "#1C1230", dusk: "#170C24", night: "#03050B" };
const DEPTH = { day: 0.5, dawn: 0.86, dusk: 0.9, night: 0.74 }; // how much ink
const CLEARNESS = { clear: 1, partly: 1, cloudy: 0.88, rain: 0.78, snow: 0.66, thunder: 0.92, fog: 0.38 };

// How bright the city lights are (0 = off). Floodlights come on later than
// windows, so at sunset the landmark stays a dark cut-out against the sky.
const LIGHTS = { day: 0, dawn: 0.3, dusk: 0.6, night: 1 };
const FLOOD = { day: 0, dawn: 0, dusk: 0.25, night: 1 };

// Pale parts (snow caps, white marble) show best in daylight
const HIGHLIGHT = { day: 1, dawn: 0.75, dusk: 0.6, night: 0.25 };

// Mist in front of the city's feet (fog has its own mist layers already)
const MIST = { rain: 0.32, thunder: 0.22, snow: 0.3 };

// Warm edge where the low sun catches the tops (only when the sun is visible)
const RIM = { dawn: "#FFC994", dusk: "#FFA46C" };

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** a → b by t (0–1) → "rgb(r,g,b)" */
function mix(a, b, t) {
    const A = hexToRgb(a);
    const B = hexToRgb(b);
    const c = A.map((v, i) => Math.round(v + (B[i] - v) * Math.min(1, t)));
    return `rgb(${c.join(",")})`;
}

export function skylineColors(kind, phase) {
    const horizon = getSkyColors(kind, phase)[3];
    const ink = INK[phase] || INK.day;
    const k = (DEPTH[phase] ?? 0.5) * (CLEARNESS[kind] ?? 1);
    const sunVisible = kind === "clear" || kind === "partly";
    const darkDay = phase === "day" && (kind === "rain" || kind === "thunder");

    return {
        far: mix(horizon, ink, k * 0.5), // distant layer: paler, it's farther away
        nearTop: mix(horizon, ink, k * 0.88), // near layer: a touch lighter at the top
        nearBottom: mix(horizon, ink, k * 1.08),
        rim: sunVisible ? RIM[phase] || null : null,
        lights: darkDay ? 0.3 : (LIGHTS[phase] ?? 0) * (kind === "fog" ? 0.65 : 1),
        highlight: (HIGHLIGHT[phase] ?? 1) * Math.min(1, (CLEARNESS[kind] ?? 1) + 0.2),
        flood: darkDay ? 0 : (FLOOD[phase] ?? 0) * (kind === "fog" ? 0.65 : 1),
        halo: kind === "rain" || kind === "thunder" || kind === "fog", // wet air → lights blur into halos
        mist: MIST[kind] ? { color: horizon, alpha: MIST[kind] } : null,
    };
}

/** "#RRGGBB" + alpha → "rgba(...)" (for the mist gradient) */
export const rgba = (hex, a) => `rgba(${hexToRgb(hex).join(",")},${a})`;
