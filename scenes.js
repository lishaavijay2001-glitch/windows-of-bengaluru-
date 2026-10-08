// Scene configuration — one house-front and one window per eatery, in street order.
// To add a window: write a scene module in /src/scenes, point `illustration` at it,
// design its `window`, and set `enabled: true`.
//
// insight: the secret fact revealed with a ✌️ (or V). Each one comes from the source listed with it;
//   double-check before sharing publicly. The illustrations themselves are imagined, not the real places.
//
// window design keys:
//   shape         'arch' | 'chajja' (rectangle under a tiled sunshade) | 'fanlight' (coloured half-moon above)
//   shutterStyle  'louvre' | 'panel' | 'plank'
//   grille        'bars' | 'ornate' | 'mullions'
//   roof          'tiled' | 'parapet' | 'deco'
//   sill          two props from: 'tumbler' 'plant' 'diya' 'cat' 'jasmine'
//   colours       wall, wallLight, wallDark, frame, frameLight, shutter, shutterTrim, accent, sillColor, roofTile
//
// music: each window plays in its own five-note scale (named after the Carnatic raga it borrows
// its notes from) over a drone on `root` (MIDI note). Only used if a window has no song file.

import { airlinesHotel } from '../scenes/airlinesHotel.js';
import { ctr } from '../scenes/ctr.js';
import { mtr } from '../scenes/mtr.js';
import { vidyarthiBhavan } from '../scenes/vidyarthiBhavan.js';
import { brahminsCoffeeBar } from '../scenes/brahminsCoffeeBar.js';
import { taazaThindi } from '../scenes/taazaThindi.js';

export const SCENES = [
  {
    id: 'ctr',
    name: 'Central Tiffin Room',
    location: 'Malleshwaram',
    mood: 'Neighbourhood morning, filter coffee, tiffin',
    illustration: ctr,
    interaction: 'steam',
    music: { raga: 'mohanam', root: 50 },
    copy: { line: 'Make a ✌️ for a secret' },
    insight: { text: 'CTR goes by two names, Central Tiffin Room and Shri Sagar. Order the benne masala dosa: “benne” is Kannada for butter.', source: 'en.wikipedia.org/wiki/Central_Tiffin_Room' },
    window: {
      shape: 'chajja', shutterStyle: 'panel', grille: 'ornate', roof: 'tiled', sill: ['jasmine', 'tumbler'],
      wall: '#d9a441', wallLight: '#f0c870', wallDark: '#9c6a1e',
      frame: '#2f5f86', frameLight: '#5f8fb6', shutter: '#2f5f86', shutterTrim: '#3f74a0', accent: '#e9d3a2',
      sillColor: '#9c3b2a', roofTile: '#a8492f', iron: '#1d2430',
    },
    enabled: true,
  },
  {
    id: 'airlines-hotel',
    name: 'Airlines Hotel',
    location: 'Central Bengaluru',
    mood: 'Open-air, leafy, old Bengaluru',
    illustration: airlinesHotel,
    interaction: 'gust',
    music: { raga: 'hamsadhwani', root: 53 },
    copy: { line: 'Make a ✌️ for a secret' },
    insight: { text: 'Around since about 1968, it was one of Bengaluru’s early drive-ins. People ate masala dosa without leaving their car seats.', source: 'charukesi.com · thetastytales.com' },
    window: {
      shape: 'arch', shutterStyle: 'louvre', grille: 'bars', roof: 'parapet', sill: ['plant', 'cat'],
      wall: '#2f5552', wallLight: '#4f7a74', wallDark: '#1b3433',
      frame: '#6b3d1f', frameLight: '#8a5530', shutter: '#4c7a52', shutterLine: '#2e5134', shutterTrim: '#5e8c62',
      sillColor: '#9c3b2a',
    },
    enabled: true,
  },
  {
    id: 'mtr', name: 'MTR', location: 'Lalbagh Road', mood: 'Warm, nostalgic tiffin house (seen from inside)',
    illustration: mtr, interaction: 'fans', music: { raga: 'abhogi', root: 48 },
    copy: { line: 'Make a ✌️ for a secret' },
    insight: { text: 'When rice ran short in World War II, MTR says it steamed idlis from semolina instead. That’s how rava idli was born.', source: 'en.wikipedia.org/wiki/Mavalli_Tiffin_Rooms' }, enabled: true,
    window: {
      shape: 'fanlight', shutterStyle: 'plank', grille: 'mullions', roof: 'deco', sill: ['diya', 'tumbler'],
      wall: '#b5523e', wallLight: '#d0735c', wallDark: '#7a2f22',
      frame: '#3a2a20', shutter: '#c98b2f', shutterLine: '#8a5a1a', accent: '#f0c53a', sillColor: '#5a3a2a',
    },
  },
  {
    id: 'vidyarthi-bhavan', name: 'Vidyarthi Bhavan', location: 'Basavanagudi', mood: 'Bustling, crowded dosa rush',
    illustration: vidyarthiBhavan, interaction: 'flying-dosas', music: { raga: 'mohanam', root: 55 },
    copy: { line: 'Make a ✌️ for a secret' },
    insight: { text: 'It opened in 1943 to feed students from nearby schools; “Vidyarthi” means student. At 75, India Post gave it a special postal cover.', source: 'en.wikipedia.org/wiki/Vidyarthi_Bhavan' }, enabled: true,
    window: {
      shape: 'arch', shutterStyle: 'panel', grille: 'ornate', roof: 'tiled', sill: ['plant', 'jasmine'],
      wall: '#e6d3ac', wallLight: '#f6e8c8', wallDark: '#b89b6e',
      frame: '#7a2318', frameLight: '#a33b2c', shutter: '#2f6b6b', shutterTrim: '#3f8080', accent: '#e0a33b', sillColor: '#6e2c1c',
    },
  },
  {
    id: 'brahmins-coffee-bar', name: "Brahmin's Coffee Bar", location: 'Shankarapuram', mood: 'Small, intimate, quick coffee, in the rain',
    illustration: brahminsCoffeeBar, interaction: 'thunder', music: { raga: 'hindolam', root: 46 },
    copy: { line: 'Make a ✌️ for a secret' },
    insight: { text: 'It opened in 1965 selling only tea, coffee and bakery snacks. Idli and vada didn’t join the menu until 1971.', source: 'yourstory.com/2017/05/bengalurus-brahmin-coffee-bar' }, enabled: true,
    window: {
      shape: 'chajja', shutterStyle: 'louvre', grille: 'bars', roof: 'parapet', sill: ['tumbler', 'diya'],
      wall: '#8fb8b0', wallLight: '#b4d4cc', wallDark: '#5f8a82',
      frame: '#5a3a2a', frameLight: '#7a5240', shutter: '#c2452f', shutterLine: '#7d2a1c', sillColor: '#9c3b2a', roofTile: '#b4553a',
    },
  },
  {
    id: 'taaza-thindi', name: 'Taaza Thindi', location: 'Jayanagar', mood: 'Stand-up darshini at night, tubelights',
    illustration: taazaThindi, interaction: 'tubelights', music: { raga: 'shivaranjani', root: 51 },
    copy: { line: 'Make a ✌️ for a secret' },
    insight: { text: '“Taaza Thindi” just means “fresh snacks” in Kannada. There are no chairs: you grab a plate and eat standing up, darshini-style.', source: 'bengaluruprayana.com/taaza-thindi-bengaluru' }, enabled: true,
    window: {
      shape: 'fanlight', shutterStyle: 'louvre', grille: 'bars', roof: 'deco', sill: ['cat', 'tumbler'],
      wall: '#6b5a8e', wallLight: '#8a78ab', wallDark: '#463a60',
      frame: '#ece4d0', frameLight: '#fffaf0', shutter: '#e0a33b', shutterLine: '#9a6a1a', accent: '#e8578f', sillColor: '#ece4d0',
      stained: ['#e8578f', '#3f8fd8', '#f2c230', '#9cc94a', '#3f8fd8', '#e8578f'],
    },
  },
];

