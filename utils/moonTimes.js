/* ------------------------------------------------------------------
 * Moonrise / moonset from latitude, longitude and time: pure maths,
 * no API needed (Open-Meteo doesn't provide moon times).
 *
 * How it works:
 *   1. moonAltitude(): where the moon is in the sky at one moment,
 *      using the simplified lunar formulas from SunCalc / Meeus
 *      (accurate to a few minutes, plenty for a weather app).
 *   2. getMoonPass(): sample that altitude every 10 minutes around
 *      "now". Wherever it crosses the horizon is a rise or a set.
 *
 * All times are real UTC milliseconds. Convert to city time for display.
 * ------------------------------------------------------------------ */

const RAD = Math.PI / 180;
const DAY_MS = 86400000;
const J2000_MS = Date.UTC(2000, 0, 1, 12); // the formulas count days from here
const OBLIQUITY = 23.4397 * RAD; // tilt of Earth's axis

// The moon counts as "risen" when its top edge appears. Measured from its
// centre that is +0.125°: parallax (+0.95°) minus refraction (0.57°)
// and its own radius (0.26°).
const HORIZON = 0.125 * RAD;

const STEP_MS = 10 * 60000; // sample every 10 minutes
const BACK_MS = 30 * 3600000; // look back far enough to find tonight's rise
const AHEAD_MS = 48 * 3600000; // and ahead to the next rise and its set

/** Moon's altitude above the horizon (radians) at moment `ms`, seen from lat/lng. */
export function moonAltitude(ms, lat, lng) {
    const d = (ms - J2000_MS) / DAY_MS;

    // 1. Moon on its orbit (ecliptic longitude / latitude). Each angle
    //    grows at a steady rate per day, plus the biggest wobble term.
    const L = RAD * (218.316 + 13.176396 * d); // mean longitude
    const M = RAD * (134.963 + 13.064993 * d); // mean anomaly (where it is on its ellipse)
    const F = RAD * (93.272 + 13.22935 * d); // distance from the orbit's node
    const lon = L + RAD * 6.289 * Math.sin(M);
    const lat_ = RAD * 5.128 * Math.sin(F);

    // 2. Rotate into sky coordinates (right ascension / declination)
    const ra = Math.atan2(
        Math.sin(lon) * Math.cos(OBLIQUITY) - Math.tan(lat_) * Math.sin(OBLIQUITY),
        Math.cos(lon)
    );
    const dec = Math.asin(
        Math.sin(lat_) * Math.cos(OBLIQUITY) + Math.cos(lat_) * Math.sin(OBLIQUITY) * Math.sin(lon)
    );

    // 3. Earth's spin: how far the moon is from the observer's meridian
    const sidereal = RAD * (280.16 + 360.9856235 * d) + RAD * lng;
    const hourAngle = sidereal - ra;

    // 4. Altitude above the observer's horizon
    const phi = RAD * lat;
    return Math.asin(
        Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(hourAngle)
    );
}

/**
 * The moon's current (or next) trip across the sky.
 *   up:   is it above the horizon now?
 *   rise: when this trip started (if up) or starts (if down), or null
 *   set:  when this trip ends, or null
 * null = not found in the search window (polar regions: up or down all day).
 */
export function getMoonPass(lat, lng, nowMs) {
    const height = (ms) => moonAltitude(ms, lat, lng) - HORIZON;

    // Find every horizon crossing in the window
    const crossings = [];
    let prevMs = nowMs - BACK_MS;
    let prevH = height(prevMs);
    for (let ms = prevMs + STEP_MS; ms <= nowMs + AHEAD_MS; ms += STEP_MS) {
        const h = height(ms);
        if (prevH > 0 !== h > 0) {
            // straight line between the two samples → the exact minute
            const t = prevH / (prevH - h);
            crossings.push({ ms: prevMs + t * STEP_MS, rising: h > 0 });
        }
        prevMs = ms;
        prevH = h;
    }

    const up = height(nowMs) > 0;
    const rise = up
        ? crossings.filter((c) => c.rising && c.ms <= nowMs).pop()
        : crossings.find((c) => c.rising && c.ms > nowMs);
    const set = crossings.find((c) => !c.rising && c.ms > (rise ? rise.ms : nowMs));

    return { up, rise: rise?.ms ?? null, set: set?.ms ?? null };
}
