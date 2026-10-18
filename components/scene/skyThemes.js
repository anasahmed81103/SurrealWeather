/* ------------------------------------------------------------------
 * Colours for the animated scene. Tweak the look of the app here.
 *
 *  getSkyColors(kind, phase)  → 3-stop top-to-bottom sky gradient
 *  getCloudColor(kind, phase) → cloud colour for that sky
 *
 * kind:  clear | partly | cloudy | fog | rain | snow | thunder
 * phase: dawn | day | dusk | night
 * ------------------------------------------------------------------ */

const SKIES = {
    clear: { day: ["#1565C0", "#3D8FE0", "#8EC9F7"], night: ["#030818", "#0B1838", "#1D3366"] },
    partly: { day: ["#2A6CC4", "#5A9BE0", "#A4CEF2"], night: ["#060D22", "#13234A", "#2A4170"] },
    cloudy: { day: ["#56677D", "#8193A8", "#B7C3D0"], night: ["#10151E", "#1E2633", "#323D4E"] },
    fog: { day: ["#7F8B98", "#A9B3BD", "#D3D9DF"], night: ["#181C22", "#2A3038", "#424A55"] },
    rain: { day: ["#27354A", "#43566E", "#6B7F96"], night: ["#080D15", "#141D2A", "#233142"] },
    snow: { day: ["#6F87A5", "#A0B4CC", "#D6E2EF"], night: ["#111A2A", "#22304A", "#3A4B69"] },
    thunder: { day: ["#171A26", "#2B3045", "#474D66"], night: ["#05060B", "#10121C", "#1D2030"] },
};

// Golden-hour skies — only used when you can actually see the sky (clear / partly)
const GOLDEN = {
    dawn: ["#1D2B5E", "#8A5C8F", "#F4A86B"],
    dusk: ["#1A1B48", "#A5466A", "#F68F5A"],
};

export function getSkyColors(kind, phase) {
    if ((kind === "clear" || kind === "partly") && GOLDEN[phase]) return GOLDEN[phase];
    return SKIES[kind][phase === "night" ? "night" : "day"];
}

const CLOUDS = {
    day: { partly: "#FFFFFF", cloudy: "#E3E8EF", fog: "#E6EAEE", rain: "#8E9BAD", snow: "#EEF2F7", thunder: "#4F566B" },
    night: { partly: "#33405E", cloudy: "#38404F", fog: "#4A515B", rain: "#2A3340", snow: "#56637A", thunder: "#1B1F2B" },
};

export function getCloudColor(kind, phase) {
    if (phase === "dusk" || phase === "dawn") return kind === "partly" ? "#F3C1B0" : CLOUDS.day[kind];
    return CLOUDS[phase === "night" ? "night" : "day"][kind] || "#FFFFFF";
}

// How many clouds drift across the sky for each kind of weather
export const CLOUD_COUNT = { clear: 0, partly: 3, cloudy: 6, fog: 2, rain: 5, snow: 4, thunder: 6 };
