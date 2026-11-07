import React, { useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { getDrawing } from "./index";
import { skylineColors, rgba } from "./skylineColors";
import SkylineLights from "./SkylineLights";

/* ------------------------------------------------------------------
 * Skyline — the city's landmark on the horizon, lit by the weather.
 *
 * Back to front:
 *   far layer   paler distant rooftops / hills (looks far away)
 *   highlight   pale parts that catch the light (Fuji's snow, white marble, sails)
 *   rim         warm edge on the tops at sunrise / sunset
 *               (the same shape, nudged towards the sun, peeking out)
 *   near layer  the landmark + buildings, coloured from the sky
 *   lights      windows, floodlights, beacons (evening and night)
 *   mist        soft haze over its feet in rain / snow
 *
 * Shapes are drawn once; only the lights animate (opacity, native driver).
 * All drawings use a 400 × 300 box, scaled to the screen width and
 * pinned to the bottom (`bottom` lifts it above the parallax overflow).
 * ------------------------------------------------------------------ */

const BOX_W = 400;
const BOX_H = 300;

export default function Skyline({ landmark, kind, phase, bottom = 0 }) {
    // landmark = { id, seed } from pickLandmark()
    const { width, height: screenH } = useWindowDimensions();
    const art = getDrawing(landmark);
    const c = useMemo(() => skylineColors(kind, phase), [kind, phase]);

    // Full width; on wide/short screens it's capped and the sides are cropped
    const height = Math.min((width * BOX_H) / BOX_W, screenH * 0.42);
    const lit = art.highlight?.layer;
    const highlight = art.highlight && (
        <Path d={art.highlight.d} fill={art.highlight.color} opacity={art.highlight.opacity * c.highlight} />
    );
    const svgProps = { width, height, viewBox: `0 0 ${BOX_W} ${BOX_H}`, preserveAspectRatio: "xMidYMax slice" };

    return (
        <View style={[styles.box, { bottom, height }]} pointerEvents="none">
            <Svg {...svgProps}>
                <Defs>
                    <SvgGradient id="skylineNear" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={c.nearTop} />
                        <Stop offset="1" stopColor={c.nearBottom} />
                    </SvgGradient>
                </Defs>
                <Path d={art.far} fill={c.far} />
                {lit === "far" && highlight}
                {c.rim && <Path d={art.near} fill={c.rim} opacity={0.85} transform="translate(1.5,-1.8)" />}
                <Path d={art.near} fill="url(#skylineNear)" />
                {lit === "near" && highlight}
            </Svg>

            {c.lights > 0 && <SkylineLights art={art} strength={c.lights} flood={c.flood} halo={c.halo} svgProps={svgProps} />}

            {c.mist && (
                <LinearGradient
                    colors={[rgba(c.mist.color, 0), rgba(c.mist.color, c.mist.alpha)]}
                    locations={[0.35, 1]}
                    style={StyleSheet.absoluteFill}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    box: { position: "absolute", left: 0, right: 0 },
});
