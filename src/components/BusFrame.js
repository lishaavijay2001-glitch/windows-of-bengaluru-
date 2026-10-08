// Inside an old Bengaluru city bus. One window, one canvas blind, and the city outside.
// (An original drawing in the spirit of 70s Bangalore buses; not copied from any artwork.)

import { rect, blob, line, poly, treeCanopy, rng, INK, resetSeed } from '../scenes/draw.js';
import { tween, ease, reducedMotion } from '../animations/tween.js';

// window geometry (stage coordinates, viewBox 1600×1000)
export const GEO = {
  C: { x: 800, y: 490 },
  left: 420, right: 1180, top: 230, bottom: 750, apex: 230,
};
const L = GEO.left, R = GEO.right, T = GEO.top, B = GEO.bottom, RAD = 46;
const W = R - L, H = B - T;
const GLASS = `M${L + RAD} ${T} H${R - RAD} A${RAD} ${RAD} 0 0 1 ${R} ${T + RAD} V${B - RAD} A${RAD} ${RAD} 0 0 1 ${R - RAD} ${B} H${L + RAD} A${RAD} ${RAD} 0 0 1 ${L} ${B - RAD} V${T + RAD} A${RAD} ${RAD} 0 0 1 ${L + RAD} ${T} Z`;
const OUTER = (p) => `M${L - p + RAD} ${T - p} H${R + p - RAD} A${RAD} ${RAD} 0 0 1 ${R + p} ${T - p + RAD} V${B + p - RAD} A${RAD} ${RAD} 0 0 1 ${R + p - RAD} ${B + p} H${L - p + RAD} A${RAD} ${RAD} 0 0 1 ${L - p} ${B + p - RAD} V${T - p + RAD} A${RAD} ${RAD} 0 0 1 ${L - p + RAD} ${T - p} Z`;

const CANVAS = '#c9b07a';      // khaki tarpaulin
const CANVAS_DK = '#9c8452';

