import React, { useEffect, useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import useClimateHistory from "../hooks/useClimateHistory";
import { getMonthOutlook } from "../utils/climateOutlook";
import { formatMonthShort, formatMonthYear } from "../utils/time";
import Chips from "../components/outlook/Chips";
import OutlookSummaryCard from "../components/outlook/OutlookSummaryCard";
import SkyMixCard from "../components/outlook/SkyMixCard";
import MonthThirdsCard from "../components/outlook/MonthThirdsCard";
import { colors, fonts } from "../components/theme";

/* ------------------------------------------------------------------
 * ClimateScreen — "what is it usually like here in July?"
 * Full-screen panel over the weather screen. Layout only:
 *
 *   header (title + close)
 *   [ saved cities chips ]
 *   [ next 12 months chips ]
 *   OutlookSummaryCard → SkyMixCard → MonthThirdsCard
 *
 * Uses the same cached 10-year history as the "On this day" card
 * (useClimateHistory), so it normally needs no network at all.
 *
 * Safe areas: a Modal is its own native window on Android, so the app's
 * root insets (useSafeAreaInsets) don't fit it. SafeAreaView measures the
 * window it is actually in and keeps us clear of the status bar (top)
 * and the navigation bar (bottom).
 * ------------------------------------------------------------------ */

const pad = (n) => String(n).padStart(2, "0");

/** This month and the next 11: [{ year, month }] */
function nextMonths() {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
}

export default function ClimateScreen({ visible, city, cities, onClose }) {
    const [place, setPlace] = useState(city); // which city we're looking at
    const [monthIndex, setMonthIndex] = useState(0);

    // Each time it opens: start from the city on screen and this month
    useEffect(() => {
        if (visible) {
            setPlace(city);
            setMonthIndex(0);
        }
    }, [visible]);

    const months = useMemo(nextMonths, [visible]);
    const { year, month } = months[monthIndex];
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    // Only load while open (lat = null → the hook waits)
    const { history, status } = useClimateHistory(visible ? place?.lat : null, place?.lng, todayIso);
    // Copies saved by older app versions have no cloud cover → can't tell sunny from cloudy.
    // The hook re-downloads those; until then say so rather than show wrong numbers.
    const usable = history?.cloud ? history : null;
    const outlook = useMemo(() => (usable ? getMonthOutlook(usable, year, month) : null), [usable, year, month]);

    const message =
        status === "loading" ? "Looking back 10 years…"
            : status === "none" ? "Couldn't load the history. Check your connection and try again."
                : !usable ? "Updating the history for this place… (needs internet once)"
                    : !outlook ? "Not enough history for this month here."
                        : null;

    return (
        <Modal visible={visible} animationType="slide" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
            <SafeAreaView style={styles.screen} edges={["top", "bottom", "left", "right"]}>
                <View style={styles.header}>
                    <View style={styles.headerTexts}>
                        <Text style={styles.title}>Climate outlook</Text>
                        <Text style={styles.subtitle}>What a month is usually like, from the last 10 years</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.close}>
                        <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {cities.length > 1 && (
                    <Chips
                        items={cities.map((c) => ({ key: c.name, label: c.name }))}
                        selected={place?.name}
                        onSelect={(name) => setPlace(cities.find((c) => c.name === name))}
                    />
                )}
                <Chips
                    items={months.map((m, i) => ({ key: i, label: formatMonthShort(m.year, m.month) }))}
                    selected={monthIndex}
                    onSelect={setMonthIndex}
                />

                <ScrollView style={styles.body} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {message ? (
                        <Text style={styles.message}>{message}</Text>
                    ) : (
                        <>
                            <OutlookSummaryCard outlook={outlook} month={month} title={`${formatMonthYear(year, month)} in ${place.name}`} />
                            <SkyMixCard outlook={outlook} />
                            <MonthThirdsCard outlook={outlook} />
                            <Text style={styles.note}>
                                Typical weather from {outlook.fromYear}–{outlook.toYear} at this spot.
                                A guide to what's usual, not a forecast.
                            </Text>
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#0B1838" },
    header: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, paddingTop: 8, marginBottom: 10 },
    headerTexts: { flex: 1 },
    title: { fontFamily: fonts.light, fontSize: 28, color: colors.text },
    subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.textFaint, marginTop: 2 },
    close: { padding: 4, marginTop: 4 },
    body: { flex: 1 }, // takes the space left under the chips, so it scrolls all the way
    content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
    message: { marginTop: 60, textAlign: "center", fontFamily: fonts.regular, fontSize: 14, color: colors.textSoft },
    note: { marginTop: 4, textAlign: "center", fontFamily: fonts.light, fontSize: 12, lineHeight: 18, color: colors.textFaint },
});
