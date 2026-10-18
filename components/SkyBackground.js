import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import normalizeWeatherCode from './weatherCodeUtils';

const { width, height } = Dimensions.get('window');

const SkyBackground = ({ weatherCode, isDay = true, time }) => {
    const normalizedCode = normalizeWeatherCode(weatherCode);

    const getBackgroundImage = () => {
        // Map normalized categories to local assets
        if (normalizedCode === 0 && isDay) {
            // Clear: use same image for day/night; darken at night below
            return require('../assets/pictures/clear_day.png');
        }

        if (normalizedCode === 0 && !isDay) {
            // Clear: use same image for day/night; darken at night below
            return require('../assets/pictures/clear_night.jpg');
        }

        if ([1, 2, 3].includes(normalizedCode)) {
            return require('../assets/pictures/overcast.jpeg');
        }

        if ([45, 48].includes(normalizedCode)) {
            return require('../assets/pictures/fog.png');
        }

        if ([51, 53, 55, 61, 63, 65].includes(normalizedCode)) {
            return require('../assets/pictures/rain.jpeg');
        }

        if ([71, 73, 75].includes(normalizedCode)) {
            return require('../assets/pictures/snow.jpg');
        }

        if ([95, 96, 99].includes(normalizedCode)) {
            return require('../assets/pictures/thunderstorm.jpeg');
        }

        return require('../assets/pictures/overcast.jpeg');
    };

    const getBackgroundColors = () => {
        const code = normalizedCode;
        // Clear sky
        if (code === 0) {
            if (isDay) {
                return ['#87CEEB', '#98D8E8', '#B0E0E6'];
            } else {
                return ['#0F1419', '#1B2735', '#2C3E50'];
            }
        }

        // Cloudy
        if ([1, 2, 3].includes(code)) {
            if (isDay) {
                return ['#B8C6DB', '#C5D1E8', '#D4E4F7'];
            } else {
                return ['#2C3E50', '#34495E', '#4A5F7A'];
            }
        }

        // Fog
        if ([45, 48].includes(code)) {
            return ['#D3D3D3', '#E8E8E8', '#F5F5F5'];
        }

        // Rain
        if ([51, 53, 55, 61, 63, 65].includes(code)) {
            if (isDay) {
                return ['#6B7A8F', '#7B8A9F', '#8B9AAF'];
            } else {
                return ['#2C3E50', '#34495E', '#4A5F7A'];
            }
        }

        // Snow
        if ([71, 73, 75].includes(code)) {
            return ['#E8F4FD', '#F0F8FF', '#F8FBFF'];
        }

        // Thunderstorm
        if ([95, 96, 99].includes(code)) {
            return ['#2C3E50', '#34495E', '#4A5F7A'];
        }

        // Default
        if (isDay) {
            return ['#87CEEB', '#98D8E8', '#B0E0E6'];
        } else {
            return ['#0F1419', '#1B2735', '#2C3E50'];
        }
    };

    const getGradientLocations = () => {
        const code = normalizedCode;
        // Different gradient patterns for different weather
        if ([95, 96, 99].includes(code)) {
            return [0, 0.3, 1]; // More dramatic for storms
        }

        if ([71, 73, 75].includes(code)) {
            return [0, 0.5, 1]; // Softer for snow
        }

        return [0, 0.6, 1]; // Default
    };

    const hexToRgba = (hex, alpha) => {
        const sanitized = hex.replace('#', '');
        const bigint = parseInt(sanitized, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const headerOffset = 100; // Start image below header area
    const bgColors = getBackgroundColors();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={getBackgroundColors()}
                locations={getGradientLocations()}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            {/* Add some atmospheric effects */}
            {normalizedCode === 0 && isDay && (
                <View style={styles.sunGlow} />
            )}

            {/* Removed cloud overlays that were appearing in wrong positions */}

            {[51, 53, 55, 61, 63, 65].includes(normalizedCode) && (
                <View style={styles.rainOverlay} />
            )}

            {/* Add stars for night time */}
            {!isDay && normalizedCode === 0 && (
                <>
                    <View style={styles.star1} />
                    <View style={styles.star2} />
                    <View style={styles.star3} />
                    <View style={styles.star4} />
                    <View style={styles.star5} />
                </>
            )}

            {/* Blurred weather image below header that fades into the gradient */}
            <View style={[styles.imageContainer, { top: headerOffset, bottom: 0 }]}
                pointerEvents="none">
                <Image
                    source={getBackgroundImage()}
                    style={styles.image}
                    resizeMode="cover"
                />
                <BlurView intensity={35} tint={isDay ? 'light' : 'dark'} style={StyleSheet.absoluteFill} />
                {/* Slight darkening for night to improve contrast */}
                {!isDay && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />}

                {/* Fade image smoothly into the underlying gradient by overlaying a matching color ramp */}
                <LinearGradient
                    colors={[
                        'rgba(0,0,0,0)',
                        hexToRgba(bgColors[1], 0.0),
                        hexToRgba(bgColors[2], 0.85),
                        hexToRgba(bgColors[2], 1.0),
                    ]}
                    locations={[0.5, 0.75, 0.93, 1]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        minHeight: height + 300, // Ensure gradient covers full scroll area
    },
    gradient: {
        flex: 1,
    },
    imageContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        overflow: 'hidden',
    },
    image: {
        width: width,
        height: '100%',
    },
    sunGlow: {
        position: 'absolute',
        top: '25%',
        right: '15%',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 0, 0.1)',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    rainOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    star1: {
        position: 'absolute',
        top: '25%',
        left: '15%',
        width: 3,
        height: 3,
        backgroundColor: '#FFFFFF',
        borderRadius: 1.5,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    star2: {
        position: 'absolute',
        top: '35%',
        right: '20%',
        width: 2,
        height: 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 1,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 1,
    },
    star3: {
        position: 'absolute',
        top: '45%',
        left: '30%',
        width: 2.5,
        height: 2.5,
        backgroundColor: '#FFFFFF',
        borderRadius: 1.25,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 1.5,
    },
    star4: {
        position: 'absolute',
        top: '55%',
        right: '35%',
        width: 2,
        height: 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 1,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 1,
    },
    star5: {
        position: 'absolute',
        top: '65%',
        left: '25%',
        width: 3,
        height: 3,
        backgroundColor: '#FFFFFF',
        borderRadius: 1.5,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
});

export default SkyBackground;
