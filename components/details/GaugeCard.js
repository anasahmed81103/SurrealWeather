import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../GlassCard";
import { colors, fonts } from "../theme";

/* ------------------------------------------------------------------
 * GaugeCard — a value with a coloured scale bar and a marker showing
 * where it sits on that scale. Used for humidity and UV.
 *
 *  fraction: 0–1 position of the marker
 *  scale:    gradient colours, low → high
 * ------------------------------------------------------------------ */

export default function GaugeCard({ title, icon, value, unit, note, fraction, scale, style }) {
    const left = `${Math.min(1, Math.max(0, fraction)) * 100}%`;

    return (
        <GlassCard title={title} icon={icon} style={style}>
            <Text style={styles.value}>
                {value}
                {!!unit && <Text style={styles.unit}>{unit}</Text>}
            </Text>
            <Text style={styles.note}>{note}</Text>

            <View style={styles.bar}>
                <LinearGradient colors={scale} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient} />
                <View style={[styles.marker, { left }]} />
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    value: { fontFamily: fonts.regular, fontSize: 26, color: colors.text },
    unit: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSoft },
    note: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textSoft },
    bar: { marginTop: 12, height: 6, justifyContent: "center" },
    gradient: { height: 4, borderRadius: 2, opacity: 0.9 },
    marker: {
        position: "absolute",
        width: 12,
        height: 12,
        marginLeft: -6,
        borderRadius: 6,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "rgba(12,20,38,0.6)",
    },
});
