// Vidyarthi Bhavan — the late-morning rush. Loud colour, a crowd on the steps,
// autorickshaws, bunting, kites in a cobalt sky, and a waiter balancing an
// absurdly tall tower of dosa plates. (Illustrative, not the real facade.)

import {
  rect, blob, line, poly, sign, person, cloud, resetSeed, rng, INK, pick,
} from './draw.js';

const POP = ['#e8578f', '#f2c230', '#9cc94a', '#3f8fd8', '#f07a3a', '#8c4a7a'];

const auto = (x, y, s = 1, flip = false) => `
  <g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    ${blob(-56, 0, 18, 18, { fill: '#1d1a1c', lump: 0.02 })}${blob(60, 0, 18, 18, { fill: '#1d1a1c', lump: 0.02 })}
    ${poly([[-90, -10], [-84, -60], [70, -60], [92, -24], [92, -6], [-90, -6]], { fill: '#1f2a24', smooth: true, step: 30 })}
    ${poly([[-92, -58], [-70, -120], [60, -120], [76, -58]], { fill: '#f2c230', smooth: true, step: 30 })}
    ${poly([[30, -112], [58, -112], [74, -62], [30, -62]], { fill: '#bfe0ee', sw: 1.6 })}
    ${line([[-80, -40], [80, -40]], { stroke: '#f2c230', sw: 3 })}
    ${blob(88, -30, 6, 6, { fill: '#fff6c9', sw: 1.2 })}
  </g>`;

