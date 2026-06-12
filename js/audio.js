// ============================================================
// Tiny WebAudio sound engine — no audio files needed.
// ============================================================
let ctx = null;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type = 'sine', vol = 0.18, when = 0, slideTo = null) {
  const a = ac();
  const t0 = a.currentTime + when;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  unlock() { ac(); },  // call on first user gesture

  coin() {
    tone(988, 0.09, 'square', 0.1);
    tone(1319, 0.18, 'square', 0.1, 0.08);
  },
  chestFound() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.16, i * 0.09));
  },
  correct() {
    tone(660, 0.1, 'triangle', 0.18);
    tone(880, 0.22, 'triangle', 0.18, 0.1);
  },
  wrong() {
    tone(220, 0.25, 'sawtooth', 0.12, 0, 140);
  },
  timeout() {
    tone(330, 0.15, 'square', 0.1);
    tone(247, 0.3, 'square', 0.1, 0.15);
  },
  tick() {
    tone(1200, 0.04, 'square', 0.05);
  },
  victory() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.16, i * 0.14));
  },
  click() {
    tone(700, 0.06, 'sine', 0.1);
  },
  horn() {
    tone(440, 0.18, 'square', 0.14);
    tone(349, 0.28, 'square', 0.14, 0.14);
  },
  bark() {
    tone(520, 0.07, 'square', 0.12, 0, 320);
    tone(560, 0.08, 'square', 0.12, 0.12, 340);
  },
  whoosh() {
    tone(160, 0.5, 'sawtooth', 0.07, 0, 950);
    tone(880, 0.45, 'sine', 0.06, 0.25, 180);
  },
  firework() {
    tone(300, 0.5, 'sine', 0.1, 0, 1200);                       // whistle up
    [880, 1175, 988, 1319].forEach((f, i) => tone(f, 0.3, 'triangle', 0.12, 0.5 + i * 0.06));
  },
};

// ------------------------------------------------------------
// Gentle background music — a soft pentatonic loop, no files.
// ------------------------------------------------------------
let bgmTimer = null;
let bgmMuted = false;
let bgmStep = 0;

// 32-step melody (0 = rest) and a slow bass line
const MELODY = [
  659, 0, 784, 0, 880, 0, 784, 659,
  587, 0, 659, 0, 523, 0, 0, 0,
  659, 0, 784, 0, 880, 0, 1047, 880,
  784, 0, 659, 587, 523, 0, 0, 0,
];
const BASS = [262, 220, 196, 247];

export function startBgm() {
  if (bgmTimer) return;
  ac();
  bgmTimer = setInterval(() => {
    if (bgmMuted) return;
    const note = MELODY[bgmStep % MELODY.length];
    if (note) tone(note, 0.32, 'triangle', 0.045);
    if (bgmStep % 8 === 0) tone(BASS[(bgmStep / 8 | 0) % BASS.length], 1.6, 'sine', 0.05);
    bgmStep++;
  }, 270);
}

export function toggleBgm() {
  bgmMuted = !bgmMuted;
  return bgmMuted;
}
