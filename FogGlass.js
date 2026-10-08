// The glass is faintly misted. Wherever your hand is, it wipes a clear patch
// that slowly mists over again — feedback that feels like the window, not a cursor.

const NS = 'http://www.w3.org/2000/svg';
const TRAIL = 16;

export class FogGlass {
  constructor(refs) {
    this.fog = refs.fog;
    this.firefly = refs.firefly;
    this.ring = refs.fireflyRing;
    this.halo = refs.fireflyHalo;
    this.holes = [];
    for (let i = 0; i < TRAIL; i++) {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('fill', 'url(#fog-hole)');
      c.setAttribute('r', '0');
      refs.fogHoles.appendChild(c);
      this.holes.push({ el: c, x: 800, y: 500, life: 0 });
    }
    this.i = 0;
    this.acc = 0;
    this.density = 0.4;
    this.targetDensity = 0.16;
    this.pinchRing = 0;
  }

  // x, y in stage coordinates
  update(x, y, dt, { pinch, visible }) {
    this.density += (this.targetDensity - this.density) * Math.min(1, dt * 1.2);
    this.fog.setAttribute('opacity', this.density.toFixed(3));

    this.acc += dt;
    if (visible && this.acc > 0.05) {
      this.acc = 0;
      const h = this.holes[this.i];
      h.x = x; h.y = y; h.life = 1;
      this.i = (this.i + 1) % TRAIL;
    }
    for (const h of this.holes) {
      h.life = Math.max(0, h.life - dt * 0.55);
      h.el.setAttribute('cx', h.x.toFixed(1));
      h.el.setAttribute('cy', h.y.toFixed(1));
      h.el.setAttribute('r', (90 * Math.sqrt(h.life)).toFixed(1));
    }

    this.pinchRing += ((pinch ? 1 : 0) - this.pinchRing) * Math.min(1, dt * 8);
    this.firefly.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    this.firefly.style.opacity = visible ? '1' : '0.25';
    this.ring.setAttribute('opacity', (this.pinchRing * 0.9).toFixed(2));
    this.ring.setAttribute('r', (30 - this.pinchRing * 16).toFixed(1));
    this.halo.setAttribute('r', (34 - this.pinchRing * 12).toFixed(1));
  }
}
