import React from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import useLoop from "./useLoop";

/* ------------------------------------------------------------------
 * Fog — wide, soft bands of mist sliding slowly back and forth.
 * ------------------------------------------------------------------ */

const BANDS = [
    { top: "26%", duration: 38000, opacity: 0.16, offset: 0 },
    { top: "46%", duration: 52000, opacity: 0.22, offset: 0.4 },
    { top: "66%", duration: 44000, opacity: 0.18, offset: 0.75 },
];

function Band({ top, duration, opacity, offset, width }) {
    const p = useLoop(duration, offset);
    const translateX = p.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [-width * 0.6, 0, -width * 0.6],
    });

    return (
        <Animated.View
            style={[styles.band, { top, opacity, width: width * 1.6, transform: [{ translateX }] }]}
        />
    );
}

export default function Fog() {
    const { width } = useWindowDimensions();

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {BANDS.map((band) => (
                <Band key={band.top} {...band} width={width} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    band: {
        position: "absolute",
        left: 0,
        height: 140,
        borderRadius: 70,
        backgroundColor: "#FFFFFF",
    },
});
