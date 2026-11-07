import { blocks, row, windowsFor } from "./shapes";
import { disc, finial, ring, spire } from "./ornaments";

/* ------------------------------------------------------------------
 * United Kingdom — Big Ben (Elizabeth Tower) and the long Gothic
 * Palace of Westminster with its pinnacles and Victoria Tower.
 * Behind: the London Eye and the Shard. Night: the clock faces glow.
 * ------------------------------------------------------------------ */

const BEN = 104; // tower centre

const elizabethTower = [
    blocks([[BEN - 9, 18, 300 - 112], [BEN - 11, 22, 300 - 88], [BEN - 9, 18, 300 - 74]]),
    spire(BEN, 75, 18, 36),
    spire(BEN - 9, 75, 4, 12),
    spire(BEN + 9, 75, 4, 12),
    finial(BEN, 39, 9),
].join(" ");

// The palace: a long block with a row of little pinnacles, a lantern spire and Victoria Tower
const pinnacles = Array.from({ length: 30 }, (_, i) => spire(122 + i * 9, 241, 3, 9)).join(" ");
const palace = [
    blocks([[118, 290, 300 - 242], [242, 12, 300 - 196], [346, 34, 300 - 150]]),
    spire(248, 197, 10, 30),
    spire(348, 151, 4, 12),
    spire(378, 151, 4, 12),
    pinnacles,
].join(" ");
const palaceWindows = windowsFor([[118, 228, 58], [346, 34, 150]], 17, 0.3, { dx: 6, dy: 9 });

const far = [
    ring(36, 206, 46, 3), // London Eye
    blocks([[34, 4, 50]]), // its leg
    spire(290, 300, 34, 210), // the Shard
    blocks(row(-4, 404, 91, { minH: 24, maxH: 56, minW: 14, maxW: 30 })),
].join(" ");

export default {
    far,
    near: `${elizabethTower} ${palace}`,
    glow: { d: disc(BEN, 100, 6.5), color: "#FFE8B0", opacity: 0.95 }, // the clock face
    windows: palaceWindows,
    beacons: [{ x: 290, y: 92, color: "#FF4A3D" }],
};
