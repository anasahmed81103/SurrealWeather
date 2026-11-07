import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GlassCard from "../GlassCard";
import { SKY } from "./sky";
import { colors, fonts } from "../theme";

/* ------------------------------------------------------------------
 * MonthThirdsCard — the month in three parts (1–10, 11–20, 21–end),
 * so patterns show: "sunny at the start, rain mid-month".
 * Each column: usual sky, typical high / low, chance of a rainy day.
 * ------------------------------------------------------------------ */

const RANGES = { Early: "1–10", Mid: "11–20", Late: "21–end" };

export default function MonthThirdsCard({ outlook }) {
    return (
        <GlassCard title="Through the month" icon="calendar-range">
            <View style={styles.row}>
                {outlook.thirds.map((t) => (
                    <View key={t.label} style={styles.col}>
                        <Text style={styles.label}>{t.label}</Text>
                        <Text style={styles.range}>{RANGES[t.label]}</Text>
                        <MaterialCommunityIcons name={SKY[t.mostly].icon} size={30} color={SKY[t.mostly].color} style={styles.icon} />
                        <Text style={styles.temps}>
                            {Math.round(t.high)}° <Text style={styles.low}>{Math.round(t.low)}°</Text>
                        </Text>
                        <Text style={styles.rain}>
                            {t.rainChance < 0.01 ? "Dry" : `${Math.round(t.rainChance * 100)}% rain`}
                        </Text>
                    </View>
                ))}
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row" },
    col: { flex: 1, alignItems: "center" },
    label: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
    range: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.textFaint },
    icon: { marginVertical: 8 },
    temps: { fontFamily: fonts.medium, fontSize: 17, color: colors.text },
    low: { fontFamily: fonts.regular, color: colors.textFaint },
    rain: { marginTop: 2, fontFamily: fonts.medium, fontSize: 12, color: colors.rain },
});
