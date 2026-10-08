// The ride between stops, the bus-stop boards, and the view from outside at the end.

import { rect, blob, line, poly, treeCanopy, cloud, person, tumbler, sign, crow, rng, INK, resetSeed, pick } from '../scenes/draw.js';

// ── bus-stop board, added to each scene's nearest layer ──────────────────────
export function stopBoard(stop) {
  resetSeed(4100 + (stop.en || '').length);
  const x = 440, y = 560, w = 226;
  return `<g class="stop-board">
    ${line([[x + w / 2, y + 96], [x + w / 2 + 2, y + 420]], { sw: 9, stroke: '#3a3f44' })}
    ${line([[x + w / 2 - 2, y + 110], [x + w / 2, y + 420]], { sw: 2, stroke: '#9aa3a8', opacity: 0.7 })}
    ${rect(x, y, w, 98, { fill: '#fbf3e2', sw: 2.6 })}
    ${rect(x + 7, y + 7, w - 14, 22, { fill: '#2f5f86', sw: 1.2, off: 0 })}
    <text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="13" fill="#fbf3e2" letter-spacing="1">ಬಸ್ ನಿಲ್ದಾಣ · BUS STOP</text>
    <text x="${x + w / 2}" y="${y + 62}" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="${stop.kn.length > 10 ? 23 : 28}" fill="#9b2b1e">${stop.kn}</text>
    <text x="${x + w / 2}" y="${y + 86}" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-weight="600" font-size="14" fill="${INK}" letter-spacing="1.6">${stop.en}</text>
  </g>`;
}

// ── the roadside that rushes past between stops ──────────────────────────────
const JACARANDA = ['#8f7fd1', '#a796e0', '#7a6bc2', '#b6a8ea'];
const TABEBUIA = ['#f2a7c3', '#e98ab0', '#f7c4d6', '#d8487a'];
const GREENS = ['#3d6d3f', '#4f7f45', '#5f8f4c'];

function bungalow(x, s, r) {
  const wall = pick(['#f1e4c4', '#e9cf9c', '#d9e3cf', '#f0d6c8'], r);
  return `<g transform="translate(${x} 0)">
    ${rect(-120 * s, 640 - 120 * s, 240 * s, 120 * s, { fill: wall, sw: 2 })}
    ${poly([[-140 * s, 646 - 120 * s], [140 * s, 646 - 120 * s], [100 * s, 600 - 150 * s], [-100 * s, 600 - 150 * s]], { fill: '#b4553a', sw: 2 })}
    ${rect(-90 * s, 640 - 90 * s, 44 * s, 56 * s, { fill: '#7a4b2c', sw: 1.4 })}${rect(40 * s, 640 - 90 * s, 44 * s, 56 * s, { fill: '#7a4b2c', sw: 1.4 })}
    ${rect(-18 * s, 640 - 80 * s, 36 * s, 80 * s, { fill: '#5a3a2a', sw: 1.4 })}
  </g>`;
}
function tree(x, palette, s, seed) {
  return `<g transform="translate(${x} 0)">
    ${line([[0, 700], [4, 520 - 60 * s], [-10, 430 - 80 * s]], { sw: 16 * s, stroke: '#5e4130' })}
    ${treeCanopy(0, 400 - 90 * s, 300 * s, 190 * s, { n: 10, greens: palette, cls: 'none', seed })}
  </g>`;
}
function lamp(x) {
  return `<g transform="translate(${x} 0)">
    ${line([[0, 780], [0, 300], [40, 270], [70, 276]], { sw: 7, stroke: '#3a3f44' })}
    ${poly([[56, 272], [86, 272], [80, 292], [62, 292]], { fill: '#fff2c4', sw: 1.6 })}
  </g>`;
}
function wallSeg(x) {
  return `<g transform="translate(${x} 0)">${rect(-160, 660, 320, 48, { fill: '#e2cfa6', sw: 1.8 })}${rect(-166, 652, 20, 60, { fill: '#c9b28a', sw: 1.6 })}</g>`;
}

