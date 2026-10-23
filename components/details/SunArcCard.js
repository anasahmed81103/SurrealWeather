import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import GlassCard from "../GlassCard";
import { formatClock, parseCityTime } from "../../utils/time";
import { colors, fonts } from "../theme";

/* ------------------------------------------------------------------
 * SunArcCard — the sun's path today as an arc from sunrise to sunset,
 * with the sun drawn where it is right now (in the city's local time).
 * ------------------------------------------------------------------ */

// Arc geometry inside a 300 × 100 drawing box
const LEFT = 20;
const RIGHT = 280;
const BASE = 88; // horizon line
const RX = (RIGHT - LEFT) / 2;
const RY = 70;

/** progress 0–1 along the arc → point */
function arcPoint(progress) {
    const angle = Math.PI * (1 - progress);
    return [LEFT + RX + RX * Math.cos(angle), BASE - RY * Math.sin(angle)];
}

/** "3h 20m" */
function duration(ms) {
    const mins = Math.max(0, Math.round(ms / 60000));
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function SunArcCard({ daily, localTime }) {
    const sunrise = parseCityTime(daily.sunrise[0]);
    const sunset = parseCityTime(daily.sunset[0]);
    const progress = (localTime - sunrise) / (sunset - sunrise);
    const sunUp = progress > 0 && progress < 1;
    const [sx, sy] = arcPoint(Math.min(1, Math.max(0, progress)));

    const status = sunUp
        ? `Sunset in ${duration(sunset - localTime)}`
        : localTime < sunrise
            ? `Sunrise in ${duration(sunrise - localTime)}`
            : `Daylight today ${duration(sunset - sunrise)}`;

    return (
        <GlassCard title="Sun" icon="weather-sunset">
            <Svg width="100%" height={100} viewBox="0 0 300 100">
                <Line x1="0" y1={BASE} x2="300" y2={BASE} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                {/* full path (dashed) and the part already travelled (solid) */}
                <Path d={`M ${LEFT} ${BASE} A ${RX} ${RY} 0 0 1 ${RIGHT} ${BASE}`} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
                {progress > 0 && (
                    <Path d={`M ${LEFT} ${BASE} A ${RX} ${RY} 0 0 1 ${sx} ${sy}`} stroke={colors.warm} strokeWidth="2.5" fill="none" />
                )}
                {sunUp && (
                    <>
                        <Circle cx={sx} cy={sy} r="14" fill={colors.warm} opacity="0.25" />
                        <Circle cx={sx} cy={sy} r="7" fill="#FFE47A" />
                    </>
                )}
            </Svg>

            <View style={styles.row}>
                <View>
                    <Text style={styles.label}>Sunrise</Text>
                    <Text style={styles.time}>{formatClock(sunrise)}</Text>
                </View>
                <Text style={styles.status}>{status}</Text>
                <View style={styles.right}>
                    <Text style={styles.label}>Sunset</Text>
                    <Text style={styles.time}>{formatClock(sunset)}</Text>
                </View>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 },
    right: { alignItems: "flex-end" },
    label: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint },
    time: { fontFamily: fonts.medium, fontSize: 17, color: colors.text },
    status: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSoft, paddingBottom: 2 },
});
