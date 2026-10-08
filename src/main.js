// The Windows of Bengaluru — prototype v0.8: a city-bus ride, one stop per eatery
import { buildBus, GEO, createBlind } from './components/BusFrame.js';
import { Road, stopBoard, exteriorMarkup } from './components/Journey.js';
import { Texts, SPOTS } from './components/Texts.js';
import { FogGlass } from './components/FogGlass.js';
import { FogWriting } from './components/FogWriting.js';
import { InsightChit } from './components/InsightChit.js';
import { BusPass } from './components/BusPass.js';
import { buildLookAgain } from './components/Finale.js';
import { DebugPanel } from './components/DebugPanel.js';
import { InputManager } from './handTracking/InputManager.js';
import { SceneRenderer } from './scenes/SceneRenderer.js';
import { tween, wait, ease, reducedMotion } from './animations/tween.js';
import { StateMachine, S } from './stateMachine.js';
import { ACTIVE_SCENES } from './data/scenes.js';
import { Sound } from './audio/Sound.js';
import { AudioManager } from './audio/AudioManager.js';

const svg = document.getElementById('stage');
const street = buildBus(svg);
const road = new Road(street.road);
const input = new InputManager();
const renderer = new SceneRenderer(null, { reduced: reducedMotion() });
const texts = new Texts(street.texts);
const debug = new DebugPanel(input);
const statusEl = document.getElementById('status');
const lookAgain = buildLookAgain(street.finaleUI, () => restart());

// the bus pass: every gesture on one card, before boarding and any time after (H / ✋ button)
const pass = new BusPass(street.pass);
const gesturesBtn = document.getElementById('gestures');
gesturesBtn.addEventListener('click', (e) => { e.stopPropagation(); if (!sm.is(S.INTRO)) pass.toggle(); });
addEventListener('keydown', (e) => { if ((e.key === 'h' || e.key === 'H') && !sm.is(S.INTRO, S.BOOT)) pass.toggle(); });

// ── sound: wakes on the first click / key press (browser rule), M to mute ──
const sound = new Sound();
const audio = new AudioManager(sound);
const soundBtn = document.getElementById('sound');
const renderSoundBtn = () => {
  const on = sound.running && !sound.muted;
  soundBtn.textContent = !sound.running ? '♪ click anywhere for sound' : on ? '♪ sound on · M to mute' : '♪ muted · M for sound';
  soundBtn.classList.toggle('on', on);
  soundBtn.setAttribute('aria-pressed', String(on));
};
sound.onChange(() => { renderSoundBtn(); audio.unlock(); audio.setMuted(sound.muted); });
const wake = (e) => { if (e && e.target && e.target.closest && e.target.closest('#sound')) return; audio.primeFromGesture(); if (!sound.running) sound.start(); };
addEventListener('pointerdown', wake);
addEventListener('keydown', (e) => { if (e.key === 'm' || e.key === 'M') sound.toggleMute(); else wake(); });
soundBtn.addEventListener('click', (e) => { e.stopPropagation(); audio.primeFromGesture(); if (sound.running) sound.toggleMute(); else sound.start(); });

// one bus, one window: the blind stands in for the old shutters (same open/close/set interface)
const kit = {
  refs: street,
  shutters: createBlind(street.blind),
  glass: new FogGlass(street),
  writing: new FogWriting(street.writing),
  chit: new InsightChit(street.chit),
};
renderer.attach(street.scene);

// ── progress ────────────────────────────────────────────────────────
let index = 0;
let zoom = 0;
let discovered = false, discoveredAt = 0;
let interacted = false, interactedAt = 0;
let secretSeen = false, secretAt = 0;
let zoomedSince = 0;
let awaitMotion0 = 0, crack = 0, swinging = false;
let nagUntil = 0;
const visited = new Set();
const tickets = new Set();
const opened = new Set();        // stops where you actually rolled the blind up (their shop is lit at the end)       // stops where you got the ✌️ ticket (they get a star at the end)
const here = () => kit;
const isLast = () => index === ACTIVE_SCENES.length - 1;

function arriveAt(i) {
  index = i;
  renderer.mount(ACTIVE_SCENES[i], { near: stopBoard(ACTIVE_SCENES[i].stop) });
  sound.setScene(ACTIVE_SCENES[i].music);
  audio.setScene(ACTIVE_SCENES[i]);
  zoom = 0; discovered = false; interacted = false; zoomedSince = 0; secretSeen = false;
}