function interior() {
  resetSeed(3101);
  const r = rng(31);
  // rivets along the panel seams
  let rivets = '';
  for (const y of [150, 860, 940]) for (let x = 20; x < 1600; x += 48) rivets += `<circle cx="${x}" cy="${y}" r="3" fill="#b9ab88"/>`;
  for (const x of [200, 1400]) for (let y = 180; y < 840; y += 48) rivets += `<circle cx="${x}" cy="${y}" r="3" fill="#b9ab88"/>`;
  // a few scuffs and a sticker, because buses are lived in
  let scuffs = '';
  for (let i = 0; i < 8; i++) scuffs += line([[r() * 1600, 840 + r() * 150], [r() * 1600, 840 + r() * 150]], { stroke: '#2f4a38', sw: 1.2, opacity: 0.35 });
  const strap = (x, i) => `
    <g class="strap" style="animation-delay:${(-i * 0.7).toFixed(1)}s">
      ${line([[x, 128], [x, 176]], { sw: 5, stroke: '#3a2a20' })}
      <ellipse cx="${x}" cy="196" rx="15" ry="22" fill="none" stroke="#3a2a20" stroke-width="7"/>
    </g>`;
  return `
    <defs>
      <linearGradient id="bus-panel" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
        <stop offset="0" stop-color="#e9d8ae"/><stop offset=".55" stop-color="#f1e4c2"/><stop offset=".784" stop-color="#e6d3a6"/>
        <stop offset=".785" stop-color="#b8372b"/><stop offset=".815" stop-color="#a83226"/>
        <stop offset=".816" stop-color="#4f7a5c"/><stop offset="1" stop-color="#3d6249"/>
      </linearGradient>
      <linearGradient id="bus-chrome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f4f6f7"/><stop offset=".5" stop-color="#b9c1c5"/><stop offset="1" stop-color="#8e979c"/>
      </linearGradient>
      <linearGradient id="bus-ceiling" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#d9caa2"/><stop offset="1" stop-color="#efe3c4"/>
      </linearGradient>
    </defs>
    <!-- the wall of the bus, with the window cut out -->
    <path d="M-400 -400 H2000 V1400 H-400 Z ${GLASS}" fill="url(#bus-panel)" fill-rule="evenodd"/>
    <path d="M-400 -400 H2000 V120 Q800 150 -400 120 Z" fill="url(#bus-ceiling)"/>
    ${line([[-400, 121], [800, 141], [2000, 121]], { sw: 2, stroke: '#b9ab88' })}
    ${line([[-400, 784], [2000, 784]], { sw: 2.4, stroke: INK })}${line([[-400, 816], [2000, 816]], { sw: 2.4, stroke: INK })}
    ${rivets}${scuffs}
    <!-- window frame: rubber seal + aluminium -->
    <path d="${OUTER(30)} ${GLASS}" fill="url(#bus-chrome)" fill-rule="evenodd" stroke="${INK}" stroke-width="2.4"/>
    <path d="${OUTER(10)} ${GLASS}" fill="#2a2a2a" fill-rule="evenodd"/>
    <path d="${GLASS}" fill="none" stroke="${INK}" stroke-width="2"/>
    ${rect(L + 30, T - 26, 34, 14, { fill: '#8e979c', sw: 1.6, off: 0 })}${rect(R - 64, T - 26, 34, 14, { fill: '#8e979c', sw: 1.6, off: 0 })}
    <!-- the sill you lean on -->
    ${rect(L - 60, B + 26, W + 120, 22, { fill: 'url(#bus-chrome)', sw: 2.2, off: 0 })}
    <!-- grab rail, straps, bell cord -->
    ${line([[-400, 120], [2000, 120]], { sw: 12, stroke: '#9aa3a8' })}${line([[-400, 116], [2000, 116]], { sw: 3, stroke: '#f4f6f7', opacity: 0.8 })}
    ${[240, 560, 1040, 1360].map(strap).join('')}
    <!-- the bell cord: hold a 👍 and it pulls down; at full pull the bell rings and the bus goes -->
    <polyline class="bell-cord" points="-400,72 800,77 1460,82" fill="none" stroke="#7a4b2c" stroke-width="2.6" stroke-linejoin="round"/>
    <g class="cord-toggle" transform="translate(800 77)">${blob(0, 10, 8, 12, { fill: '#c98b2f', sw: 1.6, lump: 0.05 })}</g>
    <g class="bus-bell" role="button" tabindex="0" aria-label="Ring the bell: next stop" style="cursor:pointer">
      <circle cx="1460" cy="90" r="40" fill="transparent"/>
      <g transform="translate(1460 74)"><g class="bell-body">${blob(0, 8, 20, 18, { fill: '#d9a441', sw: 2, lump: 0.03 })}${blob(0, 24, 6, 6, { fill: '#8a5a1a', sw: 1.4 })}</g></g>
      <circle class="bell-glow" cx="1460" cy="84" r="34" fill="#ffe9a0" opacity="0"/>
    </g>
    <!-- a painted notice above the window -->
    <g transform="translate(800 182)">
      ${rect(-170, -26, 340, 54, { fill: '#fbf3e2', sw: 2, off: 0 })}
      <text y="2" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="22" fill="#9b2b1e">ಕೈ ಹೊರಗೆ ಹಾಕಬೇಡಿ</text>
      <text y="20" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-weight="600" font-size="12" fill="${INK}" opacity=".75">please keep your hands inside the bus</text>
    </g>
    <!-- the seat in front of you -->
    <g transform="translate(0 0)">
      ${poly([[40, 1010], [60, 868], [110, 846], [520, 846], [560, 868], [580, 1010]], { fill: '#7a3328', smooth: true, step: 60 })}
      ${line([[90, 880], [540, 880]], { stroke: '#5a2219', sw: 2 })}
      ${line([[70, 850], [70, 820], [550, 820], [550, 850]], { sw: 9, stroke: '#9aa3a8' })}${line([[72, 818], [548, 818]], { sw: 2.4, stroke: '#f4f6f7', opacity: 0.8 })}
    </g>`;
}

// the canvas blind: hangs from the top of the window, rolls up from the bottom
function blindMarkup() {
  resetSeed(3201);
  let folds = '';
  for (let x = L + 50; x < R; x += 95) folds += line([[x, T], [x + 6, B]], { stroke: CANVAS_DK, sw: 2, amp: 1.5, opacity: 0.6 });
  for (let y = T + 70; y < B; y += 120) folds += line([[L, y], [R, y + 4]], { stroke: '#d9c494', sw: 3, amp: 1, opacity: 0.6 });
  return `
    <defs><clipPath id="blind-clip"><rect class="blind-rect" x="${L - 20}" y="${T - 20}" width="${W + 40}" height="${H + 20}"/></clipPath></defs>
    <g clip-path="url(#glass-clip)"><g clip-path="url(#blind-clip)">
      <rect x="${L}" y="${T}" width="${W}" height="${H}" fill="${CANVAS}"/>
      ${folds}
      <rect class="blind-shade" x="${L}" y="${T}" width="${W}" height="${H}" fill="#000" opacity=".12"/>
    </g></g>
    <g class="blind-roll">
      <rect x="${L - 26}" y="-14" width="${W + 52}" height="30" rx="15" fill="${CANVAS_DK}" stroke="${INK}" stroke-width="2.4"/>
      <rect x="${L - 22}" y="-8" width="${W + 44}" height="7" rx="3.5" fill="#e3cf9c" opacity=".7"/>
      ${blob(L + 80, 16, 7, 9, { fill: '#7a4b2c', sw: 1.4 })}${blob(R - 80, 16, 7, 9, { fill: '#7a4b2c', sw: 1.4 })}
    </g>
    <g class="blind-cords">
      <line class="cord" x1="${L + 80}" y1="${T - 18}" x2="${L + 80}" y2="${T}" stroke="#7a4b2c" stroke-width="2.4"/>
      <line class="cord" x1="${R - 80}" y1="${T - 18}" x2="${R - 80}" y2="${T}" stroke="#7a4b2c" stroke-width="2.4"/>
    </g>`;
}

