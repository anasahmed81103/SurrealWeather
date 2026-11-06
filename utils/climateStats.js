/* ------------------------------------------------------------------
 * climateStats — turns 10 years of daily history into "on this day"
 * facts. Pure maths, no network.
 *
 * Two kinds of numbers:
 *   - Exact date (Nov 3 of each past year): records, last year, rain count.
 *     Easy to picture ("Nov 3, 2019 was 33°").
 *   - "Normal" = average over ±7 days around the date in every year
 *     (150 days instead of 10), so one freak day doesn't skew it.
 * ------------------------------------------------------------------ */

const DAY_MS = 86400000;
const YEARS = 10;
const WINDOW_DAYS = 7;
const RAINY_MM = 1; // less than 1 mm is drizzle nobody remembers
const MIN_YEARS = 5; // less history than this → don't claim anything

const avg = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

/**
 * history:   { start, max, min, rain } from services/historyApi
 * todayIso:  city's local date "2026-11-03"
 * todayHigh: today's forecast high
 * Returns null when there isn't enough data.
 */
export function getClimateStats(history, todayIso, todayHigh) {
    const [y, m, d] = todayIso.split("-").map(Number);
    const startMs = Date.parse(`${history.start}T00:00:00Z`);
    // value on a day, or null (before the start, after yesterday, or a gap)
    const on = (key, ms) => history[key][Math.round((ms - startMs) / DAY_MS)] ?? null;

    const years = []; // { year, high, low, rain } for the exact date
    const windowHighs = [];
    const windowLows = [];

    for (let year = y - YEARS; year < y; year++) {
        const day = m === 2 && d === 29 ? 28 : d; // leap day → Feb 28 in other years
        const ms = Date.UTC(year, m - 1, day);

        const high = on("max", ms);
        const low = on("min", ms);
        if (high != null && low != null) years.push({ year, high, low, rain: on("rain", ms) ?? 0 });

        for (let k = -WINDOW_DAYS; k <= WINDOW_DAYS; k++) {
            const hi = on("max", ms + k * DAY_MS);
            const lo = on("min", ms + k * DAY_MS);
            if (hi != null) windowHighs.push(hi);
            if (lo != null) windowLows.push(lo);
        }
    }

    if (years.length < MIN_YEARS) return null;

    const normalHigh = avg(windowHighs);
    const warmest = years.reduce((a, b) => (b.high > a.high ? b : a));
    const coolest = years.reduce((a, b) => (b.high < a.high ? b : a));
    const coldestNight = years.reduce((a, b) => (b.low < a.low ? b : a));

    return {
        years,
        normalHigh,
        normalLow: avg(windowLows),
        diff: todayHigh - normalHigh, // + warmer than usual, − cooler
        lastYear: years.find((e) => e.year === y - 1) ?? null,
        warmest,
        coldestNight,
        rainyYears: years.filter((e) => e.rain >= RAINY_MM).length,
        // Beats every year on record → worth a headline
        rank: todayHigh > warmest.high ? "warmest" : todayHigh < coolest.high ? "coolest" : null,
    };
}
