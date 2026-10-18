import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import WeatherScreen from "./screens/WeatherScreen";

/* ------------------------------------------------------------------
 * App — app-wide providers only. Everything else lives in:
 *   screens/WeatherScreen.js  (layout)
 *   hooks/useCityWeather.js   (state + data)
 * ------------------------------------------------------------------ */

export default function App() {
    return (
        <SafeAreaProvider>
            <WeatherScreen />
        </SafeAreaProvider>
    );
}
