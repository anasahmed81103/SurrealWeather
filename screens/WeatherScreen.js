import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, RefreshControl, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import useCityWeather from "../hooks/useCityWeather";
import useMinuteTick from "../hooks/useMinuteTick";
import useSoundSetting from "../hooks/useSoundSetting";
import useAmbientSound from "../hooks/useAmbientSound";
import { cityNow, deviceOffsetSeconds, getDayPhase, parseCityTime } from "../utils/time";
import { getAmbience } from "../utils/ambience";
import { getMoonPhase } from "../utils/moonPhase";

import WeatherScene from "../components/scene/WeatherScene";
import CityHeader from "../components/CityHeader";
import CityPicker from "../components/CityPicker";
import CurrentWeather from "../components/CurrentWeather";
import HourlyChart from "../components/HourlyChart";
import DailyForecast from "../components/DailyForecast";
import WeatherDetails from "../components/WeatherDetails";
import StatusMessage from "../components/StatusMessage";
import FadeIn from "../components/FadeIn";
import { colors, fonts } from "../components/theme";

/* ------------------------------------------------------------------
 * WeatherScreen — the main (and only) screen. Layout only:
 *
 *   [animated WeatherScene, full screen, drifts up slightly on scroll]
 *   CityHeader          (right under the status bar)
 *   ScrollView          (pull down to refresh)
 *     CurrentWeather → HourlyChart → DailyForecast → WeatherDetails
 *     (cards fade in one after another)
 *   CityPicker          (bottom sheet)
 *
 * All data/state comes from useCityWeather().
 * ------------------------------------------------------------------ */

// DEV ONLY: preview any scene regardless of the real weather, e.g.
//   { code: 95, phase: "night" }   (codes: utils/weatherCodes.js)
// Keep this null in normal use.
const DEBUG_SCENE = null;

const STAGGER_MS = 110; // delay between each card's entrance
const PARALLAX = 80; // how far (px) the sky drifts while scrolling

export default function WeatherScreen() {
    const insets = useSafeAreaInsets();
    const nowMs = useMinuteTick();
    const [pickerOpen, setPickerOpen] = useState(false);
    const { city, isHome, cities, weather, status, refreshing, refresh, selectCity, addPlace, removeCity, makeHome } =
        useCityWeather();

    const ready = status === "ready" && weather;

    // City-local time drives the clock and the sky (dawn / day / dusk / night)
    const localTime = cityNow(weather?.utc_offset_seconds ?? deviceOffsetSeconds(), nowMs);
    const phase = weather
        ? getDayPhase(localTime, parseCityTime(weather.daily.sunrise[0]), parseCityTime(weather.daily.sunset[0]))
        : "night";
    const sceneCode = DEBUG_SCENE?.code ?? weather?.current.weather_code ?? 3; // overcast while nothing is loaded
    const scenePhase = DEBUG_SCENE?.phase ?? phase;
    const southern = (weather?.latitude ?? 0) < 0;
    const moonPhase = useMemo(() => getMoonPhase(new Date(nowMs)), [Math.floor(nowMs / 3600000)]); // hourly is plenty

    // A short ambient "sound moment" each time new weather loads
    // (app open, city change, pull-to-refresh) — `weather` is the trigger
    const [soundOn, toggleSound] = useSoundSetting();
    useAmbientSound(ready ? getAmbience(sceneCode, scenePhase) : null, soundOn, ready ? weather : null);

    // Scroll position drives the hero fade and the sky parallax (all on the native thread)
    const scrollY = useRef(new Animated.Value(0)).current;
    const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true });
    const skyShift = scrollY.interpolate({ inputRange: [0, 600], outputRange: [0, -PARALLAX], extrapolate: "clamp" });
    useEffect(() => scrollY.setValue(0), [city?.name]); // new city → content remounts at the top

    // Small haptic "ticks" make actions feel physical
    const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const onRefresh = () => { tap(); refresh(); };
    const onToggleSound = () => { tap(); toggleSound(); };
    const openPicker = () => { tap(); setPickerOpen(true); };

    return (
        <View style={styles.screen}>
            <Animated.View style={[styles.sky, { transform: [{ translateY: skyShift }] }]}>
                <WeatherScene
                    code={sceneCode}
                    phase={scenePhase}
                    wind={weather?.current.wind_speed_10m}
                    moonPhase={moonPhase}
                    southern={southern}
                />
            </Animated.View>

            <CityHeader
                cityName={city?.name ?? "Locating…"}
                isHome={isHome}
                localTime={localTime}
                onPress={openPicker}
                soundOn={soundOn}
                onToggleSound={onToggleSound}
            />

            {ready ? (
                <Animated.ScrollView
                    key={city?.name} // remount per city → fresh entrance animation, scrolled to top
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
                    showsVerticalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                >
                    <FadeIn delay={0}>
                        <CurrentWeather weather={weather} scrollY={scrollY} />
                    </FadeIn>
                    <FadeIn delay={STAGGER_MS * 1}>
                        <HourlyChart hourly={weather.hourly} />
                    </FadeIn>
                    <FadeIn delay={STAGGER_MS * 2}>
                        <DailyForecast daily={weather.daily} currentTemp={weather.current.temperature_2m} />
                    </FadeIn>
                    <FadeIn delay={STAGGER_MS * 3}>
                        <WeatherDetails weather={weather} localTime={localTime} southern={southern} />
                    </FadeIn>

                    {/* Attribution required by the free licences (CC BY 4.0) */}
                    <Text style={styles.credit}>Weather data by Open-Meteo.com · City data by GeoNames</Text>
                </Animated.ScrollView>
            ) : (
                <StatusMessage status={status} onRetry={onRefresh} />
            )}

            <CityPicker
                visible={pickerOpen}
                cities={cities}
                currentCity={city?.name}
                onClose={() => setPickerOpen(false)}
                onSelect={selectCity}
                onAddPlace={addPlace}
                onRemove={removeCity}
                onMakeHome={makeHome}
            />

            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#0B1838" },
    // Taller than the screen so the parallax drift never shows an edge
    sky: { position: "absolute", top: 0, left: 0, right: 0, bottom: -PARALLAX },
    content: { paddingHorizontal: 16 },
    credit: {
        marginTop: 8,
        textAlign: "center",
        fontFamily: fonts.light,
        fontSize: 12,
        color: colors.textFaint,
    },
});
