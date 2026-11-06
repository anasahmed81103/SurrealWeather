import React from "react";
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop } from "react-native-svg";

/* ------------------------------------------------------------------
 * FogIcon — custom fog icon (the stock glyph looked flat):
 * a sun (or thin moon) peeking behind a soft cloud, with three
 * mist lines underneath that fade out as they go down.
 * Drawn on a 24 × 24 grid like the other icons, scaled by `size`.
 * ------------------------------------------------------------------ */

const MIST = [
    // [x1, x2, y, opacity]
    [3.5, 16.5, 17.6, 0.95],
    [7.5, 20.5, 20.4, 0.7],
    [5, 13.5, 23, 0.45],
];

export default function FogIcon({ size = 24, isDay = true }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Defs>
                <LinearGradient id="fogIconCloud" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#FFFFFF" />
                    <Stop offset="1" stopColor="#CBD5E1" />
                </LinearGradient>
            </Defs>

            {isDay ? (
                <G>
                    <Circle cx="16.2" cy="6.6" r="5.2" fill="#FFD54F" opacity="0.25" />
                    <Circle cx="16.2" cy="6.6" r="3.8" fill="#FFD54F" />
                </G>
            ) : (
                // thin crescent: outer half-circle, back along a flatter inner curve
                <Path d="M16.5 2.6 A4 4 0 0 0 16.5 10.6 A1.7 4 0 0 1 16.5 2.6 Z" fill="#E8ECF8" />
            )}

            <G fill="url(#fogIconCloud)">
                <Circle cx="8.6" cy="11" r="3.6" />
                <Circle cx="12.6" cy="9.4" r="4.4" />
                <Circle cx="16.6" cy="12" r="2.8" />
                <Rect x="5" y="11" width="14.4" height="3.8" rx="1.9" />
            </G>

            {MIST.map(([x1, x2, y, opacity]) => (
                <Line key={y} x1={x1} y1={y} x2={x2} y2={y} stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity={opacity} />
            ))}
        </Svg>
    );
}
