import React from "react";
import { Circle } from "react-native-svg";
import GlassCard from "../GlassCard";
import SkyArc from "./SkyArc";
import { formatClock, formatDuration, parseCityTime } from "../../utils/time";
import { colors } from "../theme";

/* ------------------------------------------------------------------
 * SunArcCard — the sun's path today as an arc from sunrise to sunset,
 * with the sun drawn where it is right now (in the city's local time).
 * ------------------------------------------------------------------ */

export default function SunArcCard({ daily, localTime }) {
    const sunrise = parseCityTime(daily.sunrise[0]);
    const sunset = parseCityTime(daily.sunset[0]);
    const progress = (localTime - sunrise) / (sunset - sunrise);
    const sunUp = progress > 0 && progress < 1;

    const status = sunUp
        ? `Sunset in ${formatDuration(sunset - localTime)}`
        : localTime < sunrise
            ? `Sunrise in ${formatDuration(sunrise - localTime)}`
            : `Daylight today ${formatDuration(sunset - sunrise)}`;

    const sun = (x, y) => (
        <>
            <Circle cx={x} cy={y} r="14" fill={colors.warm} opacity="0.25" />
            <Circle cx={x} cy={y} r="7" fill="#FFE47A" />
        </>
    );

    return (
        <GlassCard title="Sun" icon="weather-sunset">
            <SkyArc
                progress={progress}
                color={colors.warm}
                marker={sunUp ? sun : null}
                left={{ label: "Sunrise", time: formatClock(sunrise) }}
                right={{ label: "Sunset", time: formatClock(sunset) }}
                status={status}
            />
        </GlassCard>
    );
}