const sm = new StateMachine({
  async [S.INTRO]() {
    here().glass.targetDensity = 0.42;
    await wait(700);
    texts.say('title', "DON'T LOOK TOO CLOSELY.");
    await wait(1900);
    texts.say('subtitle', 'There are stories hiding outside.');
    await wait(2800);
    texts.hush('title'); texts.hush('subtitle');
    await wait(500);
    input.enableCamera();          // the browser asks for the camera while you read the pass
    await pass.show(true);
    sm.go(S.AWAIT_HAND);
  },
  async [S.AWAIT_HAND]() {
    awaitMotion0 = input.motion;
    await wait(400);
    texts.say('hint', 'Move your hand.');
  },
  [S.EXPLORING]() { here().glass.targetDensity = 0.16; opened.add(ACTIVE_SCENES[index].id); },
  [S.CLOSED]() { here().glass.targetDensity = 0.3; },
  async [S.FINALE]() {
    // last stop: step off, and watch the bus pull away under the blossom
    texts.hushAll();
    kit.writing.clear(); kit.chit.hide();
    visited.add(ACTIVE_SCENES[index].id);
    sound.ding();
    const ext = street.exterior;
    ext.innerHTML = exteriorMarkup({ scenes: ACTIVE_SCENES, visited: opened, tickets, destination: ACTIVE_SCENES[ACTIVE_SCENES.length - 1].stop.kn });
    ext.style.display = '';
    const extBus = ext.querySelector('.ext-bus');
    extBus.setAttribute('transform', 'translate(1700 0)');
    await wait(500);
    await tween(reducedMotion() ? 10 : 1400, (t) => {
      street.bus.setAttribute('opacity', (1 - t).toFixed(3));
      ext.setAttribute('opacity', t.toFixed(3));
    }, ease.inOutCubic);
    street.bus.style.display = 'none';
    // the bus rolls in and parks in front of every place you stopped at today
    extBus.setAttribute('transform', 'translate(1700 0)');
    sound.engine(0.6);
    await tween(reducedMotion() ? 10 : 2600, (t) => {
      extBus.setAttribute('transform', `translate(${((1 - t) * 1700).toFixed(1)} 0)`);
      sound.engine(0.15 + 0.5 * (1 - t));
      if (t > 0.9 && !extBus.dataset.w) { extBus.dataset.w = '1'; sound.whistle(); }
    }, ease.outCubic);
    sound.engine(0);
    texts.say('title', `You looked through ${opened.size} window${opened.size === 1 ? '' : 's'}${tickets.size ? ` and collected ${tickets.size} ticket${tickets.size === 1 ? '' : 's'}` : ''}.`,
      { ...SPOTS.title, y: 92, size: 36, spacing: 1 });
    await wait(2000);
    texts.say('subtitle', 'But Bengaluru has thousands of stories.', { ...SPOTS.subtitle, y: 140 });
    sound.finale();
    await wait(1800);
    await wait(900);
    lookAgain.show();
  },
});

// ── actions ─────────────────────────────────────────────────────────
async function openWindow() {
  if (!sm.go(S.OPENING)) return;
  texts.hushAll();
  sound.open();
  await here().shutters.open(1300);
  sm.go(S.EXPLORING);
}

async function closeWindow() {
  if (!sm.go(S.CLOSING)) return;
  texts.hushAll();
  visited.add(ACTIVE_SCENES[index].id);
  here().writing.clear();
  here().chit.hide();
  setTimeout(() => sound.close(), 450);
  await here().shutters.close(650);
  sm.go(S.CLOSED);
}

