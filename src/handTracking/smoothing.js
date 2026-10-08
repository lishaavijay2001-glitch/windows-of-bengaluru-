// One-euro filter: steady when the hand is still, responsive when it moves fast.
// https://gery.casiez.net/1euro/
class LowPass {
  constructor() { this.y = null; }
  filter(x, a) {
    this.y = this.y === null ? x : a * x + (1 - a) * this.y;
    return this.y;
  }
}

export class OneEuro {
  constructor({ minCutoff = 1.2, beta = 0.02, dCutoff = 1.0 } = {}) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.x = new LowPass();
    this.dx = new LowPass();
    this.last = null;
  }
  static alpha(cutoff, dt) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }
  filter(value, tMs) {
    if (this.last === null) {
      this.last = tMs;
      this.prev = value;
      return this.x.filter(value, 1);
    }
    const dt = Math.max((tMs - this.last) / 1000, 1 / 240);
    this.last = tMs;
    const d = (value - this.prev) / dt;
    this.prev = value;
    const ed = this.dx.filter(d, OneEuro.alpha(this.dCutoff, dt));
    const cutoff = this.minCutoff + this.beta * Math.abs(ed);
    return this.x.filter(value, OneEuro.alpha(cutoff, dt));
  }
  reset() {
    this.x = new LowPass();
    this.dx = new LowPass();
    this.last = null;
  }
}

export const clamp = (v, lo = -1, hi = 1) => Math.min(hi, Math.max(lo, v));

// Soft dead zone: small movements near the centre do nothing, then ramps linearly.
export function deadZone(v, dz = 0.06) {
  const a = Math.abs(v);
  if (a < dz) return 0;
  return Math.sign(v) * ((a - dz) / (1 - dz));
}
