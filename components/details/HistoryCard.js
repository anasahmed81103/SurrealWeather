import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import GlassCard from "../GlassCard";
import HistoryBars from "./HistoryBars";
import { getClimateStats } from "../../utils/climateStats";
import { formatDayMonth, parseCityTime } from "../../utils/time";
import { colors, fonts } from "../theme";

/* ------------------------------------------------------------------
 * HistoryCard — "On this day": how today compares with the last
 * 10 years here.
 *
 *   +3°  warmer than usual for Nov 3        ← headline
 *   [ bars: Nov 3 of each year + today ]
 *   Last year · Record · Rain              ← three short facts
 *   Explore the year ›                     ← opens the climate outlook
 *
 * While history downloads (history = null) it shows a same-size placeholder,
 * so the cards below don't jump when it arrives.
 * Renders nothing when there isn't enough history.
 * ------------------------------------------------------------------ */

const r = Math.round;

function headline(stats, day) {
    if (stats.rank === "warmest") return `Warmest ${day} in ${stats.years.length} years`;
    if (stats.rank === "coolest") return `Coolest ${day} in ${stats.years.length} years`;
    if (Math.abs(stats.diff) < 1) return `A typical ${day}`;
    return `${stats.diff > 0 ? "Warmer" : "Cooler"} than usual for ${day}`;
}

function Fact({ icon, children }) {
    return (
        <View style={styles.fact}>
            <MaterialCommunityIcons name={icon} size={15} color={colors.textFaint} />
            <Text style={styles.factText}>{children}</Text>
        </View>
    );
}

export default function HistoryCard({ history, daily, onExplore }) {
    if (!history) {
        return (
            <GlassCard title="On this day" icon="history">
                <Text style={styles.waiting}>Looking back 10 years…</Text>
            </GlassCard>
        );
    }

    const todayIso = daily.time[0];
    const todayHigh = daily.temperature_2m_max[0];
    const stats = getClimateStats(history, todayIso, todayHigh);
    if (!stats) return null;

    const day = formatDayMonth(parseCityTime(todayIso));
    const diff = r(stats.diff);
    const diffColor = diff > 0 ? colors.hot : diff < 0 ? colors.accent : colors.text;
    const { lastYear, warmest, coldestNight } = stats;

    return (
        <GlassCard title="On this day" icon="history">
            <View style={styles.head}>
                <Text style={[styles.diff, { color: diffColor }]}>
                    {diff > 0 ? "+" : diff < 0 ? "−" : "±"}{Math.abs(diff)}°
                </Text>
                <View style={styles.headTexts}>
                    <Text style={styles.headline}>{headline(stats, day)}</Text>
                    <Text style={styles.sub}>Normal high {r(stats.normalHigh)}° · low {r(stats.normalLow)}°</Text>
                </View>
            </View>

            <HistoryBars years={stats.years} todayHigh={todayHigh} normalHigh={stats.normalHigh} todayColor={diffColor} />

            <View style={styles.facts}>
                {lastYear && (
                    <Fact icon="calendar-arrow-left">
                        Last year {r(lastYear.high)}° / {r(lastYear.low)}°
                        {lastYear.rain >= 1 ? `, ${r(lastYear.rain)} mm rain` : ", dry"}
                    </Fact>
                )}
                <Fact icon="thermometer-high">
                    Record {r(warmest.high)}° in {warmest.year} · coldest night {r(coldestNight.low)}° in {coldestNight.year}
                </Fact>
                <Fact icon="weather-rainy">
                    {stats.rainyYears === 0
                        ? `No rain on ${day} in the last ${stats.years.length} years`
                        : `Rained on ${day} in ${stats.rainyYears} of the last ${stats.years.length} years`}
                </Fact>
            </View>

            <TouchableOpacity onPress={onExplore} style={styles.explore} activeOpacity={0.7}>
                <Text style={styles.exploreText}>Explore the year</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.accent} />
            </TouchableOpacity>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    head: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
    diff: { fontFamily: fonts.light, fontSize: 40, marginRight: 12 },
    headTexts: { flex: 1 },
    headline: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
    sub: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textSoft, marginTop: 2 },
    facts: { marginTop: 8 },
    // ≈ the real card's body height (headline + bars + facts + explore link)
    waiting: { height: 280, textAlignVertical: "center", textAlign: "center", fontFamily: fonts.regular, fontSize: 13, color: colors.textFaint },
    fact: { flexDirection: "row", alignItems: "center", marginTop: 6 },
    factText: { flex: 1, marginLeft: 8, fontFamily: fonts.regular, fontSize: 13, color: colors.textSoft },
    explore: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.glassBorder,
    },
    exploreText: { fontFamily: fonts.medium, fontSize: 14, color: colors.accent },
});
