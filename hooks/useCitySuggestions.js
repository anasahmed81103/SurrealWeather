import { useEffect, useMemo, useState } from "react";
import { searchLocalCities, isSamePlace } from "../utils/citySearch";
import { searchCities } from "../services/geocodingApi";

/* ------------------------------------------------------------------
 * useCitySuggestions — city suggestions while the user types.
 *
 *  - Offline list first: instant, free, typo-tolerant.
 *  - Online search only as a backup, when the offline list finds fewer
 *    than ONLINE_BELOW results (small towns). It waits until typing
 *    pauses (debounce) so we don't send a request per keystroke.
 * ------------------------------------------------------------------ */

const MAX_RESULTS = 8;
const ONLINE_BELOW = 3;
const DEBOUNCE_MS = 450;

export default function useCitySuggestions(query) {
    const local = useMemo(() => searchLocalCities(query, MAX_RESULTS), [query]);
    const [online, setOnline] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        setOnline([]);
        const q = query.trim();
        if (q.length < 3 || local.length >= ONLINE_BELOW) return;

        let cancelled = false; // ignore answers for an old query
        setSearching(true);
        const timer = setTimeout(async () => {
            try {
                const results = await searchCities(q, 6);
                if (!cancelled) setOnline(results);
            } catch (err) {
                console.warn("[suggest] online search failed:", err.message);
            } finally {
                if (!cancelled) setSearching(false);
            }
        }, DEBOUNCE_MS);

        return () => {
            cancelled = true;
            clearTimeout(timer);
            setSearching(false);
        };
    }, [query, local.length]);

    // Offline results first, then online ones that aren't duplicates
    const suggestions = useMemo(() => {
        const extra = online.filter((o) => !local.some((l) => isSamePlace(l, o)));
        return [...local, ...extra].slice(0, MAX_RESULTS);
    }, [local, online]);

    return { suggestions, searching };
}
