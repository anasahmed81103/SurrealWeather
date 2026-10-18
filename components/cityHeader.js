import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatClock, formatDate } from "../utils/time";

/* ------------------------------------------------------------------
 * CityHeader — city name (tap to open the city picker) and the city's
 * local date + time. Sits right under the phone's status bar using
 * safe-area insets, transparent so the sky shows through.
 * ------------------------------------------------------------------ */

export default function CityHeader({ cityName, isHome, localTime, onPress }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
            <TouchableOpacity style={styles.cityButton} onPress={onPress} activeOpacity={0.7}>
                <MaterialCommunityIcons name={isHome ? "home-map-marker" : "map-marker"} size={20} color="#fff" />
                <Text style={styles.city} numberOfLines={1}>{cityName}</Text>
                <MaterialCommunityIcons name="chevron-down" size={22} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>

            <Text style={styles.date}>
                {formatDate(localTime)}  ·  {formatClock(localTime)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    cityButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingVertical: 4,
    },
    city: {
        marginHorizontal: 6,
        fontSize: 24,
        fontWeight: "600",
        color: "#fff",
        maxWidth: "80%",
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    date: {
        marginTop: 2,
        marginLeft: 26,
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
    },
});
