/* ------------------------------------------------------------------
 * shapes — tiny helpers that turn simple lists into skyline SVG paths.
 *
 * Every skyline is drawn in one 400 × 300 box (y = 300 is the ground).
 * Shapes reach a bit below the box (GROUND), so no bottom edge ever shows.
 *
 * All sub-paths run clockwise, so overlapping shapes simply merge
 * (fill-rule "nonzero"). A sub-path drawn the other way cuts a hole
 * (arches, windows you can see through).
 * ------------------------------------------------------------------ */

export const GROUND = 310;
const BASE = 300; // building heights are measured up from here

/** Same "random" number for the same input, so a city looks the same every time */
export const seeded = (n) => {
    const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return s - Math.floor(s);
};

export const r1 = (n) => Math.round(n * 10) / 10; // keep path strings short

/** Points → closed path, always clockwise (so it merges instead of cutting a hole) */
export function poly(points) {
    let area = 0;
    points.forEach(([x1, y1], i) => {
        const [x2, y2] = points[(i + 1) % points.length];
        area += x1 * y2 - x2 * y1;
    });
    const pts = area < 0 ? [...points].reverse() : points;
    return `M${pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" L")} Z`;
}

/**
 * One building → path. roof:
 *   "flat"  plain box          "step"  a narrower top tier
 *   "slope" mansard (Paris)    "spire" thin pointed tip
 *   "gable" pointed house roof (old Europe)
 */
function building([x, w, h, roof = "flat"]) {
    const top = BASE - h;
    const r = x + w;
    const L = (px, py) => `${r1(px)},${r1(py)}`;
    if (roof === "step") {
        const i = w * 0.22;
        const t = Math.min(12, h * 0.12);
        return `M${L(x, GROUND)} L${L(x, top + t)} L${L(x + i, top + t)} L${L(x + i, top)} L${L(r - i, top)} L${L(r - i, top + t)} L${L(r, top + t)} L${L(r, GROUND)} Z`;
    }
    if (roof === "slope") {
        const i = Math.min(3, w * 0.15);
        return `M${L(x, GROUND)} L${L(x, top + 4)} L${L(x + i, top)} L${L(r - i, top)} L${L(r, top + 4)} L${L(r, GROUND)} Z`;
    }
    if (roof === "spire") {
        const m = x + w / 2;
        return `M${L(x, GROUND)} L${L(x, top)} L${L(m - 1, top)} L${L(m, top - h * 0.2)} L${L(m + 1, top)} L${L(r, top)} L${L(r, GROUND)} Z`;
    }
    if (roof === "gable") {
        return `M${L(x, GROUND)} L${L(x, top)} L${L(x + w / 2, top - Math.min(w * 0.5, 14))} L${L(r, top)} L${L(r, GROUND)} Z`;
    }
    return `M${L(x, GROUND)} L${L(x, top)} L${L(r, top)} L${L(r, GROUND)} Z`;
}

/** List of buildings [x, w, h, roof?] → one path */
export const blocks = (list) => list.map(building).join(" ");

/** Buildings stacked on one centre line: [[width, topY], ...] → list for blocks() */
export const tiers = (cx, list) => list.map(([w, top]) => [cx - w / 2, w, BASE - top]);

/**
 * A row of made-up buildings from x0 to x1 (same every time for the same seed).
 * Returns the list, so it can be drawn (blocks) and get windows (windowsFor).
 * roof can be a name or a function (i, rnd) → name.
 */
export function row(x0, x1, seed, { minH, maxH, minW = 10, maxW = 22, roof = "flat", gap = 0 }) {
    const list = [];
    let x = x0;
    for (let i = 0; x < x1; i++) {
        const w = minW + seeded(seed + i * 3.1) * (maxW - minW);
        const h = minH + seeded(seed + i * 7.7) * (maxH - minH);
        list.push([x, w, h, typeof roof === "function" ? roof(i, seeded(seed + i * 1.9)) : roof]);
        x += w + gap;
    }
    return list;
}

/**
 * Lit windows for a list of buildings → [{ x, y, warm }].
 * A loose grid on each building; `density` of the windows are lit.
 */
export function windowsFor(list, seed, density = 0.25, { dx = 5, dy = 7 } = {}) {
    const out = [];
    list.forEach(([x, w, h], b) => {
        if (h < 14) return;
        for (let y = BASE - h + 6; y < BASE - 4; y += dy) {
            for (let wx = x + 3; wx < x + w - 3; wx += dx) {
                const n = seed + b * 101 + wx * 1.3 + y * 0.7;
                if (seeded(n) < density) out.push({ x: r1(wx), y: r1(y), warm: seeded(n + 5) < 0.8 });
            }
        }
    });
    return out;
}

/** A row of lamps (warm dots) from x0 to x1 at height y */
export const lamps = (x0, x1, y, step = 12) =>
    Array.from({ length: Math.floor((x1 - x0) / step) + 1 }, (_, i) => ({ x: x0 + i * step, y, warm: true }));

/** A smooth ridge through [x, y] points, filled down to the ground (hills, mountains) */
export function ridge(points) {
    let d = `M${points[0][0]},${GROUND} L${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
        const [px, py] = points[i - 1];
        const [x, y] = points[i];
        d += ` C${r1(px + (x - px) / 2)},${py} ${r1(px + (x - px) / 2)},${y} ${x},${y}`;
    }
    return `${d} L${points[points.length - 1][0]},${GROUND} Z`;
}