// ── the ride: ding-ding, pull away, the city streams past, slow into the next stop ──
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
async function rideTo(i) {
  const wasOpen = sm.is(S.EXPLORING);
  if (!sm.go(S.RIDING)) return;
  texts.hushAll();
  kit.writing.clear(); kit.chit.hide();
  visited.add(ACTIVE_SCENES[index].id);
  sound.ding();
  street.bellBody.classList.remove('ring'); void street.bellBody.getBBox(); street.bellBody.classList.add('ring');
  await wait(650);
  const OUT = 1900;
  const ms = reducedMotion() ? 900 : 4600;
  let swapped = false, whistled = false, last = performance.now();
  await tween(ms, (t) => {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    const v = smooth(0, 0.3, t) * (1 - smooth(0.7, 1, t));                 // speed: pull away, cruise, brake
    if (t < 0.5) renderer.rideX = OUT * Math.pow(t / 0.5, 2);              // this stop slides away
    else {
      if (!swapped) { swapped = true; arriveAt(i); }
      const k = (t - 0.5) / 0.5;
      renderer.rideX = -OUT * Math.pow(1 - k, 2);                          // the next stop slides in
    }
    road.place(v * 2300 * dt);
    road.root.setAttribute('opacity', (smooth(0.16, 0.36, t) * (1 - smooth(0.64, 0.86, t))).toFixed(3));
    const bump = reducedMotion() ? 0 : v * (Math.sin(now * 0.031) * 1.6 + Math.sin(now * 0.077) * 0.9);
    street.shake.setAttribute('transform', `translate(0 ${bump.toFixed(2)}) rotate(${(bump * 0.04).toFixed(3)} 800 500)`);
    sound.engine(0.15 + 0.85 * v);
    if (!whistled && t > 0.86) { whistled = true; sound.whistle(); }
  }, (t) => t);
  renderer.rideX = 0;
  road.root.setAttribute('opacity', '0');
  street.shake.removeAttribute('transform');
  sound.engine(0);
  sm.go(wasOpen ? S.EXPLORING : S.CLOSED);
}

function nextWindow() {
  if (isLast()) sm.go(S.FINALE);
  else rideTo(index + 1);
}

async function restart() {
  if (!sm.is(S.FINALE)) return;
  lookAgain.hide();
  texts.hushAll();
  visited.clear();
  tickets.clear();
  opened.clear();
  sm.go(S.RIDING);
  kit.shutters.set(0);
  arriveAt(0);
  street.bus.style.display = '';
  await tween(reducedMotion() ? 10 : 1200, (t) => {
    street.bus.setAttribute('opacity', t.toFixed(3));
    street.exterior.setAttribute('opacity', (1 - t).toFixed(3));
  }, ease.inOutCubic);
  street.exterior.style.display = 'none';
  street.exterior.innerHTML = '';
  sm.go(S.CLOSED);
}

// ── gestures ────────────────────────────────────────────────────────
let lastPalm = 0;
input.on('palm', () => {
  const now = performance.now();
  if (pass.visible) { pass.hide(); return; }          // Space / Enter put the pass away
  if (sm.is(S.FINALE) && sm.elapsed() > 5000) { restart(); return; }
  if (sm.is(S.AWAIT_HAND) && !swinging) { swinging = true; openWindow().then(() => { swinging = false; }); return; }
  if (sm.is(S.CLOSED) && sm.elapsed() > 500) { openWindow(); return; }
  if (!sm.is(S.EXPLORING) || now - lastPalm < 2200) return;
  lastPalm = now;
  renderer.interact();
  sound.palm();
  if (ACTIVE_SCENES[index].interaction === 'thunder') sound.thunder();
  if (!interacted) { interacted = true; interactedAt = now; }
});

// ✌️ the secret insight
input.on('secret', async () => {
  if (pass.visible || !sm.is(S.EXPLORING)) return;
  const shown = await here().chit.show(ACTIVE_SCENES[index], index + 1);
  if (shown) {
    sound.secret();
    secretSeen = true; secretAt = performance.now();
    tickets.add(ACTIVE_SCENES[index].id);
    texts.hush('hint');
  }
});

input.on('tap', () => {
  if (pass.visible) return;
  if (sm.is(S.CLOSED) && sm.elapsed() > 500) openWindow();
});

input.on('close', () => {
  if (pass.visible) return;
  if (sm.is(S.EXPLORING) && sm.elapsed() > 600) closeWindow();
});

