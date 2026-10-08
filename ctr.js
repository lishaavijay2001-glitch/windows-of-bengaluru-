// CTR / Central Tiffin Room — Malleshwaram at blue dawn.
// Signature: indigo sky + moon, glowing lamps, a warmly lit tiffin room,
// a crowd clutching steaming tumblers. Cool street, warm light.

import {
  rect, blob, line, poly, sign, person, tumbler, treeCanopy, resetSeed, rng, INK, pick,
} from './draw.js';

const NIGHT = '#232845';          // silhouette ink for dawn shadows
const GLOW = '#ffcf6b';

const palm = (x, y, h, o = {}) => {
  const c = o.color || NIGHT;
  const top = [x + 18, y - h];
  let fronds = '';
  for (let i = 0; i < 8; i++) {
    const side = i % 2 ? 1 : -1;
    const spread = 0.25 + (Math.floor(i / 2) / 3) * 1.1;
    const L = 62 + (i % 3) * 12;
    const dx = side * Math.sin(spread) * L;
    const lift = Math.cos(spread) * 28;
    const midp = [top[0] + dx * 0.55, top[1] - lift - 6];
    const end = [top[0] + dx, top[1] - lift * 0.2 + 26 * spread];
    fronds += line([top, midp, end], { sw: 6, stroke: c, amp: 0.8 });
    for (let k = 1; k <= 4; k++) {
      const tt = k / 5;
      const px = top[0] + dx * tt, py = top[1] - lift * Math.sin(tt * Math.PI) * 0.9 + 26 * spread * tt * tt;
      fronds += line([[px, py], [px + side * 6, py + 14]], { sw: 3, stroke: c, amp: 0.4 });
    }
  }
  return `<g>${line([[x, y], [x + 8, y - h * 0.5], [x + 18, y - h]], { sw: 10, stroke: o.trunk || c })}<g class="sway">${fronds}</g></g>`;
};

