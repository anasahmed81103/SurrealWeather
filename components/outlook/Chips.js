import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, fonts } from "../theme";

/* ------------------------------------------------------------------
 * Chips — a sideways-scrolling row of pills, one selected.
 * Used for picking the city and the month in the outlook.
 *
 *   items: [{ key, label }]    selected: key    onSelect(key)
 * ------------------------------------------------------------------ */

export default function Chips({ items, selected, onSelect }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroller} contentContainerStyle={styles.row}>
            {items.map(({ key, label }) => {
                const active = key === selected;
                return (
                    <TouchableOpacity
                        key={key}
                        onPress={() => onSelect(key)}
                        style={[styles.chip, active && styles.active]}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // ScrollViews grow to fill their parent by default; a chip row should only be as tall as its chips
    scroller: { flexGrow: 0 },
    row: { paddingHorizontal: 16, paddingVertical: 4 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glass,
    },
    active: { backgroundColor: "rgba(255,255,255,0.92)", borderColor: "transparent" },
    label: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.textSoft },
    activeLabel: { fontFamily: fonts.medium, color: colors.sheet },
});
