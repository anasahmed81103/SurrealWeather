import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors, fonts } from "./theme";

/* ------------------------------------------------------------------
 * GlassCard — the frosted panel every section sits in.
 * Dark translucent glass so white text stays readable on any sky,
 * with a brighter top edge that catches the "light".
 * ------------------------------------------------------------------ */

export default function GlassCard({ title, icon, style, children }) {
    return (
        <View style={[styles.card, style]}>
            {title && (
                <View style={styles.titleRow}>
                    {icon && <MaterialCommunityIcons name={icon} size={14} color={colors.textFaint} />}
                    <Text style={styles.title}>{title.toUpperCase()}</Text>
                </View>
            )}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.glass,
        borderColor: colors.glassBorder,
        borderTopColor: "rgba(255,255,255,0.24)",
        borderWidth: 1,
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
    },
    titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    title: {
        marginLeft: 6,
        fontFamily: fonts.medium,
        fontSize: 11.5,
        letterSpacing: 1.2,
        color: colors.textFaint,
    },
});
