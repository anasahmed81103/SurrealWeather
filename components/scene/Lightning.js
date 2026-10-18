import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import useLoop from "./useLoop";

/* ------------------------------------------------------------------
 * Lightning — a double flash of the whole sky plus a zig-zag bolt,
 * once every ~8 seconds.
 * ------------------------------------------------------------------ */

export default function Lightning() {
    const p = useLoop(8000);

    // Dark for 90% of the loop, then: flash → dim → flash → dark
    const opacity = p.interpolate({
        inputRange: [0, 0.9, 0.905, 0.92, 0.935, 0.95, 1],
        outputRange: [0, 0, 0.85, 0.15, 0.6, 0, 0],
    });

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View style={[StyleSheet.absoluteFill, styles.flash, { opacity }]} />

            <Animated.View style={[styles.bolt, { opacity }]}>
                <View style={[styles.segment, { height: 70, left: 10, top: 0, transform: [{ rotate: "18deg" }] }]} />
                <View style={[styles.segment, { height: 46, left: 4, top: 62, transform: [{ rotate: "-35deg" }] }]} />
                <View style={[styles.segment, { height: 80, left: 0, top: 96, transform: [{ rotate: "20deg" }] }]} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    flash: { backgroundColor: "#E6ECFF" },
    bolt: { position: "absolute", top: "14%", left: "58%", width: 40, height: 180 },
    segment: {
        position: "absolute",
        width: 4,
        borderRadius: 2,
        backgroundColor: "#FFFBE0",
    },
});
