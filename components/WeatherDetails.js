import React from "react";
import { StyleSheet, View } from "react-native";
import SunArcCard from "./details/SunArcCard";
import WindCard from "./details/WindCard";
import GaugeCard from "./details/GaugeCard";
import MoonCard from "./details/MoonCard";

/* ------------------------------------------------------------------
 * WeatherDetails — the detail section:
 *   [ Sun arc (full width) ]
 *   [ Wind     ][ Humidity ]
 *   [ UV index ][ Moon     ]
 * ------------------------------------------------------------------ */

function uvLevel(uv) {
    if (uv < 3) return "Low";
    if (uv < 6) return "Moderate";
    if (uv < 8) return "High";
    if (uv < 11) return "Very high";
    return "Extreme";
}

function humidityLevel(h) {
    if (h < 30) return "Dry";
    if (h < 60) return "Comfortable";
    if (h < 80) return "Humid";
    return "Very humid";
}

export default function WeatherDetails({ weather, localTime, southern }) {
    const { current, daily } = weather;
    const uv = daily.uv_index_max?.[0] ?? 0;
    const humidity = current.relative_humidity_2m ?? 0;

    return (
        <View>
            <SunArcCard daily={daily} localTime={localTime} />

            <View style={styles.grid}>
                <WindCard style={styles.tile} speed={current.wind_speed_10m} direction={current.wind_direction_10m ?? 0} />
                <GaugeCard
                    style={styles.tile}
                    title="Humidity"
                    icon="water-percent"
                    value={humidity}
                    unit="%"
                    note={humidityLevel(humidity)}
                    fraction={humidity / 100}
                    scale={["#FCD34D", "#7DD3FC", "#3B82F6"]}
                />
                <GaugeCard
                    style={styles.tile}
                    title="UV index"
                    icon="sun-wireless-outline"
                    value={Math.round(uv)}
                    note={uvLevel(uv)}
                    fraction={uv / 11}
                    scale={["#4ADE80", "#FACC15", "#FB923C", "#EF4444", "#A855F7"]}
                />
                <MoonCard style={styles.tile} date={new Date()} southern={southern} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    tile: { width: "48.5%", minHeight: 124 },
});
