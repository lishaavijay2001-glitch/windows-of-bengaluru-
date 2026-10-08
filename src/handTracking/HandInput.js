// Webcam hand tracking with MediaPipe Hand Landmarker.
// Emits the same shape as MouseInput, so the scenes never know which one is driving.

import {
  palmCentre, pinchRatio, openness, isFist, isPeace, isThumbsUp, PinchDetector, GripTracker, PeaceDetector, ThumbsHold, TUNING,
} from './gestures.js';
import { clamp } from './smoothing.js';

const MP_VERSION = '0.10.21';
const MP_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}`;
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export class HandInput {
  constructor(emit) {
    this.emit = emit;           // (eventName, data) => void   for 'palm' | 'go' | 'close' | 'secret'
    this.status = 'idle';       // idle | loading | ready | denied | unavailable | error
    this.state = { present: false, x: 0, y: 0, pinch: false, open: 0, gripMs: 0, lastSeen: 0 };
    this.debug = { ratio: 0, fps: 0, landmarks: null };
    this.pinch = new PinchDetector();
    this.grip = new GripTracker();
    this.thumbs = new ThumbsHold();
    this.peace = new PeaceDetector();
    this._pendingSwipe = null;
    this._closeFired = false;
    this.video = document.createElement('video');
    this.video.playsInline = true;
    this.video.muted = true;
    this.video.autoplay = true;
    this.video.setAttribute('playsinline', '');      // Safari / iOS need the attribute, not just the property
    this.video.setAttribute('muted', '');
    // Safari can freeze frames from a <video> that isn't in the page, so keep it attached but invisible.
    Object.assign(this.video.style, { position: 'fixed', width: '2px', height: '2px', opacity: '0', pointerEvents: 'none', left: '0', top: '0' });
    document.body.appendChild(this.video);
    this._lastVideoTime = -1;
    this._frames = 0;
    this._fpsT = performance.now();
  }

  // Load the model early (no permission needed), so it's warm when the camera opens.
  async preload() {
    if (this._modelPromise) return this._modelPromise;
    this._modelPromise = (async () => {
      const mod = await import(/* @vite-ignore */ `${MP_BASE}/vision_bundle.mjs`);
      const fileset = await mod.FilesetResolver.forVisionTasks(`${MP_BASE}/wasm`);
      const make = (delegate) => mod.HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      try { return await make('GPU'); } catch { return await make('CPU'); }
    })();
    return this._modelPromise;
  }

  async start() {
    if (!navigator.mediaDevices?.getUserMedia) { this.status = 'unavailable'; return false; }
    this.status = 'loading';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      this.video.srcObject = stream;
      await this.video.play();
    } catch (err) {
      this.status = err && err.name === 'NotAllowedError' ? 'denied' : 'unavailable';
      return false;
    }
    try {
      this.landmarker = await this.preload();
    } catch (err) {
      console.warn('[hand] model failed to load, staying on mouse', err);
      this.status = 'error';
      this.stop();
      return false;
    }
    this.status = 'ready';
    return true;
  }

  stop() {
    const s = this.video.srcObject;
    if (s) s.getTracks().forEach((t) => t.stop());
    this.video.srcObject = null;
  }

  // Called every animation frame by InputManager.
  tick(now) {
    if (this.status !== 'ready' || this.video.readyState < 2) return;
    if (this.video.currentTime === this._lastVideoTime) return;
    this._lastVideoTime = this.video.currentTime;

    let res;
    try { res = this.landmarker.detectForVideo(this.video, now); } catch { return; }

    this._frames++;
    if (now - this._fpsT > 1000) {
      this.debug.fps = Math.round((this._frames * 1000) / (now - this._fpsT));
      this._frames = 0; this._fpsT = now;
    }

    const l = res.landmarks && res.landmarks[0];
    this.debug.landmarks = l || null;
    if (!l) {
      this.state.present = false;
      this.state.gripMs = 0;
      this.state.goProgress = 0;
      this.thumbs.update(false, now);
      this.pinch.reset();
      this.grip.reset();
      return;
    }

    const aspect = this.video.videoWidth / this.video.videoHeight || 4 / 3;
    const c = palmCentre(l);
    const ratio = pinchRatio(l, aspect);
    const open = openness(l, aspect);
    const thumbsUp = isThumbsUp(l, aspect);
    const fist = isFist(l, aspect) && !thumbsUp;      // a 👍 is not a grip

    this.state.present = true;
    this.state.lastSeen = now;
    this.state.x = clamp((c.x - 0.5) / TUNING.rangeX);
    this.state.y = clamp((c.y - 0.5) / TUNING.rangeY);
    if (fist) this.pinch.reset();
    const wasPinch = this.state.pinch, wasFist = this.state.fist, wasOpen = this.state.open;
    this.state.pinch = fist ? false : this.pinch.update(ratio);
    // note when the hand changes shape, so InputManager can hold the view steady through it
    if (this.state.pinch !== wasPinch || fist !== !!wasFist || Math.abs(open - (wasOpen ?? open)) >= 2 ||
        (ratio < TUNING.pinchOff && !this.state.pinch)) this.state.shapeChangedAt = now;
    this.state.open = open;
    this.state.fist = fist;
    this.debug.ratio = ratio;

    const peace = !fist && isPeace(l, aspect);
    this.state.peace = peace;
    if (this.peace.update(peace, now)) this.emit('secret');

    const g = this.grip.update(fist, open, now);
    this.state.gripMs = g.heldMs;
    if (g.heldMs === 0) this._closeFired = false;
    if (!this._closeFired && g.heldMs >= TUNING.gripFullMs) { this._closeFired = true; this.emit('close'); }
    if (g.bloom && !this.state.pinch) this.emit('palm');
    // 👍 held → ring the bell and go to the next stop. Nothing else moves the bus.
    this.state.thumbs = thumbsUp;
    if (this.thumbs.update(thumbsUp && !this.state.pinch, now)) this.emit('go', { dir: 1 });
    this.state.goProgress = this.thumbs.progress;
  }
}
