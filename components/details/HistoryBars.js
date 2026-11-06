import React from "react";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";
import { colors, fonts } from "../theme";

/* ------------------------------------------------------------------
 * HistoryBars — this date's high in each of the past years, plus today's
 * forecast as the last (highlighted) bar, and a dashed "normal" line.
 * Static SVG: drawn once, nothing animates.
 * ------------------------------------------------------------------ */

const W = 300;
const TOP = 16; // room for the value labels
const BASE = 88; // bottom of the bars
const MIN_BAR = 6; // even the coolest year gets a visible stub

export default function HistoryBars({ years, todayHigh, normalHigh, todayColor }) {
    const bars = [
        ...years.map((e) => ({ key: e.year, label: `'${String(e.year).slice(2)}`, value: e.high })),
        { key: "today", label: "Today", value: todayHigh, today: true },
    ];

    // Scale from a bit below the coolest bar to the warmest, so differences show
    const values = bars.map((b) => b.value).concat(normalHigh);
    const lo = Math.min(...values) - 2;
    const hi = Math.max(...values);
    const yOf = (v) => BASE - MIN_BAR - ((v - lo) / (hi - lo || 1)) * (BASE - TOP - MIN_BAR);

    const slot = W / bars.length;
    const barW = slot * 0.56;
    const normalY = yOf(normalHigh);

    return (
        <Svg width="100%" height={104} viewBox={`0 0 ${W} 104`}>
            {bars.map((b, i) => {
                const x = i * slot + (slot - barW) / 2;
                const y = yOf(b.value);
                const cx = x + barW / 2;
                return (
                    <React.Fragment key={b.key}>
                        <Rect x={x} y={y} width={barW} height={BASE - y} rx="3"
                            fill={b.today ? todayColor : "rgba(255,255,255,0.26)"} />
                        <SvgText x={cx} y={y - 4} fontSize="9" textAnchor="middle" fontFamily={fonts.medium}
                            fill={b.today ? colors.text : colors.textSoft}>
                            {Math.round(b.value)}°
                        </SvgText>
                        <SvgText x={cx} y={101} fontSize="8.5" textAnchor="middle" fontFamily={fonts.regular}
                            fill={b.today ? colors.text : colors.textFaint}>
                            {b.label}
                        </SvgText>
                    </React.Fragment>
                );
            })}
            {/* the normal for this date, across the whole chart */}
            <Line x1="0" y1={normalY} x2={W} y2={normalY} stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeDasharray="3 4" />
        </Svg>
    );
}
