import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getWeatherIcon } from "../utils/weatherCodes";

/* WeatherIcon — the right icon + colour for a WMO weather code. */
export default function WeatherIcon({ code, isDay = true, size = 24 }) {
    const { name, color } = getWeatherIcon(code, isDay);
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
}
