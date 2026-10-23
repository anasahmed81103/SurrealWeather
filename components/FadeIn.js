import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

/* ------------------------------------------------------------------
 * FadeIn — wraps anything so it fades + slides up into place when it
 * mounts. Give siblings increasing `delay`s for a staggered entrance.
 * ------------------------------------------------------------------ */

export default function FadeIn({ delay = 0, distance = 24, style, children }) {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 650,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, []);

    const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });

    return (
        <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
            {children}
        </Animated.View>
    );
}