// ── Audio: one song per window (see src/audio/AudioManager.js) ─────────────────
// Plays plainly when the window opens, fades out when it closes.
// musicFile   the window's song, a local file (missing files are skipped quietly)
// musicStart  seconds into the track to begin
// musicVolume 0..1 · fadeInDuration / fadeOutDuration in seconds
// LOCAL_SONGS: true = play MP3s from assets/audio (your own copy). false = the public version:
// no song files, every stop plays its built-in melody (synthesised in the browser).
export const LOCAL_SONGS = false;
const A = (id, o = {}) => ({
  musicFile: LOCAL_SONGS ? `assets/audio/${id}.mp3` : null, musicStart: 0,
  musicVolume: 0.85, fadeInDuration: 1, fadeOutDuration: 0.8,
  ...o,
});
export const AUDIO = {
  'taaza-thindi': A('taaza-thindi'),
  'ctr': A('ctr'),
  'vidyarthi-bhavan': A('vidyarthi-bhavan'),   // local file trimmed: 4 s of silence removed from the top
  'airlines-hotel': A('airlines-hotel'),
  'brahmins-coffee-bar': A('brahmins-coffee-bar'),
  'mtr': A('mtr'),
};
SCENES.forEach((s) => { s.audio = { ...AUDIO[s.id], ...(s.audio || {}) }; });

// Street order — the order you walk past the windows. Any enabled scene not listed joins at the end.
// The bus route, north to south: Malleshwaram → city centre → Lalbagh → Shankarapura → Basavanagudi → Jayanagar
export const ORDER = ['ctr', 'airlines-hotel', 'mtr', 'brahmins-coffee-bar', 'vidyarthi-bhavan', 'taaza-thindi'];

// Bus-stop boards (Kannada + English). Airlines Hotel's stop is named after the landmark itself.
export const STOPS = {
  'ctr': { kn: 'ಮಲ್ಲೇಶ್ವರಂ', en: 'MALLESHWARAM' },
  'airlines-hotel': { kn: 'ಏರ್‌ಲೈನ್ಸ್ ಹೋಟೆಲ್', en: 'AIRLINES HOTEL' },
  'mtr': { kn: 'ಲಾಲ್‌ಬಾಗ್', en: 'LALBAGH' },
  'brahmins-coffee-bar': { kn: 'ಶಂಕರಪುರ', en: 'SHANKARAPURA' },
  'vidyarthi-bhavan': { kn: 'ಬಸವನಗುಡಿ', en: 'BASAVANAGUDI' },
  'taaza-thindi': { kn: 'ಜಯನಗರ', en: 'JAYANAGAR' },
};
SCENES.forEach((s) => { s.stop = s.stop || STOPS[s.id] || { kn: s.name, en: s.name.toUpperCase() }; });
const live = (s) => s.enabled && s.illustration;
export const STREET = [
  ...ORDER.map((id) => SCENES.find((s) => s.id === id)).filter((s) => s && live(s)),
  ...SCENES.filter((s) => live(s) && !ORDER.includes(s.id)),
  ...SCENES.filter((s) => !live(s)),
];
export const ACTIVE_SCENES = STREET.filter(live);
