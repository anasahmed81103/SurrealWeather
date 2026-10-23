import React, { useMemo } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Rect, Stop } from "react-native-svg";
import useLoop, { rand } from "./useLoop";

/* ------------------------------------------------------------------
 * Clouds — shaded puffy clouds drifting across the sky in two layers:
 *   far:  small, faint, slow
 *   near: big, solid, faster
 * The speed difference gives a sense of depth (parallax).
 * ------------------------------------------------------------------ */

const LAYERS = {
    far: { size: [90, 150], opacity: [0.3, 0.5], duration: [110000, 170000], top: [0, 0.18] },
    near: { size: [180, 300], opacity: [0.6, 0.9], duration: [55000, 95000], top: [0.02, 0.3] },
};

/** One cloud drawn in a 200 × 120 box, shaded top → bottom */
function CloudShape({ size, colors, id }) {
    return (
        <Svg width={size} height={size * 0.6} viewBox="0 0 200 120">
            <Defs>
                <LinearGradient id={id} x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
                    <Stop offset="0.2" stopColor={colors[0]} />
                    <Stop offset="1" stopColor={colors[1]} />
                </LinearGradient>
            </Defs>
            <G fill={`url(#${id})`}>
                <Circle cx="62" cy="68" r="36" />
                <Circle cx="102" cy="50" r="46" />
                <Circle cx="146" cy="70" r="32" />
                <Circle cx="36" cy="86" r="22" />
                <Circle cx="170" cy="88" r="20" />
                <Rect x="30" y="72" width="145" height="38" rx="19" />
            </G>
        </Svg>
    );
}

function Cloud({ id, layer, index, count, colors, width, height }) {
    const L = LAYERS[layer];
    const cfg = useMemo(() => ({
        size: rand(...L.size),
        top: rand(...L.top) * height,
        duration: rand(...L.duration),
        offset: index / count + rand(0, 0.08), // spread clouds out across the sky
        opacity: rand(...L.opacity),
    }), [layer, index, count, height]);

    const p = useLoop(cfg.duration, cfg.offset);
    const translateX = p.interpolate({ inputRange: [0, 1], outputRange: [-cfg.size, width] });

    return (
        <Animated.View
            // Composite the cloud as one image so the overlapping puffs don't show seams
            // and cache it as a bitmap, so moving it is cheap (only the transform animates)
            needsOffscreenAlphaCompositing
            renderToHardwareTextureAndroid
            shouldRasterizeIOS
            style={[styles.cloud, { top: cfg.top, opacity: cfg.opacity, transform: [{ translateX }] }]}
        >
            <CloudShape size={cfg.size} colors={colors} id={id} />
        </Animated.View>
    );
}

export default function Clouds({ count, colors }) {
    const { width, height } = useWindowDimensions();
    const farCount = Math.ceil(count / 2);
    const nearCount = count - farCount;

    const layer = (name, n) =>
        Array.from({ length: n }, (_, i) => (
            <Cloud
                key={`${name}${i}`}
                id={`cloud-${name}-${i}`}
                layer={name}
                index={i}
                count={n}
                colors={colors}
                width={width}
                height={height}
            />
        ));

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {layer("far", farCount)}
            {layer("near", nearCount)}
        </View>
    );
}

const styles = StyleSheet.create({
    cloud: { position: "absolute", left: 0 },
});
