import React from "react";
import { WeatherWidget } from "./WeatherWidget";
import { getHomeWeather } from "./homeWeather";

/* ------------------------------------------------------------------
 * widgetTaskHandler — Android calls this (even when the app is closed)
 * when the widget is added, resized, or its 30-minute refresh is due.
 * Clicks are handled natively (clickAction="OPEN_APP"), nothing to do here.
 * ------------------------------------------------------------------ */

export async function widgetTaskHandler({ widgetAction, renderWidget }) {
    console.log("[widget]", widgetAction);
    if (widgetAction === "WIDGET_DELETED" || widgetAction === "WIDGET_CLICK") return;

    const data = await getHomeWeather(); // never throws
    renderWidget(<WeatherWidget {...data} />);
}