export class Road {
  constructor(root) {
    this.root = root;
    resetSeed(4200);
    const r = rng(42);
    // three bands of things at different depths; each wraps around once it leaves the window
    this.span = 2600;
    const items = [];
    const add = (depth, x, markup) => items.push({ depth, x, markup });
    for (let x = 0; x < this.span; x += 420) add(0.35, x + r() * 120, bungalow(0, 0.7 + r() * 0.3, r));
    for (let x = 0; x < this.span; x += 330) add(0.7, x + r() * 80, tree(0, r() > 0.5 ? JACARANDA : (r() > 0.5 ? TABEBUIA : GREENS), 0.8 + r() * 0.4, 4300 + x));
    for (let x = 0; x < this.span; x += 520) add(1.0, x + 200, lamp(0));
    for (let x = 0; x < this.span; x += 330) add(1.25, x, wallSeg(0));
    root.innerHTML = `
      <defs><linearGradient id="road-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3e8"/><stop offset="1" stop-color="#f6e9c9"/></linearGradient></defs>
      <rect x="0" y="0" width="1600" height="1000" fill="url(#road-sky)"/>
      ${cloud(600, 300, 300, { opacity: 0.8 })}${cloud(1100, 260, 220, { opacity: 0.7 })}
      <rect x="0" y="690" width="1600" height="400" fill="#8d8478"/>
      <rect x="0" y="690" width="1600" height="16" fill="#b3a892"/>
      <g class="road-items">${items.map((it, i) => `<g data-i="${i}">${it.markup}</g>`).join('')}</g>`;
    this.items = items.map((it, i) => ({ ...it, el: root.querySelector(`[data-i="${i}"]`) }));
    this.items.sort((a, b) => a.depth - b.depth).forEach((it) => root.querySelector('.road-items').appendChild(it.el));
    this.place(0);
  }
  // move everything by `dx` at depth 1
  place(dx) {
    for (const it of this.items) {
      it.x -= dx * it.depth;
      while (it.x < -500) it.x += this.span;
      it.el.setAttribute('transform', `translate(${it.x.toFixed(1)} 0)`);
    }
  }
}

// ── the last stop: a busy Bengaluru street, one shopfront for every eatery on the route ──
// (Our own drawing, in the spirit of flat, side-on street illustrations; not copied from any artwork.)
const SHOP = {
  'ctr': { name: 'C.T.R.', wall: '#e3b04b', trim: '#2f5f86', awning: ['#2f5f86', '#f3e6c8'] },
  'airlines-hotel': { name: 'AIRLINES', wall: '#6f9a7a', trim: '#6b3d1f', awning: ['#2f6b3a', '#f3e6c8'] },
  'mtr': { name: 'M.T.R.', wall: '#c4553f', trim: '#3a2a20', awning: ['#8a1f16', '#f6e3a6'] },
  'brahmins-coffee-bar': { name: "BRAHMIN'S", wall: '#8fb8b0', trim: '#5a3a2a', awning: ['#e0662f', '#fbf3e2'] },
  'vidyarthi-bhavan': { name: 'VIDYARTHI BHAVAN', wall: '#e9dcb4', trim: '#7a2318', awning: ['#2f6b6b', '#f3e6c8'] },
  'taaza-thindi': { name: 'TAAZA THINDI', wall: '#7c6aa6', trim: '#ece4d0', awning: ['#e8578f', '#f4fbf2'] },
};

