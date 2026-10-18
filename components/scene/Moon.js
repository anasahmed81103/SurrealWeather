import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import useLoop from "./useLoop";

/* ------------------------------------------------------------------
 * Moon — pale disc with craters and a softly breathing glow.
 * ------------------------------------------------------------------ */

export default function Moon() {
    const pulse = useLoop(6000);
    const glowOpacity = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.35, 0.7, 0.35] });
    const glowScale = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.1, 1] });

    return (
        <View style={styles.wrap} pointerEvents="none">
            <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
            <View style={styles.core}>
                <View style={[styles.crater, { width: 18, height: 18, top: 16, left: 20 }]} />
                <View style={[styles.crater, { width: 11, height: 11, top: 44, left: 48 }]} />
                <View style={[styles.crater, { width: 8, height: 8, top: 22, left: 52 }]} />
                <View style={[styles.crater, { width: 6, height: 6, top: 52, left: 24 }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: "absolute",
        top: 0, // top-right corner, clear of the big temperature
        right: -10,
        width: 180,
        height: 180,
        alignItems: "center",
        justifyContent: "center",
    },
    glow: {
        position: "absolute",
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "rgba(200, 215, 255, 0.18)",
    },
    core: {
        width: 74,
        height: 74,
        borderRadius: 37,
        backgroundColor: "#F2F0E6",
        overflow: "hidden",
    },
    crater: {
        position: "absolute",
        borderRadius: 20,
        backgroundColor: "rgba(170, 170, 160, 0.35)",
    },
});
