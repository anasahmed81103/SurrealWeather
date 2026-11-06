import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getWeatherIcon, getWeatherInfo } from "../utils/weatherCodes";
import FogIcon from "./FogIcon";

/* WeatherIcon — the right icon + colour for a WMO weather code.
 * Fog gets a hand-drawn SVG icon; everything else uses the icon font. */
export default function WeatherIcon({ code, isDay = true, size = 24 }) {
    if (getWeatherInfo(code).kind === "fog") return <FogIcon size={size} isDay={isDay} />;

    const { name, color } = getWeatherIcon(code, isDay);
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
}
