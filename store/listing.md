# Surreal Weather · Google Play listing kit

Everything needed to fill in Google Play Console for the first release.
Copy each block into the matching field. Things marked **TODO** need a real value first.

Files in this folder:

| File | Play Console field | Spec |
|---|---|---|
| `graphics/icon-512.png` | Store listing → App icon | 512×512 PNG, full square (Google rounds the corners) |
| `graphics/feature-graphic-1024x500.png` | Store listing → Feature graphic | 1024×500 PNG, no transparency |
| `screenshots/01…07.png` | Store listing → Phone screenshots | 7 × 1080×1920 PNG (upload in this order) |
| `privacy-policy.html` | App content → Privacy policy (needs a public URL, see below) | |
| the `.aab` file (sent separately) | Testing → Internal testing → Create release | |

---

## Main store listing

**App name** (max 30). The keyword "Forecast" helps search. The name on the phone stays "Surreal Weather".
```
Surreal Weather: Live Forecast
```

**Short description** (max 80)
```
Weather forecast with animated skies, ambient sounds and a home screen widget.
```

**Full description** (max 4000)
```
Surreal Weather turns your daily weather forecast into something you can feel.

Open the app and the sky comes alive. The sun glows, rain streaks down your screen, snow drifts softly, thunderstorms flash with lightning, fog rolls in, and on clear nights the stars twinkle under a moon that shows its real phase. Every scene follows your city's actual sunrise and sunset, through dawn, day, golden dusk and night, so checking the weather feels like looking out of a window.

It's a beautiful weather app that is also simple, fast and accurate: current conditions, an hourly forecast, a 7-day forecast and all the details you need, at a glance.

ANIMATED, LIVE WEATHER
• Animated weather scenes for clear skies, clouds, rain, snow, thunderstorms and fog
• Dawn, day, dusk and night skies that match the real local time in each city
• Light rain, heavy rain and snow that change with how hard it's actually falling
• Soft ambient sounds: birdsong on sunny days, crickets at night, wind, rain and distant thunder, with a gentle tune for calm moments. One tap to mute.

ACCURATE FORECASTS AT A GLANCE
• Current temperature, "feels like" temperature and today's high and low
• A one-line summary of what's coming next, like "Rain likely around 7 PM" or "Cooling to 7° by 4 AM"
• Hourly forecast for the next 24 hours, with a temperature chart and chance of rain
• 7-day weather forecast with daily highs, lows and rain chances
• Sunrise and sunset times with a live sun path
• Wind speed and direction, humidity, UV index and moon phase

LOCAL WEATHER, AUTOMATICALLY
• Finds your city from your location and shows your local weather right away
• Travelling? Your home city follows you to the new place
• Save cities around the world and switch between them in a tap
• Fast, typo-tolerant city search: 11,000+ cities work even offline, and smaller towns are found online

HOME SCREEN WEATHER WIDGET
• A weather widget for your home city, with a painted sky that changes with the weather
• Shows the temperature, conditions and today's high and low
• Updates on its own, and opens the full app with a tap

LIGHT, FAST AND PRIVATE
• No account, no sign-up, no ads and no tracking
• Your cities and weather are stored on your phone
• Location is only used to find your city, and only while the app is open
• Smart caching keeps data use and battery use low

Whether you're planning your commute, checking if you need an umbrella, or just want to watch the rain fall at night, Surreal Weather makes the forecast something to look forward to.

Weather data by Open-Meteo.com · City data by GeoNames
```

**App category:** Weather
**Tags:** Weather, Travel & local (only these two; unrelated tags hurt ranking)
**Developer / publisher name:** ShahKings
**Contact email:** `contact@shahkings.com` (shown publicly on the store page)
**Website:** optional (e.g. the ShahKings site, if it's live)

---

## App content (Policy section)

**Privacy policy URL:** **TODO**, a public link to `privacy-policy.html` (already filled in with
ShahKings and `contact@shahkings.com`). Easiest: upload it to the ShahKings website, e.g.
`shahkings.com/surreal-weather/privacy`. Free alternatives: Google Sites (paste the text, publish)
or GitHub Pages.

**Ads:** No, the app contains no ads.

**App access:** All functionality is available without special access (no login).

**Content rating** (IARC questionnaire):
- Category: *All other app types* (utility / tools)
- Violence, sexuality, language, controlled substances, gambling: **No** to all
- Users can interact or exchange content: **No**
- Shares user location with other users: **No**
- Digital purchases: **No**
- Expected result: **Everyone / PEGI 3**

**Target audience and content:** ages **13+** (choosing under-13 brings in the stricter Families policy;
the app isn't made for kids). Appeals to children: **No**.

**News app:** No · **COVID-19 tracing:** No · **Government app:** No · **Financial features:** None · **Health:** No

**Data safety form:**

| Question | Answer |
|---|---|
| Does the app collect or share any required user data types? | **Yes** (location is sent to a weather service) |
| Is all user data encrypted in transit? | **Yes** (all requests use HTTPS) |
| Account creation | **My app does not allow users to create an account** · outside login: **No** |
| Can users request that their data is deleted? (optional) | Leave blank or **No**: nothing is kept off-device, and uninstalling removes local data |
| **Location → Approximate location** | Collected: **Yes** · Shared: **No** · Processed ephemerally: **Yes** · Required: **No, users can choose** · Purpose: **App functionality** |
| **Location → Precise location** | Same as above |
| **App activity → In-app search history** | Same as above (typed city names go to Open-Meteo when a small town isn't in the offline list) |
| Personal info, financial, health, messages, photos, audio, files, calendar, contacts | **Not collected** |
| App activity, web browsing, app info and performance, device or other IDs | **Not collected** |

Why "Shared: No": coordinates go to weather and geocoding services that process them for the app
(service providers). Google doesn't count that as "sharing".

---

## Release notes (first release, "What's new")
```
Welcome to Surreal Weather! Animated live skies, ambient sounds, hourly and 7-day forecasts, and a home screen weather widget.
```

---

## Credits and licences (no action needed, for reference)
- Weather data: Open-Meteo.com (CC BY 4.0, free for non-commercial use; credited in the app and description)
- City data: GeoNames (CC BY 4.0; credited in the app)
- Ambient sounds: CC0 recordings from freesound.org (`assets/sounds/CREDITS.md`)
- Font: Outfit (SIL Open Font License)

## Release checklist
1. Create app → name "Surreal Weather", App, Free.
2. Fill in **Store listing** with the text and graphics above.
3. Fill in **App content**: privacy policy URL, ads, app access, content rating, target audience, data safety.
4. **Testing → Internal testing**: upload the `.aab`, add yourself as a tester, install from Play and check the app and widget.
5. If the developer account is a personal one created after Nov 2023: run a **Closed test with 12+ testers for 14 days** before production is unlocked.
6. **Production → Create release** → upload the same `.aab` (or a newer one) → roll out.
