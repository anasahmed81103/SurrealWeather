import { colors } from "../theme";

/* ------------------------------------------------------------------
 * sky — how each sky type (utils/climateOutlook skyType) looks in the
 * outlook: label, icon and colour. One lookup table for all outlook cards.
 * ------------------------------------------------------------------ */

export const SKY = {
    sunny: { label: "Sunny", icon: "weather-sunny", color: colors.warm },
    mixed: { label: "Partly cloudy", icon: "weather-partly-cloudy", color: "#A9C1E0" },
    cloudy: { label: "Cloudy", icon: "weather-cloudy", color: "rgba(255,255,255,0.5)" },
    rainy: { label: "Rainy", icon: "weather-rainy", color: colors.rain },
};