// 👍 held (or → / clicking the bell): ding-ding, on to the next stop. ← goes back one.
// Nothing else moves the bus, so you can look around freely.
function go(dir) {
  const move = () => {
    if (dir > 0) nextWindow();
    else if (index > 0) rideTo(index - 1);
    else sound.noiseHit({ freq: 500, q: 4, vel: 0.3, dur: 0.08 });   // this is the first stop
  };
  // the window stays as it is: ride with it open to watch the city go by
  if ((sm.is(S.EXPLORING) && sm.elapsed() > 900) || (sm.is(S.CLOSED) && sm.elapsed() > 450)) move();
}
input.on('go', (source, d) => {
  if (pass.visible) { pass.hide(); return; }          // 👍 boards the bus / puts the pass away
  go(d ? d.dir : 1);
});
const ringBell = (e) => { e.stopPropagation(); go(1); };
street.bell.addEventListener('click', ringBell);
street.bell.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ringBell(e); } });

input.on('camera', () => updateStatus(true));

// ── hints: words change with whoever is driving (hand or mouse) ─────
function hint(now, intent) {
  if (now < nagUntil) return;
  if (pass.visible) { texts.hush('hint'); texts.hush('hintSub'); return; }
  const hand = intent.source === 'hand';
  const t = sm.elapsed();
  if (sm.is(S.AWAIT_HAND)) {
    if (swinging) return;
    const st = input.hand.status;
    if (['denied', 'unavailable', 'error'].includes(st)) texts.say('hintSub', '(or the mouse. the camera is asleep)');
    else if (st === 'ready' && !intent.handVisible && t > 5000) texts.say('hintSub', 'hold it up where the camera can see it');
    else texts.hush('hintSub');
    return;
  }
  if (sm.is(S.CLOSED)) {
    texts.hush('hintSub');
    if (t < 600) return;
    const seen = visited.has(ACTIVE_SCENES[index].id);
    if (!seen) texts.say('hint', hand ? 'Close your hand, then open it to roll up the blind.' : 'Click (or press space) to roll up the blind.');
    else {
      const go = isLast() ? 'get off the bus' : 'ride to the next stop';
      texts.say('hint', hand ? `Hold a 👍 to ${go}.` : `Press → (or click the bell) to ${go}.`);
    }
    return;
  }
  if (!sm.is(S.EXPLORING)) return;
  texts.hush('hintSub');
  if (here().chit.visible) { texts.hush('hint'); return; }
  if (intent.grip > 0.05) { texts.say('hint', 'Keep holding…'); return; }
  if (!discovered) {
    if (zoomedSince && now - zoomedSince > 2600) texts.say('hint', 'Something is written out there. Look around.');
    else if (t > 2200) texts.say('hint', hand ? 'Pinch to look closer.' : 'Hold the click to look closer.');
  } else if (!interacted) {
    if (now - discoveredAt > 2000) texts.say('hint', hand ? 'Make a quick fist, then open your hand.' : 'Press space to stir things up.');
  } else if (!secretSeen) {
    if (now - interactedAt > 2500) texts.say('hint', hand ? 'Show the conductor a ✌️ for a ticket.' : 'Press V for a ticket.');
  } else if (now - secretAt > 1500) {
    const go = isLast() ? 'get off the bus' : 'the next stop';
    texts.say('hint', hand ? `Hold a 👍 for ${go}.` : `Press → (or click the bell) for ${go}.`);
  }
}

let lastStatus = '';
function updateStatus(force) {
  const st = input.hand.status;
  const msg =
    input.intent.handVisible ? '✋ the window can see your hand'
    : st === 'loading' ? 'waking the camera…'
    : st === 'ready' ? 'the camera is watching for a hand'
    : st === 'denied' ? 'camera off · the mouse works too'
    : st === 'unavailable' || st === 'error' ? 'no camera here · the mouse works too'
    : '';
  if (msg !== lastStatus || force) { statusEl.textContent = msg; lastStatus = msg; }
}

