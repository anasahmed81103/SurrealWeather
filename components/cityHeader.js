import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Modal,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar, Platform } from "react-native";

// DB helpers
import { getAllCities, saveCity, deleteCity } from "../db/citiesDb"; // adjust path if needed

const CityHeader = ({ city, currentTime, onCityChange }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCity, setNewCity] = useState("");
    const [savedCities, setSavedCities] = useState([]);

    // Load cities on mount
    useEffect(() => {
        refreshCities();
    }, []);

    const refreshCities = async () => {
        try {
            const cities = await getAllCities();
            setSavedCities(cities);
        } catch (err) {
            console.error("Failed to load cities:", err);
        }
    };

    const formatTime = () =>
        currentTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    const formatDate = () =>
        currentTime.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });

    const handleSelectCity = (selected) => {
        setShowDropdown(false);
        onCityChange?.(selected);
    };

    const handleAddCity = async () => {
        const trimmed = newCity.trim();
        if (!trimmed) {
            setShowAddModal(false);
            return;
        }

        try {
            // Call the parent handler (App.js) to handle everything.
            // It returns false when the city can't be found.
            const found = await onCityChange(trimmed);
            if (!found) {
                alert(`Couldn't find "${trimmed}". Check the spelling and try again.`);
                return;
            }

            // Close modal + reset
            setShowAddModal(false);
            setNewCity("");
            await refreshCities();

        } catch (err) {
            console.error("Failed to add city:", err);
            alert("Error adding city. Try again.");
        }
    };




    const handleDeleteCity = async (name) => {
        try {
            const cities = await getAllCities();
            const defaultCity = cities.find(c => c.isDefault); // adjust if returning object instead of name

            if (defaultCity && defaultCity.name === name) {
                alert("You cannot delete your default city.");
                return;
            }

            await deleteCity(name);
            await refreshCities();

            if (name === city) {
                const remaining = await getAllCities();
                if (remaining.length > 0) {
                    onCityChange?.(remaining[0].name || remaining[0]);
                } else {
                    onCityChange?.(defaultCity.name);
                }
            }
        } catch (err) {
            console.error("Failed to delete city:", err);
        }
    };


    return (
        <View style={styles.header}>
            <SafeAreaView style={styles.safeArea}>
                <LinearGradient
                    colors={["#1e293b", "#334155", "#475569"]}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                >
                    <View style={styles.content}>
                        <View style={styles.leftSection}>
                            <Text style={styles.locationIcon}>📍</Text>
                            <TouchableOpacity
                                onPress={() => setShowDropdown((v) => !v)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.title}>{city || "Select city"}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.rightSection}>
                            <Text style={styles.timeText}>{formatTime()}</Text>
                            <Text style={styles.dateText}>{formatDate()}</Text>
                        </View>
                    </View>

                    {showDropdown && (
                        <View style={styles.dropdownContainer}>
                            {savedCities.map((c) => (
                                <View key={c.name} style={styles.dropdownRow}>
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => handleSelectCity(c.name)}
                                    >
                                        <Text style={styles.dropdownText}>{c.name}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteCity(c.name)}
                                        style={styles.deleteBtn}
                                    >
                                        <Text style={{ color: "#f87171", fontSize: 14 }}>🗑️</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={styles.dropdownDivider} />
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setShowAddModal(true);
                                    setShowDropdown(false);
                                }}
                            >
                                <Text style={styles.dropdownText}>➕ Add city…</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </LinearGradient>
            </SafeAreaView>

            {/* Add City Modal */}
            <Modal
                transparent
                visible={showAddModal}
                animationType="fade"
                onRequestClose={() => setShowAddModal(false)}
            >
                <TouchableWithoutFeedback
                    onPress={() => {
                        Keyboard.dismiss();
                        setShowAddModal(false);
                    }}
                >
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalCard}>
                                <Text style={styles.modalTitle}>Add a city</Text>
                                <TextInput
                                    value={newCity}
                                    onChangeText={setNewCity}
                                    placeholder="Type city name"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    style={styles.input}
                                    returnKeyType="done"
                                    onSubmitEditing={handleAddCity}
                                />
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={() => setShowAddModal(false)}
                                    >
                                        <Text style={styles.btnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.addBtn} onPress={handleAddCity}>
                                        <Text style={styles.btnText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000 },
    safeArea: {
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 20,
        backgroundColor: "#1e293b",
    },
    gradient: {
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        overflow: "hidden",
    },
    content: {
        paddingHorizontal: 25,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    leftSection: { flexDirection: "row", alignItems: "center" },
    rightSection: { alignItems: "flex-end" },
    locationIcon: { fontSize: 20, marginRight: 8 },
    title: { color: "white", fontSize: 24, fontWeight: "bold" },
    timeText: { color: "white", fontSize: 18, fontWeight: "600", marginBottom: 2 },
    dateText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
    dropdownContainer: {
        marginTop: -5,
        marginHorizontal: 16,
        backgroundColor: "rgba(15,23,42,0.95)",
        borderRadius: 12,
        paddingVertical: 6,
    },
    dropdownRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    dropdownItem: { paddingVertical: 10 },
    dropdownText: { color: "#ffffff", fontSize: 16 },
    deleteBtn: { padding: 6 },
    dropdownDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", margin: 6 },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalCard: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "rgba(15,23,42,0.98)",
        borderRadius: 16,
        padding: 16,
    },
    modalTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        borderRadius: 10,
        padding: 10,
        color: "#fff",
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    modalActions: { flexDirection: "row", justifyContent: "flex-end" },
    cancelBtn: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
        marginRight: 8,
    },
    addBtn: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#334155",
    },
    btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export { CityHeader };
