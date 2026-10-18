import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getWeatherInfo } from "../../utils/weatherCodes";
import { getSkyColors, getCloudColor, CLOUD_COUNT } from "./skyThemes";
import Sun from "./Sun";
import Moon from "./Moon";
import Stars from "./Stars";
import Clouds from "./Clouds";
import Rain from "./Rain";
import Snow from "./Snow";
import Lightning from "./Lightning";
import Fog from "./Fog";

/* ------------------------------------------------------------------
 * WeatherScene — the full-screen animated background.
 * Stacks layers back-to-front based on the weather and time of day:
 *   sky gradient → stars → sun/moon → clouds → fog/rain/snow → lightning
 *   → a soft dark vignette so text and cards stay readable.
 *
 * Wrapped in memo() so the scene only re-renders when the weather or
 * day phase changes (not every time the clock ticks).
 * ------------------------------------------------------------------ */

function WeatherScene({ code, phase }) {
    const { kind, intensity } = getWeatherInfo(code);
    const isNight = phase === "night";
    const skyVisible = kind === "clear" || kind === "partly";

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient colors={getSkyColors(kind, phase)} style={StyleSheet.absoluteFill} />

            {isNight && skyVisible && <Stars shooting={kind === "clear"} />}
            {skyVisible && (isNight ? <Moon /> : <Sun low={phase !== "day"} />)}

            {CLOUD_COUNT[kind] > 0 && (
                // key forces fresh clouds when the weather kind changes
                <Clouds key={kind} count={CLOUD_COUNT[kind]} color={getCloudColor(kind, phase)} />
            )}

            {kind === "fog" && <Fog />}
            {(kind === "rain" || kind === "thunder") && <Rain intensity={kind === "thunder" ? 3 : intensity} />}
            {kind === "snow" && <Snow intensity={intensity} />}
            {kind === "thunder" && <Lightning />}

            <LinearGradient
                colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0)", "rgba(0,0,0,0.4)"]}
                locations={[0, 0.3, 1]}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
}

export default memo(WeatherScene);
