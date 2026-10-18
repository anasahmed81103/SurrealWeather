import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/* ------------------------------------------------------------------
 * CityPicker — bottom sheet to switch, add and remove cities.
 * The search box sits at the top so the keyboard never covers it.
 * Pure UI: the actual work is done by onSelect / onRemove (from
 * useCityWeather).
 * ------------------------------------------------------------------ */

export default function CityPicker({ visible, cities, currentCity, onClose, onSelect, onRemove }) {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const close = () => {
        setQuery("");
        setError("");
        onClose();
    };

    // Used for both tapping a saved city and searching a new one
    const pick = async (name) => {
        if (!name.trim() || busy) return;
        setBusy(true);
        setError("");
        const found = await onSelect(name);
        setBusy(false);
        if (found) close();
        else setError(`Couldn't find "${name.trim()}". Check the spelling and try again.`);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
            <View style={styles.backdrop}>
                {/* Tap outside the sheet to close */}
                <Pressable style={StyleSheet.absoluteFill} onPress={close} />

                <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>Cities</Text>

                    <View style={styles.search}>
                        <MaterialCommunityIcons name="magnify" size={20} color="rgba(255,255,255,0.6)" />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Add a city…"
                            placeholderTextColor="rgba(255,255,255,0.45)"
                            style={styles.input}
                            returnKeyType="search"
                            onSubmitEditing={() => pick(query)}
                        />
                        {busy ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <TouchableOpacity onPress={() => pick(query)} hitSlop={10}>
                                <MaterialCommunityIcons name="plus-circle" size={26} color="#7DD3FC" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {!!error && <Text style={styles.error}>{error}</Text>}

                    <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                        {cities.map((c) => {
                            const active = c.name === currentCity;
                            return (
                                <View key={c.name} style={[styles.row, active && styles.activeRow]}>
                                    <TouchableOpacity style={styles.rowMain} onPress={() => pick(c.name)}>
                                        <MaterialCommunityIcons
                                            name={c.isDefault ? "home-map-marker" : "map-marker-outline"}
                                            size={20}
                                            color={active ? "#7DD3FC" : "rgba(255,255,255,0.7)"}
                                        />
                                        <Text style={[styles.cityName, active && styles.activeText]}>{c.name}</Text>
                                    </TouchableOpacity>

                                    {/* Home city can't be removed */}
                                    {!c.isDefault && (
                                        <TouchableOpacity onPress={() => onRemove(c.name)} hitSlop={10}>
                                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#F87171" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
    sheet: {
        maxHeight: "80%",
        backgroundColor: "#111a2e",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    handle: {
        alignSelf: "center",
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.25)",
        marginBottom: 12,
    },
    title: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 14 },
    search: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 48,
    },
    input: { flex: 1, marginHorizontal: 8, fontSize: 16, color: "#fff" },
    error: { marginTop: 8, fontSize: 13, color: "#FCA5A5" },
    list: { marginTop: 12 },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    activeRow: { backgroundColor: "rgba(125,211,252,0.1)" },
    rowMain: { flex: 1, flexDirection: "row", alignItems: "center", paddingVertical: 14 },
    cityName: { marginLeft: 10, fontSize: 17, color: "#fff" },
    activeText: { fontWeight: "600", color: "#7DD3FC" },
});
