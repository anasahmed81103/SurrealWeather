import React, { useMemo } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import useLoop, { rand } from "./useLoop";

/* ------------------------------------------------------------------
 * Stars — a faint Milky Way band, twinkling dots, a few bright
 * sparkling stars, and (on clear nights) an occasional shooting star.
 * ------------------------------------------------------------------ */

const STAR_COUNT = 60;
const BRIGHT_COUNT = 5;

function Star({ width, height }) {
    // Random but fixed per star (useMemo keeps it stable across renders)
    const cfg = useMemo(() => ({
        x: rand(0, width),
        y: rand(0, height * 0.6),
        size: rand(1, 2.6),
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

/** A brighter star with a 4-point sparkle that pulses */
function BrightStar({ width, height }) {
    const cfg = useMemo(() => ({
        x: rand(0.05, 0.9) * width,
        y: rand(0.04, 0.45) * height,
        duration: rand(3000, 5000),
        offset: Math.random(),
    }), [width, height]);

    const p = useLoop(cfg.duration, cfg.offset);
    const scale = p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1, 0.6] });
    const opacity = p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1, 0.5] });

    return (
        <Animated.View style={[styles.sparkle, { left: cfg.x - 8, top: cfg.y - 8, opacity, transform: [{ scale }] }]}>
            <View style={styles.sparkleH} />
            <View style={styles.sparkleV} />
            <View style={styles.sparkleDot} />
        </Animated.View>
    );
}

function ShootingStar() {
    // Visible for the first 6% of an 11s loop, hidden the rest of the time
    const p = useLoop(11000, 0.5);
    const translateX = p.interpolate({ inputRange: [0, 0.06, 1], outputRange: [0, 260, 260] });
    const translateY = p.interpolate({ inputRange: [0, 0.06, 1], outputRange: [0, 120, 120] });
    const opacity = p.interpolate({ inputRange: [0, 0.01, 0.05, 0.06, 1], outputRange: [0, 1, 1, 0, 0] });

    return (
        <Animated.View style={[styles.shooting, { opacity, transform: [{ translateX }, { translateY }, { rotate: "25deg" }] }]}>
            <LinearGradient
                colors={["rgba(255,255,255,0)", "#FFFFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
            />
        </Animated.View>
    );
}

export default function Stars({ shooting = false }) {
    const { width, height } = useWindowDimensions();

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Milky Way: a faint diagonal haze */}
            <View style={[styles.milkyWay, { width: width * 1.8, left: -width * 0.4, top: height * 0.12 }]}>
                <LinearGradient
                    colors={["rgba(170,180,255,0)", "rgba(190,200,255,0.09)", "rgba(220,200,255,0.06)", "rgba(170,180,255,0)"]}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            {Array.from({ length: STAR_COUNT }, (_, i) => (
                <Star key={i} width={width} height={height} />
            ))}
            {Array.from({ length: BRIGHT_COUNT }, (_, i) => (
                <BrightStar key={`b${i}`} width={width} height={height} />
            ))}
            {shooting && <ShootingStar />}
        </View>
    );
}

const styles = StyleSheet.create({
    star: { position: "absolute", backgroundColor: "#FFFFFF" },
    milkyWay: { position: "absolute", height: 170, transform: [{ rotate: "-28deg" }] },
    sparkle: { position: "absolute", width: 16, height: 16, alignItems: "center", justifyContent: "center" },
    sparkleH: { position: "absolute", width: 16, height: 1, backgroundColor: "rgba(255,255,255,0.8)" },
    sparkleV: { position: "absolute", width: 1, height: 16, backgroundColor: "rgba(255,255,255,0.8)" },
    sparkleDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#FFFFFF" },
    shooting: {
        position: "absolute",
        top: "10%",
        left: "5%",
        width: 90,
        height: 2,
        borderRadius: 1,
        overflow: "hidden",
    },
});
