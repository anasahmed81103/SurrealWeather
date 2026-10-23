import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { setAudioModeAsync } from "expo-audio";
import useFadingPlayer from "./useFadingPlayer";

/* ------------------------------------------------------------------
 * useAmbientSound — plays a short "sound moment" in two layers:
 *
 *   weather sound:  gentle fade in (2.5 s) → play (4 s) → fade out (2 s)
 *   soft tune:      only in serene moments (see utils/ambience.js),
 *                   plays underneath, from its start, fading with it
 *
 * A moment plays when:
 *   - `trigger` changes (pass the weather object → app open, city change,
 *     pull-to-refresh all load new weather)
 *   - the app comes back from the background
 *   - the user turns sound on (a quick preview)
 *
 *  ambience: { key, volume } weather sound, or null for silence
 *  music:    { key, volume } tune, or null
 *  enabled:  user's sound on/off setting
 * ------------------------------------------------------------------ */

const SOUND_FILES = {
    birds: require("../assets/sounds/birds.m4a"),
    crickets: require("../assets/sounds/crickets.m4a"),
    wind: require("../assets/sounds/wind.m4a"),
    rain_light: require("../assets/sounds/rain_light.m4a"),
    rain_heavy: require("../assets/sounds/rain_heavy.m4a"),
    storm: require("../assets/sounds/storm.m4a"),
};

const MUSIC_FILES = {
    serene: require("../assets/music/serene.m4a"),
};

const FADE_IN_MS = 2500;
const MUSIC_FADE_IN_MS = 1500; // the tune comes in a bit sooner so its first notes aren't lost
const HOLD_MS = 4000;
const FADE_OUT_MS = 2000; // ends at 8.5 s — the full length of the tune
const LOOP_SECONDS = 50; // length of every file in assets/sounds

export default function useAmbientSound(ambience, music, enabled, trigger) {
    const effect = useFadingPlayer();
    const tune = useFadingPlayer();
    const holdTimer = useRef(null);

    // Latest values for callbacks that are registered once
    const latest = useRef({});
    latest.current = { ambience, music, enabled };

    const stopAll = (ms = FADE_OUT_MS) => {
        clearTimeout(holdTimer.current);
        effect.stop(ms);
        tune.stop(ms);
    };

    const playMoment = () => {
        const { ambience: amb, music: mus, enabled: on } = latest.current;
        if (!on || !amb) return;
        clearTimeout(holdTimer.current);

        // Weather sound starts somewhere random so it never sounds identical
        console.log("[sound] moment:", amb.key, mus ? `+ ${mus.key}` : "");
        effect.start(SOUND_FILES[amb.key], amb.volume, FADE_IN_MS, { startAt: Math.random() * (LOOP_SECONDS - 10) });

        // The tune always plays from its beginning, once
        if (mus) tune.start(MUSIC_FILES[mus.key], mus.volume, MUSIC_FADE_IN_MS, { startAt: 0, loop: false });
        else tune.pauseNow();

        holdTimer.current = setTimeout(() => stopAll(), FADE_IN_MS + HOLD_MS);
    };

    // One-time audio setup
    useEffect(() => {
        setAudioModeAsync({
            // true: play even when the phone is on silent/vibrate (on Android `false` mutes the
            // app in vibrate mode, which most people use). The 🔊 button is the off switch.
            playsInSilentMode: true,
            interruptionMode: "mixWithOthers", // never stop the user's music
            shouldPlayInBackground: false,
        }).catch((err) => console.warn("[sound] audio mode failed:", err.message));
        return () => clearTimeout(holdTimer.current);
    }, []);

    // New weather loaded (app open / city change / refresh) or sound turned on
    useEffect(() => {
        if (enabled) playMoment();
        else stopAll(300); // muted → stop quickly
    }, [trigger, enabled]);

    // Back from the background → play again; leaving → silence
    useEffect(() => {
        const sub = AppState.addEventListener("change", (state) => {
            if (state === "active") playMoment();
            else {
                clearTimeout(holdTimer.current);
                effect.pauseNow();
                tune.pauseNow();
            }
        });
        return () => sub.remove();
    }, []);
}
