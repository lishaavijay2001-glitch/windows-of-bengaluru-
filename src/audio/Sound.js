// Gesture music, synthesised live with Web Audio — no audio files.
//
//   drone            a soft tanpura-like Sa–Pa–Sa under every open window, in that window's key
//   moving your hand plucks the window's five-note scale: left→right climbs, raising your hand lifts the octave
//   pinch            a shimmering tone that rises as you zoom in
//   grip (fist held) a low tension tone that swells until the window shuts
//   open palm        a little cascade of bells
//   close            a wooden clack and a low note
//   open window      a quick upward strum
//   wave / walking   bells, then footsteps down the street
//   discovery        a soft chord as the name is written on the glass
//
// Browsers only allow sound after a click or key press, so audio wakes on the first one.

const RAGAS = {
  mohanam: [0, 2, 4, 7, 9],
  hamsadhwani: [0, 2, 4, 7, 11],
  hindolam: [0, 3, 5, 8, 10],
  shivaranjani: [0, 2, 3, 7, 9],
  abhogi: [0, 2, 3, 5, 9],
};
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.scale = RAGAS.mohanam;
    this.root = 50;
    this.zone = null;
    this.lastPluck = 0;
    this.listeners = [];
    this.cueScale = 1;   // turned down under a real soundtrack
  }

  get running() { return !!this.ctx && this.ctx.state === 'running'; }
  onChange(fn) { this.listeners.push(fn); }
  _changed() { this.listeners.forEach((fn) => fn(this)); }

  // Call from a user gesture.
  async start() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this._build();
    }
    if (this.ctx.state !== 'running') { try { await this.ctx.resume(); } catch { /* ignore */ } }
    this._changed();
  }

  toggleMute() {
    if (!this.ctx) { this.start(); return; }
    this.muted = !this.muted;
    this.master.gain.setTargetAtTime(this.muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    this._changed();
  }

  _build() {
    const c = this.ctx;
    this.master = c.createGain();
    this.master.gain.value = 0.8;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -18;
    this.master.connect(comp).connect(c.destination);

    // reverb from a generated impulse
    this.verb = c.createConvolver();
    const len = c.sampleRate * 2.6;
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    this.verb.buffer = ir;
    this.verbIn = c.createGain();
    this.verbIn.gain.value = 0.35;
    this.verbIn.connect(this.verb).connect(this.master);

    // shared noise
    this.noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const nd = this.noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    // drone: Sa, Pa, upper Sa through a slowly breathing low-pass
    this.droneGain = c.createGain();
    this.droneGain.gain.value = 0;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 650; lp.Q.value = 2;
    const lfo = c.createOscillator(); const lfoAmt = c.createGain();
    lfo.frequency.value = 0.13; lfoAmt.gain.value = 220;
    lfo.connect(lfoAmt).connect(lp.frequency); lfo.start();
    this.droneOsc = [0, 7, 12, -12].map((iv, i) => {
      const o = c.createOscillator();
      o.type = i === 3 ? 'sine' : 'sawtooth';
      o.frequency.value = hz(this.root + iv);
      o.detune.value = (i - 1.5) * 4;
      const g = c.createGain(); g.gain.value = i === 3 ? 0.5 : 0.22;
      o.connect(g).connect(lp); o.start();
      return { o, iv };
    });
    lp.connect(this.droneGain);
    this.droneGain.connect(this.master);
    this.droneGain.connect(this.verbIn);

    // pinch shimmer
    this.shimmer = c.createOscillator(); this.shimmer.type = 'sine';
    this.shimmer2 = c.createOscillator(); this.shimmer2.type = 'sine';
    this.shimGain = c.createGain(); this.shimGain.gain.value = 0;
    const tremNode = c.createGain(); tremNode.gain.value = 0.75;     // tremolo rides on top, never below silence
    const trem = c.createOscillator(); const tremAmt = c.createGain();
    trem.frequency.value = 6; tremAmt.gain.value = 0.25;
    trem.connect(tremAmt).connect(tremNode.gain); trem.start();
    this.shimmer.connect(this.shimGain); this.shimmer2.connect(this.shimGain);
    this.shimGain.connect(tremNode);
    tremNode.connect(this.verbIn); tremNode.connect(this.master);
    this.shimmer.start(); this.shimmer2.start();

    // grip tension
    this.tension = c.createOscillator(); this.tension.type = 'triangle';
    this.tensGain = c.createGain(); this.tensGain.gain.value = 0;
    this.tension.connect(this.tensGain).connect(this.master); this.tension.start();

    // ambience (rain)
    this.ambSrc = c.createBufferSource(); this.ambSrc.buffer = this.noise; this.ambSrc.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 0.6;
    this.ambGain = c.createGain(); this.ambGain.gain.value = 0;
    this.ambSrc.connect(bp).connect(this.ambGain).connect(this.master); this.ambSrc.start();

    this.setScene(this._pendingScene || { raga: 'mohanam', root: 50 });
  }

  setScene(music = {}) {
    this._pendingScene = music;
    this.scale = RAGAS[music.raga] || RAGAS.mohanam;
    this.root = music.root || 50;
    this.ambience = music.ambience || null;
    this.zone = null;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const d of this.droneOsc) d.o.frequency.setTargetAtTime(hz(this.root + d.iv), t, 0.6);
  }

  // per-frame
  update({ x, y, active, zoom, grip, drone, moving }) {
    if (!this.running) return;
    const t = this.ctx.currentTime;
    this.droneGain.gain.setTargetAtTime(drone, t, 0.4);
    this.ambGain.gain.setTargetAtTime(this.ambience === 'rain' ? (drone > 0.01 ? 0.12 : 0.04) : 0, t, 0.5);

    // pinch shimmer
    const sm = this.root + 24 + this.scale[Math.min(4, Math.floor(zoom * 5))];
    this.shimmer.frequency.setTargetAtTime(hz(sm) * (1 + zoom * 0.5), t, 0.1);
    this.shimmer2.frequency.setTargetAtTime(hz(sm + 7) * (1 + zoom * 0.5), t, 0.1);
    this.shimGain.gain.setTargetAtTime(zoom > 0.02 ? 0.035 * zoom : 0, t, 0.08);

    // grip tension
    this.tension.frequency.setTargetAtTime(hz(this.root - 12 + grip * 12), t, 0.05);
    this.tensGain.gain.setTargetAtTime(grip > 0.01 ? 0.05 + grip * 0.08 : 0, t, 0.05);

    // moving plucks the scale
    if (!active) { this.zone = null; return; }
    const steps = 10;
    const zone = Math.max(0, Math.min(steps - 1, Math.floor(((x + 1) / 2) * steps)));
    const octave = y < -0.35 ? 12 : y > 0.45 ? -12 : 0;
    const now = performance.now();
    if (this.zone !== null && zone !== this.zone && moving && now - this.lastPluck > 90) {
      const deg = zone % 5, oct = Math.floor(zone / 5) * 12;
      this.pluck(this.root + 12 + this.scale[deg] + oct + octave, 0.22);
      this.lastPluck = now;
    }
    this.zone = zone;
  }

  pluck(midi, vel = 0.25, when = 0) {
    if (!this.running || this.muted) return;
    vel *= this.cueScale;
    const c = this.ctx, t = c.currentTime + when;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    const f = c.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(hz(midi) * 8, t); f.frequency.exponentialRampToValueAtTime(hz(midi) * 1.5, t + 0.5);
    for (const [type, mul, det] of [['triangle', 1, 0], ['sawtooth', 1, 7], ['sine', 2, -3]]) {
      const o = c.createOscillator(); o.type = type;
      o.frequency.value = hz(midi) * mul; o.detune.value = det;
      const og = c.createGain(); og.gain.value = type === 'sawtooth' ? 0.25 : 0.6;
      o.connect(og).connect(f); o.start(t); o.stop(t + 1.7);
    }
    f.connect(g); g.connect(this.master); g.connect(this.verbIn);
  }

  bell(midi, vel = 0.15, when = 0) {
    if (!this.running || this.muted) return;
    vel *= this.cueScale;
    const c = this.ctx, t = c.currentTime + when;
    for (const [mul, v, dec] of [[1, 1, 2.4], [2.76, 0.4, 1.2], [5.4, 0.2, 0.6]]) {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = hz(midi) * mul;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vel * v, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      o.connect(g); g.connect(this.master); g.connect(this.verbIn);
      o.start(t); o.stop(t + dec + 0.05);
    }
  }

  noiseHit({ type = 'bandpass', freq = 900, q = 3, vel = 0.4, dur = 0.12, when = 0 } = {}) {
    if (!this.running || this.muted) return;
    vel *= this.cueScale;
    const c = this.ctx, t = c.currentTime + when;
    const src = c.createBufferSource(); src.buffer = this.noise;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }

  // ── gesture cues ──
  palm() {
    const s = this.scale;
    [0, 1, 2, 3, 4, 5, 6].forEach((i) => this.bell(this.root + 24 + s[i % 5] + Math.floor(i / 5) * 12, 0.12, i * 0.075));
  }
  open() {
    const s = this.scale;
    [0, 2, 4, 5, 7].forEach((i, k) => this.pluck(this.root + 12 + s[i % 5] + Math.floor(i / 5) * 12, 0.2, k * 0.045));
  }
  close() {
    this.noiseHit({ freq: 700, q: 4, vel: 0.7, dur: 0.09 });
    this.noiseHit({ freq: 420, q: 6, vel: 0.5, dur: 0.14, when: 0.06 });
    this.pluck(this.root, 0.3, 0.05);
  }
  wave() {
    const s = this.scale;
    [4, 3, 2, 1, 0].forEach((d, k) => this.bell(this.root + 31 + s[d], 0.09, k * 0.06));
  }
  discover() {
    this.pluck(this.root + 12, 0.18);
    this.pluck(this.root + 12 + this.scale[2], 0.15, 0.08);
    this.pluck(this.root + 12 + this.scale[3], 0.15, 0.16);
    this.bell(this.root + 36, 0.08, 0.3);
  }
  // ── the bus ──
  ding(when = 0) {            // the conductor's cord bell: two quick strikes
    if (!this.running || this.muted) return;
    const c = this.ctx;
    for (const k of [0, 0.32]) {
      const t = c.currentTime + when + k;
      for (const [f, v, d] of [[1480, 0.16, 1.4], [3560, 0.06, 0.6], [5900, 0.03, 0.25]]) {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g); g.connect(this.master); g.connect(this.verbIn);
        o.start(t); o.stop(t + d + 0.05);
      }
    }
  }
  engine(level) {             // 0 = off, ~0.3 idling, 1 = full tilt
    if (!this.running) return;
    const c = this.ctx;
    if (!this.eng) {
      const g = c.createGain(); g.gain.value = 0;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 320; f.Q.value = 3;
      const o1 = c.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 42;
      const o2 = c.createOscillator(); o2.type = 'square'; o2.frequency.value = 63;
      const g2 = c.createGain(); g2.gain.value = 0.4;
      const rattle = c.createBufferSource(); rattle.buffer = this.noise; rattle.loop = true;
      const rf = c.createBiquadFilter(); rf.type = 'bandpass'; rf.frequency.value = 900; rf.Q.value = 0.8;
      const rg = c.createGain(); rg.gain.value = 0.25;
      o1.connect(f); o2.connect(g2).connect(f); rattle.connect(rf).connect(rg).connect(f);
      f.connect(g).connect(this.master);
      o1.start(); o2.start(); rattle.start();
      this.eng = { g, f, o1, o2 };
    }
    const t = c.currentTime, e = this.eng;
    e.g.gain.setTargetAtTime(this.muted ? 0 : 0.11 * level * this.cueScale, t, 0.15);
    e.o1.frequency.setTargetAtTime(38 + level * 38, t, 0.25);
    e.o2.frequency.setTargetAtTime(57 + level * 57, t, 0.25);
    e.f.frequency.setTargetAtTime(220 + level * 380, t, 0.25);
  }
  whistle() {                 // conductor's whistle as the bus pulls in
    if (!this.running || this.muted) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 2750;
    const lfo = c.createOscillator(); lfo.frequency.value = 26; const la = c.createGain(); la.gain.value = 140;
    lfo.connect(la).connect(o.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.03);
    g.gain.setValueAtTime(0.07, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g).connect(this.master); o.start(t); lfo.start(t); o.stop(t + 0.55); lfo.stop(t + 0.55);
  }
  secret() {
    const s = this.scale;
    [4, 2, 4, 7, 9].forEach((d, k) => this.bell(this.root + 24 + s[d % 5] + Math.floor(d / 5) * 12, 0.11, k * 0.09));
  }
  step() { this.noiseHit({ type: 'lowpass', freq: 260 + Math.random() * 80, q: 1, vel: 0.35, dur: 0.11 }); }
  thunder() {
    this.noiseHit({ type: 'lowpass', freq: 140, q: 0.7, vel: 0.9, dur: 2.6 });
    this.noiseHit({ type: 'lowpass', freq: 400, q: 0.7, vel: 0.5, dur: 0.6 });
  }
  finale() {
    const s = this.scale;
    [0, 2, 4, 5, 7, 9, 10].forEach((i, k) => this.bell(this.root + 24 + s[i % 5] + Math.floor(i / 5) * 12, 0.1, k * 0.18));
    this.pluck(this.root, 0.25, 1.4);
  }
}
