import { useEffect, useRef } from "react";
import { Animated, PanResponder, useWindowDimensions } from "react-native";

/* ------------------------------------------------------------------
 * useDraggableSheet — makes a bottom sheet resizable by dragging.
 *
 *  - Opens at HALF height, can be dragged up to FULL.
 *  - Flick or drag down far enough → closes.
 *  - Spread `panHandlers` onto the drag area (handle + title).
 *  - Animate the sheet with style={{ height: sheetHeight }}.
 *
 * Height can't use the native driver, so this runs on JS — fine for
 * a single panel.
 * ------------------------------------------------------------------ */

const HALF = 0.55; // of screen height
const FULL = 0.92;
const FLICK = 150; // how much a fast flick adds to the drag distance

export default function useDraggableSheet({ visible, onClose }) {
    const { height } = useWindowDimensions();
    const sheetHeight = useRef(new Animated.Value(0)).current;
    const currentHeight = useRef(0);

    // Refs so the PanResponder (created once) always sees fresh values
    const snaps = useRef({});
    snaps.current = { half: height * HALF, full: height * FULL };
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    const snapTo = (to) => {
        currentHeight.current = to;
        Animated.spring(sheetHeight, { toValue: to, useNativeDriver: false, bounciness: 4, speed: 14 }).start();
    };

    const close = () => {
        Animated.timing(sheetHeight, { toValue: 0, duration: 180, useNativeDriver: false }).start(() =>
            onCloseRef.current()
        );
    };

    // Slide up to half height every time the sheet opens
    useEffect(() => {
        if (!visible) return;
        sheetHeight.setValue(0);
        snapTo(snaps.current.half);
    }, [visible]);

    const panHandlers = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
            onPanResponderMove: (_, g) => {
                // Dragging up (negative dy) makes the sheet taller
                const next = currentHeight.current - g.dy;
                sheetHeight.setValue(Math.max(0, Math.min(snaps.current.full, next)));
            },
            onPanResponderRelease: (_, g) => {
                const { half, full } = snaps.current;
                const projected = currentHeight.current - g.dy - g.vy * FLICK;
                if (projected < half * 0.6) return close();
                snapTo(projected > (half + full) / 2 ? full : half);
            },
        })
    ).current.panHandlers;

    return {
        sheetHeight,
        panHandlers,
        expand: () => snapTo(snaps.current.full),
        close,
    };
}
