import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "./GlassCard";
import WeatherIcon from "./WeatherIcon";
import { formatDay, parseCityTime } from "../utils/time";

/* ------------------------------------------------------------------
 * DailyForecast — 7 days. Each row shows the day, icon, rain chance
 * and a temperature bar placed on the week's overall min→max scale,
 * so you can see at a glance which days are warmer or cooler.
 * ------------------------------------------------------------------ */

const RAIN_CHANCE_MIN = 20;

function TempBar({ low, high, weekMin, weekSpan }) {
    const left = ((low - weekMin) / weekSpan) * 100;
    const width = Math.max(((high - low) / weekSpan) * 100, 6); // never vanish completely

    return (
        <View style={styles.track}>
            <LinearGradient
                colors={["#7DD3FC", "#FCD34D", "#FB923C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.fill, { left: `${left}%`, width: `${width}%` }]}
            />
        </View>
    );
}

export default function DailyForecast({ daily }) {
    const weekMin = Math.min(...daily.temperature_2m_min);
    const weekMax = Math.max(...daily.temperature_2m_max);
    const weekSpan = Math.max(weekMax - weekMin, 1);

    return (
        <GlassCard title="7-day forecast" icon="calendar-month-outline">
            {daily.time.map((day, i) => {
                const low = daily.temperature_2m_min[i];
                const high = daily.temperature_2m_max[i];
                const rain = daily.precipitation_probability_max?.[i] ?? 0;

                return (
                    <View key={day} style={[styles.row, i > 0 && styles.divider]}>
                        <Text style={styles.day}>{i === 0 ? "Today" : formatDay(parseCityTime(day))}</Text>
                        <View style={styles.iconCol}>
                            <WeatherIcon code={daily.weather_code[i]} size={26} />
                            <Text style={styles.rain}>{rain >= RAIN_CHANCE_MIN ? `${rain}%` : ""}</Text>
                        </View>
                        <Text style={styles.low}>{Math.round(low)}°</Text>
                        <TempBar low={low} high={high} weekMin={weekMin} weekSpan={weekSpan} />
                        <Text style={styles.high}>{Math.round(high)}°</Text>
                    </View>
                );
            })}
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
    divider: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
    day: { width: 58, fontSize: 16, fontWeight: "600", color: "#fff" },
    iconCol: { width: 44, alignItems: "center" },
    rain: { fontSize: 10, color: "#8FD0FF" },
    low: { width: 36, textAlign: "right", fontSize: 16, color: "rgba(255,255,255,0.65)" },
    high: { width: 36, textAlign: "right", fontSize: 16, fontWeight: "600", color: "#fff" },
    track: {
        flex: 1,
        height: 6,
        marginLeft: 10,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.14)",
        overflow: "hidden",
    },
    fill: { position: "absolute", top: 0, bottom: 0, borderRadius: 3 },
});
