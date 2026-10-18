import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

/**
 * Flag to check if we’re on native mobile (iOS/Android)
 */
const isMobile = Platform.OS === "ios" || Platform.OS === "android";

/* ---------------- MOBILE: SQLite IMPLEMENTATION ---------------- */
let db;
if (isMobile) {
    db = SQLite.openDatabaseSync("appdata.db");
}

async function initDbMobile() {
    await db.execAsync(`
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

async function saveWeatherMobile(name, weatherData) {
    const cityId = await getCityIdMobile(name);
    if (!cityId) return;

    const now = Date.now();
    await db.runAsync(
        `INSERT OR REPLACE INTO weather_cache (city_id, data, timestamp) VALUES (?, ?, ?)`,
        [cityId, JSON.stringify(weatherData), now]
    );
}

async function getWeatherMobile(name) {
    const cityId = await getCityIdMobile(name);
    if (!cityId) return null;

    const result = await db.getFirstAsync(
        `SELECT data, timestamp FROM weather_cache WHERE city_id = ?`,
        [cityId]
    );
    if (!result) return null;

    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    if (now - result.timestamp < tenMinutes) {
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
    return memoryDb.cities;
}

async function deleteCityWeb(name) {
    memoryDb.cities = memoryDb.cities.filter((c) => c.name !== name);
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

async function getWeatherWeb(name) {
    const cityId = await getCityIdWeb(name);
    if (!cityId) return null;

    const result = memoryDb.weather.find((w) => w.cityId === cityId);
    if (!result) return null;

    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    if (now - result.timestamp < tenMinutes) {
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
export const saveWeather = isMobile ? saveWeatherMobile : saveWeatherWeb;
export const getWeather = isMobile ? getWeatherMobile : getWeatherWeb;
export const clearStaleWeather = isMobile
    ? clearStaleWeatherMobile
    : clearStaleWeatherWeb;

export const usingMobileDb = isMobile;
