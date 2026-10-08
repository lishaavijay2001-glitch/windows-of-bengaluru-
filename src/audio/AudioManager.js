// AudioManager — one song per window, played plainly.
//
//   window opens   → its song fades in (over ~1 s) and plays at a steady volume
//   window closes  → the song fades out and pauses; reopening resumes where it left off
//   next window    → the new song starts from its beginning (or `musicStart`) when you open it
//   final screen   → silence
//
// No filters, no proximity, no ambience: just the song. Uses plain <audio> volume, so it behaves the
// same whether the page is opened from disk or through the Start script, in Safari or Chrome.
//
// Each scene configures:  audio: { musicFile, musicStart, musicVolume, fadeInDuration, fadeOutDuration }

class Deck {
  constructor(mgr) {
    this.mgr = mgr;
    this.el = new Audio();
    this.el.preload = 'auto';
    this.el.loop = true;
    this.src = null;
    this.level = 0;
    this.target = 0;
    this.status = 'idle';    // idle | loading | playing | missing
    this.el.addEventListener('error', () => { if (this.src) mgr.missing.add(this.src); this.status = 'missing'; });
    this.el.addEventListener('playing', () => { this.status = 'playing'; });
  }
  load(file, start = 0) {
    if (!file || this.mgr.missing.has(file)) { this.status = file ? 'missing' : 'idle'; this.src = null; return; }
    this.src = file;
    this.el.src = file;
    this.status = 'loading';
    this.el.addEventListener('loadedmetadata', () => { try { this.el.currentTime = start; } catch { /* ignore */ } }, { once: true });
  }
  play() {
    if (!this.src || !this.el.paused) return;
    const p = this.el.play();
    if (p && p.catch) p.catch(() => {});
  }
}

export class AudioManager {
  constructor(sound) {
    this.sound = sound;      // gesture cues (kept separate)
    this.missing = new Set();
    this.decks = [new Deck(this), new Deck(this)];
    this.cur = 0;
    this.scene = null;
    this.muted = false;
    this.amb = null;         // no ambience any more
  }

  get deck() { return this.decks[this.cur]; }
  get hasMusic() { return !!this.deck.src && this.deck.status !== 'missing'; }
  get musicLevel() { return this.deck.level; }

  // Must run inside a click/keypress. Safari only lets an <audio> element start later
  // (e.g. when the next window opens) if it was played once from a user gesture.
  primeFromGesture() {
    if (this._primed) return;
    this._primed = true;
    for (const el of this.decks.map((d) => d.el)) {
      el.muted = true;
      const p = el.play();
      const settle = () => { el.pause(); el.muted = false; };
      if (p && p.then) p.then(settle, () => { el.muted = false; }); else settle();
    }
  }

  unlock() { /* nothing to set up: plain <audio> */ }

  _cfg(scene) { return scene.audio || {}; }

  // Arriving at a window: get its song ready (it plays when the window opens).
  setScene(scene) {
    if (this.scene === scene) return;
    this.scene = scene;
    const a = this._cfg(scene);
    const old = this.deck;
    old.target = 0;
    this.cur = 1 - this.cur;
    const next = this.deck;
    next.level = 0;
    next.target = 0;
    next.load(a.musicFile, a.musicStart || 0);
  }

  setMuted(m) { this.muted = m; }

  /** every frame. ctl: { open 0..1 (how far the shutters are open), finale } */
  update(dt, ctl) {
    const a = this.scene ? this._cfg(this.scene) : {};
    const playing = ctl.open > 0.5 && !ctl.finale;   // starts as the shutters swing open
    this.deck.target = playing ? (a.musicVolume ?? 0.85) : 0;

    for (const d of this.decks) {
      const up = d.target > d.level;
      const dur = up ? (a.fadeInDuration ?? 1) : (a.fadeOutDuration ?? 0.8);
      const step = dt / Math.max(0.05, dur);
      d.level = up ? Math.min(d.target, d.level + step) : Math.max(d.target, d.level - step);  // straight, even fade
      if (d.target > 0 && this.sound.running) d.play();
      d.el.volume = this.muted ? 0 : Math.max(0, Math.min(1, d.level));
      if (d.level === 0 && d.target === 0 && !d.el.paused) d.el.pause();
    }
  }

  get debugLine() {
    const d = this.deck;
    return `music   ${d.status} ${(d.level * 100).toFixed(0)}%  ${d.src || '—'}`;
  }
}
