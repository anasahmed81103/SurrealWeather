import React from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Circle, ClipPath, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import useLoop from "./useLoop";
import { getMoonPath } from "../../utils/moonPhase";

/* ------------------------------------------------------------------
 * Moon — shows TODAY's real phase (utils/moonPhase.js).
 *   breathing halo → faint dark disc ("earthshine") → lit part with craters.
 * `southern` mirrors it, because the moon looks flipped south of the equator.
 * ------------------------------------------------------------------ */

const R = 36; // moon radius
const HALO = 150;

const CRATERS = [
    [22, 24, 8],
    [46, 40, 6],
    [30, 50, 4],
    [52, 20, 3.5],
    [40, 58, 3],
];

export default function Moon({ phase = 0.5, southern = false }) {
    const { width } = useWindowDimensions();
    const cx = width - 80;
    const cy = 105;

    const pulse = useLoop(7000);
    const haloOpacity = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.55, 1, 0.55] });
    const haloScale = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 1] });

    const box = (r) => ({ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2 });

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View style={[box(HALO), { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}>
                <Svg width={HALO * 2} height={HALO * 2}>
                    <Defs>
                        <RadialGradient id="moonHalo">
                            <Stop offset="0.2" stopColor="#DCE6FF" stopOpacity="0.35" />
                            <Stop offset="0.5" stopColor="#B8C8F0" stopOpacity="0.1" />
                            <Stop offset="1" stopColor="#B8C8F0" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Circle cx={HALO} cy={HALO} r={HALO} fill="url(#moonHalo)" />
                </Svg>
            </Animated.View>

            <View style={[box(R), southern && styles.mirrored]}>
                <Svg width={R * 2} height={R * 2}>
                    <Defs>
                        <RadialGradient id="moonLit" cx="40%" cy="38%">
                            <Stop offset="0" stopColor="#FFFFFF" />
                            <Stop offset="1" stopColor="#E4E1D3" />
                        </RadialGradient>
                        <ClipPath id="moonLitClip">
                            <Path d={getMoonPath(phase, R)} />
                        </ClipPath>
                    </Defs>

                    {/* the dark side is faintly visible */}
                    <Circle cx={R} cy={R} r={R} fill="rgba(190,205,240,0.12)" />
                    <Path d={getMoonPath(phase, R)} fill="url(#moonLit)" />
                    {CRATERS.map(([x, y, r]) => (
                        <Circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="rgba(140,140,130,0.2)" clipPath="url(#moonLitClip)" />
                    ))}
                </Svg>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mirrored: { transform: [{ scaleX: -1 }] },
});
