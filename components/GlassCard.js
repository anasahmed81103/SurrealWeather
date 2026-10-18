import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/* ------------------------------------------------------------------
 * GlassCard — the frosted panel every section sits in.
 * Dark translucent glass so white text stays readable on any sky
 * (even bright snow/fog days).
 * ------------------------------------------------------------------ */

export default function GlassCard({ title, icon, style, children }) {
    return (
        <View style={[styles.card, style]}>
            {title && (
                <View style={styles.titleRow}>
                    {icon && <MaterialCommunityIcons name={icon} size={14} color="rgba(255,255,255,0.65)" />}
                    <Text style={styles.title}>{title.toUpperCase()}</Text>
                </View>
            )}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "rgba(12, 20, 38, 0.32)",
        borderColor: "rgba(255, 255, 255, 0.14)",
        borderWidth: 1,
        borderRadius: 22,
        padding: 16,
        marginBottom: 14,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        marginLeft: 6,
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 1,
        color: "rgba(255,255,255,0.65)",
    },
});
