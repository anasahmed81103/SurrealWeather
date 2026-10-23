import { useEffect, useRef } from "react";
import { useAudioPlayer } from "expo-audio";

/* ------------------------------------------------------------------
 * useFadingPlayer — one audio player that fades smoothly.
 *
 *   start(source, volume, fadeInMs, { startAt, loop })
 *   stop(fadeOutMs)   → fade out, then pause
 *   pauseNow()        → silence immediately (e.g. app went to background)
 *
 * Fades are eased: ears hear loudness logarithmically, so a straight
 * line sounds rushed. Fade in starts very slowly (p²), fade out trails
 * off gently (1-(1-p)²).
 * ------------------------------------------------------------------ */

const STEP_MS = 50;

export default function useFadingPlayer() {
    const player = useAudioPlayer(null);
    const loaded = useRef(null); // which file is in the player
    const timer = useRef(null);
    const run = useRef(0); // newest start/stop wins if calls overlap

    useEffect(() => () => clearInterval(timer.current), []);

    const fadeTo = (target, ms, done) => {
        clearInterval(timer.current);
        const from = player.volume;
        const rising = target > from;
        const steps = Math.max(1, Math.round(ms / STEP_MS));
        let step = 0;
        timer.current = setInterval(() => {
            step += 1;
            const p = step / steps;
            const eased = rising ? p * p : 1 - (1 - p) * (1 - p);
            player.volume = from + (target - from) * eased;
            if (step >= steps) {
                clearInterval(timer.current);
                done?.();
            }
        }, STEP_MS);
    };

    const start = async (source, volume, fadeInMs, { startAt = 0, loop = true } = {}) => {
        const id = ++run.current;
        clearInterval(timer.current);
        try {
            player.volume = 0; // silent *before* anything can be heard
            if (loaded.current !== source) {
                player.replace(source);
                loaded.current = source;
            }
            // Seek first, then play — no blip from the old position
            await player.seekTo(startAt).catch(() => {});
            if (id !== run.current) return; // a newer call took over

            player.loop = loop;
            player.play();
            fadeTo(volume, fadeInMs);
        } catch (err) {
            console.error("[sound] playback failed:", err);
        }
    };

    const stop = (fadeOutMs) => {
        run.current += 1;
        fadeTo(0, fadeOutMs, () => player.pause());
    };

    const pauseNow = () => {
        run.current += 1;
        clearInterval(timer.current);
        player.pause();
    };

    return { start, stop, pauseNow };
}
