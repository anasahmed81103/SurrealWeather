/* ------------------------------------------------------------------
 * widgetSky — draws the widget's background as an SVG string.
 *
 * Widgets can't animate, but they can show a picture. So instead of a
 * flat 2-colour gradient we paint a small still of the app's scenes:
 * a 3-shade sky, soft light glows, and the weather itself (sun, moon +
 * stars, clouds, rain, snow, fog, lightning).
 *
 * The art sits on the right side so the text on the left stays readable.
 * Drawn at the widget's real size (w × h in dp), so nothing stretches.
 * Plain SVG only — the widget renderer (AndroidSVG) has no blur/filters,
 * so softness comes from radial gradients.
 * ------------------------------------------------------------------ */

// 3-shade sky per kind: [day, night], each [top, middle, bottom]
const SKIES = {
    clear: [["#1F78D6", "#4FA3EE", "#86C6F4"], ["#0A0F35", "#1B2160", "#3A2E78"]],
    partly: [["#2E6FC0", "#5B97D8", "#94BFE6"], ["#10153A", "#23295C", "#3B3B70"]],
    cloudy: [["#4E5B70", "#717F95", "#97A3B5"], ["#1A1E2E", "#2B3145", "#42485E"]],
    fog: [["#6E7A88", "#8C96A3", "#A9B1BB"], ["#252A39", "#373D4D", "#4E5464"]],
    rain: [["#253649", "#3E5469", "#5E768C"], ["#0E1522", "#1B2738", "#2E3D54"]],
    snow: [["#56739A", "#7A97BC", "#A3BAD6"], ["#1A2340", "#2E3B63", "#4C5B88"]],
    thunder: [["#1C1730", "#352C52", "#56477A"], ["#0B0918", "#1E1733", "#352850"]],
};

// Star positions as fractions of the card (fixed, so the widget doesn't flicker)
const STARS = [
    [0.52, 0.12, 1.2], [0.6, 0.3, 0.8], [0.66, 0.08, 1], [0.74, 0.22, 0.7], [0.58, 0.55, 0.9],
    [0.9, 0.62, 1.1], [0.95, 0.3, 0.8], [0.47, 0.4, 0.7], [0.7, 0.7, 0.8], [0.82, 0.86, 0.9],
    [0.4, 0.15, 0.8], [0.98, 0.1, 0.9],
];

// Fog: soft mist banks [cx, cy, rx (of width), ry (of height), opacity], mostly on the right
const MIST_BANKS = [
    [0.95, 0.24, 0.3, 0.12, 0.7], [0.74, 0.44, 0.4, 0.13, 1], [0.58, 0.62, 0.45, 0.14, 0.85],
    [0.88, 0.72, 0.38, 0.13, 1], [0.5, 0.88, 0.55, 0.15, 0.75],
];

const n = (v) => Math.round(v * 10) / 10; // keep the SVG string short

// Cloud shades. Solid colours: a gradient per puff would show seams between them.
const CLOUD = { light: "#F3F6FA", grey: "#B9C3D0", dark: "#596277", night: "#454E68" };

// A soft cloud: three puffs on a rounded base
function cloud(x, y, s, shade, opacity) {
    return `<g opacity="${opacity}" fill="${CLOUD[shade]}">
<circle cx="${n(x - s * 0.55)}" cy="${n(y + s * 0.1)}" r="${n(s * 0.42)}"/>
<circle cx="${n(x)}" cy="${n(y - s * 0.15)}" r="${n(s * 0.58)}"/>
<circle cx="${n(x + s * 0.6)}" cy="${n(y + s * 0.12)}" r="${n(s * 0.4)}"/>
<rect x="${n(x - s * 0.95)}" y="${n(y + s * 0.1)}" width="${n(s * 1.9)}" height="${n(s * 0.42)}" rx="${n(s * 0.21)}"/></g>`;
}

// A round glow that fades to nothing (fake blur)
const glow = (x, y, r, id) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="url(#${id})"/>`;

// Shared gradients. Radial ones are drawn white/colour → transparent.
function defs(sky, w, h, radius) {
    const radial = (id, color, opacity) =>
        `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/>` +
        `<stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
    return `<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0.35" y2="1">
<stop offset="0" stop-color="${sky[0]}"/><stop offset="0.55" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient>
${radial("sunGlow", "#FFE6A0", 0.9)}${radial("moonGlow", "#C8D2FF", 0.45)}${radial("haze", "#FFFFFF", 0.16)}
${radial("boltGlow", "#B9A2FF", 0.55)}${radial("shade", "#000000", 0.22)}
${radial("fogSun", "#FFF3D6", 0.55)}${radial("mist", "#FFFFFF", 0.5)}
<linearGradient id="fogFloor" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0.3"/></linearGradient>
<clipPath id="card"><rect width="${w}" height="${h}" rx="${radius}"/></clipPath>
</defs>`;
}

