import React, { useMemo } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import useLoop, { rand } from "./useLoop";

/* ------------------------------------------------------------------
 * Rain — streaks in two depth layers:
 *   far:  thin, faint, slower (background)
 *   near: longer, brighter, faster (foreground)
 * The slant follows the real wind speed, so a windy day looks windy.
 * intensity 1–3 controls how many drops there are.
 * ------------------------------------------------------------------ */

const COUNTS = { far: [0, 40, 60, 85], near: [0, 18, 35, 55] };

const LAYERS = {
    far: { width: 1, length: [10, 18], opacity: [0.15, 0.32], duration: [900, 1300] },
    near: { width: 1.8, length: [20, 36], opacity: [0.35, 0.65], duration: [480, 720] },
};

/** Wind (km/h) → rain angle in degrees */
export const slantFromWind = (windKmh = 10) => Math.max(4, Math.min(28, windKmh * 0.7));

function Drop({ layer, width, height, slant }) {
    const L = LAYERS[layer];
    const fall = height + 80;
    const drift = Math.tan((slant * Math.PI) / 180) * fall; // sideways distance while falling

    const cfg = useMemo(() => ({
        x: rand(0, width + drift), // start further right because drops drift left
        length: rand(...L.length),
        duration: rand(...L.duration),
        offset: Math.random(),
        opacity: rand(...L.opacity),
    }), [layer, width, drift]);

    const p = useLoop(cfg.duration, cfg.offset);

    return (
        <Animated.View
            style={[styles.drop, {
                left: cfg.x,
                width: L.width,
                height: cfg.length,
                opacity: cfg.opacity,
                transform: [
                    { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, -drift] }) },
                    { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [-60, fall] }) },
                    { rotate: `${slant}deg` },
                ],
            }]}
        />
    );
}

export default function Rain({ intensity = 2, wind = 10 }) {
    const { width, height } = useWindowDimensions();
    const slant = slantFromWind(wind);
    const level = Math.max(1, Math.min(3, intensity));

    const layer = (name) =>
        Array.from({ length: COUNTS[name][level] }, (_, i) => (
            <Drop key={`${name}${i}`} layer={name} width={width} height={height} slant={slant} />
        ));

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {layer("far")}
            {layer("near")}
        </View>
    );
}

const styles = StyleSheet.create({
    drop: {
        position: "absolute",
        top: 0,
        borderRadius: 1,
        backgroundColor: "#D6E9FF",
    },
});