function shopfront(x, w, scene, visited, ticket, i, r) {
  const sh = SHOP[scene.id] || { name: scene.name.toUpperCase(), wall: '#d9c49a', trim: INK, awning: ['#9b2b1e', '#f3e6c8'] };
  const top = 230 + (i % 3) * 18 - (i % 2) * 26;
  let s = rect(x, top, w, 720 - top, { fill: sh.wall, sw: 2.4 });
  // parapet + upper-floor windows with little shutters
  s += rect(x - 4, top - 14, w + 8, 18, { fill: sh.trim, sw: 2, off: 0 });
  for (const wx of [x + w * 0.22, x + w * 0.62]) {
    s += rect(wx, top + 50, 46, 70, { fill: '#2a2a35', sw: 1.8 });
    s += rect(wx - 16, top + 50, 16, 70, { fill: sh.trim, sw: 1.6, off: 0 }) + rect(wx + 46, top + 50, 16, 70, { fill: sh.trim, sw: 1.6, off: 0 });
    s += rect(wx - 6, top + 120, 58, 7, { fill: sh.trim, sw: 1.4, off: 0 });
  }
  if (i % 2 === 0) s += poly([[x + w * 0.42, top + 128], [x + w * 0.42 + 26, top + 128], [x + w * 0.42 + 21, top + 110], [x + w * 0.42 + 5, top + 110]], { fill: '#b4553a', sw: 1.4 }) + blob(x + w * 0.42 + 13, top + 100, 18, 12, { fill: '#4f7f45', sw: 1.4 });
  // the signboard (with the Kannada stop name underneath), and a star if you collected its ticket
  s += sign(x + 14, 455, w - 28, 62, sh.name, { size: sh.name.length > 12 ? 19 : 25, color: sh.trim === '#ece4d0' ? '#5a3a8a' : sh.trim, fill: '#fbf3e2', sub: scene.stop ? scene.stop.kn : '' });
  if (ticket) s += `<g transform="translate(${x + w - 26} 452)"><path d="M0 -15 L4.5 -5 15 -4 7 3.5 9 14 0 8.5 -9 14 -7 3.5 -15 -4 -4.5 -5Z" fill="#f2c230" stroke="${INK}" stroke-width="1.6"/></g>`;
  // striped awning
  for (let k = 0; k < Math.floor(w / 22); k++) {
    s += poly([[x + k * 22, 524], [x + k * 22 + 22, 524], [x + k * 22 + 26, 552], [x + k * 22 + 4, 552]], { fill: sh.awning[k % 2], sw: 1.2, off: 0, amp: 0.4 });
  }
  // the shop below: open and lit if you stopped here, rolling shutter down if you skipped it
  if (visited) {
    s += rect(x + 18, 558, w - 36, 160, { fill: '#ffd98a', sw: 2 });
    s += `<circle cx="${x + w / 2}" cy="${620}" r="${w * 0.45}" fill="#fff2c4" opacity=".35"/>`;
    s += blob(x + w * 0.35, 690, 14, 30, { fill: '#7a4b2c', stroke: false, opacity: 0.5 }) + blob(x + w * 0.62, 686, 14, 34, { fill: '#7a4b2c', stroke: false, opacity: 0.5 });
  } else {
    s += rect(x + 18, 558, w - 36, 160, { fill: '#8e979c', sw: 2 });
    for (let y = 566; y < 716; y += 9) s += line([[x + 20, y], [x + w - 20, y]], { stroke: '#6c757a', sw: 1.2, amp: 0.2 });
    s += `<text x="${x + w / 2}" y="${646}" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="16" fill="#f3e6c8" opacity=".9">next time</text>`;
    // a stop you rode past without looking: the whole shopfront is greyed, like it's closed for the day
    s += `<rect x="${x}" y="${top - 16}" width="${w}" height="${740 - top}" fill="#5d5a55" opacity=".5"/>`;
    s += `<g transform="translate(${x + w / 2} 422) rotate(-6)">${rect(-76, -16, 152, 32, { fill: "#fbf3e2", sw: 1.8, off: 0 })}
      <text y="7" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="17" fill="#9b2b1e">ಮುಚ್ಚಿದೆ · closed</text></g>`;
  }
  return s;
}

function walker(x, s, o, prop = '') {
  return person(x, 965, s, { ...o, prop });
}

