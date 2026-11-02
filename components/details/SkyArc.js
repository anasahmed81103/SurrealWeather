import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { colors, fonts } from "../theme";

/* ------------------------------------------------------------------
 * SkyArc — a body's trip across the sky, shared by the Sun and Moon cards:
 * horizon line, dashed full path, solid "already travelled" part,
 * a marker drawn by the caller, and rise / status / set texts below.
 *
 *   progress: 0 = just rose, 1 = just set (clamped)
 *   marker:   (x, y) => SVG element at the current spot, or null to hide
 *   left / right: { label, time, note? }  (note = small line under the time)
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

export default function SkyArc({ progress, color, marker, left, right, status }) {
    const p = Math.min(1, Math.max(0, progress));
    const [x, y] = arcPoint(p);

    return (
        <>
            <Svg width="100%" height={100} viewBox="0 0 300 100">
                <Line x1="0" y1={BASE} x2="300" y2={BASE} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <Path d={`M ${LEFT} ${BASE} A ${RX} ${RY} 0 0 1 ${RIGHT} ${BASE}`} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
                {p > 0 && (
                    <Path d={`M ${LEFT} ${BASE} A ${RX} ${RY} 0 0 1 ${x} ${y}`} stroke={color} strokeWidth="2.5" fill="none" />
                )}
                {marker?.(x, y)}
            </Svg>

            <View style={styles.row}>
                <View>
                    <Text style={styles.label}>{left.label}</Text>
                    <Text style={styles.time}>{left.time}</Text>
                    {left.note && <Text style={styles.label}>{left.note}</Text>}
                </View>
                <Text style={styles.status}>{status}</Text>
                <View style={styles.right}>
                    <Text style={styles.label}>{right.label}</Text>
                    <Text style={styles.time}>{right.time}</Text>
                    {right.note && <Text style={styles.label}>{right.note}</Text>}
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 },
    right: { alignItems: "flex-end" },
    label: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint },
    time: { fontFamily: fonts.medium, fontSize: 17, color: colors.text },
    status: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSoft, paddingBottom: 2 },
});
