// Tiny hand-drawn SVG toolkit.
// Every shape is drawn twice: a flat fill nudged off-register, then a wobbly ink outline
// on top — a cheap risograph / children's-book look with zero runtime filter cost.

export const INK = '#2a1a12';

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let SEED = 7;
export const nextSeed = () => (SEED = (SEED * 9301 + 49297) % 233280);
export const resetSeed = (s) => { SEED = s; };

const f = (n) => Math.round(n * 10) / 10;

// Densify a polygon so the jitter reads as hand-drawn rather than random.
function densify(pts, step, closed) {
  const out = [];
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const k = Math.max(1, Math.round(len / step));
    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  if (!closed) out.push(pts[pts.length - 1]);
  return out;
}

function jitter(pts, amp, r) {
  return pts.map(([x, y]) => [x + (r() - 0.5) * 2 * amp, y + (r() - 0.5) * 2 * amp]);
}

// Smooth path through points using midpoint quadratic curves.
export function smoothPath(pts, closed = true) {
  if (pts.length < 3) return `M${pts.map((p) => p.map(f).join(' ')).join(' L')}`;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (!closed) {
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const m = mid(pts[i], pts[i + 1]);
      d += ` Q${f(pts[i][0])} ${f(pts[i][1])} ${f(m[0])} ${f(m[1])}`;
    }
    const l = pts[pts.length - 1];
    return d + ` L${f(l[0])} ${f(l[1])}`;
  }
  const m0 = mid(pts[pts.length - 1], pts[0]);
  let d = `M${f(m0[0])} ${f(m0[1])}`;
  for (let i = 0; i < pts.length; i++) {
    const m = mid(pts[i], pts[(i + 1) % pts.length]);
    d += ` Q${f(pts[i][0])} ${f(pts[i][1])} ${f(m[0])} ${f(m[1])}`;
  }
  return d + 'Z';
}

// Corner-preserving path (keeps rectangles looking like rectangles).
function sharpPath(pts) {
  return 'M' + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L') + 'Z';
}

/**
 * Generic hand-drawn polygon.
 * opts: fill, stroke (false to skip), amp, step, sw, smooth, off (fill misregistration), opacity
 */
