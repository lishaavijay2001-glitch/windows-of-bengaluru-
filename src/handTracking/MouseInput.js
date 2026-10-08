// Mouse / touch fallback. Same output shape as HandInput.
//   move           → look around
//   hold click     → pinch (look closer)
//   Space / Enter  → open palm (stir the scene, or open a closed window)
//   click          → open a closed window
//   C / Esc / double-click → close the window
//   V              → ✌️ the secret insight
//   → key / click the bell → next stop   (← previous). Moving the mouse never moves the bus.

import { clamp } from './smoothing.js';

export class MouseInput {
  constructor(emit) {
    this.emit = emit;
    this.state = { present: false, x: 0, y: 0, pinch: false, open: 4, lastSeen: 0 };

    addEventListener('pointermove', (e) => {
      const now = performance.now();
      this.state.present = true;
      this.state.lastSeen = now;
      this.state.x = clamp(((e.clientX / innerWidth) - 0.5) * 2.4);
      this.state.y = clamp(((e.clientY / innerHeight) - 0.5) * 2.4);
    });
    let downAt = 0, downX = 0, downY = 0;
    addEventListener('pointerdown', (e) => {
      if (e.target.closest && e.target.closest('#look-again, #sound, #gestures, .bus-bell, .pass-board')) return;
      this.state.pinch = true;
      this.state.lastSeen = downAt = performance.now();
      downX = e.clientX; downY = e.clientY;
    });
    const up = (e) => {
      if (this.state.pinch && e && e.type === 'pointerup' &&
          performance.now() - downAt < 260 && Math.hypot(e.clientX - downX, e.clientY - downY) < 10) this.emit('tap');
      this.state.pinch = false;
    };
    addEventListener('dblclick', () => this.emit('close'));
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    addEventListener('blur', up);
    addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); this.emit('palm'); }
      if (e.key === 'c' || e.key === 'C' || e.key === 'Escape') this.emit('close');
      if (e.key === 'v' || e.key === 'V') this.emit('secret');
      if (e.code === 'ArrowRight' || e.key === 'n') this.emit('go', { dir: 1 });
      if (e.code === 'ArrowLeft' || e.key === 'p') this.emit('go', { dir: -1 });
    });
  }
  tick() {}
}
