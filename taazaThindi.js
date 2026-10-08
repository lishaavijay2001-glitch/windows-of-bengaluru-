// Taaza Thindi — a stand-up darshini at night, lit by tubelights.
// Signature: navy night, cool green-white tubelight glow, rolling shutter half up,
// tall steel tables with people eating standing, moths circling the street light.
// (Illustrative, not drawn from the real place.)

import {
  rect, blob, line, poly, sign, person, tumbler, resetSeed, rng, INK, pick,
} from './draw.js';

const TUBE = '#e8fff0';
const NAVY = '#141a33';

const tubelight = (x, y, w = 120) => `
  <g class="tube">
    <rect x="${x - 30}" y="${y - 30}" width="${w + 60}" height="70" rx="35" fill="url(#tt-tubeglow)"/>
    ${rect(x, y, w, 10, { fill: TUBE, sw: 1.4, off: 0, amp: 0.3 })}
  </g>`;

const standingTable = (x, y) => `
  ${line([[x, y], [x, y + 92]], { sw: 5, stroke: '#9aa3a8' })}${line([[x - 26, y + 94], [x + 26, y + 94]], { sw: 4, stroke: '#9aa3a8' })}
  ${blob(x, y, 52, 11, { fill: '#cfd5d8', sw: 2, lump: 0.02 })}
  ${blob(x - 18, y - 6, 18, 5, { fill: '#e8edf0', sw: 1.2, lump: 0.02 })}${blob(x - 18, y - 9, 8, 4, { fill: '#c98b2f', sw: 1, lump: 0.1 })}
  ${tumbler(x + 22, y - 4, 0.7)}`;

function far() {
  resetSeed(2501);
  const r = rng(251);
  let stars = '';
  for (let i = 0; i < 26; i++) stars += `<circle cx="${(r() * 2400 - 400).toFixed(0)}" cy="${(r() * 320 - 200).toFixed(0)}" r="${(0.8 + r()).toFixed(1)}" fill="#f6efd8" opacity=".5"/>`;
  let fairy = '';
  for (let i = 0; i < 40; i++) {
    const t = i / 39;
    fairy += `<circle class="${i % 3 ? '' : 'twinkle'}" cx="${(1050 + t * 380).toFixed(0)}" cy="${(330 + Math.sin(t * Math.PI) * 40).toFixed(0)}" r="3" fill="${pick(['#ffd36a', '#ff8fa3', '#9fe0ff'], r)}"/>`;
  }
  return `
  <defs>
    <linearGradient id="tt-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${NAVY}"/><stop offset=".7" stop-color="#2a3460"/><stop offset="1" stop-color="#4a3f6b"/>
    </linearGradient>
    <radialGradient id="tt-tubeglow"><stop offset="0" stop-color="#d9ffe9" stop-opacity=".75"/><stop offset="1" stop-color="#d9ffe9" stop-opacity="0"/></radialGradient>
    <radialGradient id="tt-roomglow"><stop offset="0" stop-color="#e9fff2" stop-opacity=".55"/><stop offset="1" stop-color="#e9fff2" stop-opacity="0"/></radialGradient>
    <radialGradient id="tt-lamp"><stop offset="0" stop-color="#fff2c4" stop-opacity=".6"/><stop offset="1" stop-color="#fff2c4" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="-1400" y="-900" width="4400" height="1520" fill="url(#tt-sky)"/>
  ${stars}
  ${poly([[-400, 600], [-400, 420], [100, 420], [100, 380], [420, 380], [420, 440], [1000, 440], [1000, 360], [1480, 360], [1480, 430], [2000, 430], [2000, 600]], { fill: '#1d2240', stroke: false })}
  ${fairy}
  <rect x="-1400" y="598" width="4400" height="900" fill="#252a3f"/>`;
}

