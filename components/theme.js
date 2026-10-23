/* ------------------------------------------------------------------
 * theme — fonts, colours and shared text styles for the whole app.
 * Change the look in one place.
 *
 * Fonts are loaded in App.js. With custom fonts, pick the weight via
 * fontFamily (not fontWeight — Android ignores the family if both are set).
 * ------------------------------------------------------------------ */

export const fonts = {
    thin: "Outfit_200ExtraLight", // giant temperature
    light: "Outfit_300Light",
    regular: "Outfit_400Regular",
    medium: "Outfit_500Medium",
    semibold: "Outfit_600SemiBold",
};

export const colors = {
    text: "#FFFFFF",
    textSoft: "rgba(255,255,255,0.78)",
    textFaint: "rgba(255,255,255,0.5)",
    accent: "#7DD3FC", // sky blue — active things
    rain: "#8FD0FF",
    warm: "#FCD34D",
    hot: "#FB923C",
    danger: "#F87171",
    glass: "rgba(12, 20, 38, 0.30)", // card background
    glassBorder: "rgba(255, 255, 255, 0.14)",
    sheet: "#0F172A",
};

// Soft shadow so white text stays readable on bright skies
export const textShadow = {
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
};