export function exteriorMarkup({ scenes, visited, tickets, destination }) {
  resetSeed(4400);
  const r = rng(44);
  const W = 1600 / scenes.length;
  const shops = scenes.map((sc, i) => shopfront(i * W, W, sc, visited.has(sc.id), tickets.has(sc.id), i, r)).join('');

  // the bus, side-on, parked at the last stop
  let wins = '';
  for (let i = 0; i < 7; i++) {
    const wx = 400 + i * 96;
    wins += rect(wx, 610, 80, 68, { fill: '#cfe3e8', sw: 2 });
    if (i % 3 !== 2) wins += person(wx + 40, 690, 0.66, { seed: 4700 + i, sitting: true, anim: 'none', flower: i === 1 });
    else for (let y = 614; y < 650; y += 6) wins += line([[wx + 3, y], [wx + 77, y]], { stroke: '#9aa3a8', sw: 1.6, amp: 0.1 });   // a half-pulled shutter
    wins += rect(wx, 610, 80, 68, { fill: 'none', sw: 2.4, off: 0 });
  }
  const bus = `
    <g class="ext-bus"><g class="bob slow">
      ${poly([[330, 830], [330, 610], [350, 572], [1290, 572], [1316, 612], [1318, 830]], { fill: '#f3e6c8', sw: 3, smooth: true, step: 90 })}
      ${poly([[332, 700], [1316, 700], [1318, 830], [330, 830]], { fill: '#d4572f', sw: 2.4 })}
      ${line([[332, 742], [1316, 742]], { stroke: '#f3e6c8', sw: 8 })}
      ${wins}
      <!-- door, with the conductor leaning out -->
      ${rect(1100, 600, 90, 228, { fill: '#2a2a35', sw: 2.4 })}
      ${person(1150, 812, 1.12, { seed: 4790, cloth: '#c9b07a', anim: 'bob', prop: `<g transform="translate(-22 -66)">${rect(-8, 0, 16, 20, { fill: '#7a4b2c', sw: 1.2, off: 0 })}</g>` })}
      ${rect(1206, 610, 92, 80, { fill: '#cfe3e8', sw: 2.2 })}
      ${blob(1296, 760, 13, 13, { fill: '#fff2c4', sw: 1.8 })}
      <!-- destination board -->
      ${rect(360, 580, 210, 26, { fill: '#1d1a1c', sw: 1.6, off: 0 })}
      <text x="465" y="600" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="18" fill="#f6e3a6">${destination}</text>
      <text x="1000" y="790" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-weight="800" font-size="30" fill="#f3e6c8" letter-spacing="2">ಬೆಂಗಳೂರು</text>
      ${blob(480, 836, 46, 46, { fill: '#1d1a1c', lump: 0.02 })}${blob(480, 836, 17, 17, { fill: '#f3e6c8', lump: 0.02 })}
      ${blob(1170, 836, 46, 46, { fill: '#1d1a1c', lump: 0.02 })}${blob(1170, 836, 17, 17, { fill: '#f3e6c8', lump: 0.02 })}
      ${rect(600, 548, 150, 26, { fill: '#7a4b2c', sw: 2 })}${rect(770, 556, 80, 18, { fill: '#2f6b6b', sw: 2 })}
    </g></g>`;

  // people walking past (the set repeats, so the crowd flows without a gap)
  const crowd = (dx) => `<g transform="translate(${dx} 0)">
    ${walker(60, 1.25, { seed: 4801, cloth: '#e8578f', flower: true })}
    ${walker(220, 1.2, { seed: 4802, cloth: '#f1ece0' }, `<g transform="translate(16 -60)">${tumbler(0, 0, 0.7)}</g>`)}
    ${walker(380, 1.0, { seed: 4803, cloth: '#3f6f8f' }, `<g transform="translate(-20 -60)">${rect(-12, 0, 22, 30, { fill: '#e0a33b', sw: 1.4, off: 0 })}</g>`)}
    ${walker(470, 1.0, { seed: 4804, cloth: '#3f6f8f' })}
    ${walker(660, 1.25, { seed: 4805, cloth: '#2f6b6b', flower: true })}
    ${walker(840, 1.22, { seed: 4806, cloth: '#c2452f' })}
    ${walker(1040, 1.25, { seed: 4807, cloth: '#e0a33b' }, `<g transform="translate(18 -60)">${rect(-4, -10, 8, 40, { fill: '#2f5f86', sw: 1.2, off: 0 })}</g>`)}
    ${walker(1240, 1.2, { seed: 4808, cloth: '#8c4a7a', flower: true })}
    ${walker(1420, 1.25, { seed: 4809, cloth: '#f1ece0' })}
  </g>`;

  let petals = '';
  for (let i = 0; i < 30; i++) petals += blob(r() * 1600, 790 + r() * 200, 5, 3, { fill: pick(r() > 0.5 ? TABEBUIA : JACARANDA, r), stroke: false, lump: 0.2 });

  return `
  <defs><linearGradient id="ext-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7ead0"/><stop offset="1" stop-color="#efdcb2"/></linearGradient></defs>
  <rect x="-400" y="-400" width="2400" height="1800" fill="url(#ext-sky)"/>
  ${shops}
  <!-- wires overhead, with crows -->
  ${line([[-50, 250], [500, 300], [1100, 285], [1650, 240]], { sw: 2, stroke: '#1d1a1c' })}
  ${line([[-50, 280], [700, 330], [1650, 270]], { sw: 2, stroke: '#1d1a1c' })}
  ${crow(560, 290, 0.8)}${crow(1240, 272, 0.75)}
  ${tree(560, JACARANDA, 1.1, 4601)}${tree(1330, TABEBUIA, 1.1, 4602)}
  ${lamp(250)}
  <!-- pavement and road -->
  <rect x="-400" y="720" width="2400" height="70" fill="#c9bea6"/>
  ${[...Array(18)].map((_, k) => line([[k * 100 - 40, 720], [k * 100 - 40, 790]], { stroke: '#a89c84', sw: 1.4 })).join('')}
  <rect x="-400" y="790" width="2400" height="600" fill="#9a907f"/>
  ${line([[-400, 790], [2000, 790]], { sw: 2.4 })}
  ${[0, 1, 2, 3, 4].map((k) => line([[k * 380 - 100, 960], [k * 380 + 80, 960]], { stroke: '#f3e6c8', sw: 7, opacity: 0.5 })).join('')}
  ${petals}
  ${bus}
  <!-- a cow, unbothered by all of it -->
  <g transform="translate(1460 900)"><g class="bob slow">
    ${blob(0, 0, 70, 30, { fill: '#efe8dc', lump: 0.06 })}${blob(-70, -14, 22, 18, { fill: '#efe8dc', lump: 0.06 })}
    ${line([[-82, -30], [-92, -46]], { sw: 3 })}${line([[-62, -30], [-56, -46]], { sw: 3 })}<circle cx="-76" cy="-16" r="2" fill="${INK}"/>
    ${line([[-40, 26], [-40, 60]], { sw: 5 })}${line([[40, 26], [40, 60]], { sw: 5 })}
  </g></g>
  <g class="crowd">${crowd(0)}${crowd(1800)}</g>`;
}
