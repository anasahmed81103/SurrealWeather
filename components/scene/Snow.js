import React, { useMemo } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import useLoop, { rand } from "./useLoop";

/* ------------------------------------------------------------------
 * Snow — flakes in two depth layers, drifting down and swaying:
 *   far:  tiny, faint, slow
 *   near: bigger, brighter, faster, wider sway
 * intensity 1–3 controls how many flakes there are.
 * ------------------------------------------------------------------ */

const COUNTS = { far: [0, 30, 50, 70], near: [0, 14, 26, 40] };

const LAYERS = {
    far: { size: [2, 4], opacity: [0.4, 0.7], duration: [11000, 17000], sway: [6, 14] },
    near: { size: [5, 9], opacity: [0.75, 1], duration: [6000, 10000], sway: [14, 30] },
};

function Flake({ layer, width, height }) {
    const L = LAYERS[layer];
    const cfg = useMemo(() => ({
        x: rand(0, width),
        size: rand(...L.size),
        duration: rand(...L.duration),
        offset: Math.random(),
        sway: rand(...L.sway),
        opacity: rand(...L.opacity),
    }), [layer, width]);

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
    const level = Math.max(1, Math.min(3, intensity));

    const layer = (name) =>
        Array.from({ length: COUNTS[name][level] }, (_, i) => (
            <Flake key={`${name}${i}`} layer={name} width={width} height={height} />
        ));

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {layer("far")}
            {layer("near")}
        </View>
    );
}

const styles = StyleSheet.create({
    flake: { position: "absolute", top: 0, backgroundColor: "#FFFFFF" },
});
