import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GlassCard from "../GlassCard";
import { SKY_TYPES } from "../../utils/climateOutlook";
import { SKY } from "./sky";
import { colors, fonts } from "../theme";

/* ------------------------------------------------------------------
 * SkyMixCard — what kind of days the month brings: one bar split into
 * sunny / partly cloudy / cloudy / rainy shares, a legend with the
 * percentages, and the usual rain amount.
 * Plain Views (flex widths), no SVG needed.
 * ------------------------------------------------------------------ */

const pct = (x) => `${Math.round(x * 100)}%`;

export default function SkyMixCard({ outlook }) {
    const { mix, rainyDays, rainTotal } = outlook;
    const shown = SKY_TYPES.filter((t) => mix[t] >= 0.005); // skip 0% slices

    return (
        <GlassCard title="Kind of days" icon="weather-partly-snowy-rainy">
            <View style={styles.bar}>
                {shown.map((t) => (
                    <View key={t} style={{ flex: mix[t], backgroundColor: SKY[t].color }} />
                ))}
            </View>

            <View style={styles.legend}>
                {shown.map((t) => (
                    <View key={t} style={styles.item}>
                        <MaterialCommunityIcons name={SKY[t].icon} size={16} color={SKY[t].color} />
                        <Text style={styles.itemText}>{SKY[t].label} {pct(mix[t])}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.rain}>
                {rainyDays < 0.5
                    ? "Usually no rainy days at all"
                    : `About ${Math.round(rainyDays)} rainy ${Math.round(rainyDays) === 1 ? "day" : "days"}, ${Math.round(rainTotal)} mm in total`}
            </Text>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    bar: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden" },
    legend: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
    item: { flexDirection: "row", alignItems: "center", width: "50%", marginTop: 6 },
    itemText: { marginLeft: 6, fontFamily: fonts.regular, fontSize: 13, color: colors.textSoft },
    rain: { marginTop: 12, fontFamily: fonts.regular, fontSize: 13, color: colors.text },
});
