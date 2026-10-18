import React, { useMemo } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import useLoop, { rand } from "./useLoop";

/* ------------------------------------------------------------------
 * Rain — slanted streaks falling at different speeds.
 * intensity 1–3 controls how many drops there are.
 * ------------------------------------------------------------------ */

const DROPS_BY_INTENSITY = [0, 45, 85, 130];
const SLANT_DEG = 12; // wind angle

function Drop({ width, height, heavy }) {
    const fall = height + 80;
    const drift = Math.tan((SLANT_DEG * Math.PI) / 180) * fall; // sideways distance while falling

    const cfg = useMemo(() => ({
        x: rand(0, width + drift), // start further right because drops drift left
        length: rand(14, heavy ? 30 : 22),
        duration: rand(550, 900),
        offset: Math.random(),
        opacity: rand(0.25, 0.6),
    }), [width, drift, heavy]);

    const p = useLoop(cfg.duration, cfg.offset);

    return (
        <Animated.View
            style={[styles.drop, {
                left: cfg.x,
                height: cfg.length,
                opacity: cfg.opacity,
                transform: [
                    { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, -drift] }) },
                    { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [-60, fall] }) },
                    { rotate: `${SLANT_DEG}deg` },
                ],
            }]}
        />
    );
}

export default function Rain({ intensity = 2 }) {
    const { width, height } = useWindowDimensions();
    const count = DROPS_BY_INTENSITY[intensity] || DROPS_BY_INTENSITY[2];

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: count }, (_, i) => (
                <Drop key={i} width={width} height={height} heavy={intensity === 3} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    drop: {
        position: "absolute",
        top: 0,
        width: 1.6,
        borderRadius: 1,
        backgroundColor: "#CFE6FF",
    },
});
