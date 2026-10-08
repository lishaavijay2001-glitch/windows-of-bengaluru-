// Airlines Hotel — a bright midday garden.
// Signature: green everything, a huge canopy, shafts of sunlight, striped umbrellas,
// an old Ambassador parked by the gate. Warm sun, cool shade.

import {
  rect, blob, line, poly, sign, person, tumbler, table, chair, treeCanopy, crow,
  resetSeed, rng, INK,
} from './draw.js';

const LEAF = ['#2f5a37', '#3d6d3f', '#4f7f45', '#2a4d31'];
const LIT = ['#8cc152', '#a5d16a', '#7fb547'];

// canopy with sunlit highlights on top
const sunTree = (cx, cy, w, h, seed, o = {}) => {
  const r = rng(seed);
  let hi = '';
  for (let i = 0; i < (o.hi ?? 6); i++) {
    hi += blob(cx + (r() - 0.5) * w * 0.7, cy - h * 0.15 - r() * h * 0.2, 20 + r() * 26, 12 + r() * 14,
      { fill: LIT[i % 3], stroke: false, lump: 0.2, opacity: 0.85 });
  }
  return `<g class="${o.cls || 'sway'}">${treeCanopy(cx, cy, w, h, { n: o.n || 13, greens: o.greens || LEAF, cls: 'none', seed })}${hi}</g>`;
};

const umbrella = (x, y) => {
  // pole + striped canopy, a red-and-white garden umbrella
  const w = 92, top = y - 150;
  let stripes = '';
  for (let i = 0; i < 6; i++) {
    const a = -w + (i * 2 * w) / 6, b = -w + ((i + 1) * 2 * w) / 6;
    stripes += poly([[x, top - 26], [x + a, top + 22], [x + b, top + 22]], { fill: i % 2 ? '#fbf3e2' : '#d9412f', sw: 1.4, off: 0, amp: 0.5 });
  }
  return line([[x, y - 8], [x, top]], { sw: 4 }) + stripes +
    line([[x - w, top + 22], [x + w, top + 22]], { sw: 2.4 }) + blob(x, top - 28, 4, 4, { fill: '#f0c53a', sw: 1.2 });
};

const ambassador = (x, y) => `
  <g transform="translate(${x} ${y})">
    ${blob(-70, 0, 26, 26, { fill: '#1d1a1c', lump: 0.02 })}${blob(80, 0, 26, 26, { fill: '#1d1a1c', lump: 0.02 })}
    ${blob(-70, 0, 10, 10, { fill: '#d6dcdf', lump: 0.02 })}${blob(80, 0, 10, 10, { fill: '#d6dcdf', lump: 0.02 })}
    ${poly([[-130, -8], [-128, -46], [-90, -58], [-60, -100], [40, -104], [80, -62], [140, -54], [150, -12], [130, -2], [-110, -2]], { fill: '#efe6cf', smooth: true, step: 26 })}
    ${poly([[-52, -92], [-6, -94], [-6, -62], [-80, -60]], { fill: '#a9cfd6', sw: 1.6 })}
    ${poly([[4, -94], [36, -94], [66, -62], [4, -62]], { fill: '#a9cfd6', sw: 1.6 })}
    ${line([[-130, -24], [150, -24]], { stroke: '#b9b2a0', sw: 2 })}
    ${blob(142, -36, 8, 8, { fill: '#fff6c9', sw: 1.4 })}
    ${rect(136, -18, 18, 10, { fill: '#c9cfd2', sw: 1.2 })}
  </g>`;

function far() {
  resetSeed(101);
  let rays = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rays += line([[1150 + Math.cos(a) * 70, 170 + Math.sin(a) * 70], [1150 + Math.cos(a) * 110, 170 + Math.sin(a) * 110]], { stroke: '#f5c94a', sw: 4 });
  }
  return `
  <defs>
    <linearGradient id="ah-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9fd6dc"/>
      <stop offset=".6" stop-color="#e6f4e4"/>
      <stop offset="1" stop-color="#fffbe6"/>
    </linearGradient>
    <radialGradient id="ah-sunhalo"><stop offset="0" stop-color="#fff7c2" stop-opacity=".9"/><stop offset="1" stop-color="#fff7c2" stop-opacity="0"/></radialGradient>
    <linearGradient id="ah-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c2" stop-opacity=".55"/><stop offset="1" stop-color="#fff7c2" stop-opacity="0"/></linearGradient>
  </defs>
  <rect x="-1400" y="-900" width="4400" height="1600" fill="url(#ah-sky)"/>
  <circle cx="1150" cy="170" r="200" fill="url(#ah-sunhalo)"/>
  <g class="twinkle slow">${rays}</g>
  ${blob(1150, 170, 50, 50, { fill: '#ffe46b', stroke: '#e0a33b', sw: 1.6, lump: 0.03 })}
  <rect x="-1400" y="560" width="4400" height="900" fill="#6ea24a"/>`;
}

