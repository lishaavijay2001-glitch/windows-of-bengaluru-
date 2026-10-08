// Pure gesture maths on MediaPipe hand landmarks (21 points, normalised 0..1).
// Kept free of DOM so it can be unit-tested and tuned in isolation.
//
// Landmark indices: 0 wrist · thumb 1-4 · index 5-8 · middle 9-12 · ring 13-16 · pinky 17-20

export const TUNING = {
  pinchOn: 0.30,       // thumb-index distance ÷ hand size to start a pinch
  pinchOff: 0.45,      // ...and to release it (hysteresis stops flicker)
  bloomWindowMs: 500,  // after a fist, the hand must open within this long → "open palm"
  bloomMaxFistMs: 650, // a fist held longer than this is a grip (close), not a palm
  gripStartMs: 350,    // shutters start following your grip after this long
  gripFullMs: 1200,    // ...and are fully shut (window closes) at this point
  gestureHoldMs: 450,  // view holds still this long after the hand changes shape (stops the end-of-gesture wobble)
  peaceHoldMs: 350,    // hold a ✌️ this long to reveal the secret
  thumbsHoldMs: 900,   // hold a 👍 this long to ring the bell and ride to the next stop
  thumbsCooldownMs: 2500,
  swipeDist: 0.24,     // (swipe/wave are no longer used to move the bus: too easy to trigger by accident)
  swipeMs: 380,
  swipeCooldownMs: 1400,
  waveSwingAmp: 0.045, // min horizontal travel per swing (normalised frame width)
  waveSwings: 3,       // left-right-left (3 reversals) = wave
  waveWindowMs: 1100,
  waveCooldownMs: 1500,
  rangeX: 0.26,        // hand travel from centre that maps to full pan
  rangeY: 0.2,
};

const dist = (a, b, aspect = 1) => Math.hypot((a.x - b.x) * aspect, a.y - b.y);

export function handSize(l, aspect) {
  return dist(l[0], l[9], aspect) || 1e-3;
}

export function palmCentre(l) {
  const ids = [0, 5, 9, 13, 17];
  let x = 0, y = 0;
  for (const i of ids) { x += l[i].x; y += l[i].y; }
  // Mirror x so moving your hand right moves "right" on screen (selfie view).
  return { x: 1 - x / ids.length, y: y / ids.length };
}

export function pinchRatio(l, aspect) {
  return dist(l[4], l[8], aspect) / handSize(l, aspect);
}

// How many of the four fingers (not thumb) are extended.
export function openness(l, aspect) {
  const pairs = [[8, 6], [12, 10], [16, 14], [20, 18]];
  let n = 0;
  for (const [tip, pip] of pairs) {
    if (dist(l[tip], l[0], aspect) > dist(l[pip], l[0], aspect) * 1.12) n++;
  }
  return n;
}

export class PinchDetector {
  constructor() { this.active = false; }
  update(ratio) {
    if (!this.active && ratio < TUNING.pinchOn) this.active = true;
    else if (this.active && ratio > TUNING.pinchOff) this.active = false;
    return this.active;
  }
  reset() { this.active = false; }
}

export function isFist(l, aspect) {
  // fingers curled AND index tip pulled back toward the palm (separates a fist from a pinch)
  return openness(l, aspect) <= 1 && dist(l[8], l[0], aspect) < dist(l[5], l[0], aspect) * 1.2;
}

// Fist handling, two gestures from one shape:
//  • quick fist → open hand   = "open palm" (a little release; a plain open hand is just panning)
//  • fist held                = "grip": the shutters follow it, and it closes the window
export class GripTracker {
  constructor() { this.reset(); }
  reset() { this.fistStart = null; this.lastFistEnd = -Infinity; this.lastFistDur = 0; }
  update(fist, open, t) {
    let bloom = false;
    if (fist) {
      if (this.fistStart === null) this.fistStart = t;
    } else if (this.fistStart !== null) {
      this.lastFistDur = t - this.fistStart;
      this.lastFistEnd = t;
      this.fistStart = null;
    }
    if (!fist && open >= 3 && t - this.lastFistEnd < TUNING.bloomWindowMs && this.lastFistDur < TUNING.bloomMaxFistMs) {
      bloom = true;
      this.lastFistEnd = -Infinity;
    }
    return { bloom, heldMs: this.fistStart === null ? 0 : t - this.fistStart };
  }
}

