/* ------------------------------------------------------------------
 * Colours for the animated scene. Tweak the look of the app here.
 *
 *  getSkyColors(kind, phase)   → 4-stop top-to-bottom sky gradient
 *  getCloudColors(kind, phase) → [top, bottom] cloud shading
 *
 * kind:  clear | partly | cloudy | fog | rain | snow | thunder
 * phase: dawn | day | dusk | night
 * ------------------------------------------------------------------ */

const SKIES = {
    clear: {
        day: ["#0B5FC4", "#2A86E0", "#64AEF0", "#B5DCFA"],
        night: ["#02040F", "#081230", "#132552", "#26406E"],
    },
    partly: {
        day: ["#1C66C2", "#4590DD", "#7DB5EC", "#BFDDF6"],
        night: ["#050A1C", "#0E1B3D", "#1C305A", "#2E4672"],
    },
    cloudy: {
        day: ["#4A5B72", "#6D7F96", "#97A6B8", "#C2CCD8"],
        night: ["#0C1018", "#171E29", "#252F3D", "#37424F"],
    },
    fog: {
        day: ["#6F7B88", "#949FAA", "#B9C1C9", "#DCE1E5"],
        night: ["#14171C", "#22272E", "#343A42", "#4A5159"],
    },
    rain: {
        day: ["#1D2838", "#334457", "#4F6278", "#73879C"],
        night: ["#05080E", "#0D141E", "#18222F", "#263342"],
    },
    snow: {
        day: ["#5E7695", "#88A0BC", "#B4C6DA", "#E2EBF4"],
        night: ["#0D1524", "#1B2840", "#2F4060", "#4A5D7E"],
    },
    thunder: {
        day: ["#0F121C", "#20253A", "#363C57", "#4E5672"],
        night: ["#030409", "#0A0C15", "#151826", "#232738"],
    },
};

// Golden-hour skies — only when you can actually see the sky (clear / partly)
const GOLDEN = {
    dawn: ["#14204F", "#4F4A8A", "#C66F8A", "#F8B27A"],
    dusk: ["#120F3A", "#4A2C6E", "#B4467A", "#F7915C"],
};

export function getSkyColors(kind, phase) {
    if ((kind === "clear" || kind === "partly") && GOLDEN[phase]) return GOLDEN[phase];
    return SKIES[kind][phase === "night" ? "night" : "day"];
}

// [top, bottom] — clouds are lit from above, shaded underneath
const CLOUDS = {
    day: {
        partly: ["#FFFFFF", "#D9E6F2"],
        cloudy: ["#EEF2F6", "#A9B5C3"],
        fog: ["#F1F3F5", "#C8CED4"],
        rain: ["#A8B3C1", "#5E6B7B"],
        snow: ["#FBFCFE", "#C9D4E1"],
        thunder: ["#6B7389", "#2B3043"],
    },
    night: {
        partly: ["#3E4C6E", "#1E2A44"],
        cloudy: ["#465062", "#232A36"],
        fog: ["#59616C", "#353B44"],
        rain: ["#333D4C", "#171E28"],
        snow: ["#66748E", "#3A4660"],
        thunder: ["#262B3A", "#0E1119"],
    },
    golden: ["#FFE0D0", "#C9849A"], // sunrise / sunset tint for light clouds
};

export function getCloudColors(kind, phase) {
    if ((phase === "dawn" || phase === "dusk") && kind === "partly") return CLOUDS.golden;
    return CLOUDS[phase === "night" ? "night" : "day"][kind] || CLOUDS.day.cloudy;
}

// How many clouds drift across the sky for each kind of weather
export const CLOUD_COUNT = { clear: 0, partly: 4, cloudy: 8, fog: 3, rain: 7, snow: 5, thunder: 8 };
