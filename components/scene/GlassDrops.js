import React, { useMemo } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import useLoop, { rand } from "./useLoop";

/* ------------------------------------------------------------------
 * GlassDrops — raindrops "on the screen glass": each one appears,
 * clings for a moment, then slides down and fades. A nod to the
 * classic HTC weather app.
 * ------------------------------------------------------------------ */

const DROPS_BY_INTENSITY = [0, 4, 7, 10];

function Drop({ width, height }) {
    const cfg = useMemo(() => ({
        x: rand(0.05, 0.95) * width,
        y: rand(0.05, 0.45) * height,
        size: rand(9, 18),
        slide: rand(0.25, 0.5) * height,
        duration: rand(7000, 14000),
        offset: Math.random(),
    }), [width, height]);

    const p = useLoop(cfg.duration, cfg.offset);
    // appear → cling (still) → slide down, speeding up → gone
    const translateY = p.interpolate({ inputRange: [0, 0.55, 0.7, 1], outputRange: [0, 4, cfg.slide * 0.25, cfg.slide] });
    const opacity = p.interpolate({ inputRange: [0, 0.06, 0.85, 1], outputRange: [0, 1, 0.8, 0] });

    return (
        <Animated.View
            style={[styles.drop, {
                left: cfg.x,
                top: cfg.y,
                width: cfg.size,
                height: cfg.size * 1.15,
                borderRadius: cfg.size / 2,
                opacity,
                transform: [{ translateY }],
            }]}
        >
            {/* small highlight makes it read as a water bead */}
            <View style={[styles.shine, { width: cfg.size * 0.3, height: cfg.size * 0.3, borderRadius: cfg.size }]} />
        </Animated.View>
    );
}

export default function GlassDrops({ intensity = 2 }) {
    const { width, height } = useWindowDimensions();
    const count = DROPS_BY_INTENSITY[Math.max(1, Math.min(3, intensity))];

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: count }, (_, i) => (
                <Drop key={i} width={width} height={height} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    drop: {
        position: "absolute",
        backgroundColor: "rgba(210, 230, 255, 0.14)",
        borderWidth: 1,
        borderColor: "rgba(235, 245, 255, 0.35)",
    },
    shine: {
        position: "absolute",
        top: "18%",
        left: "22%",
        backgroundColor: "rgba(255,255,255,0.8)",
    },
});
