import { useState, useEffect } from "react";

/* ------------------------------------------------------------------
 * useMinuteTick — returns Date.now(), refreshed every 30 seconds.
 * Keeps the header clock and the day/night sky up to date without
 * re-rendering every second.
 * ------------------------------------------------------------------ */

export default function useMinuteTick() {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(id);
    }, []);

    return now;
}
