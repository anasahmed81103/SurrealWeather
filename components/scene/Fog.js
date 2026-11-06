import React, { useMemo } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";
import useLoop, { rand } from "./useLoop";
import { fogTint } from "./FogLight";

/* ------------------------------------------------------------------
 * Fog — layers of soft mist drifting slowly to the left, plus a dense
 * haze sitting on the ground.
 *
 * Each layer is a strip 2 screens wide filled with blurry puffs
 * (ellipses with a radial gradient, so there are no hard edges).
 * The puffs repeat every screen width, so sliding the strip by one
 * width loops seamlessly. Back layers are high, faint and slow; front
 * layers are low, dense and faster (parallax). Each layer also
 * "breathes" (opacity), so the fog thickens and thins.
 * ------------------------------------------------------------------ */

// far → near. top = centre of the strip (fraction of the screen)
const LAYERS = [
    { top: 0.2, height: 200, puffs: 5, opacity: 0.55, duration: 150000, breathe: 11000 },
    { top: 0.38, height: 240, puffs: 6, opacity: 0.65, duration: 105000, breathe: 9000 },
    { top: 0.56, height: 280, puffs: 6, opacity: 0.75, duration: 75000, breathe: 13000 },
    { top: 0.76, height: 320, puffs: 7, opacity: 0.9, duration: 50000, breathe: 10000 },
];

/** Puffs spread evenly across one screen width, each a bit different */
function makePuffs(count, width, height) {
    return Array.from({ length: count }, (_, i) => ({
        x: (i + rand(0.1, 0.9)) * (width / count),
        y: height * rand(0.42, 0.58),
        rx: width * rand(0.3, 0.48),
        ry: height * rand(0.26, 0.4),
        opacity: rand(0.6, 1),
    }));
}

function MistLayer({ index, layer, rgb, width, screenHeight }) {
    const { top, height, puffs, opacity, duration, breathe } = layer;
    const cfg = useMemo(
        () => ({ puffs: makePuffs(puffs, width, height), drift: Math.random(), breathe: Math.random() }),
        [puffs, width, height]
    );

    const drift = useLoop(duration, cfg.drift);
    const pulse = useLoop(breathe, cfg.breathe);
    const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -width] });
    const fade = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [opacity * 0.65, opacity, opacity * 0.65] });
    const id = `mist${index}`;

    return (
        <Animated.View
            style={[
                styles.layer,
                { top: top * screenHeight - height / 2, height, width: width * 2, opacity: fade, transform: [{ translateX }] },
            ]}
        >
            <Svg width={width * 2} height={height}>
                <Defs>
                    <RadialGradient id={id}>
                        <Stop offset="0" stopColor={`rgb(${rgb})`} stopOpacity="0.55" />
                        <Stop offset="0.5" stopColor={`rgb(${rgb})`} stopOpacity="0.25" />
                        <Stop offset="1" stopColor={`rgb(${rgb})`} stopOpacity="0" />
                    </RadialGradient>
                </Defs>
                {/* 3 copies (one screen apart) so puffs crossing the seams wrap around too */}
                {[-width, 0, width].map((shift) =>
                    cfg.puffs.map((f, i) => (
                        <Ellipse key={`${shift}-${i}`} cx={f.x + shift} cy={f.y} rx={f.rx} ry={f.ry} opacity={f.opacity} fill={`url(#${id})`} />
                    ))
                )}
            </Svg>
        </Animated.View>
    );
}

export default function Fog({ phase = "day" }) {
    const { width, height } = useWindowDimensions();
    const { mist } = fogTint(phase);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {LAYERS.map((layer, i) => (
                <MistLayer key={i} index={i} layer={layer} rgb={mist} width={width} screenHeight={height} />
            ))}

            {/* Dense haze hugging the ground */}
            <LinearGradient
                colors={[`rgba(${mist},0)`, `rgba(${mist},0.18)`, `rgba(${mist},0.38)`]}
                locations={[0, 0.5, 1]}
                style={styles.ground}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    layer: { position: "absolute", left: 0 },
    ground: { position: "absolute", left: 0, right: 0, bottom: 0, height: "45%" },
});
