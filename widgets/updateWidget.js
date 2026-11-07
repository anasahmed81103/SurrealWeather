import React from "react";
import { Platform } from "react-native";
import { getHomeWeather } from "./homeWeather";

/* ------------------------------------------------------------------
 * updateWidget — called by the app after it saves new weather or changes
 * the home city, so every widget on the home screen updates right away:
 * the Weather widget and both Clock & Weather widgets.
 *
 * The widget library is loaded lazily: it needs native code, which
 * doesn't exist on web, iOS or in Expo Go — there this quietly does nothing.
 * Fire-and-forget: never throws, never blocks the app.
 * ------------------------------------------------------------------ */

export async function updateWidget() {
    if (Platform.OS !== "android") return;
    try {
        const { requestWidgetUpdate, getWidgetInfo } = require("react-native-android-widget");
        const { WeatherWidget, WIDGET_NAME } = require("./WeatherWidget");
        const { CLOCK_WIDGETS, drawClockWidget } = require("./clockWidget");
        const data = await getHomeWeather();

        await requestWidgetUpdate({
            widgetName: WIDGET_NAME,
            renderWidget: (info) => <WeatherWidget {...data} width={info.width} height={info.height} />,
            widgetNotFound: () => console.log("[widget] no Weather widget on the home screen"),
        });

        // Clock widgets: draw each one placed on the home screen
        for (const name of Object.keys(CLOCK_WIDGETS)) {
            const placed = await getWidgetInfo(name);
            for (const info of placed) await drawClockWidget({ ...info, widgetName: name }, data);
        }
    } catch (err) {
        console.log("[widget] not available here (Expo Go?):", err.message);
    }
}