function back() {
  resetSeed(202);
  // a wall of trees behind the garden, with a white cottage and green roof peeking through
  return `
  ${sunTree(-120, 380, 700, 320, 11)}
  ${sunTree(1500, 370, 700, 340, 12)}
  ${rect(560, 450, 380, 130, { fill: '#f7f3e6' })}
  ${poly([[530, 458], [970, 458], [910, 392], [590, 392]], { fill: '#4f8a52' })}
  ${line([[600, 420], [900, 420]], { stroke: '#2f5a37', sw: 1.4 })}
  ${[600, 680, 760, 840].map((x) => rect(x, 490, 46, 60, { fill: '#3d6d3f', sw: 1.6 })).join('')}
  ${sunTree(330, 330, 520, 300, 13)}
  ${sunTree(1180, 330, 520, 300, 14)}
  <!-- clipped hedge -->
  ${[...Array(18)].map((_, i) => blob(-200 + i * 110, 572, 66, 34, { fill: i % 2 ? '#3f7a3a' : '#4a8a40', lump: 0.1, sw: 2 })).join('')}
  ${crow(1170, 260, 0.9, 'perch')}${crow(330, 250, 0.8, 'perch')}${crow(1250, 300, 0.75, 'perch')}`;
}

function mid() {
  resetSeed(303);
  const r = rng(33);
  let dapple = '';
  for (let i = 0; i < 46; i++) {
    dapple += `<ellipse cx="${(r() * 2000 - 200).toFixed(0)}" cy="${(620 + r() * 650).toFixed(0)}" rx="${(14 + r() * 34).toFixed(0)}" ry="${(5 + r() * 10).toFixed(0)}" fill="#f6f2b0" opacity=".38"/>`;
  }
  let grass = '';
  for (let i = 0; i < 40; i++) {
    const x = r() * 1900 - 150, y = 630 + r() * 620;
    grass += line([[x - 6, y], [x - 3, y - 12]], { stroke: '#4f7f45', sw: 2 }) + line([[x + 2, y], [x + 3, y - 15]], { stroke: '#4f7f45', sw: 2 });
  }
  const seat = (x, y, a, b) =>
    umbrella(x, y - 4) +
    person(x - 52, y + 6, 0.95, { sitting: true, seed: a }) +
    person(x + 52, y + 6, 0.95, { sitting: true, seed: b }) +
    chair(x - 52, y + 12, 0.95, false, '#2f6b3a') + chair(x + 52, y + 12, 0.95, true, '#2f6b3a') +
    table(x, y) + tumbler(x - 20, y - 4, 0.8) + tumbler(x + 18, y - 4, 0.8) +
    blob(x + 2, y - 6, 16, 5, { fill: '#e8edf0', sw: 1.4, lump: 0.02 });

  return `
  <rect x="-1400" y="600" width="4400" height="1200" fill="#86bb55"/>
  ${blob(300, 860, 420, 90, { fill: '#79ad4a', stroke: false, lump: 0.2 })}
  ${blob(1300, 960, 460, 100, { fill: '#79ad4a', stroke: false, lump: 0.2 })}
  <!-- gravel path from the gate -->
  ${poly([[1010, 610], [1100, 610], [1180, 760], [1320, 1100], [900, 1100], [960, 760]], { fill: '#eadcb2', smooth: true, step: 60 })}
  ${grass}${dapple}
  <!-- green iron gateway with the hanging sign -->
  ${line([[930, 640], [932, 420]], { sw: 8, stroke: '#2f6b3a' })}${line([[1180, 640], [1178, 420]], { sw: 8, stroke: '#2f6b3a' })}
  ${line([[926, 424], [980, 372], [1055, 356], [1130, 372], [1184, 424]], { sw: 7, stroke: '#2f6b3a' })}
  ${blob(1055, 350, 10, 10, { fill: '#f0c53a', sw: 1.6 })}
  ${line([[960, 424], [962, 440]], { sw: 2 })}${line([[1150, 424], [1148, 440]], { sw: 2 })}
  <g class="hotspot-glow"><circle cx="1055" cy="485" r="150" fill="#fff6c9" opacity="0"/></g>
  ${sign(940, 440, 230, 86, 'AIRLINES HOTEL', { size: 28, color: '#2f6b3a', fill: '#fbf6e4', sub: '· garden · tiffin ·' })}
  <g class="twinkle"><path d="M1180 432 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#fff6c9" stroke="${INK}" stroke-width="1.2"/></g>
  ${ambassador(260, 715)}
  ${seat(520, 700, 11, 12)}
  ${seat(820, 760, 21, 22)}
  ${seat(1400, 710, 31, 32)}
  ${seat(150, 840, 41, 42)}
  <!-- waiter crossing the lawn -->
  <g class="walk">${person(1060, 680, 1, { seed: 77, cloth: '#f7f3e6', prop: `<g transform="translate(18 -70)">${blob(0, 0, 22, 5, { fill: '#d6dcdf', lump: 0.02, sw: 1.4 })}${tumbler(-8, -4, 0.6, false)}${tumbler(8, -4, 0.6, false)}</g>` })}</g>`;
}