export function buildBus(svg) {
  svg.innerHTML = `
  <defs>
    <clipPath id="glass-clip"><path d="${GLASS}"/></clipPath>
    <radialGradient id="fog-hole"><stop offset="0" stop-color="#000" stop-opacity="1"/><stop offset=".55" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="firefly"><stop offset="0" stop-color="#fffbe0"/><stop offset=".35" stop-color="#ffe9a0" stop-opacity=".8"/><stop offset="1" stop-color="#ffd36a" stop-opacity="0"/></radialGradient>
    <mask id="fog-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="1000">
      <rect x="0" y="0" width="1600" height="1000" fill="#fff"/><g class="fog-holes"></g>
    </mask>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
  </defs>
  <g id="bus">
    <g id="bus-shake">
      <g class="glass" clip-path="url(#glass-clip)">
        <rect x="0" y="0" width="1600" height="1000" fill="#cfe3e8"/>
        <g class="scene"></g>
        <g class="road" opacity="0"></g>
        <rect class="fog" x="0" y="0" width="1600" height="1000" fill="#eef2ea" opacity=".14" mask="url(#fog-mask)"/>
        <g class="writing"></g>
        <g class="firefly-g" pointer-events="none">
          <circle class="firefly-halo" r="34" fill="url(#firefly)" opacity=".7"/>
          <circle class="firefly-ring" r="16" fill="none" stroke="#fff6c9" stroke-width="2" opacity="0"/>
        </g>
      </g>
      <g class="interior">${interior()}</g>
      <g class="blind">${blindMarkup()}</g>
      <g class="chit"></g>
    </g>
  </g>
  <g id="exterior" opacity="0" style="display:none"></g>
  <g id="texts" font-family="'Baloo Tamma 2', sans-serif" fill="#f3e6c8" text-anchor="middle"></g>
  <g id="finale-ui"></g>
  <g id="pass" style="display:none"></g>`;

  const q = (c) => svg.querySelector('.' + c);
  return {
    bus: svg.querySelector('#bus'), shake: svg.querySelector('#bus-shake'), exterior: svg.querySelector('#exterior'),
    scene: q('scene'), road: q('road'), fog: q('fog'), fogHoles: q('fog-holes'), writing: q('writing'),
    firefly: q('firefly-g'), fireflyRing: q('firefly-ring'), fireflyHalo: q('firefly-halo'), chit: q('chit'),
    blind: q('blind'), grille: null,
    cord: q('bell-cord'), cordToggle: q('cord-toggle'), bell: q('bus-bell'), bellGlow: q('bell-glow'), bellBody: q('bell-body'),
    texts: svg.querySelector('#texts'), finaleUI: svg.querySelector('#finale-ui'), pass: svg.querySelector('#pass'),
  };
}

// ── the blind: same interface the shutters had (amount 0 = down/closed, 1 = rolled up/open) ──
export function createBlind(el) {
  const clipRect = el.querySelector('.blind-rect');
  const roll = el.querySelector('.blind-roll');
  const cords = el.querySelectorAll('.cord');
  const shade = el.querySelector('.blind-shade');
  let amount = 0, busy = false;
  const apply = (a) => {
    amount = Math.max(-0.05, Math.min(1.05, a));
    const edge = T + H * (1 - Math.max(0, Math.min(1, amount)));    // bottom edge of the canvas
    clipRect.setAttribute('height', (edge - (T - 20)).toFixed(1));
    roll.setAttribute('transform', `translate(0 ${(edge - 2).toFixed(1)})`);
    cords.forEach((c) => c.setAttribute('y2', (edge - 6).toFixed(1)));
    shade.setAttribute('opacity', (0.05 + 0.12 * amount).toFixed(3));
  };
  apply(0);
  return {
    get amount() { return Math.max(0, Math.min(1, amount)); },
    set(a) { apply(a); },
    get busy() { return busy; },
    async open(ms = 1100) {
      busy = true;
      const from = amount;
      await tween(reducedMotion() ? 10 : ms, (t) => apply(from + (1 - from) * t), ease.outBack);
      busy = false;
    },
    async close(ms = 650) {
      busy = true;
      const from = amount;
      await tween(reducedMotion() ? 10 : ms, (t) => apply(from * (1 - t)), ease.inCubic);
      busy = false;
    },
    async creak() {},
  };
}
