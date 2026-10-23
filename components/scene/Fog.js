import React from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import useLoop from "./useLoop";

/* ------------------------------------------------------------------
 * Fog — wide banks of mist with soft top/bottom edges, sliding slowly
 * back and forth at different speeds.
 * ------------------------------------------------------------------ */

const BANKS = [
    { top: "18%", height: 180, duration: 42000, opacity: 0.22, offset: 0 },
    { top: "38%", height: 220, duration: 56000, opacity: 0.28, offset: 0.35 },
    { top: "58%", height: 200, duration: 48000, opacity: 0.24, offset: 0.7 },
    { top: "76%", height: 240, duration: 64000, opacity: 0.3, offset: 0.15 },
];

function Bank({ top, height, duration, opacity, offset, width }) {
    const p = useLoop(duration, offset);
    const translateX = p.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [-width * 0.5, 0, -width * 0.5],
    });

    return (
        <Animated.View style={[styles.bank, { top, height, opacity, width: width * 1.5, transform: [{ translateX }] }]}>
            <LinearGradient
                colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)", "rgba(255,255,255,0)"]}
                style={StyleSheet.absoluteFill}
            />
        </Animated.View>
    );
}

export default function Fog() {
    const { width } = useWindowDimensions();

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {BANKS.map((bank) => (
                <Bank key={bank.top} {...bank} width={width} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    bank: { position: "absolute", left: 0 },
});