// Where the weather art sits: anchor (fractions of width / height) and cloud size (of height).
// Weather widget: big, right side. Clock widget: smaller and higher, clear of the temperature.
const ART_PLACE = { x: 0.78, y: 0.32, size: 0.36 };
// Clock: the tallest art (rain: cloud top → last drop ≈ 2.3 × size) must end above the
// temperature (~45% down), and the sun must clear the top edge → size 0.18, anchor 20% down.
export const CLOCK_ART_PLACE = { x: 0.82, y: 0.2, size: 0.18 };

// The weather layer for each kind. (x, y) is the art's anchor on the right side.
// soft = false leaves out stars and the big glows (for the icon on transparent widgets,
// where a glow cut off at the icon's edge would show as a hard line).
// place: where the art sits and how big (fractions of the card), see ART_PLACE.
function weatherArt(kind, night, w, h, soft = true, place = ART_PLACE) {
    const halo = soft ? glow : () => "";
    const dim = night && soft; // dark night clouds on the sky; the icon keeps them light so they show on any wallpaper
    const x = w * place.x;
    const y = h * place.y;
    const s = h * place.size; // cloud size scales with the widget height
    const u = s / 0.36; // unit for sun / moon / glow sizes, so they shrink with the art
    const sunOrMoon = night
        ? halo(x + s * 0.5, y - s * 0.2, u * 0.75, "moonGlow") +
          `<circle cx="${n(x + s * 0.5)}" cy="${n(y - s * 0.2)}" r="${n(u * 0.13)}" fill="#F3EFDC"/>`
        : halo(x + s * 0.5, y - s * 0.3, u * 1.0, "sunGlow") +
          `<circle cx="${n(x + s * 0.5)}" cy="${n(y - s * 0.3)}" r="${n(u * 0.17)}" fill="#FFF4C8"/>`;
    const stars = night && soft
        ? STARS.map(([fx, fy, r]) => `<circle cx="${n(fx * w)}" cy="${n(fy * h)}" r="${r}" fill="#FFFFFF" opacity="0.8"/>`).join("")
        : "";
    const darkCloud = dim ? "night" : soft ? "dark" : "grey"; // icon: lighter storm clouds, visible on dark wallpapers

    switch (kind) {
        case "clear":
            return stars + sunOrMoon;
        case "partly":
            return stars + sunOrMoon + cloud(x - s * 0.2, y + s * 0.55, s, dim ? "night" : "light", 0.95);
        case "cloudy":
            return (
                cloud(x + s * 0.5, y - s * 0.1, s * 0.9, dim ? "night" : "grey", 0.8) +
                cloud(x - s * 0.4, y + s * 0.5, s * 1.1, dim ? "night" : "light", 0.9)
            );
        case "fog": {
            // A pale sun / moon behind the veil, a faint cloud, soft banks of mist and ground haze
            const lx = x + s * 0.5;
            const ly = y - s * 0.25;
            if (!soft) {
                // Icon version: pale sun / moon behind a cloud, three mist bars below
                const bars = [[0.62, 0.95, 2.2], [0.8, 1.35, 2.5], [0.98, 1.0, 2.1]]
                    .map(([fy, dx, len]) => `<rect x="${n(x - s * dx)}" y="${n(h * fy)}" width="${n(s * len)}" height="${n(h * 0.06)}" rx="${n(h * 0.03)}"/>`)
                    .join("");
                return (
                    `<circle cx="${n(lx)}" cy="${n(ly)}" r="${n(u * 0.14)}" fill="${night ? "#E6EAF5" : "#FFF3D6"}" opacity="0.8"/>` +
                    cloud(x - s * 0.15, y + s * 0.2, s * 0.95, "grey", 0.9) +
                    `<g fill="#E8EDF3" opacity="0.85">${bars}</g>`
                );
            }
            const banks = MIST_BANKS.map(([fx, fy, rx, ry, o]) =>
                `<ellipse cx="${n(fx * w)}" cy="${n(fy * h)}" rx="${n(rx * w)}" ry="${n(ry * h)}" fill="url(#mist)" opacity="${o}"/>`
            ).join("");
            return (
                halo(lx, ly, u * 0.8, night ? "moonGlow" : "fogSun") +
                `<circle cx="${n(lx)}" cy="${n(ly)}" r="${n(u * 0.14)}" fill="${night ? "#E6EAF5" : "#FFF8E6"}" opacity="${night ? 0.4 : 0.6}"/>` +
                cloud(x - s * 0.15, y + s * 0.2, s * 0.95, dim ? "night" : "grey", 0.4) +
                `<g opacity="${night ? 0.65 : 1}">${banks}</g>` +
                `<rect y="${n(h * 0.5)}" width="${w}" height="${n(h * 0.5)}" fill="url(#fogFloor)"/>`
            );
        }
        case "rain":
        case "thunder": {
            const drops = Array.from({ length: 9 }, (_, i) => {
                const dx = x - s * 1.1 + i * s * 0.32;
                const dy = y + s * 0.85 + (i % 3) * s * 0.18;
                return `<line x1="${n(dx)}" y1="${n(dy)}" x2="${n(dx - s * 0.12)}" y2="${n(dy + s * 0.35)}"/>`;
            }).join("");
            const thunder = kind === "thunder";
            // Glow goes behind the clouds, the bolt in front of them (it hangs from the cloud's belly)
            const boltPoints = [[0.05, 0.75], [-0.2, 1.2], [0, 1.2], [-0.15, 1.6], [0.3, 1.05], [0.08, 1.05], [0.22, 0.75]]
                .map(([px, py]) => `${n(x + px * s)},${n(y + py * s)}`)
                .join(" ");
            return (
                (thunder ? halo(x, y + s * 0.9, u * 0.6, "boltGlow") : "") +
                `<g stroke="#BFE3FF" stroke-width="${n(u * 0.014)}" stroke-linecap="round" opacity="0.6">${drops}</g>` +
                cloud(x + s * 0.55, y - s * 0.15, s * 0.85, darkCloud, 0.85) +
                cloud(x - s * 0.3, y + s * 0.35, s * 1.1, darkCloud, 0.95) +
                (thunder ? `<polygon fill="#FFE27A" points="${boltPoints}"/>` : "")
            );
        }
        case "snow": {
            const flakes = Array.from({ length: 12 }, (_, i) => {
                const fx = x - s * 1.2 + (i % 6) * s * 0.45 + (i > 5 ? s * 0.2 : 0);
                const fy = y + s * 0.95 + (i > 5 ? s * 0.4 : 0) + (i % 2) * s * 0.12;
                return `<circle cx="${n(fx)}" cy="${n(fy)}" r="${n(u * 0.018)}"/>`;
            }).join("");
            return (
                `<g fill="#FFFFFF" opacity="0.85">${flakes}</g>` +
                cloud(x + s * 0.5, y - s * 0.1, s * 0.85, dim ? "night" : "grey", 0.85) +
                cloud(x - s * 0.3, y + s * 0.4, s * 1.1, dim ? "night" : "light", 0.95)
            );
        }
        default:
            return "";
    }
}

