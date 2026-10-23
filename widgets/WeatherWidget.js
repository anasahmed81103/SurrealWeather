import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { getWeatherInfo } from "../utils/weatherCodes";
import { fonts } from "../components/theme";

/* ------------------------------------------------------------------
 * WeatherWidget — the 4×2 home-screen widget layout (Android only).
 *
 * Widgets are drawn by the launcher, not by our app, so they can't run
 * animations or SVG — just layouts, text and gradients. The sky gradient
 * and emoji change with the weather to keep the app's feel.
 * Tapping anywhere opens the app.
 * ------------------------------------------------------------------ */

export const WIDGET_NAME = "Weather";

// Sky gradient per weather kind: [day, night], each [top, bottom]
const SKIES = {
    clear: [["#4FA9F0", "#1E5FB0"], ["#22285E", "#0E0C3F"]],
    partly: [["#5C9BD6", "#2E5E93"], ["#2A2F5E", "#11113F"]],
    cloudy: [["#7F8EA3", "#4A5768"], ["#353C52", "#181C2E"]],
    fog: [["#9AA5B1", "#626D7A"], ["#3C4252", "#1C2030"]],
    rain: [["#4E6378", "#27384A"], ["#263247", "#0F1626"]],
    snow: [["#9DB8D4", "#5F7FA3"], ["#3A4766", "#1A2240"]],
    thunder: [["#47425E", "#211E33"], ["#2A2540", "#0D0B1C"]],
};

// Emoji per kind: [day, night] — renders in full colour, no icon font needed
const EMOJI = {
    clear: ["☀️", "🌙"],
    partly: ["⛅", "☁️"],
    cloudy: ["☁️", "☁️"],
    fog: ["🌫️", "🌫️"],
    rain: ["🌧️", "🌧️"],
    snow: ["❄️", "❄️"],
    thunder: ["⛈️", "⛈️"],
};

const WHITE = "#FFFFFF";
const SOFT = "rgba(255, 255, 255, 0.78)";

export function WeatherWidget({ city, weather }) {
    // No data yet: still show something useful, never a blank widget
    if (!weather) {
        return (
            <Background sky={SKIES.clear[1]}>
                <TextWidget
                    text={city ? `${city}\nNo weather yet — tap to open` : "Tap to open Surreal Weather"}
                    style={{ fontSize: 16, fontFamily: fonts.regular, color: WHITE }}
                />
            </Background>
        );
    }

    const { current, daily } = weather;
    const { label, kind } = getWeatherInfo(current.weather_code);
    const night = current.is_day ? 0 : 1;
    const high = Math.round(daily.temperature_2m_max[0]);
    const low = Math.round(daily.temperature_2m_min[0]);

    return (
        <Background sky={SKIES[kind][night]}>
            {/* Left: city + big temperature */}
            <FlexWidget style={{ flexDirection: "column", justifyContent: "center" }}>
                <TextWidget text={city} maxLines={1} truncate="END" style={{ fontSize: 16, fontFamily: fonts.medium, color: WHITE }} />
                <TextWidget
                    text={`${Math.round(current.temperature_2m)}°`}
                    style={{ fontSize: 56, fontFamily: fonts.thin, color: WHITE }}
                />
            </FlexWidget>

            {/* Right: emoji, condition, high / low */}
            <FlexWidget style={{ flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
                <TextWidget text={EMOJI[kind][night]} style={{ fontSize: 34 }} />
                <TextWidget text={label} style={{ fontSize: 14, fontFamily: fonts.regular, color: WHITE }} />
                <TextWidget text={`H ${high}°  ·  L ${low}°`} style={{ fontSize: 13, fontFamily: fonts.light, color: SOFT }} />
            </FlexWidget>
        </Background>
    );
}

// Full-size rounded gradient card; tapping it opens the app
function Background({ sky, children }) {
    return (
        <FlexWidget
            clickAction="OPEN_APP"
            style={{
                height: "match_parent",
                width: "match_parent",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 18,
                borderRadius: 24,
                backgroundGradient: { from: sky[0], to: sky[1], orientation: "TOP_BOTTOM" },
            }}
        >
            {children}
        </FlexWidget>
    );
}
