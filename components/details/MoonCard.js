import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import GlassCard from "../GlassCard";
import { getMoonPhase, getMoonPhaseName, getMoonIllumination, getMoonPath } from "../../utils/moonPhase";
import { colors, fonts } from "../theme";

/* ------------------------------------------------------------------
 * MoonCard — tonight's moon: a small drawing of the real phase,
 * its name and how much of it is lit.
 * ------------------------------------------------------------------ */

const R = 22;

export default function MoonCard({ date, southern = false, style }) {
    const phase = getMoonPhase(date);
    const lit = Math.round(getMoonIllumination(phase) * 100);

    return (
        <GlassCard title="Moon" icon="moon-waning-crescent" style={style}>
            <View style={styles.row}>
                <View style={styles.texts}>
                    <Text style={styles.value}>{lit}<Text style={styles.unit}>%</Text></Text>
                    <Text style={styles.note}>{getMoonPhaseName(phase)}</Text>
                </View>
                <View style={southern && styles.mirrored}>
                    <Svg width={R * 2} height={R * 2}>
                        <Circle cx={R} cy={R} r={R} fill="rgba(255,255,255,0.12)" />
                        <Path d={getMoonPath(phase, R)} fill="#F2EFE3" />
                    </Svg>
                </View>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center" },
    texts: { flex: 1 },
    value: { fontFamily: fonts.regular, fontSize: 26, color: colors.text },
    unit: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSoft },
    note: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textSoft },
    mirrored: { transform: [{ scaleX: -1 }] },
});
