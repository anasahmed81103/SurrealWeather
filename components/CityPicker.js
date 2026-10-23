import React, { useState } from "react";
import {
    ActivityIndicator,
    Animated,
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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { fonts } from "./theme";
import useDraggableSheet from "../hooks/useDraggableSheet";
import useCitySuggestions from "../hooks/useCitySuggestions";
import CityRow from "./CityRow";

/* ------------------------------------------------------------------
 * CityPicker — draggable bottom sheet to switch, add and remove cities.
 *
 *  - Drag the handle/title up for more room, down to close.
 *  - Empty search box → your saved cities (🏠 button sets the home city).
 *  - Typing → world-city suggestions (tap one to add it).
 *
 * Pure UI: the real work is done by onSelect / onAddPlace / onRemove
 * (from useCityWeather).
 * ------------------------------------------------------------------ */

export default function CityPicker({ visible, cities, currentCity, onClose, onSelect, onAddPlace, onRemove, onMakeHome }) {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const handleClosed = () => {
        setQuery("");
        setError("");
        onClose();
    };
    const sheet = useDraggableSheet({ visible, onClose: handleClosed });
    const { suggestions, searching } = useCitySuggestions(query);
    const typing = query.trim().length > 0;

    // Runs an add/select action with a spinner; closes the sheet on success
    const run = async (action, failMessage) => {
        if (busy) return;
        setBusy(true);
        setError("");
        const ok = await action();
        setBusy(false);
        if (ok) {
            Haptics.selectionAsync().catch(() => {}); // tiny "tick" to confirm
            sheet.close();
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
            setError(failMessage);
        }
    };

    const pickSaved = (name) => run(() => onSelect(name), `Couldn't open ${name}.`);
    const pickPlace = (place) => run(() => onAddPlace(place), `Couldn't add ${place.name}.`);

    // Enter key: take the top suggestion, or fall back to an online search
    const submit = () => {
        if (!typing) return;
        if (suggestions[0]) pickPlace(suggestions[0]);
        else run(() => onSelect(query), `Couldn't find "${query.trim()}". Check the spelling.`);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={sheet.close}>
            <View style={styles.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={sheet.close} />

                <Animated.View style={[styles.sheet, { height: sheet.sheetHeight, paddingBottom: insets.bottom + 8 }]}>
                    {/* Drag area */}
                    <View {...sheet.panHandlers} style={styles.dragArea}>
                        <View style={styles.handle} />
                        <Text style={styles.title}>Cities</Text>
                    </View>

                    <View style={styles.search}>
                        <MaterialCommunityIcons name="magnify" size={20} color="rgba(255,255,255,0.6)" />
                        <TextInput
                            value={query}
                            onChangeText={(text) => { setQuery(text); setError(""); }}
                            onFocus={sheet.expand} // more room for suggestions + keyboard
                            placeholder="Search any city…"
                            placeholderTextColor="rgba(255,255,255,0.45)"
                            style={styles.input}
                            autoCorrect={false}
                            returnKeyType="search"
                            onSubmitEditing={submit}
                        />
                        {busy || searching ? (
                            <ActivityIndicator color="#fff" />
                        ) : typing ? (
                            <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
                                <MaterialCommunityIcons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                    {!!error && <Text style={styles.error}>{error}</Text>}

                    <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                        {typing ? (
                            <>
                                {suggestions.map((p) => (
                                    <CityRow
                                        key={`${p.name}|${p.lat}|${p.lng}`}
                                        icon="map-marker-plus-outline"
                                        title={p.name}
                                        subtitle={[p.region, p.country].filter(Boolean).join(", ")}
                                        onPress={() => pickPlace(p)}
                                    />
                                ))}
                                {!suggestions.length && !searching && (
                                    <Text style={styles.hint}>No matches yet — press Enter to search online.</Text>
                                )}
                            </>
                        ) : (
                            cities.map((c) => (
                                <CityRow
                                    key={c.name}
                                    icon={c.isDefault ? "home-map-marker" : "map-marker-outline"}
                                    title={c.name}
                                    subtitle={c.isDefault ? "Home · opens on start" : ""}
                                    active={c.name === currentCity}
                                    home={Boolean(c.isDefault)}
                                    onPress={() => pickSaved(c.name)}
                                    onMakeHome={() => onMakeHome(c.name)}
                                    onRemove={c.isDefault ? undefined : () => onRemove(c.name)} // home can't be removed
                                />
                            ))
                        )}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
    sheet: {
        backgroundColor: "#111a2e",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        overflow: "hidden",
    },
    dragArea: { paddingTop: 10, paddingBottom: 14 }, // big, easy-to-grab target
    handle: {
        alignSelf: "center",
        width: 44,
        height: 5,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.3)",
        marginBottom: 12,
    },
    title: { fontFamily: fonts.semibold, fontSize: 22, color: "#fff" },
    search: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 48,
    },
    input: { flex: 1, marginHorizontal: 8, fontFamily: fonts.regular, fontSize: 16, color: "#fff" },
    error: { marginTop: 8, fontFamily: fonts.regular, fontSize: 13, color: "#FCA5A5" },
    list: { flex: 1, marginTop: 10 },
    hint: { marginTop: 16, textAlign: "center", fontFamily: fonts.regular, fontSize: 14, color: "rgba(255,255,255,0.55)" },
});
