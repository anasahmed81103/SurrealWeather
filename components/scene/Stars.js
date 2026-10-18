import React, { useMemo } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import useLoop, { rand } from "./useLoop";

/* ------------------------------------------------------------------
 * Stars — twinkling dots in the upper sky, plus an occasional
 * shooting star (only on clear nights).
 * ------------------------------------------------------------------ */

const STAR_COUNT = 45;

function Star({ width, height }) {
    // Random but fixed per star (useMemo keeps it stable across renders)
    const cfg = useMemo(() => ({
        x: rand(0, width),
        y: rand(0, height * 0.55),
        size: rand(1, 2.8),
        duration: rand(2500, 6000),
        offset: Math.random(),
    }), [width, height]);

    const twinkle = useLoop(cfg.duration, cfg.offset);
    const opacity = twinkle.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 1, 0.2] });

    return (
        <Animated.View
            style={[styles.star, {
                left: cfg.x,
                top: cfg.y,
                width: cfg.size,
                height: cfg.size,
                borderRadius: cfg.size / 2,
                opacity,
            }]}
        />
    );
}

function ShootingStar() {
    // Visible for the first 6% of an 11s loop, hidden the rest of the time
    const p = useLoop(11000, 0.5);
    const translateX = p.interpolate({ inputRange: [0, 0.06, 1], outputRange: [0, 260, 260] });
    const translateY = p.interpolate({ inputRange: [0, 0.06, 1], outputRange: [0, 120, 120] });
    const opacity = p.interpolate({ inputRange: [0, 0.01, 0.05, 0.06, 1], outputRange: [0, 1, 1, 0, 0] });

    return (
        <Animated.View
            style={[styles.shooting, { opacity, transform: [{ translateX }, { translateY }, { rotate: "25deg" }] }]}
        />
    );
}

export default function Stars({ shooting = false }) {
    const { width, height } = useWindowDimensions();

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: STAR_COUNT }, (_, i) => (
                <Star key={i} width={width} height={height} />
            ))}
            {shooting && <ShootingStar />}
        </View>
    );
}

const styles = StyleSheet.create({
    star: { position: "absolute", backgroundColor: "#FFFFFF" },
    shooting: {
        position: "absolute",
        top: "10%",
        left: "5%",
        width: 70,
        height: 2,
        borderRadius: 1,
        backgroundColor: "#FFFFFF",
    },
});
