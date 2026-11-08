# Surreal Weather · Google Play listing kit

Everything needed to fill in Google Play Console for the first release.
Copy each block into the matching field. Things marked **TODO** need a real value first.

Files in this folder:

| File | Play Console field | Spec |
|---|---|---|
| `graphics/icon-512.png` | Store listing → App icon | 512×512 PNG, full square (Google rounds the corners) |
| `graphics/feature-graphic-1024x500.png` | Store listing → Feature graphic | 1024×500 PNG, no transparency |
| `screenshots/01…07.png` | Store listing → Phone screenshots | 1.0 set: 7 × 1080×1920 PNG |
| `screenshots/08…14.png` | Store listing → Phone screenshots | 1.1 set (skylines, moon, history, outlook, widgets): 7 × 1080×1920 PNG |
| `privacy-policy.html` | App content → Privacy policy (needs a public URL, see below) | |
| the `.aab` file (sent separately) | Testing → Internal testing → Create release | |

---

## Main store listing

**App name** (max 30). The keyword "Forecast" helps search. The name on the phone stays "Surreal Weather".
```
Surreal Weather: Live Forecast
```

**Phone screenshots** (Play shows at most 8; the first 2–3 appear in search). Order for 1.1:
`08-skyline`, `10-world`, `09-night`, `03-rain`, `12-history`, `13-outlook`, `11-moon`, `14-widgets`

**Short description** (max 80)
```
Beautiful animated weather: your city's skyline, sun & moon, 10 years of history
```

**Full description** (max 4000)
```
Live weather forecast with animated skies, your city's skyline on the horizon, a weather clock widget, moonrise & moonset and 10 years of weather history.

Surreal Weather turns your daily forecast into something you can feel. Open the app and the sky comes alive: the sun glows, rain streaks down your screen, snow drifts, thunderstorms flash with lightning, fog rolls in, and on clear nights the stars twinkle under a moon in its real phase. And on the horizon stands your city.

YOUR CITY ON THE HORIZON (NEW)
• Every place gets its own skyline: the Eiffel Tower in Paris, the Taj Mahal in India, the Faisal Mosque in Pakistan, Big Ben in London, the Burj Khalifa in Dubai, the Makkah Clock Tower, the Blue Mosque in Istanbul, the Pyramids of Egypt, Mt Fuji in Japan, Shanghai, the Colosseum in Rome, Christ the Redeemer in Rio and the Opera House in Sydney
• Everywhere else gets a local skyline: old European towns and cathedrals, mosques and minarets, pagodas, temples and colonial churches
• It lives in the weather: a dark silhouette at sunset, city lights and floodlit landmarks at night, fading into fog, mist and rain

WEATHER CLOCK WIDGETS (NEW)
• Clock & Weather widget: a live clock and date with today's weather, on a painted sky
• A transparent version that blends into any wallpaper
• The classic weather widget with temperature, conditions and today's high and low
• Updates on its own and opens the app with a tap

MOON, HISTORY AND THE YEAR AHEAD (NEW)
• Moonrise and moonset times with a live moon path across the sky, calculated on your phone
• On this day: historical weather for today's date over the last 10 years. Is it warmer than usual? What's the record? How often did it rain?
• Climate outlook: what any month up to a year ahead is usually like, with typical temperatures and sunny vs rainy days. Great for planning trips, weddings and holidays

ANIMATED, LIVE WEATHER
• Animated scenes for clear skies, clouds, rain, snow, thunderstorms and fog
• Dawn, day, golden dusk and night skies that follow your city's real sunrise and sunset
• Light rain, heavy rain and snow that match how hard it's actually falling
• Relaxing weather sounds: birdsong, crickets at night, wind, rain and distant thunder, with a gentle tune for calm moments. One tap to mute.

ACCURATE FORECAST AT A GLANCE
• Current temperature, feels like, and today's high and low
• A one-line summary of what's next, like "Rain likely around 7 PM"
• Hourly forecast for the next 24 hours with a temperature chart and chance of rain
• 7 day forecast with daily highs, lows and rain chances
• Sunrise and sunset with a live sun path
• Wind speed and direction, humidity, UV index and moon phase

LOCAL WEATHER, AUTOMATICALLY
• Finds your city from your location and shows local weather right away
• Travelling? Your home city follows you
• Save cities worldwide and switch in a tap
• Fast, typo-tolerant city search: 11,000+ cities work offline, smaller towns are found online

LIGHT, FAST AND PRIVATE
• No account, no sign-up, no ads and no tracking
• Small download, smooth even on older phones
• Your cities and weather are stored on your phone
• Location is only used to find your city, only while the app is open
• Smart caching keeps data and battery use low

Whether you're checking if you need an umbrella, planning next month's trip, or just want to watch the rain fall over your city at night, Surreal Weather makes the forecast something to look forward to.

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

## Release notes 1.1 ("What's new", max 500)
```
What's new in 1.1
• Your city on the horizon: the Eiffel Tower, Taj Mahal, Faisal Mosque, Big Ben and more, plus local skylines everywhere. They glow at sunset and light up at night.
• Moonrise & moonset: see where the moon is right now.
• On this day: how today compares with the last 10 years.
• Climate outlook: typical weather for any month, up to a year ahead.
• Clock & Weather widgets: a live clock on your own sky.
```

## Release notes 1.0 (first release)
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
