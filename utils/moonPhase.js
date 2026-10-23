/* ------------------------------------------------------------------
 * Moon phase from the date — pure maths, no API needed.
 *
 * phase: 0 = new moon · 0.25 = first quarter · 0.5 = full · 0.75 = last quarter
 * Based on a known new moon (6 Jan 2000 18:14 UTC) and the average
 * length of a lunar cycle. Accurate to within about a day.
 * ------------------------------------------------------------------ */

const SYNODIC_DAYS = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86400000;

/** 0–1, see header */
export function getMoonPhase(date = new Date()) {
    const days = (date.getTime() - KNOWN_NEW_MOON) / DAY_MS;
    return (((days % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS) / SYNODIC_DAYS;
}

/** How much of the moon is lit, 0–1 */
export const getMoonIllumination = (phase) => (1 - Math.cos(2 * Math.PI * phase)) / 2;

const NAMES = [
    [0.03, "New moon"],
    [0.22, "Waxing crescent"],
    [0.28, "First quarter"],
    [0.47, "Waxing gibbous"],
    [0.53, "Full moon"],
    [0.72, "Waning gibbous"],
    [0.78, "Last quarter"],
    [0.97, "Waning crescent"],
    [1.01, "New moon"],
];

export const getMoonPhaseName = (phase) => NAMES.find(([max]) => phase < max)[1];

/**
 * SVG path of the lit part of a moon of radius r (drawn in a 2r × 2r box).
 * Northern-hemisphere view: waxing = lit on the right. Mirror it for the south.
 *
 * Shape = outer edge (half circle on the lit side) + terminator (half ellipse
 * whose width shrinks to 0 at the quarters).
 */
export function getMoonPath(phase, r) {
    const litRight = phase < 0.5;
    const gibbous = phase > 0.25 && phase < 0.75; // more than half lit
    const rx = Math.abs(Math.cos(2 * Math.PI * phase)) * r;

    // SVG arc sweep flags: 1 = clockwise on screen
    const outerSweep = litRight ? 1 : 0;
    const terminatorSweep = litRight === gibbous ? 1 : 0;

    return (
        `M ${r} 0 ` +
        `A ${r} ${r} 0 0 ${outerSweep} ${r} ${2 * r} ` +
        `A ${rx} ${r} 0 0 ${terminatorSweep} ${r} 0 Z`
    );
}
