import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator, Dimensions, ScrollView, SafeAreaView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { CityHeader } from "./components/cityHeader";
import SkyBackground from "./components/SkyBackground";
import normalizeWeatherCode, { getWeatherDescription } from "./components/weatherCodeUtils";
import * as Location from "expo-location";
import {
  initDb,
  saveCity,
  getCityCoordinates,
  getAllCities,
  saveWeather,
  getWeather,
} from "./db/citiesDb"; // the unified db.js file
import { fetchWeather, isValidWeather } from "./services/weatherApi";
import { searchCity, getCityNameFromCoords } from "./services/geocodingApi";

const { width, height } = Dimensions.get('window');

// Used when location permission is denied or GPS fails
const FALLBACK_CITY = { name: "Karachi", lat: 24.8607, lng: 67.0011 };

export default function App() {
  const [city, setCity] = useState(null);
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());



  /* ---------- INIT DB ---------- */
  useEffect(() => {
    (async () => {
      await initDb();

      const existing = await getAllCities();
      if (existing.length === 0) {
        // First launch: detect the user's city once and save it as the default
        let home = FALLBACK_CITY;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            // Low accuracy is enough for a city and is faster + easier on battery
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
            const lat = loc.coords.latitude;
            const lng = loc.coords.longitude;
            home = { name: await getCityNameFromCoords(lat, lng), lat, lng };
          } else {
            console.warn("Permission denied, falling back to", FALLBACK_CITY.name);
          }
        } catch (err) {
          console.error("Error getting location:", err);
        }

        await saveCity(home.name, home.lat, home.lng, true);
        setCity(home.name);
        setCoords({ lat: home.lat, lng: home.lng });
      } else {
        // Load first default city
        const def = existing.find(c => c.isDefault) || existing[0];
        setCity(def.name);
        setCoords({ lat: def.lat, lng: def.lng });
      }
    })();
  }, []);

  /* ---------- FETCH WEATHER ---------- */
  useEffect(() => {
    const fetchWeather = async () => {
      if (!coords || coords.lat == null || coords.lng == null || !city) return; // 🚨 guard

      try {
        setLoading(true);

        // Try cache first (saves data + API calls)
        const cached = await getWeather(city);
        if (isValidWeather(cached)) {
          setWeather(cached);
          return;
        }

        // Fetch fresh, then cache it
        const data = await fetchWeather(coords.lat, coords.lng);
        setWeather(data);
        await saveWeather(city, data);
      } catch (err) {
        console.error("Weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timeInterval);
  }, [coords, city]);

  /* ---------- HANDLE CITY CHANGE ---------- */
  // Switches to a city. Returns true on success, false if it couldn't be found.
  const handleCityChange = async (newCity) => {
    if (!newCity) return false;

    // Helper: switch to a city we already have saved (no network needed)
    const switchToSaved = async (name) => {
      const saved = await getCityCoordinates(name);
      if (!saved) return false;
      setCity(name);
      setCoords({ lat: saved.lat, lng: saved.lng });
      return true;
    };

    if (await switchToSaved(newCity)) return true;

    try {
      const place = await searchCity(newCity);
      if (!place) {
        console.warn("No results found for city:", newCity);
        return false;
      }

      // The search may return a cleaner name ("karachi" → "Karachi") that's already saved
      if (await switchToSaved(place.name)) return true;

      await saveCity(place.name, place.lat, place.lng);
      setCity(place.name);
      setCoords({ lat: place.lat, lng: place.lng });
      return true;
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return false;
    }
  };



  const getWeatherIconFromDescription = (description, isDay = true) => {
    const desc = (description || '').toLowerCase();
    if (desc.includes('thunder')) return '⛈️';
    if (desc.includes('hail')) return '⛈️';
    if (desc.includes('snow')) return '🌨️';
    if (desc.includes('drizzle')) return '🌦️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('fog')) return '🌫️';
    if (desc.includes('overcast') || desc.includes('cloud')) return '☁️';
    if (desc.includes('clear')) return isDay ? '☀️' : '🌙';
    return '🌤️';
  };

  const isDay = () => {
    const hour = currentTime.getHours();
    return hour >= 6 && hour <= 18;
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#1e293b', '#334155', '#475569']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#facc15" />
          <Text style={styles.loadingText}>Fetching weather data...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={['#1e293b', '#334155', '#475569']}
          style={styles.errorGradient}
        >
          <Text style={styles.errorText}>Unable to fetch weather data</Text>
        </LinearGradient>
      </View>
    );
  }

  const current = weather.current;
  const daily = weather.daily;
  // Open-Meteo tells us if it's day in *that* city (correct across timezones)
  const isDayTime = current.is_day != null ? current.is_day === 1 : isDay();

  return (
    <View style={styles.container}>
      {/* Dynamic Sky Background - Full Screen */}
      <SkyBackground
        weatherCode={current.weather_code}
        isDay={isDayTime}
        time={currentTime}
      />


      {/* Header */}
      <CityHeader
        city={city}
        currentTime={currentTime}
        onCityChange={handleCityChange}
      />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always"
      >
        {/* Current Weather Section */}
        <View style={styles.currentWeatherSection}>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherIcon}>{getWeatherIconFromDescription(getWeatherDescription(current.weather_code), isDayTime)}</Text>
            <Text style={styles.weatherText}>
              {getWeatherDescription(current.weather_code)}
            </Text>
            <Text style={styles.tempText}>{Math.round(current.temperature_2m)}°C</Text>
            <Text style={styles.feelsLikeText}>
              Feels like {Math.round(current.apparent_temperature)}°C
            </Text>
          </View>

          <View style={styles.tempRange}>
            <View style={styles.tempItem}>
              <Text style={styles.tempLabel}>High</Text>
              <Text style={styles.tempValue}>{Math.round(daily.temperature_2m_max[0])}°</Text>
            </View>
            <View style={styles.tempDivider} />
            <View style={styles.tempItem}>
              <Text style={styles.tempLabel}>Low</Text>
              <Text style={styles.tempValue}>{Math.round(daily.temperature_2m_min[0])}°</Text>
            </View>
          </View>
        </View>

        {/* Forecast Section */}
        <View style={styles.forecastSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Forecast</Text>
          </View>

          <View style={styles.forecastList}>
            {daily.time.slice(0, 7).map((day, index) => {
              const date = new Date(day);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <View key={day} style={styles.forecastItem}>
                  <View style={styles.forecastDay}>
                    <Text style={styles.dayName}>{dayName}</Text>
                    <Text style={styles.dayDate}>{monthDay}</Text>
                  </View>

                  <View style={styles.forecastWeather}>
                    <Text style={styles.forecastIcon}>
                      {getWeatherIconFromDescription(getWeatherDescription(daily.weather_code[index]))}
                    </Text>
                    <Text style={styles.forecastDescription}>
                      {getWeatherDescription(daily.weather_code[index])}
                    </Text>
                  </View>

                  <View style={styles.forecastTemp}>
                    <Text style={styles.forecastHigh}>
                      {Math.round(daily.temperature_2m_max[index])}°
                    </Text>
                    <Text style={styles.forecastLow}>
                      {Math.round(daily.temperature_2m_min[index])}°
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Extra space at bottom for better scrolling */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
  },
  errorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    minHeight: height + 200, // Ensure background covers full scroll area
  },
  currentWeatherSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  weatherInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  weatherIcon: {
    fontSize: 100,
    marginBottom: 15,
  },
  weatherText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  tempText: {
    fontSize: 88,
    fontWeight: 'bold',
    color: '#facc15',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  feelsLikeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
  },
  tempRange: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tempItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tempDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 10,
  },
  tempLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 5,
  },
  tempValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  forecastSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  forecastList: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  forecastDay: {
    flex: 1,
    alignItems: 'flex-start',
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  forecastWeather: {
    flex: 2,
    alignItems: 'center',
  },
  forecastIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  forecastDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  forecastTemp: {
    flex: 1,
    alignItems: 'flex-end',
  },
  forecastHigh: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  forecastLow: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  bottomSpacer: {
    height: 100, // Extra space at bottom for better scrolling
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 15,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