const kite = (x, y, c1, c2, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})"><g class="sway">
    ${poly([[0, -40], [30, 0], [0, 46], [-30, 0]], { fill: c1, sw: 1.8, off: 0 })}
    ${poly([[0, -40], [30, 0], [0, 0]], { fill: c2, sw: 1.2, off: 0 })}
    ${line([[0, 46], [10, 80], [-6, 110], [8, 140]], { sw: 1.6 })}
    ${line([[0, 0], [-300, 600]], { sw: 0.8, opacity: 0.5 })}
  </g></g>`;

const dosaPlate = () =>
  blob(0, 0, 30, 6, { fill: '#cfd5d8', sw: 1.4, lump: 0.02 }) +
  poly([[-26, -3], [24, -12], [26, -4], [-24, 3]], { fill: '#d99a3a', sw: 1.2, off: 0, amp: 0.5 });

function far() {
  resetSeed(1501);
  return `
  <defs>
    <linearGradient id="vb-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1f6fd0"/>
      <stop offset=".7" stop-color="#6fb3ec"/>
      <stop offset="1" stop-color="#bfe2f6"/>
    </linearGradient>
  </defs>
  <rect x="-1400" y="-900" width="4400" height="1600" fill="url(#vb-sky)"/>
  <g class="drift">${cloud(300, 180, 320, { stroke: INK })}${cloud(1250, 120, 260, { stroke: INK })}</g>
  <g class="drift slow">${cloud(820, 300, 200, { stroke: INK })}</g>
  ${kite(560, 130, '#e8578f', '#f2c230', 0.9)}${kite(1100, 240, '#9cc94a', '#3f8fd8', 0.7)}${kite(1400, 90, '#f07a3a', '#fbf3e2', 0.8)}
  <rect x="-1400" y="600" width="4400" height="900" fill="#8d8478"/>`;
}

function back() {
  resetSeed(1602);
  const r = rng(162);
  let s = '';
  let x = -320;
  while (x < 1900) {
    const w = 140 + r() * 120, h = 200 + r() * 140, top = 610 - h;
    const c = pick(POP, r);
    s += rect(x, top, w, h, { fill: c });
    s += rect(x - 6, top - 14, w + 12, 18, { fill: '#fbf3e2', sw: 1.8 });
    // shop boards with squiggle lettering (no real names)
    s += rect(x + 12, top + 30, w - 24, 34, { fill: pick(['#fbf3e2', '#1f2a24', '#f2c230'], r), sw: 1.6 });
    s += line([[x + 22, top + 47], [x + w * 0.4, top + 42], [x + w * 0.6, top + 52], [x + w - 22, top + 46]], { sw: 2.4, stroke: pick(['#c2452f', '#3f8fd8', '#1f2a24'], r) });
    // striped awning
    for (let k = 0; k < Math.floor(w / 20); k++) {
      s += poly([[x + k * 20, top + 110], [x + k * 20 + 20, top + 110], [x + k * 20 + 24, top + 136], [x + k * 20 + 4, top + 136]],
        { fill: k % 2 ? '#fbf3e2' : c, sw: 1.2, off: 0 });
    }
    s += rect(x + 20, top + 150, w - 40, h - 150, { fill: '#3a2a20', sw: 1.6 });
    x += w + 4;
  }
  return s;
}

function mid() {
  resetSeed(1703);
  const r = rng(173);
  // queue zig-zagging down the steps
  let crowd = '';
  const spots = [[700, 600], [760, 606], [820, 600], [880, 612], [930, 640], [870, 660], [800, 668], [730, 660],
    [660, 690], [600, 700], [980, 690], [1040, 700], [540, 720], [1100, 720]];
  spots.forEach(([px, py], i) => {
    crowd += person(px, py, 0.9 + (py - 600) / 600, { seed: 1200 + i, cloth: pick(POP.concat(['#fbf3e2', '#1f2a24']), r), flower: i % 3 === 0 });
  });
  // the plate tower
  let tower = '';
  for (let k = 0; k < 13; k++) tower += `<g transform="translate(${Math.sin(k * 0.6) * 4} ${-k * 14})">${dosaPlate()}</g>`;
  return `
  <rect x="-1400" y="612" width="4400" height="1200" fill="#8d8478"/>
  <rect x="-1400" y="604" width="4400" height="30" fill="#b3a892"/>
  ${line([[-200, 860], [80, 858]], { stroke: '#fbf3e2', sw: 7, opacity: 0.6 })}${line([[400, 862], [700, 860]], { stroke: '#fbf3e2', sw: 7, opacity: 0.6 })}${line([[1000, 858], [1300, 860]], { stroke: '#fbf3e2', sw: 7, opacity: 0.6 })}
  <!-- the eatery (illustrative), lime-washed green with red-oxide steps -->
  ${rect(560, 330, 480, 290, { fill: '#cfe3a0' })}
  ${rect(546, 314, 508, 24, { fill: '#fbf3e2', sw: 2 })}
  ${[600, 700, 900, 980].map((x) => rect(x, 400, 50, 70, { fill: '#2f6b3a', sw: 1.8 })).join('')}
  ${rect(740, 470, 120, 150, { fill: '#3a2a20' })}
  ${[0, 1, 2, 3].map((k) => rect(700 - k * 14, 620 + k * 14, 200 + k * 28, 14, { fill: '#9c3b2a', sw: 1.6 })).join('')}
  <g class="hotspot-glow"><circle cx="800" cy="368" r="160" fill="#fff6c9" opacity="0"/></g>
  ${sign(605, 340, 390, 58, 'VIDYARTHI BHAVAN', { size: 27, color: '#9b2b1e', fill: '#fbf3e2' })}
  <g class="twinkle"><path d="M1006 330 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#fff6c9" stroke="${INK}" stroke-width="1.2"/></g>
  ${crowd}
  <!-- the waiter and his impossible tower -->
  <g transform="translate(1180 700)">
    ${person(0, 0, 1.15, { seed: 77, cloth: '#fbf3e2', anim: 'none' })}
    <g transform="translate(20 -112)"><g class="wobble">${tower}</g></g>
  </g>
  ${auto(260, 740, 1.1)}${auto(1500, 760, 1.05, true)}
  <!-- scooter -->
  <g transform="translate(-60 790)">
    ${blob(0, 0, 20, 20, { fill: '#1d1a1c', lump: 0.02 })}${blob(100, 0, 20, 20, { fill: '#1d1a1c', lump: 0.02 })}
    ${poly([[-18, -16], [18, -54], [56, -44], [118, -36], [122, -12], [80, -8], [36, -14]], { fill: '#e8578f', smooth: true, step: 30 })}
  </g>`;
}

function near() {
  resetSeed(1804);
  let bunting = '';
  const strings = [[150, 60], [230, 45]];
  strings.forEach(([y0, sag], si) => {
    bunting += line([[-500, y0], [800, y0 + sag], [2100, y0]], { sw: 2 });
    for (let x = -460; x < 2080; x += 54) {
      const t = (x + 500) / 2600;
      const y = y0 + sag * Math.sin(t * Math.PI) - 2;
      bunting += poly([[x - 16, y], [x + 16, y], [x, y + 34]], { fill: POP[(Math.round(x / 54) + si) % POP.length], sw: 1.4, off: 1 });
    }
  });
  return `
  <g class="sway">${bunting}</g>
  <!-- the back of an auto, right up close -->
  <g transform="translate(1420 1020) scale(1.6)">
    ${poly([[-100, 0], [-96, -110], [90, -110], [96, 0]], { fill: '#1f2a24', smooth: true, step: 40 })}
    ${poly([[-104, -104], [-80, -190], [74, -190], [98, -104]], { fill: '#f2c230', smooth: true, step: 40 })}
    ${rect(-50, -84, 100, 30, { fill: '#fbf3e2', sw: 1.6 })}
    ${line([[-40, -70], [40, -68]], { sw: 2.4, stroke: '#c2452f' })}
    ${blob(-70, -30, 8, 8, { fill: '#e04b3a', sw: 1.4 })}${blob(70, -30, 8, 8, { fill: '#e04b3a', sw: 1.4 })}
  </g>
  ${blob(120, 1060, 160, 80, { fill: '#2f6b3a', lump: 0.2 })}`;
}

export const vidyarthiBhavan = {
  layers: [
    { id: 'far', depth: 0.2, svg: far },
    { id: 'back', depth: 0.45, svg: back },
    { id: 'mid', depth: 0.8, svg: mid },
    { id: 'near', depth: 1.25, svg: near },
  ],
  hotspot: { x: 800, y: 369, depth: 0.8 },

  // Open palm: the dosas take flight off the tower, like a flock heading for the kites.
  interact(fx) {
    const r = Math.random;
    for (let i = 0; i < 16; i++) {
      fx.spawn('mid', poly([[-26, 0], [24, -10], [26, -2], [-24, 6]], { fill: '#d99a3a', sw: 1.4, off: 0 }), {
        x: 1200 + (r() - 0.5) * 30, y: 600 - r() * 160, vx: -(80 + r() * 260), vy: -(160 + r() * 140),
        vr: (r() - 0.5) * 120, flap: true, sway: 20, life: 4.5, delay: i * 0.08,
      });
    }
    for (let i = 0; i < 12; i++) {
      fx.spawn('near', poly([[-12, 0], [12, 0], [0, 24]], { fill: pick(POP, r), sw: 1.2, off: 0 }), {
        x: r() * 1600, y: 160 + r() * 80, vx: (r() - 0.5) * 60, vy: 80 + r() * 60, vr: (r() - 0.5) * 300, sway: 30, life: 4, delay: r() * 0.6,
      });
    }
    fx.pulse('.wobble', 'hard', 2500);
  },
};
