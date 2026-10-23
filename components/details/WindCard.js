import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";
import GlassCard from "../GlassCard";
import { colors, fonts } from "../theme";

/* ------------------------------------------------------------------
 * WindCard — speed, a plain-words description and a compass whose
 * arrow points the way the wind is blowing.
 * ------------------------------------------------------------------ */

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

/** 0–360° → "NW" etc. */
const toCompass = (deg) => DIRECTIONS[Math.round(deg / 45) % 8];

function describe(kmh) {
    if (kmh < 6) return "Calm";
    if (kmh < 20) return "Light breeze";
    if (kmh < 39) return "Breezy";
    if (kmh < 62) return "Strong wind";
    return "Gale";
}

function Compass({ direction }) {
    // Weather data gives where wind comes FROM; the arrow shows where it goes
    const rotation = (direction + 180) % 360;

    return (
        <Svg width={58} height={58} viewBox="0 0 60 60">
            <Circle cx="30" cy="30" r="27" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
            <SvgText x="30" y="11" fontSize="8" fill={colors.textFaint} textAnchor="middle">N</SvgText>
            <G transform={`rotate(${rotation} 30 30)`}>
                <Path d="M30 12 L36 30 L30 26 L24 30 Z" fill={colors.accent} />
                <Path d="M30 48 L30 30" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" />
            </G>
        </Svg>
    );
}

export default function WindCard({ speed = 0, direction = 0, style }) {
    return (
        <GlassCard title="Wind" icon="weather-windy" style={style}>
            <View style={styles.row}>
                <View style={styles.texts}>
                    <Text style={styles.value}>
                        {Math.round(speed)}
                        <Text style={styles.unit}> km/h</Text>
                    </Text>
                    <Text style={styles.note}>{describe(speed)}</Text>
                    <Text style={styles.note}>From {toCompass(direction)}</Text>
                </View>
                <Compass direction={direction} />
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center" },
    texts: { flex: 1 },
    value: { fontFamily: fonts.regular, fontSize: 26, color: colors.text },
    unit: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSoft },
    note: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.textSoft },
});
