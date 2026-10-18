/* ------------------------------------------------------------------
 * Small network helpers shared by all API services.
 * Everything here has a timeout so a bad connection can never leave
 * the app stuck on a loading screen.
 * ------------------------------------------------------------------ */

const DEFAULT_TIMEOUT_MS = 10000;

/** Rejects if `promise` doesn't settle within `ms`. */
export function withTimeout(promise, ms = DEFAULT_TIMEOUT_MS, label = "Request") {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** GET a URL and return parsed JSON. Throws on timeout or non-200 status. */
export async function fetchJson(url, ms = DEFAULT_TIMEOUT_MS) {
    const res = await withTimeout(fetch(url), ms, "Network request");
    if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
    return res.json();
}
