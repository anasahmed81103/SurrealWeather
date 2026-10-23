import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getWeatherInfo } from "../../utils/weatherCodes";
import { getSkyColors, getCloudColors, CLOUD_COUNT } from "./skyThemes";
import Sun from "./Sun";
import Moon from "./Moon";
import Stars from "./Stars";
import Clouds from "./Clouds";
import Rain from "./Rain";
import GlassDrops from "./GlassDrops";
import Snow from "./Snow";
import Lightning from "./Lightning";
import Fog from "./Fog";

/* ------------------------------------------------------------------
 * WeatherScene — the full-screen animated background.
 * Stacks layers back-to-front based on the weather and time of day:
 *   sky → stars → sun/moon → clouds → fog/rain/snow → lightning
 *   → drops on the glass → soft vignette (keeps text readable).
 *
 * Props: code (WMO), phase (dawn|day|dusk|night), wind (km/h),
 *        moonPhase (0–1), southern (hemisphere, flips the moon)
 *
 * memo(): only re-renders when these props change, not on every clock tick.
 * ------------------------------------------------------------------ */

function WeatherScene({ code, phase, wind = 10, moonPhase = 0.5, southern = false }) {
    const { kind, intensity } = getWeatherInfo(code);
    const isNight = phase === "night";
    const skyVisible = kind === "clear" || kind === "partly";
    const wet = kind === "rain" || kind === "thunder";

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient colors={getSkyColors(kind, phase)} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFill} />

            {isNight && skyVisible && <Stars shooting={kind === "clear"} />}
            {skyVisible && (isNight ? <Moon phase={moonPhase} southern={southern} /> : <Sun low={phase !== "day"} />)}

            {CLOUD_COUNT[kind] > 0 && (
                // key → fresh clouds when the weather or time of day changes
                <Clouds key={`${kind}-${phase}`} count={CLOUD_COUNT[kind]} colors={getCloudColors(kind, phase)} />
            )}

            {kind === "fog" && <Fog />}
            {wet && <Rain intensity={kind === "thunder" ? 3 : intensity} wind={wind} />}
            {kind === "snow" && <Snow intensity={intensity} />}
            {kind === "thunder" && <Lightning />}
            {wet && <GlassDrops intensity={kind === "thunder" ? 3 : intensity} />}

            <LinearGradient
                colors={["rgba(0,0,0,0.28)", "rgba(0,0,0,0)", "rgba(0,0,0,0.05)", "rgba(0,0,0,0.45)"]}
                locations={[0, 0.25, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
}

export default memo(WeatherScene);
