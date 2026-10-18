import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import GlassCard from "./GlassCard";
import WeatherIcon from "./WeatherIcon";
import { formatHour, parseCityTime } from "../utils/time";

/* ------------------------------------------------------------------
 * HourlyForecast — swipeable strip of the next 24 hours:
 * time, icon, rain chance (when it matters) and temperature.
 * ------------------------------------------------------------------ */

const RAIN_CHANCE_MIN = 20; // only show % when rain is reasonably likely

export default function HourlyForecast({ hourly }) {
    return (
        <GlassCard title="Next 24 hours" icon="clock-outline">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {hourly.time.map((time, i) => {
                    const rain = hourly.precipitation_probability?.[i] ?? 0;
                    return (
                        <View key={time} style={styles.hour}>
                            <Text style={[styles.time, i === 0 && styles.now]}>
                                {i === 0 ? "Now" : formatHour(parseCityTime(time))}
                            </Text>
                            <WeatherIcon code={hourly.weather_code[i]} isDay={hourly.is_day[i] === 1} size={28} />
                            <Text style={styles.rain}>{rain >= RAIN_CHANCE_MIN ? `${rain}%` : " "}</Text>
                            <Text style={styles.temp}>{Math.round(hourly.temperature_2m[i])}°</Text>
                        </View>
                    );
                })}
            </ScrollView>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    hour: { alignItems: "center", width: 58 },
    time: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 8 },
    now: { color: "#fff", fontWeight: "700" },
    rain: { fontSize: 11, color: "#8FD0FF", height: 14, marginTop: 2 },
    temp: { fontSize: 17, fontWeight: "600", color: "#fff", marginTop: 2 },
});
