/* ------------------------------------------------------------------
 * climateOutlook — "what is a month usually like here?", from the
 * 10-year daily history. Pure maths, no network.
 *
 * Every day of that month in every past year (~300 days) is sorted into
 * a sky type and averaged. The month is also split into thirds
 * (early / mid / late) to show patterns like "rain mostly mid-month".
 *
 * This is climate (what's typical), not a forecast: the same month gives
 * the same answer whatever future year you ask about.
 * ------------------------------------------------------------------ */

const DAY_MS = 86400000;
const YEARS = 10;
const RAINY_MM = 1;

export const SKY_TYPES = ["sunny", "mixed", "cloudy", "rainy"];

/** One day → its sky type. Rain wins; otherwise mean cloud cover decides. */
export function skyType(rain, cloud) {
    if (rain >= RAINY_MM) return "rainy";
    if (cloud < 30) return "sunny";
    if (cloud < 65) return "mixed";
    return "cloudy";
}

const avg = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Value below which `p` (0–1) of the sorted numbers fall */
function percentile(sorted, p) {
    return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

/** Shares of each sky type, e.g. { sunny: 0.7, mixed: 0.2, cloudy: 0.05, rainy: 0.05 } */
function skyMix(days) {
    const mix = Object.fromEntries(SKY_TYPES.map((t) => [t, 0]));
    days.forEach((d) => { mix[d.sky] += 1 / days.length; });
    return mix;
}

/** The sky type with the biggest share */
const mostly = (mix) => SKY_TYPES.reduce((a, b) => (mix[b] > mix[a] ? b : a));

/** Summary of a set of days (a whole month or a third of it) */
function summarize(days) {
    const mix = skyMix(days);
    return {
        high: avg(days.map((d) => d.high)),
        low: avg(days.map((d) => d.low)),
        rainChance: mix.rainy, // share of days with ≥ 1 mm
        mix,
        mostly: mostly(mix),
    };
}

/** "very hot" … "cold" from the typical daytime high */
export function feelWord(high) {
    if (high >= 38) return "Very hot";
    if (high >= 32) return "Hot";
    if (high >= 25) return "Warm";
    if (high >= 18) return "Mild";
    if (high >= 10) return "Cool";
    return "Cold";
}

/**
 * history: { start, max, min, rain, cloud } from services/historyApi
 * year, month (1–12): any month, past or future; the result is the same
 *                     10-year pattern, `year` only picks which years count as "past".
 * Returns null if there's too little data for that month.
 */
export function getMonthOutlook(history, year, month) {
    const startMs = Date.parse(`${history.start}T00:00:00Z`);
    const today = Date.now();
    const days = [];
    const rainTotals = []; // mm per month, per year
    const years = [];

    for (let y = year - YEARS; y < year; y++) {
        const first = Date.UTC(y, month - 1, 1);
        if (first + 31 * DAY_MS > today) continue; // that month hasn't finished yet
        const length = new Date(Date.UTC(y, month, 0)).getUTCDate();
        let rainSum = 0;
        let counted = 0;

        for (let d = 1; d <= length; d++) {
            const i = Math.round((first + (d - 1) * DAY_MS - startMs) / DAY_MS);
            const high = history.max[i];
            const low = history.min[i];
            if (high == null || low == null) continue;
            const rain = history.rain[i] ?? 0;
            days.push({ day: d, year: y, high, low, rain, sky: skyType(rain, history.cloud?.[i] ?? 0) });
            rainSum += rain;
            counted++;
        }
        if (counted > 20) {
            rainTotals.push(rainSum);
            years.push(y);
        }
    }

    if (years.length < 5) return null;

    const highs = days.map((d) => d.high).sort((a, b) => a - b);
    const lows = days.map((d) => d.low).sort((a, b) => a - b);
    const hottest = days.reduce((a, b) => (b.high > a.high ? b : a));
    const coldest = days.reduce((a, b) => (b.low < a.low ? b : a));

    return {
        ...summarize(days),
        // "Expect 28° to 42°": leaves out the rarest 10% at each end
        range: [percentile(lows, 0.1), percentile(highs, 0.9)],
        hottest,
        coldest,
        rainyDays: (days.filter((d) => d.sky === "rainy").length / days.length) *
            new Date(Date.UTC(year, month, 0)).getUTCDate(),
        rainTotal: avg(rainTotals),
        fromYear: years[0],
        toYear: years[years.length - 1],
        thirds: [
            { label: "Early", ...summarize(days.filter((d) => d.day <= 10)) },
            { label: "Mid", ...summarize(days.filter((d) => d.day > 10 && d.day <= 20)) },
            { label: "Late", ...summarize(days.filter((d) => d.day > 20)) },
        ],
    };
}

/**
 * One plain sentence, e.g.
 *   "Hot and mostly cloudy. Rain is most likely late in the month."
 *   "Warm and mostly sunny. Rain is rare."
 */
export function describeOutlook(o) {
    const sky = { sunny: "mostly sunny", mixed: "partly cloudy", cloudy: "mostly cloudy", rainy: "often rainy" };
    const first = `${feelWord(o.high)} and ${sky[o.mostly]}.`;

    if (o.rainChance < 0.05) return `${first} Rain is rare.`;

    const when = { Early: "early in the month", Mid: "mid-month", Late: "late in the month" };
    const byRain = [...o.thirds].sort((a, b) => b.rainChance - a.rainChance); // wettest first
    const [wettest, second, driest] = byRain;
    const rainDays = `Rain on about ${Math.round(o.rainyDays)} days`;

    // One third clearly wetter than the rest → "most likely mid-month"
    if (wettest.rainChance > 1.5 * second.rainChance) {
        return `${first} ${rainDays}, most likely ${when[wettest.label]}.`;
    }
    // One third clearly drier → "less early in the month"
    if (driest.rainChance < 0.6 * second.rainChance) {
        return `${first} ${rainDays}, less ${when[driest.label]}.`;
    }
    return `${first} ${rainDays}.`;
}
