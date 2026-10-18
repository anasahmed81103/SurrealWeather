import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getWeatherInfo } from "../utils/weatherCodes";

/* ------------------------------------------------------------------
 * CurrentWeather — the big hero: huge thin temperature, condition,
 * today's high/low and "feels like".
 * ------------------------------------------------------------------ */

export default function CurrentWeather({ current, daily }) {
    const { label } = getWeatherInfo(current.weather_code);
    const high = Math.round(daily.temperature_2m_max[0]);
    const low = Math.round(daily.temperature_2m_min[0]);

    return (
        <View style={styles.hero}>
            <Text style={styles.temp}>{Math.round(current.temperature_2m)}°</Text>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.sub}>
                H {high}°   L {low}°   ·   Feels like {Math.round(current.apparent_temperature)}°
            </Text>
        </View>
    );
}

const shadow = {
    // Strong-ish shadow so white text stays readable over bright clouds/snow
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
};

const styles = StyleSheet.create({
    hero: {
        alignItems: "center",
        paddingTop: 36,
        paddingBottom: 44,
    },
    temp: {
        fontSize: 124,
        fontWeight: "200",
        color: "#fff",
        includeFontPadding: false,
        marginLeft: 30, // balance the ° so the number looks centred
        ...shadow,
    },
    label: {
        marginTop: -4,
        fontSize: 24,
        fontWeight: "500",
        color: "#fff",
        ...shadow,
    },
    sub: {
        marginTop: 8,
        fontSize: 15,
        color: "rgba(255,255,255,0.85)",
        ...shadow,
    },
});
