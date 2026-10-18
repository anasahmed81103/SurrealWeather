import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import useLoop from "./useLoop";

/* ------------------------------------------------------------------
 * Sun — glowing core, slowly rotating rays and a breathing halo.
 * `low` puts it near the horizon (dawn / dusk).
 * ------------------------------------------------------------------ */

const RAY_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);
const RAY_DISTANCE = 78; // px from the sun's centre

export default function Sun({ low = false }) {
    const spin = useLoop(60000); // one full turn per minute
    const pulse = useLoop(5000);

    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
    const haloScale = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.18, 1] });
    const haloOpacity = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.9, 0.5] });

    return (
        <View style={[styles.wrap, low && styles.low]} pointerEvents="none">
            <Animated.View style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]} />
            <View style={styles.glow} />

            <Animated.View style={[styles.rays, { transform: [{ rotate }] }]}>
                {RAY_ANGLES.map((deg) => (
                    <View
                        key={deg}
                        style={[styles.ray, { transform: [{ rotate: `${deg}deg` }, { translateY: -RAY_DISTANCE }] }]}
                    />
                ))}
            </Animated.View>

            <View style={styles.core} />
        </View>
    );
}

const SIZE = 240;

const styles = StyleSheet.create({
    wrap: {
        position: "absolute",
        top: -30, // top-right corner, clear of the big temperature
        right: -70,
        width: SIZE,
        height: SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    low: { top: 30, right: -50 }, // dawn/dusk: a little lower, still clear of the cards
    halo: {
        position: "absolute",
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        backgroundColor: "rgba(255, 214, 102, 0.18)",
    },
    glow: {
        position: "absolute",
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: "rgba(255, 228, 130, 0.3)",
    },
    rays: {
        position: "absolute",
        width: SIZE,
        height: SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    ray: {
        position: "absolute",
        width: 4,
        height: 22,
        borderRadius: 2,
        backgroundColor: "rgba(255, 236, 160, 0.75)",
    },
    core: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: "#FFE47A",
        borderWidth: 6,
        borderColor: "#FFF3B8",
    },
});
