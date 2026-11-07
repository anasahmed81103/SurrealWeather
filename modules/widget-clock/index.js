import { requireOptionalNativeModule } from "expo-modules-core";

/* ------------------------------------------------------------------
 * widget-clock — JS side of the local native module (Android only).
 *
 * The native part (android/…/ClockWidgetView.kt) draws the Clock & Weather
 * widgets: a real TextClock (Android keeps it on time by itself) plus the
 * weather values and pictures we pass in.
 *
 * Missing on web, iOS and in Expo Go → `available` is false and
 * render() quietly does nothing.
 * ------------------------------------------------------------------ */

const WidgetClock = requireOptionalNativeModule("WidgetClock");

export const available = Boolean(WidgetClock);

/**
 * Draw one clock widget.
 *   widgetId:    from react-native-android-widget (widgetInfo.widgetId)
 *   data:        { city, temp, label, details, sky, art } — sky / art are SVG strings
 *   transparent: true → no background, small weather icon instead
 */
export async function render(widgetId, data, transparent) {
    if (!WidgetClock) return false;
    return WidgetClock.render(widgetId, JSON.stringify(data), transparent);
}
