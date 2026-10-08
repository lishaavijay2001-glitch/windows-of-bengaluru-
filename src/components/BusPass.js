// The bus pass: every gesture on one card. Shown before you board, and again any time (H or the corner button).
// Board by holding a 👍 (the same gesture that rings the bell later), clicking, or pressing Enter.

import { rect, line, blob, INK, resetSeed } from '../scenes/draw.js';
import { tween, ease, reducedMotion } from '../animations/tween.js';

export const GESTURES = [
  { icon: '✋', hand: 'Move your hand', mouse: 'move the mouse', does: 'look around' },
  { icon: '🤏', hand: 'Pinch and hold', mouse: 'hold the click', does: 'lean in closer' },
  { icon: '✊🖐', hand: 'Quick fist, then open', mouse: 'Space', does: 'roll up the blind · stir the scene' },
  { icon: '✊', hand: 'Hold a fist', mouse: 'C', does: 'pull the blind down' },
  { icon: '✌️', hand: 'Peace sign', mouse: 'V', does: 'a ticket with a secret' },
  { icon: '👍', hand: 'Hold a thumbs up', mouse: '→  or click the bell', does: 'ding ding, next stop' },
];

const W = 820, X = 800 - W / 2, TOP = 130, ROW = 62;

export class BusPass {
  constructor(root) {
    this.root = root;
    this.visible = false;
    this._resolve = null;
    this.progress = 0;
  }

  _markup(boarding) {
    resetSeed(5150);
    const H = 168 + GESTURES.length * ROW + 120;
    const rows = GESTURES.map((g, i) => {
      const y = TOP + 150 + i * ROW;
      return `
        ${i ? line([[X + 40, y - 34], [X + W - 40, y - 34]], { stroke: INK, sw: 1, opacity: 0.18, amp: 0.6 }) : ''}
        ${blob(X + 78, y - 8, 27, 25, { fill: '#fff8e6', sw: 1.6, lump: 0.05 })}
        <text x="${X + 78}" y="${y + 2}" text-anchor="middle" font-size="${g.icon.length > 2 ? 21 : 28}">${g.icon}</text>
        <text x="${X + 124}" y="${y - 2}" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="23" fill="${INK}">${g.hand}</text>
        <text x="${X + 124}" y="${y + 20}" font-family="'Baloo Tamma 2', sans-serif" font-weight="600" font-size="15" fill="${INK}" opacity=".55">mouse: ${g.mouse}</text>
        <text x="${X + W - 44}" y="${y + 4}" text-anchor="end" font-family="'Baloo Tamma 2', sans-serif" font-weight="600" font-size="20" fill="#9b2b1e">${g.does}</text>`;
    }).join('');
    const footY = TOP + H - 72;
    return `
      <rect x="-400" y="-400" width="2400" height="1800" fill="#140f0c" opacity=".55" class="pass-dim"/>
      <g class="pass-card">
        <g transform="translate(8 10)" opacity=".3">${rect(X, TOP, W, H, { fill: '#000', stroke: false, off: 0 })}</g>
        ${rect(X, TOP, W, H, { fill: '#f6ecd2', sw: 2.6 })}
        ${rect(X, TOP, W, 74, { fill: '#b8372b', sw: 2.4, off: 0 })}
        <circle cx="${X + W - 50}" cy="${TOP + 37}" r="13" fill="#140f0c" opacity=".85"/>
        <text x="${X + 40}" y="${TOP + 48}" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="30" fill="#fbf3e2">ಬಸ್ ಪಾಸ್</text>
        <text x="${X + 196}" y="${TOP + 46}" font-family="'Baloo Tamma 2', sans-serif" font-weight="600" font-size="21" fill="#fbf3e2" opacity=".9">BUS PASS · how to ride</text>
        <text x="${X + 40}" y="${TOP + 112}" font-family="'Baloo Tamma 2', sans-serif" font-weight="600" font-size="18" fill="${INK}" opacity=".75">Hold your hand up to the camera. It is your ticket to six old eateries.</text>
        ${rows}
        ${line([[X + 30, footY - 30], [X + W - 30, footY - 28]], { stroke: INK, sw: 1.4, opacity: 0.4 })}
        <g class="pass-board" role="button" tabindex="0" aria-label="${boarding ? 'Board the bus' : 'Back to the ride'}" style="cursor:pointer">
          ${rect(800 - 170, footY - 18, 340, 52, { fill: '#2f5f86', sw: 2.2, off: 0 })}
          <rect class="pass-fill" x="${800 - 168}" y="${footY - 16}" width="0" height="48" fill="#4f86b3"/>
          <text x="800" y="${footY + 16}" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="22" fill="#fbf3e2">${boarding ? 'Hold 👍 (or click) to board' : 'Hold 👍 (or click) to ride on'}</text>
        </g>
        <text x="800" y="${footY + 56}" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-size="14" fill="${INK}" opacity=".5">This pass is in the corner any time: press H, or the ✋ button.</text>
      </g>`;
  }

  // returns a promise that resolves when the pass is put away
  show(boarding = true) {
    if (this.visible) return this._promise;
    this.visible = true;
    this.root.innerHTML = this._markup(boarding);
    this.root.style.display = '';
    const card = this.root.querySelector('.pass-card');
    const btn = this.root.querySelector('.pass-board');
    btn.addEventListener('click', (e) => { e.stopPropagation(); this.hide(); });
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); this.hide(); } });
    this._fill = this.root.querySelector('.pass-fill');
    if (!reducedMotion()) {
      tween(600, (t) => card.setAttribute('transform', `translate(0 ${((1 - t) * 700).toFixed(1)}) rotate(${((1 - t) * -6).toFixed(2)} 800 500)`), ease.outBack);
    }
    this._promise = new Promise((res) => { this._resolve = res; });
    return this._promise;
  }

  // feed the 👍 hold progress (0..1) to fill the button
  setProgress(p) {
    if (!this.visible || !this._fill) return;
    this._fill.setAttribute('width', (336 * Math.max(0, Math.min(1, p))).toFixed(1));
  }

  async hide() {
    if (!this.visible) return;
    this.visible = false;
    const card = this.root.querySelector('.pass-card');
    const dim = this.root.querySelector('.pass-dim');
    await tween(reducedMotion() ? 10 : 420, (t) => {
      card && card.setAttribute('transform', `translate(0 ${(-t * 800).toFixed(1)}) rotate(${(t * 5).toFixed(2)} 800 500)`);
      dim && dim.setAttribute('opacity', (0.55 * (1 - t)).toFixed(3));
    }, ease.inCubic);
    if (!this.visible) { this.root.innerHTML = ''; this.root.style.display = 'none'; }
    const r = this._resolve; this._resolve = null; r && r();
  }

  toggle() { return this.visible ? this.hide() : this.show(false); }
}
