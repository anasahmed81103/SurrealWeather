import { sqliteDb, usingMobileDb } from "./citiesDb";

/* ------------------------------------------------------------------
 * climateDb — cache for the 10-year weather history (one row per place).
 *
 * Keyed by rounded coordinates, not city name: history belongs to the
 * spot on the map (the data grid is ~25 km anyway), so renaming or
 * re-adding a city reuses it. Rows nobody refreshed for 2 years
 * (cities long removed) are cleaned up on each save.
 *
 * SQLite on mobile (shares citiesDb's connection), in-memory on web.
 * ------------------------------------------------------------------ */

const FORGET_AFTER_MS = 2 * 365 * 86400000;

/** 24.8607, 67.0011 → "24.86,67.00" (≈1 km — same city, same row) */
export const placeKey = (lat, lng) => `${lat.toFixed(2)},${lng.toFixed(2)}`;

/* ---------------- MOBILE: SQLite ---------------- */
// Created on first use, like the settings table
const ensureTable = () =>
    sqliteDb.execAsync(
        `CREATE TABLE IF NOT EXISTS climate_cache (place TEXT PRIMARY KEY, data TEXT, timestamp INTEGER);`
    );

async function getClimateMobile(place) {
    await ensureTable();
    const row = await sqliteDb.getFirstAsync(`SELECT data, timestamp FROM climate_cache WHERE place = ?`, [place]);
    return row ? { data: JSON.parse(row.data), timestamp: row.timestamp } : null;
}

async function saveClimateMobile(place, data) {
    await ensureTable();
    const now = Date.now();
    await sqliteDb.runAsync(
        `INSERT OR REPLACE INTO climate_cache (place, data, timestamp) VALUES (?, ?, ?)`,
        [place, JSON.stringify(data), now]
    );
    await sqliteDb.runAsync(`DELETE FROM climate_cache WHERE (? - timestamp) > ?`, [now, FORGET_AFTER_MS]);
}

/* ---------------- WEB: memory ---------------- */
const memory = {}; // place → { data, timestamp }

async function getClimateWeb(place) {
    return memory[place] ?? null;
}

async function saveClimateWeb(place, data) {
    memory[place] = { data, timestamp: Date.now() };
}

/* ---------------- EXPORT THE CORRECT VERSION ---------------- */
export const getClimate = usingMobileDb ? getClimateMobile : getClimateWeb;
export const saveClimate = usingMobileDb ? saveClimateMobile : saveClimateWeb;
