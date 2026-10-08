// Merges hand + mouse into one "intent" the experience reads every frame.
//   intent = { x, y: -1..1, pinch: bool, grip: 0..1, source: 'hand' | 'mouse', handVisible: bool }
// Discrete gestures arrive as events: 'palm', 'go' {dir}, 'close', 'secret', 'tap'.

import { HandInput } from './HandInput.js';
import { MouseInput } from './MouseInput.js';
import { OneEuro, deadZone, clamp } from './smoothing.js';
import { TUNING } from './gestures.js';

export class InputManager {
  constructor() {
    this.listeners = {};
    this.hand = new HandInput((e, d) => this._fire(e, 'hand', d));
    this.mouse = new MouseInput((e, d) => this._fire(e, 'mouse', d));
    this.intent = { x: 0, y: 0, pinch: false, grip: 0, source: 'mouse', handVisible: false };
    this.fx = new OneEuro({ minCutoff: 0.6, beta: 0.35 });
    this.fy = new OneEuro({ minCutoff: 0.6, beta: 0.35 });
    // gesture lock: while your hand is changing shape, the view holds still
    this.held = null;          // {x, y} target frozen during a gesture
    this.off = { x: 0, y: 0 }; // re-anchor offset after a gesture, eased away so nothing jumps
    this.motion = 0; // accumulated movement, used to detect "the user discovered it"
    this._last = performance.now();
  }

  on(name, fn) { (this.listeners[name] ||= []).push(fn); }
  _fire(name, source, data) {
    // Mouse/keyboard gestures always count; hand gestures only while the hand is seen.
    if (source === 'hand' && !this.hand.state.present) return;
    (this.listeners[name] || []).forEach((fn) => fn(source, data));
  }

  preloadHand() { this.hand.preload().catch(() => {}); }
  async enableCamera() {
    const ok = await this.hand.start();
    (this.listeners.camera || []).forEach((fn) => fn(this.hand.status));
    return ok;
  }

  // zoom (0..1) is passed in so panning gets calmer when you're looking closer
  tick(now, zoom = 0) {
    const dt = Math.min(0.05, (now - this._last) / 1000);
    this._last = now;
    this.hand.tick(now);

    const h = this.hand.state;
    const m = this.mouse.state;
    const handActive = h.present || now - h.lastSeen < 600;
    const mouseFresher = m.lastSeen > h.lastSeen + 300;
    const src = handActive && !mouseFresher ? 'hand' : 'mouse';
    if (src !== this.intent.source) { this.fx.reset(); this.fy.reset(); }

    const s = src === 'hand' ? h : m;
    let tx = s.x, ty = s.y;
    // Hand left the frame for a while → drift gently back to centre.
    // (A still mouse is still "holding" the view, so it never drifts.)
    if (src === 'hand' && !h.present && now - h.lastSeen > 2500) { tx = 0; ty = 0; }
    if (src === 'hand') { tx = deadZone(tx, 0.08); ty = deadZone(ty, 0.08); }

    // Making or releasing a pinch / fist moves the whole hand a little. Don't read that as panning:
    // freeze the view while the shape changes, then re-anchor so it continues from where it was.
    const changing = src === 'hand' && h.present &&
      (h.fist || h.gripMs > 0 || now - (h.shapeChangedAt || -1e9) < TUNING.gestureHoldMs);
    if (changing) {
      if (!this.held) this.held = { x: this.lastTx ?? tx, y: this.lastTy ?? ty };
      tx = this.held.x; ty = this.held.y;
    } else {
      if (this.held) { this.off.x = this.held.x - tx; this.off.y = this.held.y - ty; this.held = null; }
      const decay = Math.exp(-dt * 1.2);
      this.off.x *= decay; this.off.y *= decay;
      tx = clamp(tx + this.off.x); ty = clamp(ty + this.off.y);
    }
    this.lastTx = tx; this.lastTy = ty;

    const fx = this.fx.filter(tx, now);
    const fy = this.fy.filter(ty, now);
    // Extra ease for a floaty, "looking around" feel.
    const k = 1 - Math.pow(0.0015, dt / (1 + zoom * 2.5));   // calmer when zoomed (zoom magnifies jitter)
    const nx = this.intent.x + (fx - this.intent.x) * k;
    const ny = this.intent.y + (fy - this.intent.y) * k;
    this.motion += Math.hypot(nx - this.intent.x, ny - this.intent.y);

    this.intent.x = nx;
    this.intent.y = ny;
    this.intent.pinch = !!s.pinch;
    this.intent.grip = src === 'hand' && h.present
      ? clamp((h.gripMs - TUNING.gripStartMs) / (TUNING.gripFullMs - TUNING.gripStartMs), 0, 1) : 0;
    this.intent.goProgress = src === 'hand' && h.present ? (h.goProgress || 0) : 0;
    this.intent.source = src;
    this.intent.handVisible = h.present;
    return this.intent;
  }
}
