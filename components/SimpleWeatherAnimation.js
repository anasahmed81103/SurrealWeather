import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import normalizeWeatherCode from './weatherCodeUtils';

const { width, height } = Dimensions.get('window');

const SimpleWeatherAnimation = ({ weatherCode, isDay = true }) => {
    const sunRotation = useRef(new Animated.Value(0)).current;
    const cloudPosition = useRef(new Animated.Value(-100)).current;
    const rainOpacity = useRef(new Animated.Value(0)).current;
    const snowOpacity = useRef(new Animated.Value(0)).current;
    const lightningOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const code = normalizeWeatherCode(weatherCode);
        // Sun rotation animation
        if (code === 0 && isDay) {
            Animated.loop(
                Animated.timing(sunRotation, {
                    toValue: 1,
                    duration: 10000,
                    useNativeDriver: true,
                })
            ).start();
        }

        // Cloud movement animation
        if ([1, 2, 3].includes(code)) {
            Animated.loop(
                Animated.timing(cloudPosition, {
                    toValue: width + 100,
                    duration: 8000,
                    useNativeDriver: true,
                })
            ).start();
        }

        // Rain animation
        if ([51, 53, 55, 61, 63, 65].includes(code)) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(rainOpacity, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rainOpacity, {
                        toValue: 0.3,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }

        // Snow animation
        if ([71, 73, 75].includes(code)) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(snowOpacity, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(snowOpacity, {
                        toValue: 0.5,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }

        // Lightning animation
        if ([95, 96, 99].includes(code)) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(lightningOpacity, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(lightningOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.delay(2000),
                ])
            ).start();
        }
    }, [weatherCode, isDay]);

    const renderSun = () => (
        <Animated.View
            style={[
                styles.sun,
                {
                    transform: [
                        {
                            rotate: sunRotation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                            }),
                        },
                    ],
                },
            ]}
        >
            <View style={styles.sunCore} />
            <View style={[styles.sunRay, styles.sunRay1]} />
            <View style={[styles.sunRay, styles.sunRay2]} />
            <View style={[styles.sunRay, styles.sunRay3]} />
            <View style={[styles.sunRay, styles.sunRay4]} />
        </Animated.View>
    );

    const renderMoon = () => (
        <View style={styles.moon}>
            <View style={styles.moonCore} />
        </View>
    );

    const renderClouds = () => (
        <Animated.View
            style={[
                styles.clouds,
                {
                    transform: [{ translateX: cloudPosition }],
                },
            ]}
        >
            <View style={styles.cloud} />
            <View style={[styles.cloud, styles.cloud2]} />
            <View style={[styles.cloud, styles.cloud3]} />
        </Animated.View>
    );

    const renderRain = () => (
        <Animated.View
            style={[
                styles.rainContainer,
                {
                    opacity: rainOpacity,
                },
            ]}
        >
            {[...Array(30)].map((_, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.raindrop,
                        {
                            left: (i * width) / 30,
                            transform: [
                                {
                                    translateY: new Animated.Value(-100).interpolate({
                                        inputRange: [-100, height + 100],
                                        outputRange: [-100, height + 100],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            ))}
        </Animated.View>
    );

    const renderSnow = () => (
        <Animated.View
            style={[
                styles.snowContainer,
                {
                    opacity: snowOpacity,
                },
            ]}
        >
            {[...Array(25)].map((_, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.snowflake,
                        {
                            left: (i * width) / 25,
                            transform: [
                                {
                                    translateY: new Animated.Value(-50).interpolate({
                                        inputRange: [-50, height + 50],
                                        outputRange: [-50, height + 50],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            ))}
        </Animated.View>
    );

    const renderLightning = () => (
        <Animated.View
            style={[
                styles.lightningContainer,
                {
                    opacity: lightningOpacity,
                },
            ]}
        >
            <View style={styles.lightning} />
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Clear sky - Sun or Moon */}
            {normalizeWeatherCode(weatherCode) === 0 && (isDay ? renderSun() : renderMoon())}

            {/* Cloudy */}
            {[1, 2, 3].includes(normalizeWeatherCode(weatherCode)) && renderClouds()}

            {/* Rain */}
            {[51, 53, 55, 61, 63, 65].includes(normalizeWeatherCode(weatherCode)) && renderRain()}

            {/* Snow */}
            {[71, 73, 75].includes(normalizeWeatherCode(weatherCode)) && renderSnow()}

            {/* Thunderstorm */}
            {[95, 96, 99].includes(normalizeWeatherCode(weatherCode)) && (
                <>
                    {renderClouds()}
                    {renderRain()}
                    {renderLightning()}
                </>
            )}
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
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        minHeight: height + 300, // Ensure animations cover full scroll area
    },
    sun: {
        position: 'absolute',
        top: '25%',
        right: '15%',
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sunCore: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFD700',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
    },
    sunRay: {
        position: 'absolute',
        width: 4,
        height: 20,
        backgroundColor: '#FFD700',
        borderRadius: 2,
    },
    sunRay1: { transform: [{ rotate: '0deg' }], top: -10 },
    sunRay2: { transform: [{ rotate: '90deg' }], right: -10 },
    sunRay3: { transform: [{ rotate: '180deg' }], bottom: -10 },
    sunRay4: { transform: [{ rotate: '270deg' }], left: -10 },
    moon: {
        position: 'absolute',
        top: '25%',
        right: '15%',
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moonCore: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F8FF',
        shadowColor: '#F0F8FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 8,
    },
    clouds: {
        position: 'absolute',
        top: '30%',
        flexDirection: 'row',
    },
    cloud: {
        width: 60,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        marginHorizontal: 10,
    },
    cloud2: {
        width: 50,
        height: 35,
        top: 5,
    },
    cloud3: {
        width: 70,
        height: 45,
        top: -5,
    },
    rainContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    raindrop: {
        position: 'absolute',
        width: 2,
        height: 20,
        backgroundColor: '#87CEEB',
        borderRadius: 1,
        top: '30%',
    },
    snowContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    snowflake: {
        position: 'absolute',
        width: 6,
        height: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
        top: '25%',
    },
    lightningContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightning: {
        width: 4,
        height: 100,
        backgroundColor: '#FFD700',
        borderRadius: 2,
        transform: [{ rotate: '15deg' }],
    },
});

export default SimpleWeatherAnimation;
