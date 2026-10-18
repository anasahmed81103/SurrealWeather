/* ------------------------------------------------------------------
 * Time helpers that work in the *city's* local time, not the phone's.
 *
 * Trick: a "city time" is a normal Date whose UTC fields hold the city's
 * local clock. So we always read it with getUTC*() and never need
 * timezone libraries or Intl support.
 *
 * Open-Meteo already returns times in the city's local time
 * ("2026-10-19T04:00"), and gives us utc_offset_seconds for "now".
 * ------------------------------------------------------------------ */

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-19T04:00" or "2026-10-19" → city time */
export function parseCityTime(iso) {
    const [date, time = "00:00"] = iso.split("T");
    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = time.split(":").map(Number);
    return new Date(Date.UTC(y, m - 1, d, h, min));
}

/** Current city time from the city's UTC offset */
export const cityNow = (utcOffsetSeconds, nowMs = Date.now()) =>
    new Date(nowMs + utcOffsetSeconds * 1000);

/** Offset of the phone itself (used before we have any weather data) */
export const deviceOffsetSeconds = () => -new Date().getTimezoneOffset() * 60;

const to12h = (d) => {
    const h = d.getUTCHours();
    return { hour: h % 12 || 12, ampm: h >= 12 ? "PM" : "AM" };
};

/** "4:26 PM" */
export function formatClock(d) {
    const { hour, ampm } = to12h(d);
    return `${hour}:${String(d.getUTCMinutes()).padStart(2, "0")} ${ampm}`;
}

/** "4 PM" */
export function formatHour(d) {
    const { hour, ampm } = to12h(d);
    return `${hour} ${ampm}`;
}

/** "Mon" */
export const formatDay = (d) => DAYS[d.getUTCDay()].slice(0, 3);

/** "Monday, Oct 19" */
export const formatDate = (d) =>
    `${DAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;

/**
 * Where the sun is: dawn | day | dusk | night.
 * Dawn/dusk = within 40 min of sunrise/sunset (golden-hour skies).
 */
export function getDayPhase(now, sunrise, sunset) {
    const GOLDEN_MS = 40 * 60 * 1000;
    if (Math.abs(now - sunrise) < GOLDEN_MS) return "dawn";
    if (Math.abs(now - sunset) < GOLDEN_MS) return "dusk";
    return now > sunrise && now < sunset ? "day" : "night";
}
