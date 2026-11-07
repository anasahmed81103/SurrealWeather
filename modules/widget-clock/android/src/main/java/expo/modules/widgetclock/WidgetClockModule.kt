package expo.modules.widgetclock

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject

/* ------------------------------------------------------------------
 * WidgetClockModule — the bridge JS calls: WidgetClock.render(...).
 * All the drawing lives in ClockWidgetView; this only unpacks arguments.
 *
 * AsyncFunction: runs off the JS thread (SVG → bitmap takes a few ms).
 * Works in the app and in the widget's background task alike.
 * ------------------------------------------------------------------ */

class WidgetClockModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("WidgetClock")

        AsyncFunction("render") { widgetId: Int, json: String, transparent: Boolean ->
            val context = appContext.reactContext ?: return@AsyncFunction false
            ClockWidgetView.render(context, widgetId, JSONObject(json), transparent)
            true
        }
    }
}
