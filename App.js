import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Outfit_200ExtraLight } from "@expo-google-fonts/outfit/200ExtraLight";
import { Outfit_300Light } from "@expo-google-fonts/outfit/300Light";
import { Outfit_400Regular } from "@expo-google-fonts/outfit/400Regular";
import { Outfit_500Medium } from "@expo-google-fonts/outfit/500Medium";
import { Outfit_600SemiBold } from "@expo-google-fonts/outfit/600SemiBold";
import WeatherScreen from "./screens/WeatherScreen";

/* ------------------------------------------------------------------
 * App — app-wide setup only:
 *   - loads the fonts (splash screen stays up until they're ready,
 *     so text never flickers between fonts)
 *   - safe-area provider
 * Everything else lives in screens/WeatherScreen.js (layout) and
 * hooks/useCityWeather.js (state + data).
 * ------------------------------------------------------------------ */

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
    const [fontsLoaded, fontError] = useFonts({
        Outfit_200ExtraLight,
        Outfit_300Light,
        Outfit_400Regular,
        Outfit_500Medium,
        Outfit_600SemiBold,
    });
    const ready = fontsLoaded || fontError; // on error, carry on with the system font

    useEffect(() => {
        if (fontError) console.warn("[fonts] failed to load:", fontError.message);
        if (ready) SplashScreen.hideAsync().catch(() => {});
    }, [ready]);

    if (!ready) return null;

    return (
        <SafeAreaProvider>
            <WeatherScreen />
        </SafeAreaProvider>
    );
}
