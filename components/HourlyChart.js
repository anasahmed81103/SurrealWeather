import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import GlassCard from "./GlassCard";
import WeatherIcon from "./WeatherIcon";
import { formatHour, parseCityTime } from "../utils/time";
import { colors, fonts } from "./theme";

/* ------------------------------------------------------------------
 * HourlyChart — swipeable next-24-hours strip with a smooth
 * temperature curve on top, and icon / rain chance / time underneath.
 * ------------------------------------------------------------------ */

const COL = 58; // width of one hour
const LABEL_SPACE = 28; // room above the curve for the temperature labels
const CURVE_H = 56; // height of the curve area
const SVG_H = LABEL_SPACE + CURVE_H + 10;
const RAIN_CHANCE_MIN = 20; // only show % when rain is reasonably likely

/** Points → smooth SVG path (Catmull-Rom curve through every point) */
function smoothPath(pts) {
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const [p0, p1, p2, p3] = [pts[i - 1] || pts[i], pts[i], pts[i + 1], pts[i + 2] || pts[i + 1]];
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
    }
    return d;
}

export default function HourlyChart({ hourly }) {
    const temps = hourly.temperature_2m;
    const min = Math.min(...temps);
    const span = Math.max(Math.max(...temps) - min, 1);
    const width = temps.length * COL;

    // One point per hour, in the middle of its column
    const pts = temps.map((t, i) => [i * COL + COL / 2, LABEL_SPACE + (1 - (t - min) / span) * CURVE_H]);
    const line = smoothPath(pts);
    const area = `${line} L ${pts[pts.length - 1][0]} ${SVG_H} L ${pts[0][0]} ${SVG_H} Z`;

    return (
        <GlassCard title="Next 24 hours" icon="clock-outline">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ width }}>
                    <Svg width={width} height={SVG_H}>
                        <Defs>
                            <LinearGradient id="hourArea" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
                                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                            </LinearGradient>
                        </Defs>
                        <Path d={area} fill="url(#hourArea)" />
                        <Path d={line} stroke="rgba(255,255,255,0.9)" strokeWidth={2.2} fill="none" />
                        {pts.map(([x, y], i) => (
                            <Circle key={i} cx={x} cy={y} r={i === 0 ? 5 : 2.6} fill={i === 0 ? colors.warm : "#FFFFFF"} />
                        ))}
                    </Svg>

                    {/* temperature labels float just above each point */}
                    {pts.map(([x, y], i) => (
                        <Text key={i} style={[styles.temp, { left: x - COL / 2, top: y - 24 }, i === 0 && styles.nowText]}>
                            {Math.round(temps[i])}°
                        </Text>
                    ))}

                    <View style={styles.row}>
                        {hourly.time.map((time, i) => {
                            const rain = hourly.precipitation_probability?.[i] ?? 0;
                            return (
                                <View key={time} style={styles.col}>
                                    <WeatherIcon code={hourly.weather_code[i]} isDay={hourly.is_day[i] === 1} size={24} />
                                    <Text style={styles.rain}>{rain >= RAIN_CHANCE_MIN ? `${rain}%` : " "}</Text>
                                    <Text style={[styles.time, i === 0 && styles.nowText]}>
                                        {i === 0 ? "Now" : formatHour(parseCityTime(time))}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    temp: {
        position: "absolute",
        width: COL,
        textAlign: "center",
        fontFamily: fonts.medium,
        fontSize: 14,
        color: colors.text,
    },
    nowText: { fontFamily: fonts.semibold, color: colors.warm },
    row: { flexDirection: "row", marginTop: 2 },
    col: { width: COL, alignItems: "center" },
    rain: { height: 15, marginTop: 2, fontFamily: fonts.medium, fontSize: 11, color: colors.rain },
    time: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textSoft },
});
