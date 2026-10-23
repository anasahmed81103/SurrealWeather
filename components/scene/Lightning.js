import React, { useMemo } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import useLoop, { rand } from "./useLoop";

/* ------------------------------------------------------------------
 * Lightning — two independent strikes on different timings.
 * Each strike = a jagged, branching, glowing bolt + a flash of the sky.
 * Bolt shapes are random but fixed per strike (generated once).
 * ------------------------------------------------------------------ */

/** Random jagged line going down from (x, y) → SVG path string */
function jaggedPath(x, y, length, steps) {
    let d = `M ${x} ${y}`;
    for (let i = 0; i < steps; i++) {
        x += rand(-22, 22);
        y += length / steps;
        d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return { d, end: [x, y] };
}

/** Main bolt + two side branches */
function makeBolt(x, height) {
    const main = jaggedPath(x, -10, height * 0.55, 9);
    const branchA = jaggedPath(x + rand(-30, 30), height * 0.18, height * 0.16, 4);
    const branchB = jaggedPath(x + rand(-40, 40), height * 0.32, height * 0.12, 3);
    return [main.d, branchA.d, branchB.d];
}

function Strike({ xRatio, duration, offset }) {
    const { width, height } = useWindowDimensions();
    const paths = useMemo(() => makeBolt(width * xRatio, height), [width, height, xRatio]);
    const p = useLoop(duration, offset);

    // Dark for most of the loop, then: flash → dim → flash → dark
    const opacity = p.interpolate({
        inputRange: [0, 0.9, 0.905, 0.92, 0.935, 0.95, 1],
        outputRange: [0, 0, 1, 0.2, 0.75, 0, 0],
    });

    return (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
            <View style={[StyleSheet.absoluteFill, styles.flash]} />
            <Svg width={width} height={height}>
                {paths.map((d, i) => (
                    <React.Fragment key={i}>
                        {/* wide soft glow → bright middle → white-hot core */}
                        <Path d={d} stroke="rgba(170,190,255,0.25)" strokeWidth={i === 0 ? 14 : 8} fill="none" strokeLinejoin="round" />
                        <Path d={d} stroke="rgba(215,225,255,0.7)" strokeWidth={i === 0 ? 5 : 3} fill="none" strokeLinejoin="round" />
                        <Path d={d} stroke="#FFFFFF" strokeWidth={i === 0 ? 1.8 : 1} fill="none" strokeLinejoin="round" />
                    </React.Fragment>
                ))}
            </Svg>
        </Animated.View>
    );
}

export default function Lightning() {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Strike xRatio={0.62} duration={8000} offset={0} />
            <Strike xRatio={0.25} duration={11500} offset={0.45} />
        </View>
    );
}

const styles = StyleSheet.create({
    flash: { backgroundColor: "rgba(220, 228, 255, 0.35)" },
});
