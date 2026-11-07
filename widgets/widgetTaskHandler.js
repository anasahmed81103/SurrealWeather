import React from "react";
import { WeatherWidget } from "./WeatherWidget";
import { getHomeWeather } from "./homeWeather";
import { CLOCK_WIDGETS, drawClockWidget } from "./clockWidget";

/* ------------------------------------------------------------------
 * widgetTaskHandler — Android calls this (even when the app is closed)
 * when a widget is added, resized, or its 30-minute refresh is due.
 *
 *   Weather                         → drawn here by the library (renderWidget)
 *   ClockWeather, ClockWeatherClear → drawn by our native module (clockWidget.js),
 *                                     renderWidget is not called for them
 *
 * Clicks are handled natively (open the app), nothing to do here.
 * ------------------------------------------------------------------ */

export async function widgetTaskHandler({ widgetAction, widgetInfo, renderWidget }) {
    console.log("[widget]", widgetInfo.widgetName, widgetAction);
    if (widgetAction === "WIDGET_DELETED" || widgetAction === "WIDGET_CLICK") return;

    const data = await getHomeWeather(); // never throws

    if (CLOCK_WIDGETS[widgetInfo.widgetName]) {
        await drawClockWidget(widgetInfo, data);
        return;
    }
    renderWidget(<WeatherWidget {...data} width={widgetInfo.width} height={widgetInfo.height} />);
}