/**
 * @param {string} kind     clear | partly | cloudy | fog | rain | snow | thunder
 * @param {boolean} night
 * @param {number} w, h     widget size in dp
 * @param {object} place    where the art goes (ART_PLACE / CLOCK_ART_PLACE)
 * @returns {string} SVG markup
 */
export function skySvg(kind, night, w = 320, h = 150, radius = 24, place = ART_PLACE) {
    const sky = (SKIES[kind] || SKIES.cloudy)[night ? 1 : 0];
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
${defs(sky, w, h, radius)}
<g clip-path="url(#card)">
<rect width="${w}" height="${h}" fill="url(#sky)"/>
${glow(w * 0.1, h * 1.05, h * 1.1, "haze")}
${weatherArt(kind, night, w, h, true, place)}
${glow(w * 0.12, h * 0.55, h * 0.9, "shade")}
</g></svg>`;
}

/**
 * Just the weather art (sun / moon / clouds / rain…), no sky and no glows:
 * the icon for the transparent clock widget. Same drawing as the sky
 * version, cropped (viewBox) to the area the art uses.
 */
// Crop per kind (viewBox x, y, w, h in the 200 × 100 drawing), so each icon is centred
const ART_BOX = {
    clear: [144, -10, 60, 60],
    partly: [106, -4, 94, 80],
    cloudy: [100, -2, 112, 78],
    fog: [100, -4, 112, 108],
};
const ART_BOX_TALL = [102, -2, 110, 94]; // rain, snow, thunder (drops below the cloud)

export function artSvg(kind, night) {
    const w = 200;
    const h = 100;
    const [bx, by, bw, bh] = ART_BOX[kind] || ART_BOX_TALL;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${bw}" height="${bh}" viewBox="${bx} ${by} ${bw} ${bh}">
${defs((SKIES[kind] || SKIES.cloudy)[night ? 1 : 0], w, h, 0)}
${weatherArt(kind, night, w, h, false)}
</svg>`;
}
