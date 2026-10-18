import React, { useMemo } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import useLoop, { rand } from "./useLoop";

/* ------------------------------------------------------------------
 * Snow — soft flakes drifting down while swaying side to side.
 * intensity 1–3 controls how many flakes there are.
 * ------------------------------------------------------------------ */

const FLAKES_BY_INTENSITY = [0, 35, 60, 95];

function Flake({ width, height }) {
    const cfg = useMemo(() => ({
        x: rand(0, width),
        size: rand(3, 7),
        duration: rand(7000, 13000),
        offset: Math.random(),
        sway: rand(10, 25),
        opacity: rand(0.6, 1),
    }), [width]);

    const p = useLoop(cfg.duration, cfg.offset);
    const translateY = p.interpolate({ inputRange: [0, 1], outputRange: [-20, height + 20] });
    const translateX = p.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [0, cfg.sway, 0, -cfg.sway, 0],
    });

    return (
        <Animated.View
            style={[styles.flake, {
                left: cfg.x,
                width: cfg.size,
                height: cfg.size,
                borderRadius: cfg.size / 2,
                opacity: cfg.opacity,
                transform: [{ translateX }, { translateY }],
            }]}
        />
    );
}

export default function Snow({ intensity = 2 }) {
    const { width, height } = useWindowDimensions();
    const count = FLAKES_BY_INTENSITY[intensity] || FLAKES_BY_INTENSITY[2];

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: count }, (_, i) => (
                <Flake key={i} width={width} height={height} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    flake: { position: "absolute", top: 0, backgroundColor: "#FFFFFF" },
});
