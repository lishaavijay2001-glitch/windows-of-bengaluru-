// When you find the eatery, its name appears as if a fingertip wrote it on the misted glass.

const NS = 'http://www.w3.org/2000/svg';
import { tween, ease } from '../animations/tween.js';

export class FogWriting {
  constructor(root) {
    this.root = root;
    this.visible = false;
  }

  async write(scene) {
    this.visible = true;
    const uid = `w${Date.now().toString(36)}`;
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    // written on the right half of the glass, clear of the bus-stop board on the left
    const X = 968, nameSize = scene.name.length > 16 ? 33 : 40;
    this.root.innerHTML = `
      <defs><clipPath id="${uid}"><rect class="write-rect" x="${X - 220}" y="560" width="0" height="200"/></clipPath></defs>
      <g clip-path="url(#${uid})" class="fogtext">
        <rect x="${X - 196}" y="596" width="392" height="132" rx="40" fill="#f6f1e6" opacity=".72" filter="url(#soft)"/>
        <text x="${X}" y="648" text-anchor="middle" font-family="'Rozha One','Baloo Tamma 2',serif" font-size="${nameSize}" fill="#2a1a12">${esc(scene.name)}</text>
        <text x="${X}" y="680" text-anchor="middle" font-family="'Baloo Tamma 2',sans-serif" font-size="19" fill="#2a1a12" opacity=".85">${esc(scene.location)}</text>
        <text x="${X}" y="710" text-anchor="middle" font-family="'Baloo Tamma 2',sans-serif" font-size="15.5" fill="#6b3d1f">${esc(scene.copy.line)}</text>
      </g>`;
    const r = this.root.querySelector('.write-rect');
    this.root.style.opacity = '1';
    await tween(1800, (t) => r.setAttribute('width', (t * 440).toFixed(1)), ease.outCubic);
  }

  async clear() {
    if (!this.visible) return;
    this.visible = false;
    await tween(400, (t) => { this.root.style.opacity = String(1 - t); });
    this.root.innerHTML = '';
  }
}
