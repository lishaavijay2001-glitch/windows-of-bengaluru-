// MTR — warm, nostalgic tiffin house. The only window that looks INTO a room.
// Signature: amber/sepia interior, ceiling fans, rows of marble-top tables,
// steam from the kitchen hatches, a waiter with a steel bucket.
// (Illustrative interior, not drawn from the real place.)

import {
  rect, blob, line, poly, sign, person, tumbler, resetSeed, rng, INK, pick,
} from './draw.js';

const WALL = '#e8bf7e';
const WOOD = '#6b3a1f';

const fan = (x, y, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    ${line([[0, -260], [0, -14]], { sw: 3, stroke: '#3a2416' })}
    <g class="spin">
      ${poly([[0, -4], [110, -14], [116, 0], [0, 6]], { fill: '#5a3a24', sw: 1.6, off: 0 })}
      ${poly([[0, -4], [-110, -14], [-116, 0], [0, 6]], { fill: '#5a3a24', sw: 1.6, off: 0 })}
      ${poly([[-4, 0], [-12, 26], [4, 28], [6, 0]], { fill: '#5a3a24', sw: 1.6, off: 0 })}
    </g>
    ${blob(0, 0, 16, 10, { fill: '#8a5a34', sw: 1.6, lump: 0.03 })}
  </g>`;

const plate = (x, y, s = 1, food = 'dosa') => {
  let f = '';
  if (food === 'dosa') f = poly([[-22, -2], [22, -8], [24, -2], [-20, 4]], { fill: '#d99a3a', sw: 1.4, off: 0, amp: 0.6 });
  if (food === 'idli') f = blob(-8, -3, 8, 4, { fill: '#fbf6ea', sw: 1.2 }) + blob(8, -3, 8, 4, { fill: '#fbf6ea', sw: 1.2 });
  return `<g transform="translate(${x} ${y}) scale(${s})">${blob(0, 0, 30, 7, { fill: '#cfd5d8', sw: 1.4, lump: 0.02 })}${f}</g>`;
};

function far() {
  resetSeed(1101);
  const frames = [[300, 250, 90, 70], [460, 230, 70, 90], [1120, 240, 100, 70], [1300, 250, 70, 70]].map(([x, y, w, h], i) =>
    `${rect(x, y, w, h, { fill: '#7a4b2c', sw: 2 })}${rect(x + 8, y + 8, w - 16, h - 16, { fill: ['#c9a46a', '#a8b39a', '#d4b483', '#b7a08a'][i], sw: 1.2, off: 0 })}
     ${line([[x + 10, y + h - 20], [x + w * 0.4, y + h * 0.4], [x + w - 10, y + h - 24]], { sw: 1.4, stroke: '#5a3a24', opacity: 0.7 })}`).join('');
  const hatch = (x) => `
    ${poly([[x, 560], [x, 450], [x + 20, 410], [x + 70, 396], [x + 120, 410], [x + 140, 450], [x + 140, 560]], { fill: '#ffcf6b', smooth: false })}
    <circle cx="${x + 70}" cy="480" r="110" fill="url(#mtr-glow)"/>
    <g opacity=".55">${blob(x + 50, 520, 14, 22, { fill: '#7a4b2c', stroke: false })}${blob(x + 95, 515, 14, 26, { fill: '#7a4b2c', stroke: false })}</g>
    <g class="steam">${line([[x + 70, 450], [x + 60, 420], [x + 78, 390], [x + 66, 360]], { stroke: '#fffaf0', sw: 4, opacity: 0.7 })}</g>`;
  return `
  <defs>
    <radialGradient id="mtr-glow"><stop offset="0" stop-color="#ffd98a" stop-opacity=".6"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
    <linearGradient id="mtr-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a35e"/><stop offset=".6" stop-color="${WALL}"/><stop offset="1" stop-color="#c98f4e"/></linearGradient>
  </defs>
  <rect x="-1400" y="-900" width="4400" height="1600" fill="url(#mtr-wall)"/>
  <rect x="-1400" y="560" width="4400" height="60" fill="${WOOD}"/>
  ${line([[-1400, 560], [3000, 560]], { sw: 2.4 })}
  ${frames}
  ${hatch(620)}${hatch(860)}
  <!-- wall clock and a calendar, because every tiffin room has both -->
  ${blob(1000, 160, 34, 34, { fill: '#fbf3e2', sw: 2.4, lump: 0.02 })}
  ${line([[1000, 160], [1000, 138]], { sw: 2.4 })}${line([[1000, 160], [1016, 168]], { sw: 2 })}
  ${rect(180, 380, 70, 100, { fill: '#fbf3e2', sw: 1.8 })}${rect(180, 380, 70, 22, { fill: '#c2452f', sw: 1.8 })}
  ${[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${188 + c * 15}" y="${412 + r * 15}" width="9" height="9" fill="#5a3a24" opacity=".35"/>`).join('')).join('')}`;
}

function back() {
  resetSeed(1202);
  const r = rng(122);
  let rows = '';
  for (const [y, s] of [[640, 0.8]]) {
    for (let x = -200; x < 1800; x += 230) {
      rows += person(x - 40, y - 4, s, { sitting: true, seed: Math.floor(r() * 999) });
      rows += person(x + 40, y - 4, s, { sitting: true, seed: Math.floor(r() * 999) });
      rows += rect(x - 80, y - 12, 160, 14, { fill: '#f1ece0', sw: 1.8 });
      rows += line([[x - 70, y + 2], [x - 70, y + 40]], { sw: 3, stroke: WOOD }) + line([[x + 70, y + 2], [x + 70, y + 40]], { sw: 3, stroke: WOOD });
      rows += plate(x - 30, y - 14, 0.7, pick(['dosa', 'idli'], r)) + plate(x + 30, y - 14, 0.7, pick(['dosa', 'idli'], r));
    }
  }
  return `
  <rect x="-1400" y="600" width="4400" height="900" fill="#b97a45"/>
  ${rows}
  <!-- the hanging name board -->
  ${line([[930, 120], [930, 402]], { sw: 1.6 })}${line([[1070, 120], [1070, 402]], { sw: 1.6 })}
  <g class="hotspot-glow"><circle cx="1000" cy="437" r="140" fill="url(#mtr-glow)" opacity=".7"/></g>
  ${sign(900, 400, 200, 74, 'MTR', { size: 44, color: '#8a1f16', fill: '#fbf0d4' })}
  <g class="twinkle"><path d="M1108 390 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#fff6c9" stroke="${INK}" stroke-width="1.2"/></g>`;
}

function mid() {
  resetSeed(1303);
  let tiles = '';
  for (let y = 700; y < 1300; y += 44) {
    for (let x = -400 + ((y / 44) % 2) * 44; x < 2000; x += 88) {
      tiles += `<rect x="${x}" y="${y}" width="44" height="44" fill="#8f4f2c" opacity=".35"/>`;
    }
  }
  const tableRow = (y, xs, seed) => {
    const r = rng(seed);
    return xs.map((x) => `
      ${person(x - 62, y + 10, 1.05, { sitting: true, seed: Math.floor(r() * 999) })}
      ${person(x + 62, y + 10, 1.05, { sitting: true, seed: Math.floor(r() * 999) })}
      ${rect(x - 105, y - 10, 210, 20, { fill: '#f6f2e8', sw: 2 })}
      ${line([[x - 92, y + 10], [x - 92, y + 70]], { sw: 4, stroke: WOOD })}${line([[x + 92, y + 10], [x + 92, y + 70]], { sw: 4, stroke: WOOD })}
      ${plate(x - 40, y - 12, 0.95, pick(['dosa', 'idli'], r))}${plate(x + 40, y - 12, 0.95, pick(['dosa', 'idli'], r))}
      ${tumbler(x, y - 10, 0.8)}`).join('');
  };
  return `
  <rect x="-1400" y="680" width="4400" height="1000" fill="#c98f55"/>
  ${tiles}
  ${line([[-1400, 680], [3000, 680]], { sw: 2.4 })}
  ${tableRow(740, [120, 520, 1180, 1580], 31)}
  <!-- waiter with a steel bucket, serving -->
  <g class="walk">${person(850, 770, 1.15, {
    seed: 501, cloth: '#f7f3e6',
    prop: `<g transform="translate(26 -40)">${poly([[-14, 0], [14, 0], [11, 30], [-11, 30]], { fill: '#cfd5d8', sw: 1.6 })}${line([[-14, 0], [0, -14], [14, 0]], { sw: 1.6 })}${line([[4, -4], [24, -30]], { sw: 2.4, stroke: '#8e979c' })}</g>`,
  })}</g>`;
}

function near() {
  resetSeed(1404);
  return `
  <!-- ceiling beams -->
  <rect x="-1400" y="-400" width="4400" height="540" fill="#4a2814"/>
  ${[-400, 0, 400, 800, 1200, 1600, 2000].map((x) => rect(x, 120, 30, 40, { fill: '#5a3420', sw: 1.8 })).join('')}
  ${line([[-1400, 140], [3000, 140]], { sw: 2.4 })}
  ${fan(300, 390, 1.05)}${fan(1250, 380, 1.05)}${fan(-300, 400, 1)}${fan(1900, 400, 1)}
  <!-- a bare bulb on a wire -->
  ${line([[800, 140], [800, 250]], { sw: 1.6 })}
  <circle cx="800" cy="262" r="60" fill="url(#mtr-glow)"/>
  ${blob(800, 262, 12, 14, { fill: '#fff1b0', sw: 1.6, lump: 0.04 })}
  <!-- the edge of your own table, close up -->
  ${rect(-200, 980, 2000, 400, { fill: '#f6f2e8', sw: 2.4 })}
  ${plate(1180, 990, 2.2, 'dosa')}${tumbler(420, 1000, 2.2, true)}
  <!-- a soft amber wash over everything, like an old photograph -->
  <rect x="-1400" y="-900" width="4400" height="2600" fill="#ff9e3d" opacity=".07" pointer-events="none"/>`;
}

export const mtr = {
  layers: [
    { id: 'far', depth: 0.2, svg: far },
    { id: 'back', depth: 0.45, svg: back },
    { id: 'mid', depth: 0.8, svg: mid },
    { id: 'near', depth: 1.25, svg: near },
  ],
  hotspot: { x: 1000, y: 437, depth: 0.45 },

  // Open palm: the fans whirl, the kitchen exhales steam, paper napkins take flight.
  interact(fx) {
    const r = Math.random;
    fx.pulse('.spin', 'fast', 3500);
    for (const hx of [690, 930]) {
      for (let k = 0; k < 5; k++) {
        fx.spawn('far', line([[0, 0], [-10, -18], [8, -38], [-6, -58], [4, -80]], { stroke: '#fffaf0', sw: 6, opacity: 0.85 }), {
          x: hx + (r() - 0.5) * 40, y: 440, vx: (r() - 0.5) * 30, vy: -(40 + r() * 30), grow: 1.1, sway: 20, life: 4, fade: true, delay: k * 0.25,
        });
      }
    }
    for (let i = 0; i < 14; i++) {
      fx.spawn('mid', rect(-10, -8, 20, 16, { fill: '#fbf6ea', sw: 1.2, off: 0 }), {
        x: r() * 1600, y: 720 + r() * 40, vx: (r() - 0.5) * 120, vy: -(120 + r() * 80), vr: (r() - 0.5) * 400,
        sway: 30, life: 3, delay: r() * 0.5, g: 220,
      });
    }
  },
};
