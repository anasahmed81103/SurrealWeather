import React from "react";
import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from "react-native-android-widget";
import { getWeatherInfo } from "../utils/weatherCodes";
import { fonts } from "../components/theme";
import { skySvg } from "./widgetSky";

/* ------------------------------------------------------------------
 * WeatherWidget — the 4×2 home-screen widget layout (Android only).
 *
 * Widgets are drawn by the launcher, not by our app, so they can't
 * animate. Instead the background is a painted still of the weather
 * (widgetSky.js): text on the left, sky art on the right.
 * Tapping anywhere opens the app.
 *
 * width / height: the widget's real size in dp (from Android), so the
 * background is drawn to fit exactly when the user resizes it.
 * ------------------------------------------------------------------ */

export const WIDGET_NAME = "Weather";

const WHITE = "#FFFFFF";
const SOFT = "rgba(255, 255, 255, 0.85)";
const RADIUS = 24;

// Soft shadow so white text stays readable on the lighter skies
const shadow = { textShadowColor: "rgba(0, 0, 0, 0.35)", textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } };

export function WeatherWidget({ city, weather, width, height }) {
    // No data yet: still show something useful, never a blank widget
    if (!weather) {
        return (
            <Card kind="clear" night width={width} height={height}>
                <TextWidget
                    text={city ? `${city}\nNo weather yet — tap to open` : "Tap to open Surreal Weather"}
                    style={{ fontSize: 16, fontFamily: fonts.regular, color: WHITE, ...shadow }}
                />
            </Card>
        );
    }

    const { current, daily } = weather;
    const { label, kind } = getWeatherInfo(current.weather_code);
    const high = Math.round(daily.temperature_2m_max[0]);
    const low = Math.round(daily.temperature_2m_min[0]);

    return (
        <Card kind={kind} night={!current.is_day} width={width} height={height}>
            <TextWidget text={city} maxLines={1} truncate="END" style={{ fontSize: 16, fontFamily: fonts.medium, color: WHITE, ...shadow }} />
            <TextWidget
                text={`${Math.round(current.temperature_2m)}°`}
                style={{ fontSize: 54, fontFamily: fonts.thin, color: WHITE, ...shadow }}
            />
            <TextWidget
                text={`${label}  ·  H ${high}°  L ${low}°`}
                maxLines={1}
                truncate="END"
                style={{ fontSize: 13, fontFamily: fonts.regular, color: SOFT, ...shadow }}
            />
        </Card>
    );
}

// Painted sky behind, text column on top; tapping it opens the app
function Card({ kind, night, width = 320, height = 150, children }) {
    return (
        <OverlapWidget clickAction="OPEN_APP" style={{ height: "match_parent", width: "match_parent", borderRadius: RADIUS }}>
            <SvgWidget
                svg={skySvg(kind, night, Math.round(width), Math.round(height), RADIUS)}
                style={{ height: "match_parent", width: "match_parent" }}
            />
            <FlexWidget
                style={{
                    height: "match_parent",
                    width: "match_parent",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingHorizontal: 18,
                }}
            >
                {children}
            </FlexWidget>
        </OverlapWidget>
    );
}