const lamp = (x, y, h, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="34" cy="${-h + 14}" r="90" fill="url(#ctr-lampglow)"/>
    ${line([[0, 0], [0, -h], [14, -h - 14], [34, -h - 10]], { sw: 6, stroke: '#1c2038' })}
    ${poly([[22, -h - 8], [46, -h - 8], [40, -h + 10], [28, -h + 10]], { fill: GLOW, sw: 1.6 })}
  </g>`;

function far() {
  resetSeed(501);
  const r = rng(51);
  let stars = '';
  for (let i = 0; i < 40; i++) {
    stars += `<circle cx="${(r() * 2600 - 500).toFixed(0)}" cy="${(r() * 420 - 260).toFixed(0)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#f6efd8" opacity="${(0.3 + r() * 0.6).toFixed(2)}" class="${i % 4 ? '' : 'twinkle'}"/>`;
  }
  return `
  <defs>
    <linearGradient id="ctr-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1e2550"/>
      <stop offset=".45" stop-color="#4b5590"/>
      <stop offset=".78" stop-color="#b98aa6"/>
      <stop offset="1" stop-color="#f2b996"/>
    </linearGradient>
    <radialGradient id="ctr-lampglow"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
    <radialGradient id="ctr-shopglow"><stop offset="0" stop-color="#ffcf6b" stop-opacity=".6"/><stop offset="1" stop-color="#ffcf6b" stop-opacity="0"/></radialGradient>
  </defs>
  <rect x="-1400" y="-900" width="4400" height="1520" fill="url(#ctr-sky)"/>
  ${stars}
  <!-- crescent moon -->
  <circle cx="1120" cy="200" r="70" fill="#f6efd8" opacity=".12"/>
  ${blob(1120, 200, 34, 34, { fill: '#f6efd8', stroke: false, lump: 0.02 })}
  ${blob(1136, 190, 30, 30, { fill: '#38407a', stroke: false, lump: 0.02 })}
  <g opacity=".9">
    ${poly([[1180, 600], [1180, 520], [1200, 520], [1200, 480], [1215, 480], [1215, 445], [1228, 445], [1228, 410], [1252, 410], [1252, 445], [1265, 445], [1265, 480], [1280, 480], [1280, 520], [1300, 520], [1300, 600]], { fill: '#3a3d63', stroke: false })}
    ${blob(1240, 400, 8, 12, { fill: '#3a3d63', stroke: false })}
    ${rect(260, 470, 70, 40, { fill: '#3a3d63', stroke: false })}${line([[270, 510], [262, 600]], { stroke: '#3a3d63', sw: 5 })}${line([[320, 510], [328, 600]], { stroke: '#3a3d63', sw: 5 })}
    ${palm(60, 600, 190, { color: '#3a3d63' })}${palm(1480, 600, 210, { color: '#3a3d63' })}${palm(900, 600, 160, { color: '#3a3d63' })}
  </g>
  <rect x="-1400" y="598" width="4400" height="900" fill="#4b4d6b"/>`;
}

function back() {
  resetSeed(602);
  const r = rng(62);
  const walls = ['#5d6a96', '#6f7fa8', '#4f6b85', '#7a6e9a', '#5b7d8c'];
  let s = '';
  let x = -320;
  while (x < 1900) {
    const w = 150 + r() * 90, h = 130 + r() * 110, top = 612 - h;
    s += rect(x, top, w, h, { fill: pick(walls, r), stroke: '#1c2038' });
    s += poly([[x - 14, top + 6], [x + w + 14, top + 6], [x + w - 10, top - 36], [x + 10, top - 36]], { fill: '#3d3560', stroke: '#1c2038' });
    const wins = Math.max(1, Math.floor(w / 70));
    for (let i = 0; i < wins; i++) {
      const wx = x + (w / (wins + 1)) * (i + 1) - 17;
      const lit = r() > 0.55;
      if (lit) s += `<circle cx="${wx + 17}" cy="${top + 50}" r="46" fill="url(#ctr-shopglow)" opacity=".7"/>`;
      s += rect(wx, top + 28, 34, 46, { fill: lit ? GLOW : '#262b4a', stroke: '#1c2038', sw: 1.6 });
      s += line([[wx + 17, top + 28], [wx + 17, top + 74]], { sw: 1.2, stroke: '#1c2038' });
    }
    x += w + 6 + r() * 30;
    if (r() > 0.6) s += palm(x - 4, 612, 200 + r() * 60);
  }
  // electric wires sagging across the street
  s += line([[-400, 300], [400, 360], [1200, 330], [2000, 300]], { sw: 1.6, stroke: '#1c2038', opacity: 0.8 });
  s += line([[-400, 330], [500, 390], [1300, 360], [2000, 340]], { sw: 1.6, stroke: '#1c2038', opacity: 0.8 });
  return s;
}

function mid() {
  resetSeed(703);
  const r = rng(73);
  const cloth = ['#3f6f8f', '#8c4a7a', '#c2452f', '#e8dcc0', '#2f6b6b', '#d9774a', '#6d6aa0', '#f1ece0'];
  // a proper crowd waiting for coffee, two rows deep
  let crowd = '';
  const spots = [[830, 650], [890, 662], [945, 648], [1005, 664], [1060, 650], [1120, 660], [1180, 648], [1240, 662],
    [860, 690], [925, 700], [990, 688], [1050, 702], [1115, 690], [1185, 698]];
  spots.forEach(([px, py], i) => {
    crowd += person(px, py, py > 680 ? 1.08 : 0.95, {
      seed: 900 + i, cloth: pick(cloth, r), skin: pick(['#6e4430', '#7b4c33', '#8a5a3c', '#5e3a28'], r), flower: i % 4 === 1,
      prop: `<g transform="translate(16 -54)">${tumbler(0, 0, 0.6)}</g>`,
    });
  });
  return `
  <rect x="-1400" y="612" width="4400" height="1200" fill="#4b4d6b"/>
  <rect x="-1400" y="604" width="4400" height="40" fill="#6b6a85"/>
  ${line([[-400, 644], [2000, 644]], { sw: 2, stroke: '#1c2038' })}
  ${line([[-200, 820], [80, 818]], { stroke: '#d6d2e8', sw: 6, opacity: 0.35 })}${line([[300, 822], [600, 820]], { stroke: '#d6d2e8', sw: 6, opacity: 0.35 })}${line([[900, 818], [1180, 820]], { stroke: '#d6d2e8', sw: 6, opacity: 0.35 })}${line([[1400, 820], [1700, 822]], { stroke: '#d6d2e8', sw: 6, opacity: 0.35 })}
  <!-- warm spill of light from the tiffin room across the road -->
  ${poly([[520, 645], [660, 645], [820, 1000], [360, 1000]], { fill: '#ffcf6b', stroke: false, opacity: 0.22, smooth: false })}
  <circle cx="590" cy="560" r="300" fill="url(#ctr-shopglow)"/>
  <!-- the tiffin room (illustrative, not the real facade) -->
  ${rect(350, 450, 480, 200, { fill: '#e9cf9c' })}
  ${poly([[325, 460], [855, 460], [800, 400], [380, 400]], { fill: '#6e3a3a' })}
  ${line([[395, 420], [785, 420]], { stroke: '#3d1f22', sw: 1.4 })}${line([[352, 444], [828, 444]], { stroke: '#3d1f22', sw: 1.4 })}
  ${rect(350, 620, 480, 30, { fill: '#7a2f22' })}
  ${rect(510, 540, 160, 108, { fill: GLOW })}
  <g opacity=".7">${blob(560, 600, 14, 30, { fill: '#5a3420', stroke: false })}${blob(626, 596, 14, 34, { fill: '#5a3420', stroke: false })}</g>
  <!-- the big brass coffee boiler inside -->
  ${poly([[575, 640], [605, 640], [610, 586], [570, 586]], { fill: '#c98b2f', sw: 1.8 })}${blob(590, 582, 22, 8, { fill: '#e0a33b', sw: 1.6, lump: 0.04 })}
  <g class="steam">${line([[590, 574], [582, 556], [596, 538], [586, 518]], { stroke: '#fffaf0', sw: 3, opacity: 0.85 })}</g>
  ${rect(390, 556, 80, 60, { fill: GLOW })}${rect(710, 556, 80, 60, { fill: GLOW })}
  ${line([[430, 556], [430, 616]], { sw: 1.4 })}${line([[750, 556], [750, 616]], { sw: 1.4 })}
  <g class="hotspot-glow"><circle cx="600" cy="497" r="200" fill="url(#ctr-shopglow)" opacity=".8"/></g>
  ${sign(395, 465, 410, 64, 'CENTRAL TIFFIN ROOM', { size: 26, color: '#7a2318', fill: '#fff1cc' })}
  <g class="twinkle"><path d="M818 450 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#fff6c9" stroke="${INK}" stroke-width="1.2"/></g>
  ${lamp(250, 645, 230)}${lamp(1320, 645, 240)}
  <!-- flower seller under the lamp -->
  ${person(220, 700, 1, { sitting: true, seed: 980, cloth: '#2f6b6b', flower: true })}
  ${blob(272, 700, 34, 14, { fill: '#c9a26a', lump: 0.05 })}
  ${[0, 1, 2, 3, 4, 5, 6].map((i) => blob(252 + i * 7, 690 - (i % 2) * 4, 5, 5, { fill: i % 2 ? '#fffaf0' : '#f2a531', sw: 1, lump: 0.1 })).join('')}
  ${crowd}
  <!-- bicycle leaning on the lamp -->
  <g transform="translate(1340 700)">
    ${blob(0, 0, 26, 26, { fill: 'none', sw: 3, lump: 0.02 })}${blob(80, 0, 26, 26, { fill: 'none', sw: 3, lump: 0.02 })}
    ${line([[0, 0], [30, -34], [70, -34], [80, 0]], { sw: 3 })}${line([[30, -34], [40, 0], [0, 0]], { sw: 3 })}
    ${line([[66, -34], [62, -52], [74, -54]], { sw: 3 })}${line([[26, -40], [38, -40]], { sw: 5 })}
  </g>
  <!-- a cow, unbothered by the queue -->
  <g transform="translate(1560 770)"><g class="bob slow">
    ${blob(0, 0, 70, 30, { fill: '#cfcadf', lump: 0.06 })}
    ${blob(-70, -14, 22, 18, { fill: '#cfcadf', lump: 0.06 })}
    ${line([[-82, -30], [-92, -46]], { sw: 3 })}${line([[-62, -30], [-56, -46]], { sw: 3 })}
    <circle cx="-76" cy="-16" r="2" fill="${INK}"/>
  </g></g>`;
}

function near() {
  resetSeed(804);
  // a toran of mango leaves and marigolds, in silhouette against the dawn
  let toran = line([[-500, 175], [200, 215], [800, 228], [1400, 214], [2100, 170]], { sw: 2.4, stroke: NIGHT });
  for (let x = -460; x < 2080; x += 46) {
    const y = 175 + 50 * Math.sin(((x + 500) / 2600) * Math.PI) - 4;
    toran += (x / 46) % 2 === 0
      ? poly([[x - 9, y], [x + 9, y], [x, y + 40]], { fill: '#2c4a3a', stroke: NIGHT, sw: 1.6, smooth: true, step: 999, off: 1.4 })
      : blob(x, y + 8, 10, 10, { fill: '#e08a1f', stroke: NIGHT, sw: 1.6, lump: 0.2 });
  }
  return `
  <g class="sway slow">${toran}</g>
  <g class="sway">
    ${line([[2100, 60], [1600, 110], [1250, 150]], { sw: 16, stroke: NIGHT })}
    ${treeCanopy(1420, 110, 420, 140, { n: 8, greens: ['#232845', '#2a3152', '#1e2340'], stroke: '#141830' })}
  </g>
  <!-- a near street lamp, still on -->
  <circle cx="30" cy="356" r="150" fill="url(#ctr-lampglow)"/>
  ${line([[-120, 1100], [-110, 420], [-60, 360], [10, 352]], { sw: 12, stroke: '#1c2038' })}
  ${poly([[0, 340], [44, 340], [36, 374], [8, 374]], { fill: GLOW })}`;
}

const bicycle = () => `<g>
  ${blob(0, 0, 24, 24, { fill: 'none', sw: 3, lump: 0.02 })}${blob(76, 0, 24, 24, { fill: 'none', sw: 3, lump: 0.02 })}
  ${line([[0, 0], [28, -32], [66, -32], [76, 0]], { sw: 3 })}${line([[28, -32], [38, 0], [0, 0]], { sw: 3 })}
  ${person(36, -20, 0.9, { seed: 4242, cloth: '#c2452f', sitting: true, anim: 'none' })}
  ${tumbler(70, -46, 0.5, false)}
</g>`;

export const ctr = {
  layers: [
    { id: 'far', depth: 0.2, svg: far },
    { id: 'back', depth: 0.45, svg: back },
    { id: 'mid', depth: 0.8, svg: mid },
    { id: 'near', depth: 1.25, svg: near },
  ],
  hotspot: { x: 600, y: 497, depth: 0.8 },

  // Open palm: every cup in the crowd lets go of its steam, marigolds drift down, someone cycles past.
  interact(fx) {
    const r = Math.random;
    const cups = [846, 906, 961, 1021, 1076, 1136, 1196, 1256, 876, 941, 1006, 1066, 1131, 1201, 590];
    for (const cx of cups) {
      fx.spawn('mid', line([[0, 0], [-8, -16], [6, -34], [-4, -52], [4, -70]], { stroke: '#ffffff', sw: 4, opacity: 0.9 }), {
        x: cx + (r() - 0.5) * 10, y: 590, vx: (r() - 0.5) * 20, vy: -(50 + r() * 30),
        grow: 0.9, sway: 18, life: 4.5, fade: true, delay: r() * 0.9,
      });
    }
    for (let i = 0; i < 18; i++) {
      fx.spawn('near', blob(0, 0, 7, 7, { fill: r() > 0.5 ? '#f0a531' : '#e08a1f', sw: 1.2, lump: 0.2 }), {
        x: r() * 1600, y: 200 + r() * 40, vx: -20 - r() * 40, vy: 50 + r() * 60,
        vr: (r() - 0.5) * 200, sway: 30, life: 5, delay: r(),
      });
    }
    fx.spawn('mid', bicycle(), { x: -200, y: 790, vx: 330, vy: 0, life: 7, bob: 3 });
  },
};
