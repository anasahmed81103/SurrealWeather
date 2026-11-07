import { useEffect, useState } from "react";
import { getClimate, placeKey, saveClimate } from "../db/climateDb";
import { fetchHistory } from "../services/historyApi";

/* ------------------------------------------------------------------
 * useClimateHistory — 10 years of daily weather for a place.
 *
 *  - Cache first: history doesn't change, so a saved copy is used as-is.
 *  - Re-downloaded about once a year (so "this day last year" is always in it),
 *    or sooner if the saved copy is an older format (no cloud cover).
 *    An old copy still shows meanwhile.
 *  - Only starts once the forecast has loaded (`todayIso` set), so it never
 *    slows down the main screen.
 *  - status: loading → ready (card) or none (no copy + no network → card hidden).
 *    "loading" lets the screen hold the card's space, so nothing jumps.
 * ------------------------------------------------------------------ */

const REFRESH_MS = 360 * 86400000;

/** todayIso = city's local date ("2026-11-03"), from the forecast */
export default function useClimateHistory(lat, lng, todayIso) {
    const [history, setHistory] = useState(null);
    const [status, setStatus] = useState("loading"); // loading | ready | none

    useEffect(() => {
        if (lat == null || lng == null || !todayIso) return;
        let cancelled = false; // city changed mid-request → don't show the wrong city's history
        const place = placeKey(lat, lng);
        setHistory(null);
        setStatus("loading");

        (async () => {
            try {
                const cached = await getClimate(place);
                if (cached && !cancelled) {
                    setHistory(cached.data);
                    setStatus("ready");
                }
                if (cached?.data.cloud && Date.now() - cached.timestamp < REFRESH_MS) {
                    console.log("[history] using cache for", place);
                    return;
                }

                console.log("[history] fetching 10 years for", place);
                const data = await fetchHistory(lat, lng, todayIso);
                await saveClimate(place, data); // save even if cancelled — next visit is instant
                if (!cancelled) {
                    setHistory(data);
                    setStatus("ready");
                }
            } catch (err) {
                console.warn("[history] download failed:", err.message);
                // keep an older copy if we showed one; otherwise hide the card
                if (!cancelled) setStatus((s) => (s === "ready" ? s : "none"));
            }
        })();

        return () => { cancelled = true; };
    }, [lat, lng, todayIso]);

    return { history, status };
}
