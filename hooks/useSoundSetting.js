import { useEffect, useState } from "react";
import { getSetting, setSetting } from "../db/citiesDb";

/* ------------------------------------------------------------------
 * useSoundSetting — the user's sound on/off choice, saved on the phone.
 * Sound is ON by default. Returns [soundOn, toggleSound].
 * ------------------------------------------------------------------ */

export default function useSoundSetting() {
    const [soundOn, setSoundOn] = useState(true);

    useEffect(() => {
        getSetting("sound", "on")
            .then((value) => setSoundOn(value !== "off"))
            .catch((err) => console.warn("[settings] couldn't read sound setting:", err.message));
    }, []);

    const toggleSound = () => {
        const next = !soundOn;
        setSoundOn(next);
        setSetting("sound", next ? "on" : "off").catch((err) =>
            console.warn("[settings] couldn't save sound setting:", err.message)
        );
    };

    return [soundOn, toggleSound];
}