function back() {
  resetSeed(2602);
  const r = rng(262);
  let s = '';
  let x = -320;
  while (x < 1900) {
    const w = 170 + r() * 80, h = 190 + r() * 60, top = 612 - h;
    s += rect(x, top, w, h, { fill: pick(['#3b4266', '#454a70', '#353b5c'], r), stroke: '#10142a' });
    // rolling shutters, down for the night
    s += rect(x + 16, top + 60, w - 32, h - 60, { fill: '#5e6680', stroke: '#10142a', sw: 1.6 });
    for (let y = top + 70; y < 600; y += 10) s += line([[x + 18, y], [x + w - 18, y]], { stroke: '#4a5068', sw: 1.2, amp: 0.2 });
    s += rect(x + 16, top + 18, w - 32, 30, { fill: pick(['#2a3050', '#6b3a4a', '#2f5a52'], r), stroke: '#10142a', sw: 1.4 });
    x += w + 8;
  }
  return s + `
  <!-- a parked motorbike -->
  <g transform="translate(1250 650)">
    ${blob(0, 0, 20, 20, { fill: '#10142a', lump: 0.02 })}${blob(96, 0, 20, 20, { fill: '#10142a', lump: 0.02 })}
    ${poly([[0, -10], [30, -40], [80, -40], [96, -6]], { fill: '#8c2f3a', stroke: '#10142a', smooth: true, step: 30 })}
    ${line([[80, -40], [90, -64], [104, -66]], { sw: 3, stroke: '#10142a' })}
  </g>`;
}

function mid() {
  resetSeed(2703);
  const r = rng(273);
  const cloth = ['#3f6f8f', '#c2452f', '#e8dcc0', '#2f6b6b', '#d9774a', '#8c4a7a', '#f1ece0'];
  let standing = '';
  [[260, 690], [700, 700], [1180, 690]].forEach(([tx, ty], i) => {
    standing += person(tx - 70, ty + 70, 1.05, { seed: 2000 + i * 3, cloth: pick(cloth, r) });
    standing += person(tx + 70, ty + 70, 1.05, { seed: 2001 + i * 3, cloth: pick(cloth, r), flower: i === 1 });
    standing += standingTable(tx, ty);
  });
  let corrugate = '';
  for (let y = 340; y < 364; y += 7) corrugate += line([[430, y], [1170, y]], { stroke: '#6f7890', sw: 1.4, amp: 0.2 });
  return `
  <rect x="-1400" y="612" width="4400" height="1200" fill="#2e3348"/>
  <rect x="-1400" y="604" width="4400" height="34" fill="#4a5068"/>
  <!-- cool light spilling out onto the footpath -->
  ${poly([[440, 640], [1160, 640], [1400, 1100], [200, 1100]], { fill: '#d9ffe9', stroke: false, opacity: 0.12, off: 0 })}
  <!-- the darshini: shutter rolled half up, bright inside -->
  ${rect(400, 260, 800, 360, { fill: '#5a6a7a' })}
  ${rect(430, 360, 740, 260, { fill: '#dff3e6' })}
  <circle cx="800" cy="480" r="380" fill="url(#tt-roomglow)"/>
  ${rect(430, 336, 740, 28, { fill: '#8a93a8', sw: 2 })}${corrugate}
  ${tubelight(520, 380, 130)}${tubelight(740, 380, 130)}${tubelight(960, 380, 130)}
  <!-- behind the counter: big steel vessels, steam, the people who feed everyone -->
  ${person(560, 560, 0.9, { seed: 2101, cloth: '#f7f3e6', anim: 'bob' })}${person(1040, 560, 0.9, { seed: 2102, cloth: '#f7f3e6' })}
  ${[640, 760, 880].map((vx) => `
    ${poly([[vx - 34, 560], [vx + 34, 560], [vx + 30, 500], [vx - 30, 500]], { fill: '#c9cfd2', sw: 2 })}
    ${blob(vx, 498, 32, 8, { fill: '#aeb6ba', sw: 1.6, lump: 0.02 })}
    <g class="steam">${line([[vx, 488], [vx - 8, 468], [vx + 6, 450], [vx - 4, 430]], { stroke: '#ffffff', sw: 3.5, opacity: 0.85 })}</g>`).join('')}
  ${rect(430, 556, 740, 64, { fill: '#9aa3a8', sw: 2.4 })}
  ${line([[430, 570], [1170, 570]], { stroke: '#e8edf0', sw: 2 })}
  <!-- name board -->
  <g class="hotspot-glow"><circle cx="800" cy="300" r="160" fill="url(#tt-roomglow)" opacity=".8"/></g>
  ${sign(570, 268, 460, 64, 'TAAZA THINDI', { size: 36, color: '#1f6b3a', fill: '#f4fbf2' })}
  <g class="twinkle"><path d="M1040 258 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#fff6c9" stroke="${INK}" stroke-width="1.2"/></g>
  ${standing}`;
}

