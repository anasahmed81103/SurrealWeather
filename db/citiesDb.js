import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

/**
 * Flag to check if we’re on native mobile (iOS/Android)
 */
const isMobile = Platform.OS === "ios" || Platform.OS === "android";

/** How long cached weather counts as fresh. Older data is only used when offline. */
export const CACHE_MAX_AGE_MS = 10 * 60 * 1000;

/* ---------------- MOBILE: SQLite IMPLEMENTATION ---------------- */
let db;
if (isMobile) {
    db = SQLite.openDatabaseSync("appdata.db");
}

async function initDbMobile() {
    // foreign_keys ON → deleting a city also deletes its cached weather
    await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      lat REAL,
      lng REAL,
      isDefault INTEGER
    );

    CREATE TABLE IF NOT EXISTS weather_cache (
      city_id INTEGER,
      data TEXT,
      timestamp INTEGER,
      PRIMARY KEY (city_id),
      FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
    );
  `);
}

async function saveCityMobile(name, lat, lng, isDefault = false) {
    await db.runAsync(
        `INSERT OR REPLACE INTO cities (name, lat, lng, isDefault) VALUES (?, ?, ?, ?)`,
        [name, lat, lng, isDefault ? 1 : 0]
    );
}


async function getCityCoordinatesMobile(name) {
    const result = await db.getFirstAsync(
        `SELECT lat, lng FROM cities WHERE name = ?`,
        [name]
    );
    return result ? { lat: result.lat, lng: result.lng } : null;
}

async function getCityIdMobile(name) {
    const result = await db.getFirstAsync(
        `SELECT id FROM cities WHERE name = ?`,
        [name]
    );
    return result ? result.id : null;
}

async function getAllCitiesMobile() {
    return await db.getAllAsync(`SELECT * FROM cities ORDER BY name ASC`);
}


async function deleteCityMobile(name) {
    await db.runAsync(`DELETE FROM cities WHERE name = ?`, [name]);
}

// Small key/value store for user settings (e.g. "sound" → "on"/"off").
// The table is created here on first use, so it works even before initDb.
async function getSettingMobile(key, fallback) {
    await db.execAsync(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);`);
    const row = await db.getFirstAsync(`SELECT value FROM settings WHERE key = ?`, [key]);
    return row ? row.value : fallback;
}

async function setSettingMobile(key, value) {
    await db.execAsync(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);`);
    await db.runAsync(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, String(value)]);
}

// Make `name` the home city (the one that opens on start). Exactly one city is home.
async function setHomeCityMobile(name) {
    await db.runAsync(`UPDATE cities SET isDefault = (name = ?)`, [name]);
}

async function saveWeatherMobile(name, weatherData) {
    const cityId = await getCityIdMobile(name);
    if (!cityId) return;

    const now = Date.now();
    await db.runAsync(
        `INSERT OR REPLACE INTO weather_cache (city_id, data, timestamp) VALUES (?, ?, ?)`,
        [cityId, JSON.stringify(weatherData), now]
    );
}

// Returns cached weather if younger than maxAgeMs (pass Infinity to accept any age)
async function getWeatherMobile(name, maxAgeMs = CACHE_MAX_AGE_MS) {
    const cityId = await getCityIdMobile(name);
    if (!cityId) return null;

    const result = await db.getFirstAsync(
        `SELECT data, timestamp FROM weather_cache WHERE city_id = ?`,
        [cityId]
    );
    if (!result) return null;

    if (Date.now() - result.timestamp < maxAgeMs) {
        return JSON.parse(result.data);
    }
    return null;
}

async function clearStaleWeatherMobile() {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    await db.runAsync(
        `DELETE FROM weather_cache WHERE (? - timestamp) > ?`,
        [now, tenMinutes]
    );
}

/* ---------------- WEB/PC: MEMORY IMPLEMENTATION ---------------- */
const memoryDb = {
    cities: [], // { id, name, lat, lng }
    weather: [], // { cityId, data, timestamp }
};
let idCounter = 1;

async function initDbWeb() {
    memoryDb.cities = [];
    memoryDb.weather = [];
}

async function saveCityWeb(name, lat, lng, isDefault = false) {
    const existing = memoryDb.cities.find(c => c.name === name);
    if (existing) {
        existing.lat = lat;
        existing.lng = lng;
        existing.isDefault = isDefault;
    } else {
        memoryDb.cities.push({ id: idCounter++, name, lat, lng, isDefault });
    }
}


async function getCityCoordinatesWeb(name) {
    const city = memoryDb.cities.find((c) => c.name === name);
    return city ? { lat: city.lat, lng: city.lng } : null;
}

async function getCityIdWeb(name) {
    const city = memoryDb.cities.find((c) => c.name === name);
    return city ? city.id : null;
}

async function getAllCitiesWeb() {
    // Return a sorted copy (same as mobile) so React sees a new array and re-renders
    return [...memoryDb.cities].sort((a, b) => a.name.localeCompare(b.name));
}

async function deleteCityWeb(name) {
    memoryDb.cities = memoryDb.cities.filter((c) => c.name !== name);
}

const memorySettings = {};

async function getSettingWeb(key, fallback) {
    return key in memorySettings ? memorySettings[key] : fallback;
}

async function setSettingWeb(key, value) {
    memorySettings[key] = String(value);
}

async function setHomeCityWeb(name) {
    memoryDb.cities.forEach((c) => { c.isDefault = c.name === name; });
}

async function saveWeatherWeb(name, weatherData) {
    const cityId = await getCityIdWeb(name);
    if (!cityId) return;

    const now = Date.now();
    const existing = memoryDb.weather.find((w) => w.cityId === cityId);
    if (existing) {
        existing.data = weatherData;
        existing.timestamp = now;
    } else {
        memoryDb.weather.push({ cityId, data: weatherData, timestamp: now });
    }
}

async function getWeatherWeb(name, maxAgeMs = CACHE_MAX_AGE_MS) {
    const cityId = await getCityIdWeb(name);
    if (!cityId) return null;

    const result = memoryDb.weather.find((w) => w.cityId === cityId);
    if (!result) return null;

    if (Date.now() - result.timestamp < maxAgeMs) {
        return result.data;
    }
    return null;
}

async function clearStaleWeatherWeb() {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    memoryDb.weather = memoryDb.weather.filter(
        (w) => now - w.timestamp < tenMinutes
    );
}

/* ---------------- EXPORT THE CORRECT VERSION ---------------- */
export const initDb = isMobile ? initDbMobile : initDbWeb;
export const saveCity = isMobile ? saveCityMobile : saveCityWeb;
export const getCityCoordinates = isMobile
    ? getCityCoordinatesMobile
    : getCityCoordinatesWeb;
export const getCityId = isMobile ? getCityIdMobile : getCityIdWeb;
export const getAllCities = isMobile ? getAllCitiesMobile : getAllCitiesWeb;
export const deleteCity = isMobile ? deleteCityMobile : deleteCityWeb;
export const setHomeCity = isMobile ? setHomeCityMobile : setHomeCityWeb;
export const getSetting = isMobile ? getSettingMobile : getSettingWeb;
export const setSetting = isMobile ? setSettingMobile : setSettingWeb;
export const saveWeather = isMobile ? saveWeatherMobile : saveWeatherWeb;
export const getWeather = isMobile ? getWeatherMobile : getWeatherWeb;
export const clearStaleWeather = isMobile
    ? clearStaleWeatherMobile
    : clearStaleWeatherWeb;

export const usingMobileDb = isMobile;
