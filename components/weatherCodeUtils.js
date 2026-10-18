export const normalizeWeatherCode = (code) => {
    if (code === undefined || code === null || Number.isNaN(Number(code))) {
        return 0;
    }

    const numericCode = Number(code);

    // Canonical codes that existing UI logic handles per category
    const canonicalSets = {
        clear: [0],
        clouds: [1, 2, 3],
        fog: [45, 48],
        rain: [51, 53, 55, 61, 63, 65],
        snow: [71, 73, 75],
        thunder: [95, 96, 99],
    };

    // Map full WMO ranges to our UI categories
    const getCategoryForCode = (c) => {
        if (c === 0) return 'clear';
        if (c >= 1 && c <= 3) return 'clouds';
        if (c >= 45 && c <= 48) return 'fog';
        // Drizzle (51–57), Rain (61–67), Rain showers (80–82) → rain visuals
        if ((c >= 51 && c <= 57) || (c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return 'rain';
        // Snow (71–77), Snow showers (85–86) → snow visuals
        if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'snow';
        if (c >= 95 && c <= 99) return 'thunder';
        // Fallback: choose the visually safest option
        return 'clouds';
    };

    const category = getCategoryForCode(numericCode);
    const candidates = canonicalSets[category] || [0];

    // Choose the candidate code with the smallest absolute difference.
    // This effectively "averages" toward the closest actual weather code.
    let best = candidates[0];
    let bestDiff = Math.abs(numericCode - best);
    for (let i = 1; i < candidates.length; i += 1) {
        const candidate = candidates[i];
        const diff = Math.abs(numericCode - candidate);
        if (diff < bestDiff) {
            best = candidate;
            bestDiff = diff;
        }
    }

    return best;
};

export const getWeatherDescription = (code) => {
    const normalized = normalizeWeatherCode(code);
    const descriptionByCode = {
        0: 'Clear',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
    };
    return descriptionByCode[normalized] || 'Unknown';
};

export default normalizeWeatherCode;


