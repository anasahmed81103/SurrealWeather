import React from "react";
import { StyleSheet, Text, View } from "react-native";
import GlassCard from "../GlassCard";
import { describeOutlook } from "../../utils/climateOutlook";
import { formatShortDate } from "../../utils/time";
import { colors, fonts } from "../theme";

/* ------------------------------------------------------------------
 * OutlookSummaryCard — the month at a glance:
 *   one plain sentence, typical day / night temperature,
 *   the range to expect, and the hottest / coldest days on record.
 * ------------------------------------------------------------------ */

const r = Math.round;

function Stat({ value, label }) {
    return (
        <View style={styles.stat}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

export default function OutlookSummaryCard({ outlook, title, month }) {
    const { hottest, coldest, range } = outlook;

    return (
        <GlassCard title={title} icon="calendar-month-outline">
            <Text style={styles.sentence}>{describeOutlook(outlook)}</Text>

            <View style={styles.stats}>
                <Stat value={`${r(outlook.high)}°`} label="Typical day" />
                <Stat value={`${r(outlook.low)}°`} label="Typical night" />
                <Stat value={`${r(range[0])}–${r(range[1])}°`} label="Expect" />
            </View>

            <Text style={styles.record}>
                Hottest {r(hottest.high)}° on {formatShortDate(hottest.year, month, hottest.day)}
                {"\n"}Coldest {r(coldest.low)}° on {formatShortDate(coldest.year, month, coldest.day)}
            </Text>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    sentence: { fontFamily: fonts.light, fontSize: 20, lineHeight: 27, color: colors.text },
    stats: { flexDirection: "row", marginTop: 16 },
    stat: { flex: 1 },
    statValue: { fontFamily: fonts.regular, fontSize: 26, color: colors.text },
    statLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint },
    record: { marginTop: 14, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.textSoft },
});
