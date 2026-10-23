import React from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Polygon, RadialGradient, Stop } from "react-native-svg";
import useLoop from "./useLoop";

/* ------------------------------------------------------------------
 * Sun — top-right corner:
 *   light beams fanning across the sky (two sets, shimmering)
 *   → big soft glow (breathing) → slowly turning tapered rays → bright core.
 * `low` = dawn/dusk: lower in the sky and warmer in colour.
 * ------------------------------------------------------------------ */

const PALETTE = {
    day: { core: "#FFFBEA", edge: "#FFE27A", glow: "#FFD966", beam: "255,244,214" },
    low: { core: "#FFF1DC", edge: "#FFB36B", glow: "#FF9F5A", beam: "255,214,170" },
};

const GLOW = 230; // glow radius
const RAYS = 150; // ray length
const RAY_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);

/** Long, soft beams of light from the sun towards the lower-left */
function Beams({ width, height, cx, cy, angles, color, id }) {
    const length = Math.hypot(width, height) * 1.2;
    const point = (deg) => {
        const rad = (deg * Math.PI) / 180;
        return `${cx + length * Math.cos(rad)},${cy + length * Math.sin(rad)}`;
    };

    return (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <Defs>
                <RadialGradient id={id} cx={cx} cy={cy} r={length * 0.7} gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor={`rgb(${color})`} stopOpacity="0.14" />
                    <Stop offset="1" stopColor={`rgb(${color})`} stopOpacity="0" />
                </RadialGradient>
            </Defs>
            {angles.map(([angle, spread]) => (
                <Polygon key={angle} points={`${cx},${cy} ${point(angle - spread)} ${point(angle + spread)}`} fill={`url(#${id})`} />
            ))}
        </Svg>
    );
}

export default function Sun({ low = false }) {
    const { width, height } = useWindowDimensions();
    const c = PALETTE[low ? "low" : "day"];
    const cx = width - 70; // sun centre
    const cy = low ? 200 : 95;

    const spin = useLoop(120000);
    const pulse = useLoop(6000);
    const shimmerA = useLoop(9000);
    const shimmerB = useLoop(13000, 0.5);

    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
    const glowScale = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 1] });
    const beamsA = shimmerA.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] });
    const beamsB = shimmerB.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.25, 1] });

    // A box of size `r * 2` centred on the sun
    const box = (r) => ({ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2 });

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: beamsA }]}>
                <Beams id="beamsA" width={width} height={height} cx={cx} cy={cy} color={c.beam} angles={[[118, 4], [142, 6], [168, 3]]} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: beamsB }]}>
                <Beams id="beamsB" width={width} height={height} cx={cx} cy={cy} color={c.beam} angles={[[106, 3], [130, 5], [156, 4]]} />
            </Animated.View>

            <Animated.View style={[box(GLOW), { transform: [{ scale: glowScale }] }]}>
                <Svg width={GLOW * 2} height={GLOW * 2}>
                    <Defs>
                        <RadialGradient id="sunGlow">
                            <Stop offset="0" stopColor={c.core} stopOpacity="0.95" />
                            <Stop offset="0.12" stopColor={c.glow} stopOpacity="0.7" />
                            <Stop offset="0.35" stopColor={c.glow} stopOpacity="0.2" />
                            <Stop offset="1" stopColor={c.glow} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Circle cx={GLOW} cy={GLOW} r={GLOW} fill="url(#sunGlow)" />
                </Svg>
            </Animated.View>

            <Animated.View style={[box(RAYS), { transform: [{ rotate }] }]}>
                <Svg width={RAYS * 2} height={RAYS * 2}>
                    <Defs>
                        {/* bottom of each ray bright → tip transparent (follows each ray's rotation) */}
                        <LinearGradient id="sunRay" x1="0" y1="1" x2="0" y2="0">
                            <Stop offset="0" stopColor={c.core} stopOpacity="0.45" />
                            <Stop offset="1" stopColor={c.core} stopOpacity="0" />
                        </LinearGradient>
                    </Defs>
                    <G>
                        {RAY_ANGLES.map((deg) => (
                            <Polygon
                                key={deg}
                                points={`${RAYS - 4},${RAYS - 50} ${RAYS + 4},${RAYS - 50} ${RAYS},0`}
                                fill="url(#sunRay)"
                                transform={`rotate(${deg} ${RAYS} ${RAYS})`}
                            />
                        ))}
                    </G>
                </Svg>
            </Animated.View>

            <View style={box(44)}>
                <Svg width={88} height={88}>
                    <Defs>
                        <RadialGradient id="sunCore" cx="45%" cy="40%">
                            <Stop offset="0" stopColor="#FFFFFF" />
                            <Stop offset="0.6" stopColor={c.core} />
                            <Stop offset="1" stopColor={c.edge} />
                        </RadialGradient>
                    </Defs>
                    <Circle cx={44} cy={44} r={44} fill="url(#sunCore)" />
                </Svg>
            </View>
        </View>
    );
}
