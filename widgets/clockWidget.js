import { render, available } from "../modules/widget-clock";
import { getWeatherInfo } from "../utils/weatherCodes";
import { artSvg, skySvg, CLOCK_ART_PLACE } from "./widgetSky";

/* ------------------------------------------------------------------
 * clockWidget — the two Clock & Weather widgets (Android only).
 *
 * Unlike the Weather widget (drawn by react-native-android-widget as one
 * picture), these are native layouts with a real TextClock, because a
 * picture can only be redrawn every 30 minutes and the clock would be
 * stuck. Here we only prepare the weather part and let the local module
 * (modules/widget-clock) draw it.
 *
 * Both are still registered in app.json like the Weather widget, so the
 * library handles adding / resizing / the 30-minute refresh for them.
 * ------------------------------------------------------------------ */

// Widget name (app.json) → version
export const CLOCK_WIDGETS = {
    ClockWeather: { transparent: false },
    ClockWeatherClear: { transparent: true },
};

const RADIUS = 24; // same rounded corners as the Weather widget

/** Weather → the texts and pictures the native layout shows */
function clockData({ city, weather }, width, height, transparent) {
    if (!weather) {
        // No data yet: a working clock, plus a hint instead of weather
        return { city: city ?? "", temp: "", label: "Tap to open", sky: transparent ? "" : skySvg("clear", true, width, height, RADIUS, CLOCK_ART_PLACE), art: "" };
    }

    const { current, daily } = weather;
    const { label, kind } = getWeatherInfo(current.weather_code);
    const night = !current.is_day;
    const high = Math.round(daily.temperature_2m_max[0]);
    const low = Math.round(daily.temperature_2m_min[0]);

    return {
        city: city ?? "",
        temp: `${Math.round(current.temperature_2m)}°`,
        label: `${label} · H ${high}° L ${low}°`,
        // Sky drawn at the widget's real size (dp), so it fits without stretching;
        // art smaller and higher than on the Weather widget, so it doesn't sit behind the temperature
        sky: transparent ? "" : skySvg(kind, night, Math.round(width), Math.round(height), RADIUS, CLOCK_ART_PLACE),
        art: transparent ? artSvg(kind, night) : "",
    };
}

/**
 * Draw one clock widget. info = { widgetName, widgetId, width, height }
 * from react-native-android-widget. Never throws.
 */
export async function drawClockWidget(info, homeWeather) {
    const version = CLOCK_WIDGETS[info.widgetName];
    if (!version || !available) return;
    try {
        const data = clockData(homeWeather, info.width || 320, info.height || 150, version.transparent);
        await render(info.widgetId, data, version.transparent);
        console.log("[widget] clock drawn:", info.widgetName, info.widgetId);
    } catch (err) {
        console.warn("[widget] clock failed:", err.message);
    }
}
