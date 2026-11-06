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

## Size & smoothness (don't regress — ~15 MB on Play, smooth on low-end phones)

Size:
- Release builds ship as an **app bundle** (`eas.json` production → `app-bundle`), so Play
  serves each phone only its own CPU/density slice.
- `expo-build-properties` in app.json: `enableMinifyInReleaseBuilds` + `enableShrinkResourcesInReleaseBuilds` (R8 strips unused Java/resources).
- Few native deps. Every new library adds native code to every install, so ask first
  (`expo-blur` was removed for this). Build with SVG and `expo-linear-gradient` before reaching
  for a new library.
- Scenes are drawn in SVG code, not images or Lottie files. Audio is short AAC `.m4a` (~3 MB
  in total). Icons are imported per family (see below).

Smoothness:
- Every scene animation runs on the **native driver** via one `useLoop` (0→1 forever),
  turned into motion with `interpolate`, so JS work (fetching, re-renders) never drops frames.
- SVG shapes are drawn once. Only the wrapping `Animated.View` transform/opacity moves.
  Never animate SVG props.
- `WeatherScene` is `memo()`'d, so clock ticks and other state changes don't redraw the sky.
- Particles get a random `offset` instead of a staggered start, so they don't all start together.
- Local-first: the cache paints instantly, with at most one small request per city every 10 min
  (fields trimmed). No polling. Sound pauses when the app is backgrounded (`AppState`).

## Project layout

```
App.js                  # providers only
screens/                # full screens (layout, no API calls)
hooks/                  # state + reusable logic (useCityWeather, suggestions, draggable sheet)
components/             # UI pieces (header, cards, picker) + theme.js (fonts, colours)
components/details/     # detail tiles (sun arc, wind, gauges, moon)
components/scene/       # animated weather background layers (SVG + Animated)
widgets/                # Android home-screen widget (layout, painted SVG sky, data, task handler, updateWidget)
services/               # API calls (http, weatherApi, geocodingApi)
db/                     # local storage
utils/                  # pure helpers (weather codes, time, offline city search)
data/                   # bundled data — worldCities.js is GENERATED, don't edit by hand
scripts/                # dev scripts (buildWorldCities.js regenerates data/worldCities.js)
```

Sounds: CC0 loops in `assets/sounds/` (credits in `CREDITS.md`, ~50 s, AAC, loudness-matched).
`utils/ambience.js` picks the sound (and a soft tune from `assets/music/` in serene moments:
rain, dawn, dusk, late night), `hooks/useAmbientSound.js` plays both as one short moment using
two `hooks/useFadingPlayer.js` players. Audio format: AAC `.m4a`, loudness-matched to -20 LUFS.
Original audio files go in `raw-audio/` (git-ignored). Keep the expo-audio
plugin's microphone/background options OFF in app.json — the app never records.

"On this day" history: `hooks/useClimateHistory.js` downloads 10 years of daily high/low/rain
(Open-Meteo archive API, ~110 KB, one request per place) **once a year**, cached in
`db/climateDb.js` keyed by rounded coordinates (~47 KB per place). Loads only after the forecast;
fails silently (card hidden). Maths in `utils/climateStats.js`. Moon rise/set are computed
on the phone (`utils/moonTimes.js`), no API.

City search: offline list first (`utils/citySearch.js`, typo-tolerant), Open-Meteo online search
only as a debounced backup for small towns.

## Running

`npx expo start` → scan the QR code with Expo Go (SDK 57). `npx expo start -c` clears cache.
Check config/deps with `npx expo-doctor`.

Android widget (`react-native-android-widget`, config in app.json) needs a development build
(`npx expo run:android` or EAS) — Expo Go skips it silently. It always shows the **home city**,
reads the same SQLite cache as the app, and the app calls `updateWidget()` after saving weather.
The home city follows the phone: `hooks/homeLocation.js` re-checks location on each open
(no permission popup after the first launch).

- Use `react-native-safe-area-context` (not React Native's deprecated `SafeAreaView`).
- Animations: React Native `Animated` with `useNativeDriver: true` (see `components/scene/useLoop.js`).
  Draw shapes with `react-native-svg`, but only animate the wrapping `Animated.View` (transform/opacity).
- Fonts/colours come from `components/theme.js`. Use `fontFamily` (Outfit weights), never `fontWeight`.
- Icons: `import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"`
  (importing from "@expo/vector-icons" bundles every icon font, ~4 MB).
- Preview any scene with `DEBUG_SCENE` in `screens/WeatherScreen.js` (keep it null when done).
