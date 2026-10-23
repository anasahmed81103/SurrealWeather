import { saveCity, setHomeCity } from "../db/citiesDb";
import { getCityNameFromCoords, getDeviceCoords } from "../services/geocodingApi";

/* ------------------------------------------------------------------
 * homeLocation — the home city follows the phone's location.
 *
 *  locateMe(ask)          → { name, lat, lng } where the phone is now, or null
 *  updateHomeIfMoved(home) → on each app open: if the phone is now in another
 *                           city, save it as the new home (the old home stays
 *                           in the saved list). Returns the new home or null.
 *
 * The widget always shows the home city, so it follows along automatically.
 * ------------------------------------------------------------------ */

// ~20 km. Moving around inside the same city shouldn't change anything.
const MOVED_DEGREES = 0.2;

export async function locateMe(ask = true) {
    const pos = await getDeviceCoords({ ask });
    if (!pos) return null;
    return { name: await getCityNameFromCoords(pos.lat, pos.lng), ...pos };
}

export async function updateHomeIfMoved(home) {
    try {
        // ask = false: never pop up a permission dialog on a normal app open
        const here = await locateMe(false);
        if (!here) return null;

        const moved =
            Math.abs(here.lat - home.lat) > MOVED_DEGREES || Math.abs(here.lng - home.lng) > MOVED_DEGREES;
        if (!moved || here.name === home.name) {
            console.log("[location] still in", home.name);
            return null;
        }

        console.log("[location] moved:", home.name, "→", here.name);
        await saveCity(here.name, here.lat, here.lng, true);
        await setHomeCity(here.name);
        return here;
    } catch (err) {
        // Not critical — the app just keeps the old home city
        console.warn("[location] home check failed:", err.message);
        return null;
    }
}
