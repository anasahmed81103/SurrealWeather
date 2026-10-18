import React from "react";
import { StyleSheet, Text, View } from "react-native";
import GlassCard from "./GlassCard";
import { formatClock, parseCityTime } from "../utils/time";

/* ------------------------------------------------------------------
 * WeatherDetails — 2-column grid of small tiles:
 * humidity, wind, UV, rain chance, sunrise, sunset.
 * ------------------------------------------------------------------ */

function uvLevel(uv) {
    if (uv < 3) return "Low";
    if (uv < 6) return "Moderate";
    if (uv < 8) return "High";
    if (uv < 11) return "Very high";
    return "Extreme";
}

export default function WeatherDetails({ current, daily }) {
    const uv = daily.uv_index_max?.[0];

    const tiles = [
        { icon: "water-percent", label: "Humidity", value: `${current.relative_humidity_2m}%` },
        { icon: "weather-windy", label: "Wind", value: `${Math.round(current.wind_speed_10m)} km/h` },
        { icon: "sun-wireless-outline", label: "UV index", value: uv == null ? "—" : `${Math.round(uv)}`, note: uv == null ? "" : uvLevel(uv) },
        { icon: "umbrella-outline", label: "Rain chance", value: `${daily.precipitation_probability_max?.[0] ?? 0}%` },
        { icon: "weather-sunset-up", label: "Sunrise", value: formatClock(parseCityTime(daily.sunrise[0])) },
        { icon: "weather-sunset-down", label: "Sunset", value: formatClock(parseCityTime(daily.sunset[0])) },
    ];

    return (
        <View style={styles.grid}>
            {tiles.map((t) => (
                <GlassCard key={t.label} title={t.label} icon={t.icon} style={styles.tile}>
                    <Text style={styles.value}>{t.value}</Text>
                    {!!t.note && <Text style={styles.note}>{t.note}</Text>}
                </GlassCard>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    tile: { width: "48.5%", minHeight: 100 },
    value: { fontSize: 24, fontWeight: "500", color: "#fff" },
    note: { marginTop: 2, fontSize: 13, color: "rgba(255,255,255,0.7)" },
});