// ── main loop ───────────────────────────────────────────────────────
let prev = performance.now();
let lastX = 0, lastY = 0;
let cordPull = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;
  const intent = input.tick(now, zoom);
  const h = here();

  // First window: moving your hand nudges the shutters open — that's the discovery.
  if (sm.is(S.AWAIT_HAND) && !swinging) {
    const progress = Math.min(1, (input.motion - awaitMotion0) / 1.1);
    crack += (0.08 + progress * 0.35 - crack) * Math.min(1, dt * 4);
    h.shutters.set(crack);
    if (progress >= 1) {
      swinging = true;
      texts.hush('hint'); texts.hush('hintSub');
      openWindow().then(() => { swinging = false; });
    }
  }

  // Grip: while you hold a fist the shutters follow your hand; let go early and they swing back.
  if (sm.is(S.EXPLORING) && !h.shutters.busy) {
    const target = 1 - intent.grip * 0.85;
    h.shutters.set(h.shutters.amount + (target - h.shutters.amount) * Math.min(1, dt * 10));
  }

  const target = sm.is(S.EXPLORING) && intent.pinch && intent.grip === 0 ? 1 : 0;
  zoom += (target - zoom) * (1 - Math.exp(-dt * (target > zoom ? 1.7 : 2.6)));
  renderer.update(intent, zoom, dt, now);
  pass.setProgress(intent.goProgress);

  // bell cord: pulls down as you hold a 👍, springs back if you let go
  const pull = sm.is(S.EXPLORING, S.CLOSED) && !pass.visible ? intent.goProgress : 0;
  cordPull += (pull - cordPull) * Math.min(1, dt * (pull > cordPull ? 14 : 6));
  const cy0 = 77 + cordPull * 46;
  street.cord.setAttribute('points', `-400,72 800,${cy0.toFixed(1)} 1460,82`);
  street.cordToggle.setAttribute('transform', `translate(800 ${cy0.toFixed(1)})`);
  street.bellGlow.setAttribute('opacity', (cordPull * 0.5).toFixed(3));
  if (sm.is(S.EXPLORING, S.CLOSED) && cordPull > 0.1 && !here().chit.visible && !pass.visible) texts.say('hint', cordPull > 0.92 ? 'Ding ding!' : 'Keep holding… 👍');

  const cx = GEO.C.x + intent.x * 330;
  const cy = GEO.C.y + intent.y * 230;
  h.glass.update(cx, cy, dt, {
    pinch: intent.pinch,
    visible: intent.source === 'hand' ? intent.handVisible : true,
  });

  if (sm.is(S.EXPLORING)) {
    if (zoom > 0.5 && !zoomedSince) zoomedSince = now;
    if (zoom < 0.3) zoomedSince = 0;
    if (!discovered && zoom > 0.5) {
      const p = renderer.hotspotScreen(intent, zoom);
      if (p.x > GEO.left && p.x < GEO.right && p.y > GEO.apex + 20 && p.y < GEO.bottom - 20) {
        discovered = true;
        discoveredAt = now;
        texts.hush('hint');
        h.writing.write(ACTIVE_SCENES[index]);
        sound.discover();
      }
    }
  }

  audio.update(dt, {
    open: sm.is(S.RIDING) ? 0 : Math.max(0, Math.min(1, h.shutters.amount)),
    finale: sm.is(S.FINALE),
  });
  sound.cueScale = audio.hasMusic ? 0.55 : 1;              // cues sit under a real song

  const speed = Math.hypot(intent.x - lastX, intent.y - lastY) / Math.max(dt, 1e-3);
  lastX = intent.x; lastY = intent.y;
  const playing = sm.is(S.EXPLORING, S.AWAIT_HAND);
  sound.update({
    x: intent.x, y: intent.y, zoom, grip: intent.grip,
    active: playing && !audio.hasMusic && (intent.source === 'mouse' || intent.handVisible),
    moving: speed > 0.12,
    drone: (audio.hasMusic ? 0 : 1) * (sm.is(S.EXPLORING, S.OPENING) ? 0.06 : sm.is(S.AWAIT_HAND, S.CLOSED, S.CLOSING) ? 0.025 : sm.is(S.RIDING) ? 0.012 : 0),
  });

  hint(now, intent);
  updateStatus();
  debug.draw(sm.state, audio.debugLine);
  requestAnimationFrame(frame);
}

// ── boot ────────────────────────────────────────────────────────────
arriveAt(0);
input.preloadHand();
Promise.race([document.fonts?.ready, wait(1500)]).then(() => {
  document.body.classList.add('ready');
  requestAnimationFrame(frame);
  sm.go(S.INTRO);
});

// handy for testing in the console
window.__wob = {
  sm, input, renderer, sound, audio, road, pass, open: openWindow, close: closeWindow, next: nextWindow, restart,
  get index() { return index; }, get zoom() { return zoom; },
  reveal() { discovered = true; discoveredAt = performance.now(); kit.writing.write(ACTIVE_SCENES[index]); },   // testing: as if you found the sign
};
