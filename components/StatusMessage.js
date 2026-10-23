import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { fonts } from "./theme";

/* ------------------------------------------------------------------
 * StatusMessage — shown over the sky while loading, or when weather
 * couldn't be loaded (with a Retry button).
 * ------------------------------------------------------------------ */

export default function StatusMessage({ status, onRetry }) {
    if (status === "error") {
        return (
            <View style={styles.center}>
                <MaterialCommunityIcons name="cloud-off-outline" size={56} color="rgba(255,255,255,0.85)" />
                <Text style={styles.title}>Couldn't load the weather</Text>
                <Text style={styles.text}>Check your internet connection and try again.</Text>
                <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.7}>
                    <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.text}>Fetching weather…</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
    title: { marginTop: 14, fontFamily: fonts.medium, fontSize: 20, color: "#fff" },
    text: { marginTop: 8, fontFamily: fonts.regular, fontSize: 15, color: "rgba(255,255,255,0.8)", textAlign: "center" },
    button: {
        marginTop: 20,
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.18)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    buttonText: { fontFamily: fonts.medium, fontSize: 16, color: "#fff" },
});
