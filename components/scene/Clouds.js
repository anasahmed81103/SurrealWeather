import React, { useMemo } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import useLoop, { rand } from "./useLoop";

/* ------------------------------------------------------------------
 * Clouds — puffy clouds (built from overlapping circles) drifting
 * slowly across the sky at different sizes, heights and speeds.
 * ------------------------------------------------------------------ */

/** One cloud shape. All parts are sized relative to `size`. */
function CloudShape({ size, color }) {
    const part = (w, left, top) => ({
        position: "absolute",
        width: size * w,
        height: size * w,
        borderRadius: (size * w) / 2,
        left: size * left,
        top: size * top,
        backgroundColor: color,
    });

    return (
        <View style={{ width: size, height: size * 0.6 }}>
            <View style={part(0.4, 0.06, 0.15)} />
            <View style={part(0.55, 0.28, 0)} />
            <View style={part(0.36, 0.58, 0.22)} />
            {/* flat base so the bottom looks like a cloud, not bubbles */}
            <View
                style={{
                    position: "absolute",
                    left: size * 0.05,
                    bottom: 0,
                    width: size * 0.9,
                    height: size * 0.22,
                    borderRadius: size * 0.11,
                    backgroundColor: color,
                }}
            />
        </View>
    );
}

function Cloud({ index, count, color, width, height }) {
    const cfg = useMemo(() => ({
        size: rand(150, 270),
        top: rand(0, 0.26) * height, // upper sky only
        duration: rand(50000, 95000),
        offset: index / count + rand(0, 0.1), // spread clouds out across the sky
        opacity: rand(0.4, 0.75), // see-through enough to keep text readable
    }), [index, count, height]);

    const p = useLoop(cfg.duration, cfg.offset);
    const translateX = p.interpolate({ inputRange: [0, 1], outputRange: [-cfg.size, width] });

    return (
        <Animated.View
            // Composite the cloud as one image so overlapping puffs don't show darker seams
            needsOffscreenAlphaCompositing
            renderToHardwareTextureAndroid
            style={[styles.cloud, { top: cfg.top, opacity: cfg.opacity, transform: [{ translateX }] }]}
        >
            <CloudShape size={cfg.size} color={color} />
        </Animated.View>
    );
}

export default function Clouds({ count, color }) {
    const { width, height } = useWindowDimensions();

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: count }, (_, i) => (
                <Cloud key={i} index={i} count={count} color={color} width={width} height={height} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    cloud: { position: "absolute", left: 0 },
});
