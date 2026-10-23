import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getWeatherInfo } from "../utils/weatherCodes";
import { getSummary } from "../utils/summary";
import { colors, fonts, textShadow } from "./theme";

/* ------------------------------------------------------------------
 * CurrentWeather — the hero: giant thin temperature, condition,
 * high / low / feels-like and a one-line summary of what's coming.
 *
 * `scrollY` (Animated value) makes it drift down and fade as you
 * scroll, and stretch a little when you pull down.
 * ------------------------------------------------------------------ */

export default function CurrentWeather({ weather, scrollY }) {
    const { current, daily } = weather;
    const { label } = getWeatherInfo(current.weather_code);
    const high = Math.round(daily.temperature_2m_max[0]);
    const low = Math.round(daily.temperature_2m_min[0]);

    const opacity = scrollY.interpolate({ inputRange: [0, 200], outputRange: [1, 0], extrapolate: "clamp" });
    const translateY = scrollY.interpolate({ inputRange: [-150, 0, 200], outputRange: [-40, 0, 80], extrapolate: "clamp" });
    const scale = scrollY.interpolate({ inputRange: [-150, 0], outputRange: [1.08, 1], extrapolate: "clamp" });

    return (
        <Animated.View style={[styles.hero, { opacity, transform: [{ translateY }, { scale }] }]}>
            <Text style={styles.temp}>
                {Math.round(current.temperature_2m)}
                <Text style={styles.degree}>°</Text>
            </Text>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.range}>
                H {high}°   ·   L {low}°   ·   Feels {Math.round(current.apparent_temperature)}°
            </Text>

            <View style={styles.summary}>
                <MaterialCommunityIcons name="creation" size={14} color={colors.warm} />
                <Text style={styles.summaryText}>{getSummary(weather)}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    hero: { alignItems: "center", paddingTop: 28, paddingBottom: 40 },
    temp: {
        fontFamily: fonts.thin,
        fontSize: 132,
        lineHeight: 140,
        color: colors.text,
        includeFontPadding: false,
        marginLeft: 36, // balance the ° so the number looks centred
        ...textShadow,
    },
    degree: { fontFamily: fonts.thin, color: colors.textSoft },
    label: { marginTop: -6, fontFamily: fonts.regular, fontSize: 26, color: colors.text, ...textShadow },
    range: { marginTop: 6, fontFamily: fonts.light, fontSize: 15, color: colors.textSoft, ...textShadow },
    summary: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 18,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "rgba(12,20,38,0.28)",
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    summaryText: { marginLeft: 6, fontFamily: fonts.regular, fontSize: 14, color: colors.text },
});
