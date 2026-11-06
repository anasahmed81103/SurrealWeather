import React from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import useLoop from "./useLoop";

/* ------------------------------------------------------------------
 * FogLight — the sun (or moon) seen through fog: a pale, flat disc
 * with no rays inside a wide, faint, slowly breathing glow.
 * Drawn behind the clouds and the mist, so the fog really veils it.
 * ------------------------------------------------------------------ */

// Mist and light colours ("r,g,b") per time of day — warm at dawn/dusk, cool at night
const TINTS = {
    day: { mist: "255,255,255", light: "255,246,222" },
    dawn: { mist: "255,236,226", light: "255,200,158" },
    dusk: { mist: "255,228,218", light: "255,176,138" },
    night: { mist: "178,190,210", light: "214,224,255" },
};

export const fogTint = (phase) => TINTS[phase] || TINTS.day;

const GLOW = 240; // glow radius
const DISC = 38; // sun / moon radius

export default function FogLight({ phase = "day" }) {
    const { width } = useWindowDimensions();
    const { light } = fogTint(phase);
    const rgb = `rgb(${light})`;
    const cx = width - 90;
    const cy = phase === "day" || phase === "night" ? 120 : 200; // lower at dawn/dusk
    const dim = phase === "night" ? 0.6 : 1;

    const pulse = useLoop(9000);
    const glowOpacity = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7 * dim, dim, 0.7 * dim] });
    const glowScale = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 1] });

    const box = (r) => ({ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2 });

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View style={[box(GLOW), { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}>
                <Svg width={GLOW * 2} height={GLOW * 2}>
                    <Defs>
                        <RadialGradient id="fogGlow">
                            <Stop offset="0" stopColor={rgb} stopOpacity="0.5" />
                            <Stop offset="0.25" stopColor={rgb} stopOpacity="0.22" />
                            <Stop offset="0.6" stopColor={rgb} stopOpacity="0.06" />
                            <Stop offset="1" stopColor={rgb} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Circle cx={GLOW} cy={GLOW} r={GLOW} fill="url(#fogGlow)" />
                </Svg>
            </Animated.View>

            {/* The disc itself: solid-ish centre, edge melting into the mist */}
            <View style={[box(DISC), { opacity: 0.75 * dim }]}>
                <Svg width={DISC * 2} height={DISC * 2}>
                    <Defs>
                        <RadialGradient id="fogDisc">
                            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
                            <Stop offset="0.75" stopColor={rgb} stopOpacity="0.7" />
                            <Stop offset="1" stopColor={rgb} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Circle cx={DISC} cy={DISC} r={DISC} fill="url(#fogDisc)" />
                </Svg>
            </View>
        </View>
    );
}
