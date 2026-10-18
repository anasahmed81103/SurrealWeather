import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useCityWeather from "../hooks/useCityWeather";
import useMinuteTick from "../hooks/useMinuteTick";
import { cityNow, deviceOffsetSeconds, getDayPhase, parseCityTime } from "../utils/time";

import WeatherScene from "../components/scene/WeatherScene";
import CityHeader from "../components/CityHeader";
import CityPicker from "../components/CityPicker";
import CurrentWeather from "../components/CurrentWeather";
import HourlyForecast from "../components/HourlyForecast";
import DailyForecast from "../components/DailyForecast";
import WeatherDetails from "../components/WeatherDetails";
import StatusMessage from "../components/StatusMessage";

/* ------------------------------------------------------------------
 * WeatherScreen — the main (and only) screen. Layout only:
 *
 *   [animated WeatherScene, full screen, behind everything]
 *   CityHeader          (right under the status bar)
 *   ScrollView          (pull down to refresh)
 *     CurrentWeather → HourlyForecast → DailyForecast → WeatherDetails
 *   CityPicker          (bottom sheet)
 *
 * All data/state comes from useCityWeather().
 * ------------------------------------------------------------------ */

// DEV ONLY: preview any scene regardless of the real weather, e.g.
//   { code: 95, phase: "night" }   (codes: utils/weatherCodes.js)
// Keep this null in normal use.
const DEBUG_SCENE = null;

export default function WeatherScreen() {
    const insets = useSafeAreaInsets();
    const nowMs = useMinuteTick();
    const [pickerOpen, setPickerOpen] = useState(false);
    const { city, isHome, cities, weather, status, refreshing, refresh, selectCity, removeCity } =
        useCityWeather();

    const ready = status === "ready" && weather;

    // City-local time drives the clock and the sky (dawn / day / dusk / night)
    const localTime = cityNow(weather?.utc_offset_seconds ?? deviceOffsetSeconds(), nowMs);
    const phase = weather
        ? getDayPhase(localTime, parseCityTime(weather.daily.sunrise[0]), parseCityTime(weather.daily.sunset[0]))
        : "night";
    const sceneCode = weather?.current.weather_code ?? 3; // overcast while nothing is loaded

    return (
        <View style={styles.screen}>
            <WeatherScene code={DEBUG_SCENE?.code ?? sceneCode} phase={DEBUG_SCENE?.phase ?? phase} />

            <CityHeader
                cityName={city?.name ?? "Locating…"}
                isHome={isHome}
                localTime={localTime}
                onPress={() => setPickerOpen(true)}
            />

            {ready ? (
                <ScrollView
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#fff" />
                    }
                >
                    <CurrentWeather current={weather.current} daily={weather.daily} />
                    <HourlyForecast hourly={weather.hourly} />
                    <DailyForecast daily={weather.daily} />
                    <WeatherDetails current={weather.current} daily={weather.daily} />
                    {/* Attribution required by Open-Meteo's free licence (CC BY 4.0) */}
                    <Text style={styles.credit}>Weather data by Open-Meteo.com</Text>
                </ScrollView>
            ) : (
                <StatusMessage status={status} onRetry={refresh} />
            )}

            <CityPicker
                visible={pickerOpen}
                cities={cities}
                currentCity={city?.name}
                onClose={() => setPickerOpen(false)}
                onSelect={selectCity}
                onRemove={removeCity}
            />

            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#0B1838" },
    content: { paddingHorizontal: 16 },
    credit: {
        marginTop: 6,
        textAlign: "center",
        fontSize: 12,
        color: "rgba(255,255,255,0.5)",
    },
});
