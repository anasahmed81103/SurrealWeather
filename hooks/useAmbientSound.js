import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";

/* ------------------------------------------------------------------
 * useAmbientSound — plays a short weather "sound moment":
 *   gentle fade in (2.5 s) → play (4 s) → fade out (2 s) → pause.
 *
 * A moment plays when:
 *   - `trigger` changes (pass the weather object → app open, city change,
 *     pull-to-refresh all load new weather)
 *   - the app comes back from the background
 *   - the user turns sound on (a quick preview)
 *
 *  ambience: { key, volume } from utils/ambience.js, or null for silence
 *  enabled:  user's sound on/off setting
 *
 * Plays alongside the user's music (mixWithOthers).
 * ------------------------------------------------------------------ */

const SOUND_FILES = {
    birds: require("../assets/sounds/birds.m4a"),
    crickets: require("../assets/sounds/crickets.m4a"),
    wind: require("../assets/sounds/wind.m4a"),
    rain_light: require("../assets/sounds/rain_light.m4a"),
    rain_heavy: require("../assets/sounds/rain_heavy.m4a"),
    storm: require("../assets/sounds/storm.m4a"),
};

const FADE_IN_MS = 2500;
const HOLD_MS = 4000;
const FADE_OUT_MS = 2000;
const FADE_STEP_MS = 50;
const LOOP_SECONDS = 50; // length of every file in assets/sounds

export default function useAmbientSound(ambience, enabled, trigger) {
    const player = useAudioPlayer(null);
    const loadedKey = useRef(null); // which file is currently in the player
    const fadeTimer = useRef(null);
    const holdTimer = useRef(null);
    const momentId = useRef(0); // newest moment wins if several start close together

    // Latest values for the AppState listener (registered once)
    const latest = useRef({});
    latest.current = { ambience, enabled };

    const stopTimers = () => {
        clearInterval(fadeTimer.current);
        clearTimeout(holdTimer.current);
    };

    // Smoothly move the volume to `target` over `ms`, then call `done`.
    // Ears hear loudness logarithmically, so a straight line sounds rushed.
    // Curves: fade in starts very slowly (p²), fade out trails off gently (1-(1-p)²).
    const fadeTo = (target, ms, done) => {
        clearInterval(fadeTimer.current);
        const start = player.volume;
        const rising = target > start;
        const steps = Math.max(1, Math.round(ms / FADE_STEP_MS));
        let step = 0;
        fadeTimer.current = setInterval(() => {
            step += 1;
            const p = step / steps;
            const eased = rising ? p * p : 1 - (1 - p) * (1 - p);
            player.volume = start + (target - start) * eased;
            if (step >= steps) {
                clearInterval(fadeTimer.current);
                done?.();
            }
        }, FADE_STEP_MS);
    };

    const fadeOutAndStop = (ms = FADE_OUT_MS) => {
        momentId.current += 1; // cancels a moment that is still starting up
        clearTimeout(holdTimer.current);
        fadeTo(0, ms, () => player.pause());
    };

    // fade in → hold → fade out
    const playMoment = async () => {
        const { ambience: amb, enabled: on } = latest.current;
        if (!on || !amb) return;

        const id = ++momentId.current;
        try {
            stopTimers();
            player.volume = 0; // silent *before* anything can be heard
            if (loadedKey.current !== amb.key) {
                player.replace(SOUND_FILES[amb.key]);
                loadedKey.current = amb.key;
            }
            // Start somewhere random so it never sounds identical — seek first, then play,
            // so there's no blip from the old position
            await player.seekTo(Math.random() * (LOOP_SECONDS - 10)).catch(() => {});
            if (id !== momentId.current) return; // a newer moment took over

            player.loop = true;
            player.play();

            console.log("[sound] moment:", amb.key);
            fadeTo(amb.volume, FADE_IN_MS, () => {
                holdTimer.current = setTimeout(() => fadeOutAndStop(), HOLD_MS);
            });
        } catch (err) {
            console.error("[sound] playback failed:", err);
        }
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
        return stopTimers;
    }, []);

    // New weather loaded (app open / city change / refresh) or sound turned on
    useEffect(() => {
        if (enabled) playMoment();
        else fadeOutAndStop(300); // muted → stop quickly
    }, [trigger, enabled]);

    // Back from the background → play again; leaving → stop
    useEffect(() => {
        const sub = AppState.addEventListener("change", (state) => {
            if (state === "active") playMoment();
            else {
                stopTimers();
                player.pause();
            }
        });
        return () => sub.remove();
    }, []);
}
