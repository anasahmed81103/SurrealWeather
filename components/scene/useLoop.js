import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing } from "react-native";

/* ------------------------------------------------------------------
 * useLoop — the ONE animation building block for the whole scene.
 *
 * Returns an Animated value that runs 0 → 1 forever (linear, native
 * driver, so it stays smooth even when JS is busy). Components turn it
 * into motion with interpolate():
 *   - movement: [0, 1]      → [start, end]
 *   - pulses:   [0, .5, 1]  → [a, b, a]
 *
 * `offset` (0–1) starts the loop part-way through, so 100 raindrops
 * don't all fall in sync — and are already spread out on the first frame.
 * ------------------------------------------------------------------ */

export default function useLoop(duration, offset = 0) {
    const value = useRef(new Animated.Value(0)).current;

    // (value + offset) % 1 → same loop, shifted in time
    const progress = useMemo(
        () => (offset ? Animated.modulo(Animated.add(value, offset), 1) : value),
        [value, offset]
    );

    useEffect(() => {
        const anim = Animated.loop(
            Animated.timing(value, {
                toValue: 1,
                duration,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        anim.start();
        return () => anim.stop();
    }, [value, duration]);

    return progress;
}

/** Random number in [min, max) — used to give every particle its own look */
export const rand = (min, max) => min + Math.random() * (max - min);
