// Mounts a scene's layers and moves them with parallax + zoom from the current intent.

import { Particles } from '../animations/particles.js';
import { GEO } from '../components/BusFrame.js';

const RX = 420;   // horizontal travel at depth 1 (the bus window is wide)
const RY = 200;   // vertical travel at depth 1
const ZOOM = 1.35;

export class SceneRenderer {
  constructor(root, { reduced = false } = {}) {
    this.root = root;
    this.reduced = reduced;
    this.particles = new Particles();
    this.layers = [];
    this.shakeT = 0;
    this.shakeLayer = null;
    this.rideX = 0;    // the bus moving: everything slides past, near things faster
  }

  attach(root) { this.particles.clear(); this.root = root; this.layers = []; }

  // extra: { layerId: markup } added on top of a layer (e.g. the bus-stop board on the nearest one)
  mount(scene, extra = {}) {
    this.particles.clear();
    this.scene = scene;
    const ill = scene.illustration;
    this.root.innerHTML = ill.layers.map((l) =>
      `<g class="layer" data-id="${l.id}"><g class="content">${l.svg()}${extra[l.id] || ''}</g><g class="fx"></g></g>`).join('');
    this.layers = [...this.root.querySelectorAll('.layer')].map((el, i) => ({
      el, depth: ill.layers[i].depth, id: ill.layers[i].id, fx: el.querySelector('.fx'),
    }));
  }

  _transform(depth, x, y, zoom) {
    const k = this.reduced ? 0.3 : 1;
    const ox = -x * RX * depth * k - this.rideX * (0.3 + depth * 0.7);
    const oy = -y * RY * depth * k;
    const s = 1 + zoom * ZOOM * (0.55 + 0.45 * depth);
    return { ox, oy, s };
  }

  update(intent, zoom, dt, t) {
    if (!this.layers.length) return;
    // a slow idle breath so the world never feels frozen
    const bx = this.reduced ? 0 : Math.sin(t * 0.00031) * 0.025;
    const by = this.reduced ? 0 : Math.sin(t * 0.00023) * 0.02;
    const { x: cx, y: cy } = GEO.C;
    if (this.shakeT > 0) this.shakeT = Math.max(0, this.shakeT - dt);
    for (const l of this.layers) {
      const { ox, oy, s } = this._transform(l.depth, intent.x + bx, intent.y + by, zoom);
      let sx = 0;
      if (this.shakeT > 0 && l.id === this.shakeLayer) sx = Math.sin(this.shakeT * 40) * 10 * this.shakeT;
      l.el.setAttribute('transform',
        `translate(${cx} ${cy}) scale(${s.toFixed(4)}) translate(${(ox - cx + sx).toFixed(2)} ${(oy - cy).toFixed(2)})`);
    }
    this.particles.update(dt);
  }

  // Where the scene's hotspot currently sits on screen (stage coordinates).
  hotspotScreen(intent, zoom) {
    const h = this.scene.illustration.hotspot;
    const { ox, oy, s } = this._transform(h.depth, intent.x, intent.y, zoom);
    const { x: cx, y: cy } = GEO.C;
    return { x: cx + s * (h.x + ox - cx), y: cy + s * (h.y + oy - cy) };
  }

  // API handed to a scene's interact(fx)
  get fx() {
    return {
      spawn: (layerId, markup, o) => {
        const l = this.layers.find((x) => x.id === layerId);
        if (l) this.particles.spawn(l.fx, markup, o);
      },
      shake: (layerId, amount = 1) => { this.shakeLayer = layerId; this.shakeT = 0.8 * amount; },
      hide: (selector) => this.root.querySelectorAll(selector).forEach((e) => e.classList.add('gone')),
      // add a class to matching elements for a while (fans spin faster, rain pours, plates wobble)
      pulse: (selector, cls, ms) => {
        const els = this.root.querySelectorAll(selector);
        els.forEach((e) => e.classList.add(cls));
        setTimeout(() => els.forEach((e) => e.classList.remove(cls)), ms);
      },
    };
  }

  interact() {
    this.scene.illustration.interact(this.fx);
  }
}