function near() {
  resetSeed(404);
  const r = rng(44);
  let vines = '';
  for (let i = 0; i < 9; i++) {
    const x = 120 + i * 170 + (r() - 0.5) * 60, len = 80 + r() * 140;
    vines += line([[x, 200], [x + 8, 200 + len * 0.5], [x - 4, 200 + len]], { sw: 2, stroke: '#2f5a37' });
    for (let k = 1; k < 5; k++) vines += blob(x + (k % 2 ? 7 : -5), 200 + (len * k) / 5, 7, 4, { fill: '#4f7f45', sw: 1.2, lump: 0.1 });
  }
  let bougain = '';
  for (let i = 0; i < 16; i++) bougain += blob(180 + (r() - 0.5) * 160, 190 + (r() - 0.5) * 60, 9, 9, { fill: r() > 0.4 ? '#d8487a' : '#b8336a', lump: 0.15, sw: 1.4 });
  const fern = (x, y, flip) => {
    let s = '';
    for (let i = 0; i < 7; i++) {
      const a = (-0.2 - i * 0.22) * (flip ? -1 : 1);
      s += line([[x, y], [x + Math.sin(a) * 120, y - Math.cos(a) * 90]], { sw: 5, stroke: i % 2 ? '#3d6d3f' : '#4f7f45' });
    }
    return s;
  };
  return `
  <!-- shafts of sunlight through the canopy -->
  <g class="beam">${poly([[900, 60], [1010, 60], [760, 1100], [560, 1100]], { fill: 'url(#ah-beam)', stroke: false, off: 0 })}</g>
  <g class="beam slow">${poly([[1240, 60], [1300, 60], [1150, 1100], [1010, 1100]], { fill: 'url(#ah-beam)', stroke: false, off: 0 })}</g>
  <g class="beam">${poly([[420, 60], [470, 60], [260, 1100], [150, 1100]], { fill: 'url(#ah-beam)', stroke: false, off: 0 })}</g>
  ${sunTree(800, 105, 2400, 300, 21, { n: 24, hi: 14, cls: 'sway slow' })}
  <g class="sway">${vines}</g>
  <g class="sway">${bougain}</g>
  ${fern(60, 1000, false)}${fern(1560, 1010, true)}`;
}

export const airlinesHotel = {
  layers: [
    { id: 'far', depth: 0.2, svg: far },
    { id: 'back', depth: 0.45, svg: back },
    { id: 'mid', depth: 0.8, svg: mid },
    { id: 'near', depth: 1.25, svg: near },
  ],
  hotspot: { x: 1055, y: 483, depth: 0.8 },

  // Open palm: a gust shakes the canopy — leaves and petals rain down, the crows take off.
  interact(fx) {
    const r = Math.random;
    for (let i = 0; i < 34; i++) {
      const pink = r() > 0.7;
      fx.spawn('near', blob(0, 0, pink ? 8 : 14, pink ? 8 : 7, { fill: pink ? '#d8487a' : (r() > 0.5 ? '#4f7f45' : '#8cc152'), sw: 1.4, lump: 0.1 }), {
        x: r() * 1600, y: 140 + r() * 120, vx: 40 + r() * 80, vy: 60 + r() * 90,
        vr: (r() - 0.5) * 240, sway: 40 + r() * 40, life: 3.5 + r() * 2, delay: r() * 0.8,
      });
    }
    for (let i = 0; i < 6; i++) {
      fx.spawn('back', crow(0, 0, 0.8 + r() * 0.3), {
        x: 250 + r() * 1150, y: 240 + r() * 80, vx: 120 + r() * 120, vy: -(120 + r() * 80),
        flap: true, life: 4, delay: 0.15 + r() * 0.5,
      });
    }
    fx.hide('.perch');
    fx.shake('near', 1);
  },
};
