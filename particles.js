// Small particle system for scene interactions (falling leaves, steam, birds, a passing bicycle).
// Particles live inside a layer's fx group, so they inherit that layer's parallax.

const NS = 'http://www.w3.org/2000/svg';

export class Particles {
  constructor() { this.list = []; }

  spawn(parent, markup, o) {
    const el = document.createElementNS(NS, 'g');
    el.innerHTML = markup;
    el.setAttribute('opacity', '0');
    parent.appendChild(el);
    this.list.push({
      el, x: o.x, y: o.y, vx: o.vx || 0, vy: o.vy || 0, rot: 0, vr: o.vr || 0,
      sway: o.sway || 0, life: o.life || 3, age: 0, delay: o.delay || 0,
      grow: o.grow || 0, fade: !!o.fade, flap: !!o.flap, bob: o.bob || 0, seed: Math.random() * 6,
      g: o.g || 0, instant: !!o.instant,
    });
  }

  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const p = this.list[i];
      if (p.delay > 0) { p.delay -= dt; continue; }
      p.age += dt;
      if (p.age >= p.life) { p.el.remove(); this.list.splice(i, 1); continue; }
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const sx = p.sway ? Math.sin(p.age * 2.2 + p.seed) * p.sway : 0;
      const by = p.bob ? Math.sin(p.age * 12) * p.bob : 0;
      const sc = 1 + p.grow * p.age;
      const fy = p.flap ? 0.65 + 0.35 * Math.abs(Math.sin(p.age * 14 + p.seed)) : 1;
      p.el.setAttribute('transform',
        `translate(${(p.x + sx).toFixed(1)} ${(p.y + by).toFixed(1)}) rotate(${p.rot.toFixed(1)}) scale(${sc.toFixed(3)} ${(sc * fy).toFixed(3)})`);
      const tail = Math.min(1, (p.life - p.age) / 0.6);
      const head = p.instant ? 1 : Math.min(1, p.age / 0.25);
      const op = (p.fade ? 1 - p.age / p.life : 1) * tail * head;
      p.el.setAttribute('opacity', op.toFixed(3));
    }
  }

  clear() { this.list.forEach((p) => p.el.remove()); this.list = []; }
}
