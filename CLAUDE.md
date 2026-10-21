# Surreal Weather — project rules

A React Native (Expo) mobile weather app. Goal: a visually stunning, animated weather
experience in the spirit of the classic Android weather apps (HTC Sense / TouchWiz era),
built with simple, light code.

## Coding style (always follow)

- **Small, divided, componentized.** One job per file. Screens compose components;
  components don't fetch data. If a file grows past ~200 lines, split it.
- **Simple code, simple logic.** Prefer plain functions, lookup tables and small hooks over
  clever abstractions or new libraries. No state-management libraries.
- **Useful comments.** A short header comment on every file saying what it does; comment the
  *why* of anything non-obvious. Easy to read, easy to debug.
- **Debuggable.** Log key steps with tagged messages (`[init]`, `[weather]`, `[location]`...).
  Every async path must end in a visible state (data, fallback, or error) — never an
  endless loading screen. All network calls go through `services/http.js` (has timeouts).
- **Match existing patterns** before adding new ones. Look at neighbouring files first.

## Data & network (always follow)

- **Local-first.** Cities and cached weather live on the phone (`db/citiesDb.js`, SQLite on
  mobile, in-memory on web). Read the cache before hitting the network.
- **Efficient.** One weather request per city per cache window; request only the fields the
  UI shows. No polling.
- **Free APIs only, no API keys, no billing:**
  - Weather + city search: Open-Meteo (free for non-commercial use, <10k calls/day).
  - Coords → city name: native `expo-location` geocoder, BigDataCloud free client endpoint
    as fallback.
  - Never hardcode secrets in the app.

## Project layout

```
App.js                  # providers only
screens/                # full screens (layout, no API calls)
hooks/                  # state + reusable logic (useCityWeather, suggestions, draggable sheet)
components/             # UI pieces (header, cards, picker)
components/scene/       # animated weather background layers
services/               # API calls (http, weatherApi, geocodingApi)
db/                     # local storage
utils/                  # pure helpers (weather codes, time, offline city search)
data/                   # bundled data — worldCities.js is GENERATED, don't edit by hand
scripts/                # dev scripts (buildWorldCities.js regenerates data/worldCities.js)
```

Sounds: CC0 loops in `assets/sounds/` (credits in `CREDITS.md`, ~50 s, AAC, loudness-matched).
`utils/ambience.js` picks the sound, `hooks/useAmbientSound.js` plays it. Keep the expo-audio
plugin's microphone/background options OFF in app.json — the app never records.

City search: offline list first (`utils/citySearch.js`, typo-tolerant), Open-Meteo online search
only as a debounced backup for small towns.

## Running

`npx expo start` → scan the QR code with Expo Go (SDK 57). `npx expo start -c` clears cache.
Check config/deps with `npx expo-doctor`.

- Use `react-native-safe-area-context` (not React Native's deprecated `SafeAreaView`).
- Animations: React Native `Animated` with `useNativeDriver: true` (see `components/scene/useLoop.js`).
