import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "./GlassCard";
import WeatherIcon from "./WeatherIcon";
import { formatDay, parseCityTime } from "../utils/time";
import { colors, fonts } from "./theme";

/* ------------------------------------------------------------------
 * DailyForecast — 7 days. Each row: day, icon, rain chance and a
 * temperature bar placed on the week's min→max scale, so warmer and
 * cooler days stand out. Today's bar shows a dot for "now".
 * ------------------------------------------------------------------ */

const RAIN_CHANCE_MIN = 20;

function TempBar({ low, high, weekMin, weekSpan, now }) {
    const pct = (t) => ((t - weekMin) / weekSpan) * 100;
    const width = Math.max(pct(high) - pct(low), 6); // never vanish completely

    return (
        <View style={styles.track}>
            <LinearGradient
                colors={["#7DD3FC", "#FCD34D", "#FB923C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.fill, { left: `${pct(low)}%`, width: `${width}%` }]}
            />
            {now != null && <View style={[styles.nowDot, { left: `${pct(now)}%` }]} />}
        </View>
    );
}

export default function DailyForecast({ daily, currentTemp }) {
    const weekMin = Math.min(...daily.temperature_2m_min, currentTemp);
    const weekMax = Math.max(...daily.temperature_2m_max, currentTemp);
    const weekSpan = Math.max(weekMax - weekMin, 1);

    return (
        <GlassCard title="7-day forecast" icon="calendar-month-outline">
            {daily.time.map((day, i) => {
                const low = daily.temperature_2m_min[i];
                const high = daily.temperature_2m_max[i];
                const rain = daily.precipitation_probability_max?.[i] ?? 0;

                return (
                    <View key={day} style={[styles.row, i > 0 && styles.divider]}>
                        <Text style={[styles.day, i === 0 && styles.today]}>
                            {i === 0 ? "Today" : formatDay(parseCityTime(day))}
                        </Text>
                        <View style={styles.iconCol}>
                            <WeatherIcon code={daily.weather_code[i]} size={26} />
                            {rain >= RAIN_CHANCE_MIN && <Text style={styles.rain}>{rain}%</Text>}
                        </View>
                        <Text style={styles.low}>{Math.round(low)}°</Text>
                        <TempBar
                            low={low}
                            high={high}
                            weekMin={weekMin}
                            weekSpan={weekSpan}
                            now={i === 0 ? currentTemp : null}
                        />
                        <Text style={styles.high}>{Math.round(high)}°</Text>
                    </View>
                );
            })}
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", paddingVertical: 11 },
    divider: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
    day: { width: 58, fontFamily: fonts.medium, fontSize: 16, color: colors.text },
    today: { color: colors.warm },
    iconCol: { width: 44, alignItems: "center" },
    rain: { fontFamily: fonts.medium, fontSize: 10, color: colors.rain },
    low: { width: 36, textAlign: "right", fontFamily: fonts.regular, fontSize: 16, color: colors.textFaint },
    high: { width: 36, textAlign: "right", fontFamily: fonts.medium, fontSize: 16, color: colors.text },
    track: {
        flex: 1,
        height: 6,
        marginLeft: 10,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    fill: { position: "absolute", top: 0, bottom: 0, borderRadius: 3 },
    nowDot: {
        position: "absolute",
        top: -3,
        width: 12,
        height: 12,
        marginLeft: -6,
        borderRadius: 6,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "rgba(12,20,38,0.6)",
    },
});
