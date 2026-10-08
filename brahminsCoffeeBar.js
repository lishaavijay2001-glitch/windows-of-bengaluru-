// Brahmin's Coffee Bar — small, intimate, and raining.
// Signature: slate-blue monsoon evening, rain streaks, black umbrellas, a tiny lit
// counter under a striped awning, warm reflections in the puddles.
// (Illustrative, not the real place.)

import {
  rect, blob, line, poly, sign, person, tumbler, treeCanopy, resetSeed, rng, INK,
} from './draw.js';

const SLATE = '#3c4658';
const BULB = '#ffc35a';

// rain: two stacked copies of the same streaks, scrolled by CSS so it loops
const rain = (seed, n, len, op, cls) => {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = r() * 2400 - 400, y = r() * 1300 - 300;
    s += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - len * 0.25).toFixed(0)}" y2="${(y + len).toFixed(0)}"/>`;
  }
  return `<g class="${cls}" stroke="#dfe8f4" stroke-width="1.6" stroke-linecap="round" opacity="${op}">
    <g>${s}</g><g transform="translate(0 -1300)">${s}</g></g>`;
};

const brolly = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    ${poly([[-62, 0], [-48, -36], [0, -54], [48, -36], [62, 0], [42, -6], [20, 2], [0, -4], [-20, 2], [-42, -6]], { fill: '#1d1a1c', sw: 2, smooth: true, step: 30 })}
    ${line([[0, -54], [0, 60]], { sw: 2.6 })}${line([[0, 60], [8, 68]], { sw: 2.6 })}
  </g>`;

function far() {
  resetSeed(1901);
  const r = rng(191);
  let wins = '';
  for (let i = 0; i < 26; i++) {
    wins += `<rect x="${(r() * 2000 - 200).toFixed(0)}" y="${(380 + r() * 170).toFixed(0)}" width="12" height="16" fill="${r() > 0.5 ? BULB : '#2a3242'}" opacity=".8"/>`;
  }
  return `
  <defs>
    <linearGradient id="bcb-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2c3446"/><stop offset=".6" stop-color="#55627a"/><stop offset="1" stop-color="#8794a8"/>
    </linearGradient>
    <radialGradient id="bcb-glow"><stop offset="0" stop-color="${BULB}" stop-opacity=".7"/><stop offset="1" stop-color="${BULB}" stop-opacity="0"/></radialGradient>
    <linearGradient id="bcb-puddle" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BULB}" stop-opacity=".55"/><stop offset="1" stop-color="${BULB}" stop-opacity="0"/></linearGradient>
  </defs>
  <rect x="-1400" y="-900" width="4400" height="1600" fill="url(#bcb-sky)"/>
  ${[[200, 120, 420], [900, 60, 520], [1500, 140, 380], [-300, 80, 400]].map(([x, y, w]) =>
    blob(x, y, w / 2, w / 5, { fill: '#2a3142', stroke: false, lump: 0.2, opacity: 0.9 })).join('')}
  ${poly([[-400, 600], [-400, 360], [0, 360], [0, 300], [300, 300], [300, 380], [700, 380], [700, 340], [1100, 340], [1100, 390], [1500, 390], [1500, 320], [2000, 320], [2000, 600]], { fill: SLATE, stroke: false })}
  ${wins}
  ${rain(1, 70, 60, 0.25, 'rain slow')}
  <rect x="-1400" y="598" width="4400" height="900" fill="#39404f"/>`;
}

function back() {
  resetSeed(2002);
  return `
  ${line([[1350, 620], [1340, 380], [1380, 260]], { sw: 26, stroke: '#232a36' })}
  ${treeCanopy(1380, 250, 600, 280, { n: 13, greens: ['#2a3a3a', '#324646', '#263434'], stroke: '#161c22' })}
  ${rect(-300, 360, 520, 260, { fill: '#56607a', stroke: '#1c2230' })}
  ${poly([[-320, 368], [240, 368], [200, 320], [-280, 320]], { fill: '#3a3550', stroke: '#1c2230' })}
  ${[ -240, -120, 0, 120].map((x) => rect(x, 420, 60, 80, { fill: x === 0 ? BULB : '#2a3242', stroke: '#1c2230', sw: 1.6 })).join('')}
  ${rain(2, 60, 80, 0.35, 'rain')}`;
}

function mid() {
  resetSeed(2103);
  const r = rng(213);
  let ripples = '';
  for (let i = 0; i < 18; i++) {
    const x = r() * 1800 - 100, y = 700 + r() * 400;
    ripples += `<ellipse class="ripple" style="animation-delay:${(-r() * 2).toFixed(2)}s" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="14" ry="4" fill="none" stroke="#c9d4e4" stroke-width="1.4"/>`;
  }
  let awning = '';
  for (let k = 0; k < 14; k++) {
    awning += poly([[480 + k * 34, 470], [514 + k * 34, 470], [520 + k * 34, 520], [486 + k * 34, 520]], { fill: k % 2 ? '#fbf3e2' : '#e0662f', sw: 1.4, off: 0 });
  }
  return `
  <rect x="-1400" y="612" width="4400" height="1200" fill="#4a5262"/>
  <rect x="-1400" y="604" width="4400" height="34" fill="#5d6678"/>
  <!-- warm light pooling on the wet road -->
  ${poly([[520, 640], [960, 640], [1120, 1100], [380, 1100]], { fill: 'url(#bcb-puddle)', stroke: false, off: 0 })}
  ${blob(700, 820, 160, 26, { fill: '#6c7690', stroke: false, lump: 0.15 })}${blob(1300, 900, 200, 30, { fill: '#6c7690', stroke: false, lump: 0.15 })}
  ${ripples}
  <!-- the tiny coffee bar -->
  ${rect(460, 380, 520, 240, { fill: '#e6d3ac' })}
  <circle cx="720" cy="560" r="260" fill="url(#bcb-glow)"/>
  ${rect(520, 520, 400, 100, { fill: BULB })}
  ${rect(510, 580, 420, 40, { fill: '#8a5a34', sw: 2 })}
  ${[560, 620, 690, 760, 830].map((x) => tumbler(x, 578, 0.7)).join('')}
  ${line([[720, 470], [720, 520]], { sw: 1.4 })}${blob(720, 530, 9, 11, { fill: '#fff1b0', sw: 1.4 })}
  ${awning}
  ${line([[476, 520], [956, 520]], { sw: 2.4 })}
  <g class="hotspot-glow"><circle cx="720" cy="425" r="140" fill="url(#bcb-glow)" opacity=".6"/></g>
  ${sign(490, 392, 460, 66, "BRAHMIN'S COFFEE BAR", { size: 27, color: '#1f2a44', fill: '#fbf3e2' })}
  <g class="twinkle"><path d="M958 382 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#fff6c9" stroke="${INK}" stroke-width="1.2"/></g>
  <!-- huddled under the awning, coffee in hand -->
  ${person(540, 660, 1, { seed: 3001, cloth: '#3f6f8f', prop: `<g transform="translate(16 -54)">${tumbler(0, 0, 0.6)}</g>` })}
  ${person(610, 668, 1, { seed: 3002, cloth: '#c2452f', flower: true, prop: `<g transform="translate(16 -54)">${tumbler(0, 0, 0.6)}</g>` })}
  ${person(860, 664, 1, { seed: 3003, cloth: '#e8dcc0', prop: `<g transform="translate(16 -54)">${tumbler(0, 0, 0.6)}</g>` })}
  <!-- out in the rain -->
  ${person(1120, 720, 1.1, { seed: 3004, cloth: '#2f6b6b' })}${brolly(1120, 610, 1.1)}
  ${person(300, 740, 1.15, { seed: 3005, cloth: '#8c4a7a' })}${brolly(300, 622, 1.2)}
  ${rain(3, 80, 100, 0.5, 'rain')}`;
}

function near() {
  resetSeed(2204);
  let drips = '';
  for (let x = -300; x < 1900; x += 60) {
    drips += `<g class="drip" style="animation-delay:${((x % 7) * -0.31).toFixed(2)}s">${blob(x, 172, 3.5, 6, { fill: '#dfe8f4', sw: 1, lump: 0.05 })}</g>`;
  }
  return `
  <!-- the eave of the roof you're standing under, dripping -->
  <rect x="-1400" y="-400" width="4400" height="560" fill="#2a2f3a"/>
  ${line([[-1400, 160], [3000, 160]], { sw: 3 })}
  ${drips}
  ${rain(4, 50, 160, 0.6, 'rain fast')}
  <!-- someone's big umbrella brushing past, close up -->
  <g transform="translate(1500 1000) scale(3)">${poly([[-62, 0], [-48, -36], [0, -54], [48, -36], [62, 0], [42, -6], [20, 2], [0, -4], [-20, 2], [-42, -6]], { fill: '#1d1a1c', sw: 1.4, smooth: true, step: 30 })}</g>`;
}

export const brahminsCoffeeBar = {
  layers: [
    { id: 'far', depth: 0.2, svg: far },
    { id: 'back', depth: 0.45, svg: back },
    { id: 'mid', depth: 0.8, svg: mid },
    { id: 'near', depth: 1.25, svg: near },
  ],
  hotspot: { x: 720, y: 425, depth: 0.8 },

  // Open palm: lightning, thunder, and the rain comes down harder for a moment.
  interact(fx) {
    const r = Math.random;
    fx.spawn('near', '<rect x="-2000" y="-2000" width="6000" height="6000" fill="#f4f8ff"/>', { x: 0, y: 0, life: 0.45, fade: true, instant: true });
    fx.spawn('far', line([[0, 0], [-30, 80], [10, 120], [-40, 230]], { stroke: '#fbfcff', sw: 5 }), { x: 1100, y: 40, life: 0.5, fade: true, instant: true });
    fx.pulse('.rain', 'pour', 3000);
    for (let i = 0; i < 26; i++) {
      fx.spawn('mid', `<ellipse rx="12" ry="3.5" fill="none" stroke="#dfe8f4" stroke-width="1.6"/>`, {
        x: r() * 1700 - 50, y: 680 + r() * 400, grow: 1.6, life: 0.9, fade: true, delay: r() * 2,
      });
    }
  },
};
