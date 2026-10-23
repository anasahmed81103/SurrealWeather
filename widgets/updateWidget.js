import React from "react";
import { Platform } from "react-native";
import { getHomeWeather } from "./homeWeather";

/* ------------------------------------------------------------------
 * updateWidget — called by the app after it saves new weather or changes
 * the home city, so the widget on the home screen updates right away.
 *
 * The widget library is loaded lazily: it needs native code, which
 * doesn't exist on web, iOS or in Expo Go — there this quietly does nothing.
 * Fire-and-forget: never throws, never blocks the app.
 * ------------------------------------------------------------------ */

export async function updateWidget() {
    if (Platform.OS !== "android") return;
    try {
        const { requestWidgetUpdate } = require("react-native-android-widget");
        const { WeatherWidget, WIDGET_NAME } = require("./WeatherWidget");

        await requestWidgetUpdate({
            widgetName: WIDGET_NAME,
            renderWidget: async () => <WeatherWidget {...(await getHomeWeather())} />,
            widgetNotFound: () => console.log("[widget] none on the home screen"),
        });
    } catch (err) {
        console.log("[widget] not available here (Expo Go?):", err.message);
    }
}
