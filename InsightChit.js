// ✌️ The secret: the conductor hands you a punched bus ticket with one true, fun fact about the stop.
// "ಗೊತ್ತಾ?" is Kannada for "you know?". (An illustrated keepsake, not a real ticket.)

import { rect, line, INK, resetSeed } from '../scenes/draw.js';
import { tween, ease, reducedMotion } from '../animations/tween.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function wrap(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

const TINTS = ['#f6dbe2', '#dcefdc', '#f8eab8', '#dbe8f6', '#f3dccb', '#e6def4'];
const W = 560, X = 800 - W / 2, TOP = 268;

export class InsightChit {
  constructor(root) {
    this.root = root;
    this.visible = false;
    this.timer = null;
  }

  async show(scene, stopNo = 1) {
    const ins = scene.insight;
    if (!ins) return false;
    if (this.visible) { this.hide(); return false; }      // a second ✌️ hands it back
    this.visible = true;
    resetSeed(77 + scene.id.length);
    const lines = wrap(ins.text, 46);
    const H = 108 + lines.length * 29 + 30;
    const tint = TINTS[(stopNo - 1) % TINTS.length];
    // perforated left edge: little bites out of the paper
    let bites = '';
    for (let y = TOP + 14; y < TOP + H - 8; y += 18) bites += `<circle cx="${X}" cy="${y}" r="5" fill="#000" />`;
    const stop = scene.stop || { kn: '', en: scene.name };
    this.root.innerHTML = `
      <defs><mask id="ticket-mask"><rect x="${X - 10}" y="${TOP - 10}" width="${W + 20}" height="${H + 20}" fill="#fff"/>${bites}
        <circle cx="${X + W - 46}" cy="${TOP + 40}" r="11" fill="#000"/></mask></defs>
      <g class="ticket"><g class="ticket-tilt">
        <g transform="translate(7 9)" opacity=".25"><rect x="${X}" y="${TOP}" width="${W}" height="${H}" fill="#000" mask="url(#ticket-mask)"/></g>
        <rect x="${X}" y="${TOP}" width="${W}" height="${H}" fill="${tint}" mask="url(#ticket-mask)"/>
        <g mask="url(#ticket-mask)">
          ${rect(X + 2, TOP + 2, W - 4, H - 4, { stroke: INK, sw: 2.2, amp: 0.8, off: 0 })}
          ${line([[X + 24, TOP + 82], [X + W - 24, TOP + 84]], { stroke: INK, sw: 1.2, opacity: 0.5 })}
        </g>
        <text x="${X + 28}" y="${TOP + 34}" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="15" fill="${INK}" opacity=".7" letter-spacing="1.5">ಬಸ್ ಟಿಕೆಟ್ · BUS TICKET · STOP ${String(stopNo).padStart(2, '0')}</text>
        <text x="${X + 28}" y="${TOP + 68}" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="30" fill="#c2452f">ಗೊತ್ತಾ?</text>
        <text x="${X + 142}" y="${TOP + 66}" font-family="'Baloo Tamma 2', sans-serif" font-weight="600" font-size="18" fill="${INK}" opacity=".75">did you know? · ${esc(stop.en.toLowerCase())}</text>
        ${lines.map((l, i) => `<text x="${X + 28}" y="${TOP + 118 + i * 29}" font-family="'Baloo Tamma 2', sans-serif" font-weight="600" font-size="21" fill="${INK}">${esc(l)}</text>`).join('')}
        <text x="${X + 28}" y="${TOP + H - 16}" font-family="'Baloo Tamma 2', sans-serif" font-size="13" fill="${INK}" opacity=".5">source: ${esc(ins.source)}</text>
        <text x="${X + W - 26}" y="${TOP + H - 16}" text-anchor="end" font-size="22">✌️</text>
      </g></g>`;
    const tk = this.root.querySelector('.ticket');
    if (!reducedMotion()) {
      await tween(650, (t) => tk.setAttribute('transform', `translate(${((1 - t) * 900).toFixed(1)} ${((1 - t) * 60).toFixed(1)}) rotate(${(-3 + (1 - t) * 14).toFixed(2)} 800 ${TOP + H / 2})`), ease.outBack);
    } else tk.setAttribute('transform', `rotate(-3 800 ${TOP + H / 2})`);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.hide(), 14000);
    return true;
  }

  async hide() {
    if (!this.visible) return;
    this.visible = false;
    clearTimeout(this.timer);
    const tk = this.root.querySelector('.ticket');
    if (tk) await tween(380, (t) => tk.setAttribute('transform', `translate(${(t * 900).toFixed(1)} ${(t * 40).toFixed(1)}) rotate(${(-3 + t * 10).toFixed(2)} 800 400)`), ease.inCubic);
    if (!this.visible) this.root.innerHTML = '';
  }
}