export function poly(pts, opts = {}) {
  const {
    fill = 'none', stroke = INK, amp = 1.6, step = 18, sw = 2.2, smooth = false,
    off = 2.2, opacity = 1, cls = '', seed = nextSeed(),
  } = opts;
  const r = rng(seed);
  const dens = densify(pts, step, true);
  const toPath = smooth ? (p) => smoothPath(p) : sharpPath;
  let s = `<g${cls ? ` class="${cls}"` : ''}${opacity < 1 ? ` opacity="${opacity}"` : ''}>`;
  if (fill !== 'none') {
    const fp = jitter(dens, amp * 0.6, r).map(([x, y]) => [x + off, y + off * 0.7]);
    s += `<path d="${toPath(fp)}" fill="${fill}"/>`;
  }
  if (stroke) {
    s += `<path d="${toPath(jitter(dens, amp, r))}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  return s + '</g>';
}

export const rect = (x, y, w, h, o = {}) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o);

export function blob(cx, cy, rx, ry, o = {}) {
  const n = o.n || 14;
  const r = rng(o.seed || nextSeed());
  const lump = o.lump ?? 0.12;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * 2 * lump;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return poly(pts, { ...o, smooth: true, step: 999, amp: o.amp ?? 0.8 });
}

export function line(pts, o = {}) {
  const { stroke = INK, sw = 2.2, amp = 1.2, step = 16, seed = nextSeed(), opacity = 1, cls = '' } = o;
  const r = rng(seed);
  const d = smoothPath(jitter(densify(pts, step, false), amp, r), false);
  return `<path${cls ? ` class="${cls}"` : ''} d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
}

// Painted signboard with hand-lettered text.
export function sign(x, y, w, h, text, o = {}) {
  const { fill = '#f3e2bd', color = '#9b2b1e', size = 34, font = 'Rozha One', sub = '' } = o;
  return `<g>${rect(x, y, w, h, { fill, sw: 2.6 })}
    ${rect(x + 7, y + 7, w - 14, h - 14, { stroke: color, sw: 1.4, amp: 1, off: 0 })}
    <text x="${x + w / 2}" y="${y + h / 2 + size * 0.34 - (sub ? 8 : 0)}" text-anchor="middle" font-family="'${font}', 'Baloo Tamma 2', sans-serif" font-size="${size}" fill="${color}" letter-spacing="1">${text}</text>
    ${sub ? `<text x="${x + w / 2}" y="${y + h - 14}" text-anchor="middle" font-family="'Baloo Tamma 2', sans-serif" font-size="${size * 0.42}" fill="${INK}" opacity=".8">${sub}</text>` : ''}
  </g>`;
}

// ── Little characters & props ────────────────────────────────────────────

const SKIN = ['#8a5a3c', '#a26b45', '#6e4430', '#b57d55', '#7b4c33'];
const CLOTH = ['#e8d9b8', '#c2452f', '#3f6f8f', '#e0a33b', '#6d8f4e', '#f1ece0', '#8c4a7a', '#d9774a'];
export const pick = (arr, r) => arr[Math.floor(r() * arr.length)];

export function person(x, y, s = 1, o = {}) {
  const r = rng(o.seed || nextSeed());
  const skin = o.skin || pick(SKIN, r);
  const cloth = o.cloth || pick(CLOTH, r);
  const sitting = o.sitting;
  const h = sitting ? 46 : 78;
  const hair = r() > 0.3 ? INK : '#d8d2c8';
  const bodyW = 30 + r() * 8;
  const flower = o.flower ? `<circle cx="${10}" cy="${-h - 22}" r="4" fill="#fffaf0" stroke="${INK}" stroke-width="1"/>` : '';
  const legs = sitting ? '' :
    line([[-7, -4], [-7, -28]], { sw: 5, stroke: o.legs || '#e8dcc0' }) + line([[7, -4], [7, -28]], { sw: 5, stroke: o.legs || '#e8dcc0' });
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="${o.anim || 'bob'}" style="animation-delay:${(-r() * 4).toFixed(2)}s">
    ${legs}
    ${blob(0, -h / 2 - (sitting ? 0 : 14), bodyW / 2, h / 2 - 4, { fill: cloth, lump: 0.08 })}
    ${blob(0, -h - 14, 12, 13, { fill: skin, lump: 0.05 })}
    ${blob(0, -h - 21, 12.5, 7, { fill: hair, stroke: false, lump: 0.05 })}
    ${flower}
    <circle cx="-4" cy="${-h - 12}" r="1.3" fill="${INK}"/><circle cx="4" cy="${-h - 12}" r="1.3" fill="${INK}"/>
    ${o.prop || ''}
  </g></g>`;
}

export function tumbler(x, y, s = 1, steam = true) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${poly([[-13, 0], [13, 0], [9, -6], [-9, -6]], { fill: '#aeb6ba', sw: 1.4, amp: 0.4 })}
    ${poly([[-8, -6], [8, -6], [6, -30], [-6, -30]], { fill: '#d6dcdf', sw: 1.4, amp: 0.4 })}
    ${line([[-3, -26], [-2, -10]], { stroke: '#fff', sw: 1.6, amp: 0.2 })}
    ${steam ? `<g class="steam">${line([[0, -34], [-5, -44], [3, -54], [-2, -66]], { sw: 2, stroke: '#ffffff', amp: 0.5, opacity: 0.8 })}</g>` : ''}
  </g>`;
}

export function table(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${line([[0, 0], [0, 50]], { sw: 5 })}
    ${line([[-18, 52], [18, 52]], { sw: 4 })}
    ${blob(0, 0, 58, 12, { fill: '#efe9df', lump: 0.03 })}
  </g>`;
}

export function chair(x, y, s = 1, flip = false, color = '#c0663b') {
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    ${line([[-12, 0], [-12, 38]], { sw: 3 })}${line([[12, 0], [12, 38]], { sw: 3 })}
    ${line([[-12, -32], [-12, 0]], { sw: 3 })}
    ${rect(-14, -4, 28, 6, { fill: color, sw: 1.6 })}
    ${rect(-15, -34, 6, 30, { fill: color, sw: 1.6, off: 1 })}
  </g>`;
}

export function treeCanopy(cx, cy, w, h, o = {}) {
  const r = rng(o.seed || nextSeed());
  const greens = o.greens || ['#2f5a37', '#3d6d3f', '#4f7f45', '#28492f'];
  let s = '';
  const n = o.n || 11;
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    const bx = cx + Math.cos(a) * d * w * 0.42;
    const by = cy + Math.sin(a) * d * h * 0.36;
    const br = (0.22 + r() * 0.18) * Math.min(w, h * 1.6);
    s += blob(bx, by, br, br * 0.72, { fill: pick(greens, r), lump: 0.18, n: 16, stroke: o.stroke ?? INK, sw: o.sw || 2 });
  }
  return `<g class="${o.cls || 'sway'}">${s}</g>`;
}

export function crow(x, y, s = 1, cls = '') {
  return `<g transform="translate(${x} ${y}) scale(${s})"${cls ? ` class="${cls}"` : ''}>
    ${blob(0, 0, 14, 8, { fill: '#1d1a1c', lump: 0.05, sw: 1.4 })}
    ${blob(12, -6, 6, 6, { fill: '#2b2730', lump: 0.05, sw: 1.4 })}
    ${poly([[17, -6], [25, -4], [17, -3]], { fill: '#1d1a1c', sw: 1.2, off: 0 })}
    <circle cx="13" cy="-7" r="1.2" fill="#f3e6c8"/>
    ${line([[-12, -2], [-24, 2]], { sw: 3, stroke: '#1d1a1c' })}
  </g>`;
}

export function cloud(cx, cy, w, o = {}) {
  const r = rng(o.seed || nextSeed());
  let s = '';
  for (let i = 0; i < 5; i++) {
    s += blob(cx + (i - 2) * w * 0.18 + (r() - 0.5) * 10, cy - Math.sin((i / 4) * Math.PI) * w * 0.12,
      w * (0.16 + r() * 0.08), w * (0.12 + r() * 0.05), { fill: o.fill || '#fbf3e2', stroke: o.stroke ?? false, lump: 0.1 });
  }
  return `<g opacity="${o.opacity ?? 0.95}">${s}</g>`;
}
