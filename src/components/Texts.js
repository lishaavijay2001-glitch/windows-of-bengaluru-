// Hand-lettered words that appear on the wall and the shutters.
// Each line is an SVG <text> that fades in/out via CSS.

const NS = 'http://www.w3.org/2000/svg';

export const SPOTS = {
  title: { x: 800, y: 470, size: 42, weight: 700, spacing: 4 },
  subtitle: { x: 800, y: 528, size: 23 },
  hint: { x: 800, y: 922, size: 28 },
  hintSub: { x: 800, y: 958, size: 18, opacity: 0.65 },
};

export class Texts {
  constructor(root) { this.root = root; this.lines = {}; }

  say(key, text, spot = SPOTS[key] || SPOTS.hint) {
    let el = this.lines[key];
    if (el && el.textContent === text && el.classList.contains('on')) return;
    if (!el) {
      el = document.createElementNS(NS, 'text');
      el.setAttribute('class', 'say');
      this.root.appendChild(el);
      this.lines[key] = el;
    }
    el.setAttribute('x', spot.x);
    el.setAttribute('y', spot.y);
    el.setAttribute('font-size', spot.size);
    if (spot.weight) el.setAttribute('font-weight', spot.weight);
    el.setAttribute('letter-spacing', spot.spacing || 0.5);
    el.style.setProperty('--o', spot.opacity ?? 1);
    if (el.classList.contains('on') && el.textContent !== text) {
      // cross-fade the change
      el.classList.remove('on');
      clearTimeout(el._t);
      el._t = setTimeout(() => { el.textContent = text; el.classList.add('on'); }, 380);
    } else {
      el.textContent = text;
      requestAnimationFrame(() => el.classList.add('on'));
    }
  }

  hush(key) {
    const el = this.lines[key];
    if (el) { clearTimeout(el._t); el.classList.remove('on'); }
  }

  hushAll() { Object.keys(this.lines).forEach((k) => this.hush(k)); }
}
