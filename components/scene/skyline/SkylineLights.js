import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import useLoop from "../useLoop";

/* ------------------------------------------------------------------
 * SkylineLights — the city after dark, on top of the silhouette:
 *   glow      floodlit landmark (static, `flood` = how bright: on fully only at night)
 *   windows   two groups that shimmer gently, out of step
 *   sparkles  quick flickers in short bursts (the Eiffel Tower's show)
 *   beacons   slow blinking lights on the tallest tips
 *
 * Every light is drawn once; only the wrapping Animated.Views change
 * opacity (native driver). `halo` = wet air: lights get a soft blur ring.
 * ------------------------------------------------------------------ */

const WARM = "#FFD28A";
const COOL = "#CFE2FF";

/** Children fade between `low` and 1 on a loop */
function Pulse({ duration, offset = 0, low, children, curve }) {
    const p = useLoop(duration, offset);
    const opacity = curve
        ? p.interpolate(curve)
        : p.interpolate({ inputRange: [0, 0.5, 1], outputRange: [low, 1, low] });
    return <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>{children}</Animated.View>;
}

// A sharp flash early in the loop, dark the rest of the time
const FLICKER = { inputRange: [0, 0.08, 0.2, 1], outputRange: [0.1, 1, 0.1, 0.1] };
// Sparkle for ~20% of a 30 s loop, then rest (so it feels like a show, not noise)
const BURSTS = { inputRange: [0, 0.04, 0.18, 0.24, 1], outputRange: [0, 1, 1, 0, 0] };
const BLINK = { inputRange: [0, 0.1, 0.3, 1], outputRange: [0.15, 1, 0.15, 0.15] };

function WindowGroup({ windows, halo, svgProps }) {
    return (
        <Svg {...svgProps}>
            {windows.map((w, i) => (
                <React.Fragment key={i}>
                    {halo && <Circle cx={w.x + 1} cy={w.y + 1.5} r={4} fill={w.warm ? WARM : COOL} opacity={0.14} />}
                    <Rect x={w.x} y={w.y} width={2} height={3} fill={w.warm ? WARM : COOL} />
                </React.Fragment>
            ))}
        </Svg>
    );
}

export default function SkylineLights({ art, strength, flood, halo, svgProps }) {
    const windows = art.windows || [];
    const sparkles = art.sparkles || [];
    const third = (k) => sparkles.filter((_, i) => i % 3 === k);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {art.glow && flood > 0 && (
                <Svg {...svgProps}>
                    <Path d={art.glow.d} fill={art.glow.color} opacity={art.glow.opacity * flood} />
                </Svg>
            )}
            <View style={[StyleSheet.absoluteFill, { opacity: strength }]}>
                <Pulse duration={7000} low={0.7}>
                    <WindowGroup windows={windows.filter((_, i) => i % 2 === 0)} halo={halo} svgProps={svgProps} />
                </Pulse>
                <Pulse duration={9500} offset={0.5} low={0.7}>
                    <WindowGroup windows={windows.filter((_, i) => i % 2 === 1)} halo={halo} svgProps={svgProps} />
                </Pulse>

                {sparkles.length > 0 && (
                    <Pulse duration={30000} curve={BURSTS}>
                        {[0, 1, 2].map((k) => (
                            <Pulse key={k} duration={900 + k * 260} offset={k * 0.33} curve={FLICKER}>
                                <Svg {...svgProps}>
                                    {third(k).map((s, i) => (
                                        <Circle key={i} cx={s.x} cy={s.y} r={1.3} fill="#FFFFFF" />
                                    ))}
                                </Svg>
                            </Pulse>
                        ))}
                    </Pulse>
                )}

                {art.beacons?.length > 0 && (
                    <Pulse duration={2400} curve={BLINK}>
                        <Svg {...svgProps}>
                            {art.beacons.map((b, i) => (
                                <React.Fragment key={i}>
                                    <Circle cx={b.x} cy={b.y} r={5} fill={b.color} opacity={0.25} />
                                    <Circle cx={b.x} cy={b.y} r={1.6} fill={b.color} />
                                </React.Fragment>
                            ))}
                        </Svg>
                    </Pulse>
                )}
            </View>
        </View>
    );
}