function near() {
  resetSeed(2804);
  const r = rng(284);
  let moths = '';
  for (let i = 0; i < 9; i++) {
    moths += `<g class="orbit" style="animation-delay:${(-r() * 3).toFixed(2)}s; animation-duration:${(2 + r() * 2).toFixed(2)}s">
      <g transform="translate(${(20 + r() * 50).toFixed(0)} 0)">${blob(0, 0, 5, 3, { fill: '#d8cfb8', sw: 1, lump: 0.1 })}</g></g>`;
  }
  return `
  <!-- a tangle of overhead wires -->
  ${line([[-400, 120], [500, 200], [1400, 150], [2100, 220]], { sw: 2, stroke: '#0c0f20' })}
  ${line([[-400, 160], [700, 230], [2100, 170]], { sw: 2, stroke: '#0c0f20' })}
  ${line([[-400, 210], [300, 250], [1100, 240], [2100, 280]], { sw: 2, stroke: '#0c0f20' })}
  <!-- the street light everyone stands under, and its moths -->
  <circle cx="1520" cy="300" r="190" fill="url(#tt-lamp)"/>
  ${line([[1700, 1100], [1690, 360], [1640, 300], [1560, 292]], { sw: 12, stroke: '#0c0f20' })}
  ${poly([[1520, 286], [1570, 286], [1562, 312], [1528, 312]], { fill: '#fff2c4' })}
  <g transform="translate(1545 330)">${moths}</g>
  <!-- your own plate on the ledge: vada, chutney, sambar -->
  <g transform="translate(330 1010) scale(2)">
    ${blob(0, 0, 60, 14, { fill: '#cfd5d8', sw: 2, lump: 0.02 })}
    ${blob(-18, -6, 20, 10, { fill: '#b9732f', sw: 1.6, lump: 0.1 })}${blob(-18, -8, 6, 3, { fill: '#2e3348', sw: 1, lump: 0.1 })}
    ${blob(26, -4, 14, 7, { fill: '#f1ece0', sw: 1.4, lump: 0.1 })}
  </g>`;
}

export const taazaThindi = {
  layers: [
    { id: 'far', depth: 0.2, svg: far },
    { id: 'back', depth: 0.45, svg: back },
    { id: 'mid', depth: 0.8, svg: mid },
    { id: 'near', depth: 1.25, svg: near },
  ],
  hotspot: { x: 800, y: 300, depth: 0.8 },

  // Open palm: the tubelights stutter, the vessels let off a cloud, and the moths go wild.
  interact(fx) {
    const r = Math.random;
    fx.pulse('.tube', 'flick', 1600);
    fx.pulse('.orbit', 'frenzy', 3000);
    for (const vx of [640, 760, 880]) {
      for (let k = 0; k < 4; k++) {
        fx.spawn('mid', line([[0, 0], [-10, -18], [8, -38], [-6, -58], [4, -80]], { stroke: '#ffffff', sw: 6, opacity: 0.85 }), {
          x: vx + (r() - 0.5) * 20, y: 490, vx: (r() - 0.5) * 30, vy: -(50 + r() * 30), grow: 1.1, sway: 20, life: 3.5, fade: true, delay: k * 0.2,
        });
      }
    }
    for (let i = 0; i < 12; i++) {
      fx.spawn('near', blob(0, 0, 5, 3, { fill: '#d8cfb8', sw: 1, lump: 0.1 }), {
        x: 1545, y: 330, vx: (r() - 0.5) * 500, vy: (r() - 0.5) * 300, vr: (r() - 0.5) * 600, flap: true, sway: 40, life: 2.5,
      });
    }
  },
};
