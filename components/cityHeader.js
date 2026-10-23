import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { fonts } from "./theme";
import { formatClock, formatDate } from "../utils/time";

/* ------------------------------------------------------------------
 * CityHeader — city name (tap to open the city picker), the city's
 * local date + time, and a sound on/off button on the right.
 * Sits right under the phone's status bar using safe-area insets,
 * transparent so the sky shows through.
 * ------------------------------------------------------------------ */

export default function CityHeader({ cityName, isHome, localTime, onPress, soundOn, onToggleSound }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
            <View style={styles.left}>
                <TouchableOpacity style={styles.cityButton} onPress={onPress} activeOpacity={0.7}>
                    <MaterialCommunityIcons name={isHome ? "home-map-marker" : "map-marker"} size={20} color="#fff" />
                    <Text style={styles.city} numberOfLines={1}>{cityName}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={22} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>

                <Text style={styles.date}>
                    {formatDate(localTime)}  ·  {formatClock(localTime)}
                </Text>
            </View>

            <TouchableOpacity style={styles.soundButton} onPress={onToggleSound} hitSlop={10} activeOpacity={0.7}>
                <MaterialCommunityIcons
                    name={soundOn ? "volume-high" : "volume-off"}
                    size={22}
                    color={soundOn ? "#fff" : "rgba(255,255,255,0.55)"}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    left: { flex: 1 },
    cityButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingVertical: 4,
    },
    city: {
        marginHorizontal: 6,
        fontFamily: fonts.medium,
        fontSize: 25,
        color: "#fff",
        maxWidth: "80%",
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    date: {
        marginTop: 2,
        marginLeft: 26,
        fontFamily: fonts.light,
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
    },
    soundButton: {
        marginTop: 4,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.12)",
    },
});
