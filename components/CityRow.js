import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/* ------------------------------------------------------------------
 * CityRow — one row in the city picker. Used for both saved cities and
 * search suggestions. Optional buttons on the right:
 *   onMakeHome → home button (filled when `home` is true)
 *   onRemove   → trash button
 * ------------------------------------------------------------------ */

export default function CityRow({ icon, title, subtitle, active = false, home = false, onPress, onMakeHome, onRemove }) {
    return (
        <View style={[styles.row, active && styles.activeRow]}>
            <TouchableOpacity style={styles.main} onPress={onPress} activeOpacity={0.6}>
                <MaterialCommunityIcons name={icon} size={20} color={active ? "#7DD3FC" : "rgba(255,255,255,0.7)"} />
                <View style={styles.texts}>
                    <Text style={[styles.title, active && styles.activeText]} numberOfLines={1}>{title}</Text>
                    {!!subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
                </View>
            </TouchableOpacity>

            {onMakeHome && (
                <TouchableOpacity onPress={onMakeHome} hitSlop={10} style={styles.action} disabled={home}>
                    <MaterialCommunityIcons
                        name={home ? "home" : "home-outline"}
                        size={22}
                        color={home ? "#7DD3FC" : "rgba(255,255,255,0.55)"}
                    />
                </TouchableOpacity>
            )}

            {onRemove && (
                <TouchableOpacity onPress={onRemove} hitSlop={10} style={styles.action}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#F87171" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderRadius: 12 },
    activeRow: { backgroundColor: "rgba(125,211,252,0.1)" },
    main: { flex: 1, flexDirection: "row", alignItems: "center", paddingVertical: 12 },
    texts: { flex: 1, marginLeft: 10 },
    action: { marginLeft: 16 },
    title: { fontSize: 17, color: "#fff" },
    subtitle: { marginTop: 1, fontSize: 13, color: "rgba(255,255,255,0.55)" },
    activeText: { fontWeight: "600", color: "#7DD3FC" },
});
