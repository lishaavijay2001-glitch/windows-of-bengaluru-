# The Windows of Bengaluru

**A tiny interactive ride through old Bengaluru, steered by your hand.**

You're sitting at the window of an old city bus. Hold your hand up to the webcam: move it to look around, pinch to lean in, and hold a 👍 to ring the bell and ride to the next stop. Each stop is one of the city's old eateries, from Malleshwaram down to Jayanagar.

**▶ Live:** https://lishaavijay2001-glitch.github.io/windows-of-bengaluru-/

No webcam? The mouse and keyboard work too.

---

## The route

Malleshwaram **CTR** → **Airlines Hotel** → Lalbagh **MTR** → Shankarapura **Brahmin's Coffee Bar** → Basavanagudi **Vidyarthi Bhavan** → Jayanagar **Taaza Thindi**

At every stop: roll up the canvas blind, find the eatery's signboard, and show a ✌️ for a punched bus ticket with a true, fun fact about the place. At the end of the line the bus parks on a busy street of all six shopfronts: the ones you looked at are lit, the ones you skipped are closed, and the ones where you got a ticket have a gold star.

## How to ride

| | Hand (webcam) | Mouse / keyboard |
|---|---|---|
| Look around | move your hand | move the mouse |
| Lean in closer | pinch and hold | hold the click |
| Roll up the blind · stir the scene | quick fist, then open | Space |
| Pull the blind down | hold a fist | C |
| Bus ticket with a secret | ✌️ peace sign | V |
| **Next stop** | **hold a 👍 thumbs up** | **→**, or click the bell |
| Previous stop | | ← |

A bus pass with all of this appears before you board. Press **H** (or the ✋ button) to see it again. **M** mutes. **D** opens a tuning panel for the hand tracking.

## Run it yourself

It's plain HTML, CSS and JavaScript, with no install needed.

- **Online:** GitHub Pages (below) serves it over HTTPS, so the webcam works in every browser, including Safari.
- **On your computer:** double-click `Start in Safari.command` / `Start (Mac).command` / `Start (Windows).bat`. They run a tiny local server at `http://localhost:5173`, which browsers need for webcam access.
- Hand tracking uses [MediaPipe Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker), loaded from a CDN, so it needs an internet connection.

### Publish with GitHub Pages
Repository **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)` → Save.** After a minute the site is live at `https://lishaavijay2001-glitch.github.io/windows-of-bengaluru-/`.

### Music
Each stop plays its own little melody, synthesised live in the browser (no audio files), along with small sounds for each gesture: a chime, the conductor's bell, the engine, a whistle. **M** mutes.

Want real songs on your own copy? Put audio files in `assets/audio/` (names in `assets/audio/README.txt`) and set `LOCAL_SONGS = true` in `src/data/scenes.js`. Only publish music you have the rights to share.

### Editing
- `index.html` loads the source in `src/` directly.
- `windows-of-bengaluru.html` is a single-file build of the same thing: `npm install && npm run build`.
- Stops, insights, route order and audio settings live in `src/data/scenes.js`. Each eatery's illustration is one file in `src/scenes/`, drawn in code as layered SVG for parallax.
- Gesture thresholds live in `src/handTracking/gestures.js` → `TUNING`.

```
src/
  main.js               flow + main loop          stateMachine.js   states
  handTracking/         webcam + mouse input, gesture detection, smoothing
  scenes/               one illustrated scene per eatery + the drawing kit
  components/           bus interior, blind, ride, bus pass, ticket, final street
  audio/                melodies + gesture sounds (synthesised), optional song player
  data/scenes.js        everything about each stop
assets/fonts            Baloo Tamma 2 + Rozha One (SIL Open Font License)
```

## Notes & credits

- **The fun facts** on the bus tickets each come from the source printed on the ticket (Wikipedia, YourStory, Bengaluru Prayana, and others; see `src/data/scenes.js`). Corrections are welcome.
- **The illustrations are imagined.** Facades, interiors and signboards are not drawings of the real places. The bus is an original drawing in the spirit of old Bangalore city buses.
- **Fonts:** [Baloo Tamma 2](https://fonts.google.com/specimen/Baloo+Tamma+2) and [Rozha One](https://fonts.google.com/specimen/Rozha+One), both under the SIL Open Font License (licences in `assets/fonts`).
- Not affiliated with any of the eateries, or with Bengaluru's bus services.
