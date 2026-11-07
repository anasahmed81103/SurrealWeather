package expo.modules.widgetclock

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.Log
import android.view.View
import android.widget.RemoteViews
import com.caverock.androidsvg.SVG
import org.json.JSONObject
import kotlin.math.min

/* ------------------------------------------------------------------
 * ClockWidgetView — builds the Clock & Weather widget (res/layout/widget_clock.xml)
 * and hands it to the home screen.
 *
 *   left:  TextClock time + date. The launcher keeps these on time by
 *          itself, so we never need to redraw for the clock.
 *   right: temperature, condition, city (from JS).
 *   sky:   painted background (SVG from widgets/widgetSky.js), or none
 *          for the transparent version, which shows a small weather icon.
 * ------------------------------------------------------------------ */

object ClockWidgetView {
    private const val TAG = "[widget-clock]"

    // Bitmaps travel to the launcher inside one IPC message (≈1 MB limit),
    // so the background is drawn at most this wide (~550 KB). The sky is
    // soft gradients, so the scale-up on screen isn't noticeable.
    private const val MAX_SKY_PX = 540f
    private const val ART_DP = 44f // must match widget_art's size in the layout

    fun render(context: Context, widgetId: Int, data: JSONObject, transparent: Boolean) {
        val views = RemoteViews(context.packageName, R.layout.widget_clock)
        val density = context.resources.displayMetrics.density

        views.setTextViewText(R.id.widget_temp, data.optString("temp"))
        views.setTextViewText(R.id.widget_label, data.optString("label"))
        views.setTextViewText(R.id.widget_city, data.optString("city"))

        // Background sky (normal version) or small icon (transparent version)
        val sky = if (transparent) null else svgToBitmap(data.optString("sky"), MAX_SKY_PX, density)
        showImage(views, R.id.widget_sky, sky)
        val art = if (transparent) svgToBitmap(data.optString("art"), ART_DP * density, density) else null
        showImage(views, R.id.widget_art, art)

        // Tap anywhere → open the app
        context.packageManager.getLaunchIntentForPackage(context.packageName)?.let { launch ->
            val pending = PendingIntent.getActivity(
                context, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, pending)
        }

        AppWidgetManager.getInstance(context).updateAppWidget(widgetId, views)
        Log.d(TAG, "drew widget $widgetId (transparent=$transparent)")
    }

    private fun showImage(views: RemoteViews, id: Int, bitmap: Bitmap?) {
        if (bitmap == null) {
            views.setViewVisibility(id, View.GONE)
        } else {
            views.setImageViewBitmap(id, bitmap)
            views.setViewVisibility(id, View.VISIBLE)
        }
    }

    /**
     * SVG markup → bitmap, keeping the SVG's own aspect ratio.
     * Width = the SVG's size in dp × density, capped at maxPx.
     * Returns null for empty or broken markup (the image is then hidden).
     */
    private fun svgToBitmap(markup: String, maxPx: Float, density: Float): Bitmap? {
        if (markup.isEmpty()) return null
        return try {
            val svg = SVG.getFromString(markup)
            val w = svg.documentWidth
            val h = svg.documentHeight
            if (w <= 0f || h <= 0f) return null

            val widthPx = min(w * density, maxPx)
            val heightPx = widthPx * h / w
            val bitmap = Bitmap.createBitmap(widthPx.toInt(), heightPx.toInt(), Bitmap.Config.ARGB_8888)
            // Resizing the document scales the drawing through its viewBox
            svg.setDocumentWidth(widthPx)
            svg.setDocumentHeight(heightPx)
            svg.renderToCanvas(Canvas(bitmap))
            bitmap
        } catch (e: Exception) {
            Log.w(TAG, "couldn't draw SVG", e)
            null
        }
    }
}
