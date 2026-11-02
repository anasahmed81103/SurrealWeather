import React, { useMemo } from "react";
import { Circle, G, Path } from "react-native-svg";
import GlassCard from "../GlassCard";
import SkyArc from "./SkyArc";
import { getMoonPass } from "../../utils/moonTimes";
import { getMoonPhase, getMoonPath } from "../../utils/moonPhase";
import { formatClock, formatDuration } from "../../utils/time";
import { colors } from "../theme";

/* ------------------------------------------------------------------
 * MoonArcCard — the moon's trip across the sky, like the Sun card,
 * with the moon drawn in its real phase where it is right now.
 *
 * Unlike the sun, the moon's trip often crosses midnight (rises in
 * the evening, sets next morning), so times get a "Yesterday" /
 * "Tomorrow" note. Rise/set are calculated on the phone (utils/moonTimes).
 * ------------------------------------------------------------------ */

const DAY_MS = 86400000;
const R = 8; // moon radius on the arc

export default function MoonArcCard({ lat, lng, utcOffsetSeconds, localTime, southern }) {
    const offsetMs = utcOffsetSeconds * 1000;
    const nowMs = localTime.getTime() - offsetMs; // city time → real UTC moment

    // Recalculated once a minute (localTime ticks), ~500 tiny samples: well under 1 ms
    const { up, rise, set } = useMemo(() => getMoonPass(lat, lng, nowMs), [lat, lng, nowMs]);
    const phase = getMoonPhase(new Date(nowMs));

    /** real ms → "10:42 PM", plus "Yesterday" / "Tomorrow" when it's not today */
    const describe = (ms, label) => {
        if (ms == null) return { label, time: "—" };
        const city = new Date(ms + offsetMs);
        const dayDiff = Math.floor(city / DAY_MS) - Math.floor(localTime / DAY_MS);
        const note = dayDiff < 0 ? "Yesterday" : dayDiff > 0 ? "Tomorrow" : null;
        return { label, time: formatClock(city), note };
    };

    // Where on the arc: share of the trip already done (middle if a time is missing)
    const progress = !up ? 0 : rise && set ? (nowMs - rise) / (set - rise) : 0.5;

    const status = up
        ? set ? `Moonset in ${formatDuration(set - nowMs)}` : "Up all day"
        : rise ? `Moonrise in ${formatDuration(rise - nowMs)}` : "Below horizon today";

    // Glow + dark disc + lit part in today's phase (mirrored south of the equator)
    const moon = (x, y) => (
        <>
            <Circle cx={x} cy={y} r="14" fill={colors.moon} opacity="0.2" />
            <Circle cx={x} cy={y} r={R} fill="rgba(255,255,255,0.15)" />
            <G transform={southern ? `translate(${x + R} ${y - R}) scale(-1 1)` : `translate(${x - R} ${y - R})`}>
                <Path d={getMoonPath(phase, R)} fill="#F2EFE3" />
            </G>
        </>
    );

    return (
        <GlassCard title="Moon rise & set" icon="moon-waxing-crescent">
            <SkyArc
                progress={progress}
                color={colors.moon}
                marker={up ? moon : null}
                left={describe(rise, "Moonrise")}
                right={describe(set, "Moonset")}
                status={status}
            />
        </GlassCard>
    );
}