// Wave = several fast horizontal direction reversals with an open-ish hand.
export class WaveDetector {
  constructor(opts = {}) {
    this.o = {
      amp: opts.amp ?? TUNING.waveSwingAmp,
      swings: opts.swings ?? TUNING.waveSwings,
      windowMs: opts.windowMs ?? TUNING.waveWindowMs,
    };
    this.hist = []; this.cooldownUntil = 0;
  }
  update(x, t, open) {
    this.hist.push({ x, t });
    while (this.hist.length && t - this.hist[0].t > this.o.windowMs) this.hist.shift();
    if (t < this.cooldownUntil || open < 3 || this.hist.length < 6) return false;

    const A = this.o.amp;
    let reversals = 0, dir = 0, extreme = this.hist[0].x;
    for (const p of this.hist) {
      if (dir === 0) {
        if (p.x - extreme > A) { dir = 1; extreme = p.x; }
        else if (extreme - p.x > A) { dir = -1; extreme = p.x; }
      } else if (dir === 1) {
        if (p.x > extreme) extreme = p.x;
        else if (extreme - p.x > A) { reversals++; dir = -1; extreme = p.x; }
      } else {
        if (p.x < extreme) extreme = p.x;
        else if (p.x - extreme > A) { reversals++; dir = 1; extreme = p.x; }
      }
    }
    // 3 swings (left-right-left) = 2 reversals
    if (reversals >= this.o.swings - 1) {
      this.cooldownUntil = t + TUNING.waveCooldownMs;
      this.hist = [];
      return true;
    }
    return false;
  }
  reset() { this.hist = []; }
}

// Swipe = one deliberate, fast, mostly-horizontal sweep of an open hand.
// Returns +1 (hand sweeps left → next window) or -1 (sweeps right → previous), else 0.
export class SwipeDetector {
  constructor() { this.hist = []; this.cooldownUntil = 0; }
  update(x, y, t, open) {
    this.hist.push({ x, y, t });
    while (this.hist.length && t - this.hist[0].t > TUNING.swipeMs) this.hist.shift();
    if (t < this.cooldownUntil || open < 3 || this.hist.length < 4) return 0;
    const a = this.hist[0], b = this.hist[this.hist.length - 1];
    const dx = b.x - a.x, dy = b.y - a.y;
    if (Math.abs(dx) > TUNING.swipeDist && Math.abs(dy) < Math.abs(dx) * 0.5) {
      this.cooldownUntil = t + TUNING.swipeCooldownMs;
      this.hist = [];
      return dx < 0 ? 1 : -1;
    }
    return 0;
  }
  reset() { this.hist = []; }
}

// ✌️ Peace sign: index + middle up, ring + pinky curled, thumb not pinching the index.
export function isPeace(l, aspect) {
  const up = (tip, pip) => dist(l[tip], l[0], aspect) > dist(l[pip], l[0], aspect) * 1.12;
  const down = (tip, pip) => dist(l[tip], l[0], aspect) < dist(l[pip], l[0], aspect) * 1.05;
  const spread = dist(l[8], l[12], aspect) / handSize(l, aspect);       // fingers apart, like a V
  return up(8, 6) && up(12, 10) && down(16, 14) && down(20, 18) && spread > 0.25 && pinchRatio(l, aspect) > 0.5;
}

export class PeaceDetector {
  constructor() { this.since = null; this.fired = false; }
  update(peace, t) {
    if (!peace) { this.since = null; this.fired = false; return false; }
    if (this.since === null) this.since = t;
    if (!this.fired && t - this.since >= TUNING.peaceHoldMs) { this.fired = true; return true; }
    return false;
  }
}

// 👍 Thumbs up: four fingers curled into the palm, thumb clearly sticking up.
export function isThumbsUp(l, aspect) {
  const hs = handSize(l, aspect);
  const curled = (tip, pip) => dist(l[tip], l[0], aspect) < dist(l[pip], l[0], aspect) * 1.1;
  const fingersIn = curled(8, 6) && curled(12, 10) && curled(16, 14) && curled(20, 18);
  const thumbUp = l[4].y < l[3].y && l[3].y < l[2].y && (l[2].y - l[4].y) > hs * 0.45;   // y grows downward
  const thumbAbove = l[4].y < Math.min(l[6].y, l[10].y) - hs * 0.15;                      // above the curled fingers
  return fingersIn && thumbUp && thumbAbove;
}

// Hold a 👍 to fill the bell cord; at full, fire once. Letting go resets.
export class ThumbsHold {
  constructor() { this.since = null; this.fired = false; this.cooldownUntil = 0; this.progress = 0; }
  update(up, t) {
    if (!up || t < this.cooldownUntil) { this.since = null; this.fired = false; this.progress = 0; return false; }
    if (this.since === null) this.since = t;
    this.progress = Math.min(1, (t - this.since) / TUNING.thumbsHoldMs);
    if (!this.fired && this.progress >= 1) {
      this.fired = true;
      this.cooldownUntil = t + TUNING.thumbsCooldownMs;
      return true;
    }
    return false;
  }
}
