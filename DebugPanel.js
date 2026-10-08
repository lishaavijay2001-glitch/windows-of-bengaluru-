// Press D: a small panel with the camera feed, landmarks and gesture readouts.
// For tuning only — the experience itself never shows the camera.

import { TUNING } from '../handTracking/gestures.js';

export class DebugPanel {
  constructor(input) {
    this.input = input;
    this.el = document.createElement('div');
    this.el.id = 'debug';
    this.el.innerHTML = `<canvas width="240" height="180"></canvas><pre></pre>`;
    document.body.appendChild(this.el);
    this.ctx = this.el.querySelector('canvas').getContext('2d');
    this.pre = this.el.querySelector('pre');
    this.on = false;
    this.log = [];
    addEventListener('keydown', (e) => { if (e.key === 'd' || e.key === 'D') this.toggle(); });
    input.on('palm', (s) => this.note(`palm (${s})`));
    input.on('go', (s, d) => this.note(`👍 go ${d && d.dir < 0 ? '← back' : '→ next'} (${s})`));
    input.on('close', (s) => this.note(`close (${s})`));
    input.on('secret', (s) => this.note(`✌️ secret (${s})`));
  }
  toggle() { this.on = !this.on; this.el.classList.toggle('on', this.on); }
  note(s) { this.log.unshift(`${(performance.now() / 1000).toFixed(1)}s ${s}`); this.log.length = Math.min(this.log.length, 4); }

  draw(state, extra = '') {
    if (!this.on) return;
    const { hand, intent } = this.input;
    const c = this.ctx, W = 240, H = 180;
    c.fillStyle = '#111'; c.fillRect(0, 0, W, H);
    if (hand.video.readyState >= 2) {
      c.save(); c.translate(W, 0); c.scale(-1, 1);
      c.globalAlpha = 0.7; c.drawImage(hand.video, 0, 0, W, H); c.restore();
    }
    const l = hand.debug.landmarks;
    if (l) {
      c.fillStyle = '#ffd36a';
      for (const p of l) { c.beginPath(); c.arc((1 - p.x) * W, p.y * H, 2.5, 0, 7); c.fill(); }
      c.strokeStyle = intent.pinch ? '#ff6b6b' : '#7fe0c4'; c.lineWidth = 2;
      c.beginPath(); c.moveTo((1 - l[4].x) * W, l[4].y * H); c.lineTo((1 - l[8].x) * W, l[8].y * H); c.stroke();
    }
    this.pre.textContent =
`state   ${state}
camera  ${hand.status}   fps ${hand.debug.fps}
source  ${intent.source}  hand ${hand.state.present ? 'yes' : 'no'}
x ${intent.x.toFixed(2)}  y ${intent.y.toFixed(2)}
pinch   ${hand.debug.ratio.toFixed(2)} (on<${TUNING.pinchOn} off>${TUNING.pinchOff}) ${intent.pinch ? '●' : '○'}
fingers ${hand.state.open}/4  fist ${hand.state.fist ? '●' : '○'}  ✌️ ${hand.state.peace ? '●' : '○'}  👍 ${hand.state.thumbs ? '●' : '○'} ${((hand.state.goProgress || 0) * 100).toFixed(0)}%  grip ${(intent.grip * 100).toFixed(0)}%
${extra}
${this.log.join('\n')}`;
  }
}
