// ============================================================
// DG Treasure Hunt — main game engine
// ============================================================
import * as THREE from 'three';
import { createGirl, animateGirl } from './character.js';
import {
  createWorld, CHEST_SPOTS, STAR_SPOTS, GIFT_SPOTS, FOOD_STALLS, NPC_SPOTS, ROADS, MAP,
} from './world.js';
import { resetQuestionPool, recordQuestionResult, loadTopicMastery, CATEGORIES, DIFFICULTIES } from './questions.js';
import { sfx, startBgm, toggleBgm, setMusicVolume, setEffectsVolume, stopAudio } from './audio.js';
import { IS_TOUCH, LOW_FX, INITIAL_PRESET, QUALITY_PREFERENCE, chooseQualityPreset, rendererCapabilities, pointLight } from './quality.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {
  saveScore, loadBoard, renderBoard, fetchRemoteBoard, submitScore,
} from './leaderboard.js';
import { InputController, INPUT_ACTIONS } from './systems/input-controller.js';
import { InteractionSystem } from './systems/interaction-system.js';
import { GAME_CONFIG, STORAGE_KEYS } from './app/config.js';
import { createGameState } from './app/game-state.js';
import {
  configureSession, pauseSessionClock, resumeSessionClock, SESSION_MODES,
  sessionHasExpired, sessionSecondsRemaining, startSessionClock,
} from './app/session-modes.js';
import { scoreCorrectAnswer, scoreMissedAnswer, perfectChestBonus } from './systems/scoring.js';
import { completeChest, missionStatus } from './systems/mission-system.js';
import { QuizSystem } from './systems/quiz-system.js';
import { QuizView } from './ui/quiz-view.js';
import { GameHud } from './ui/hud.js';
import { DialogAccessibility } from './ui/dialog-accessibility.js';
import { SpatialHash } from './systems/spatial-hash.js';
import { normalizePlayerName } from './app/leaderboard-validation.js';
import { disposeObject3D } from './systems/three-dispose.js';

// ---------------- DOM ----------------
const $ = id => document.getElementById(id);
const canvas = $('game-canvas');
const startScreen = $('start-screen'), hud = $('hud');
const quizScreen = $('quiz-screen'), chestResult = $('chest-result');
const victoryScreen = $('victory-screen');
const nameInput = $('player-name'), startBtn = $('start-btn');
const isTouch = IS_TOUCH;
const tutorialCard = $('tutorial-card');
const dialogAccessibility = new DialogAccessibility(document);
const hudView = new GameHud({ document, isTouch, map: MAP, roads: ROADS });
const interactPrompt = hudView.interactPrompt, actionBtn = hudView.actionButton;
const quizView = new QuizView({
  screen: quizScreen, result: chestResult, category: $('quiz-category'), progress: $('quiz-progress'),
  question: $('quiz-question'), answers: $('quiz-answers'), feedback: $('quiz-feedback'), timerBar: $('timer-bar'),
  resultEmoji: $('chest-result-emoji'), resultTitle: $('chest-result-title'), resultText: $('chest-result-text'),
});

if (isTouch) document.body.classList.add('touch-device');

// ---------------- renderer / scene / camera ----------------
// Mobile: no AA, lower resolution, no shadows — big speed boost
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: !LOW_FX, powerPreference: 'high-performance',
  preserveDrawingBuffer: true,
});
const rendererPreset = chooseQualityPreset(renderer, QUALITY_PREFERENCE);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, rendererPreset.pixelRatio));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = rendererPreset.shadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = LOW_FX ? 1.05 : 0.92;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 600);

// desktop only: bloom post-processing for that neon HK glow
const glRendererInfo = (() => {
  try {
    const gl = renderer.getContext();
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || '') : '';
  } catch { return ''; }
})();
const softwareGL = /swiftshader|llvmpipe|softpipe|microsoft basic render/i.test(glRendererInfo);

let composer = null;
if (rendererPreset.bloom && !softwareGL) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 0.42, 0.55, 0.85));
  composer.addPass(new OutputPass());
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer?.setSize(window.innerWidth, window.innerHeight);
});
const gpuCapabilities = rendererCapabilities(renderer);
document.documentElement.dataset.qualityRuntime = rendererPreset.name;
let pageHidden = document.hidden;
document.addEventListener('visibilitychange', () => { pageHidden = document.hidden; });

// ---------------- world & player ----------------
const world = createWorld(scene);
world.systems.start();
const girl = createGirl();
girl.scale.setScalar(1.45);
girl.position.set(0, 0, -15);   // start on Nathan Road near Kowloon Park
scene.add(girl);

// boost glow ring under the girl (visible while speed-boosted)
const boostRing = new THREE.Mesh(
  new THREE.RingGeometry(0.5, 0.85, 20),
  new THREE.MeshBasicMaterial({ color: 0xff8fb6, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
boostRing.rotation.x = -Math.PI / 2;
boostRing.position.y = 0.06;
boostRing.visible = false;
girl.add(boostRing);

const CAM_OFFSET = new THREE.Vector3(
  GAME_CONFIG.cameraOffset.x, GAME_CONFIG.cameraOffset.y, GAME_CONFIG.cameraOffset.z);
const cameraOrbit = { yaw: 0, pitch: 0, dragging: false, x: 0, y: 0 };
camera.position.copy(girl.position).add(CAM_OFFSET);
camera.lookAt(girl.position);

// ---------------- treasure chests ----------------
function makeChest() {
  const g = new THREE.Group();
  const woodM = new THREE.MeshToonMaterial({ color: 0x9c5a24 });
  const goldM = new THREE.MeshStandardMaterial({ color: 0xffc83c, metalness: 0.7, roughness: 0.3 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.65, 0.75), woodM);
  base.position.y = 0.33;
  base.castShadow = true;
  g.add(base);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.1, 10, 1, false, 0, Math.PI), woodM);
  lid.rotation.z = Math.PI / 2;
  lid.position.y = 0.66;
  lid.castShadow = true;
  g.add(lid);
  for (const y of [0.2, 0.5]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.09, 0.79), goldM);
    band.position.y = y;
    g.add(band);
  }
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.1), goldM);
  lock.position.set(0, 0.55, 0.4);
  g.add(lock);

  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.9, 14, 12, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffd35c, transparent: true, opacity: 0.16,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
  beacon.position.y = 7;
  g.add(beacon);

  const glow = pointLight(0xffc83c, 8, 12, 1.8);
  glow.position.y = 1.5;
  g.add(glow);

  g.userData = { lid, beacon, glow, opened: false };
  return g;
}

const chests = CHEST_SPOTS.map((spot, i) => {
  const chest = makeChest();
  chest.position.set(spot.x, 0, spot.z);
  chest.rotation.y = Math.random() * Math.PI * 2;
  chest.userData.hint = spot.hint;
  chest.userData.index = i;
  scene.add(chest);
  return chest;
});
const TOTAL_CHESTS = chests.length;

const trailCrumbs = [];
{
  const crumbM = new THREE.MeshBasicMaterial({ color: 0xffd35c, transparent: true, opacity: .8 });
  const crumbG = new THREE.SphereGeometry(0.16, 8, 6);
  for (let i = 0; i < 8; i++) {
    const crumb = new THREE.Mesh(crumbG, crumbM.clone());
    crumb.visible = false;
    scene.add(crumb);
    trailCrumbs.push(crumb);
  }
}
const landmarkSeen = CHEST_SPOTS.map(spot => ({ x: spot.x, z: spot.z, hint: spot.hint, seen: false }));
function checkLandmarkVisits() {
  for (const spot of landmarkSeen) {
    if (spot.seen) continue;
    if (Math.hypot(spot.x - girl.position.x, spot.z - girl.position.z) < 12) {
      spot.seen = true;
      toast(`📍 ${spot.hint}`, 2800);
    }
  }
}

// ---------------- coins (auto-placed along the streets) ----------------
const coinM = new THREE.MeshStandardMaterial({ color: 0xffd35c, metalness: 0.8, roughness: 0.25 });
const coinGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 14);
const coins = [];
{
  const spots = [];
  for (const r of ROADS) {
    const len = r.vertical ? r.d : r.w;
    const count = Math.floor(len / 14);
    for (let i = 1; i < count; i++) {
      const along = (r.vertical ? r.z - r.d / 2 : r.x - r.w / 2) + (i / count) * len;
      const offset = (i % 3 - 1) * 2.5;
      spots.push(r.vertical ? [r.x + offset, along] : [along, r.z + offset]);
    }
  }
  for (const [x, z] of spots) {
    if (x < MAP.minX || x > MAP.maxX || z < MAP.minZ || z > MAP.maxZ) continue;
    const coin = new THREE.Mesh(coinGeo, coinM);
    coin.rotation.x = Math.PI / 2;
    coin.position.set(x, 1, z);
    coin.userData.taken = false;
    scene.add(coin);
    coins.push(coin);
  }
}

// ---------------- golden stars (+25) ----------------
function starGeometry() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? 0.55 : 0.24;
    const px = Math.cos(a) * r, py = -Math.sin(a) * r;
    i === 0 ? shape.moveTo(px, py) : shape.lineTo(px, py);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false });
}
const starGeo = starGeometry();
const starM = new THREE.MeshStandardMaterial({
  color: 0xffe066, metalness: 0.6, roughness: 0.25,
  emissive: 0x8a6a00, emissiveIntensity: 0.6,
});
const stars = STAR_SPOTS.map(([x, z]) => {
  const star = new THREE.Mesh(starGeo, starM);
  star.position.set(x, 1.4, z);
  star.userData.taken = false;
  scene.add(star);
  return star;
});

// ---------------- mystery gifts ----------------
function makeGift(i) {
  const g = new THREE.Group();
  const cols = [[0xff8fb6, 0xffffff], [0x7db8ff, 0xffd35c], [0x9be89b, 0xff8fb6]];
  const [boxC, ribC] = cols[i % 3];
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshToonMaterial({ color: boxC }));
  g.add(box);
  const rib1 = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.86, 0.16), new THREE.MeshToonMaterial({ color: ribC }));
  const rib2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.86, 0.86), new THREE.MeshToonMaterial({ color: ribC }));
  g.add(rib1, rib2);
  const bow = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshToonMaterial({ color: ribC }));
  bow.scale.set(1.4, 0.7, 1);
  bow.position.y = 0.5;
  g.add(bow);
  return g;
}
const gifts = GIFT_SPOTS.map(([x, z], i) => {
  const gift = makeGift(i);
  gift.position.set(x, 1.3, z);
  gift.userData.taken = false;
  scene.add(gift);
  return gift;
});

// ---------------- street food stalls (speed boost) ----------------
const foodStalls = FOOD_STALLS.map((f, i) => {
  const g = new THREE.Group();
  const cart = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 1.4),
    new THREE.MeshToonMaterial({ color: 0xb9744a }));
  cart.position.y = 0.9;
  cart.castShadow = true;
  g.add(cart);
  for (const wx of [-0.8, 0.8]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.15, 10),
      new THREE.MeshStandardMaterial({ color: 0x14141a }));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, 0.3, 0.6);
    g.add(wheel);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6),
    new THREE.MeshToonMaterial({ color: 0x6e4a2e }));
  pole.position.set(0, 2.4, 0);
  g.add(pole);
  const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.7, 8),
    new THREE.MeshToonMaterial({ color: [0xff5c5c, 0xffd35c, 0x7db8ff, 0x9be89b, 0xff8fb6][i % 5] }));
  umbrella.position.y = 3.6;
  g.add(umbrella);
  const food = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe9a8 }));
  food.position.set(0, 1.7, 0);
  g.add(food);
  const lite = pointLight(0xffd9a0, 3, 7, 2);
  lite.position.y = 2;
  g.add(lite);
  g.position.set(f.x, 0, f.z);
  scene.add(g);
  world.colliders.push({ minX: f.x - 1.2, maxX: f.x + 1.2, minZ: f.z - 0.8, maxZ: f.z + 0.8 });
  return { group: g, ...f, eaten: false, foodMesh: food };
});
const colliderIndex = new SpatialHash(12).rebuild(world.colliders);

// ---------------- puppy companion ----------------
function makeDog() {
  const dog = new THREE.Group();
  const furM = new THREE.MeshToonMaterial({ color: 0xc89058 });
  const darkM = new THREE.MeshToonMaterial({ color: 0x8a5c30 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.78), furM);
  body.position.y = 0.42;
  body.castShadow = true;
  dog.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), furM);
  head.position.set(0, 0.62, 0.42);
  dog.add(head);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), darkM);
  snout.position.set(0, 0.56, 0.6);
  dog.add(snout);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 6), darkM);
    ear.position.set(side * 0.13, 0.8, 0.38);
    dog.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x241a12 }));
    eye.position.set(side * 0.08, 0.66, 0.6);
    dog.add(eye);
  }
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.3), darkM);
  tail.position.set(0, 0.55, -0.45);
  tail.rotation.x = -0.7;
  dog.add(tail);
  for (const [lx, lz] of [[-0.16, 0.26], [0.16, 0.26], [-0.16, -0.26], [0.16, -0.26]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 6), furM);
    leg.position.set(lx, 0.14, lz);
    dog.add(leg);
  }
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 12),
    new THREE.MeshToonMaterial({ color: 0xd23a3a }));
  collar.position.set(0, 0.52, 0.34);
  collar.rotation.x = Math.PI / 2.4;
  dog.add(collar);
  dog.userData.tail = tail;
  return dog;
}
const dog = makeDog();
dog.position.set(-11, 0, -20);   // waiting near the Kowloon Park gate
dog.rotation.y = 0.8;
scene.add(dog);
let dogFollowing = false;

// ---------------- lucky cat 招財貓 ----------------
function makeLuckyCat() {
  const cat = new THREE.Group();
  const white = new THREE.MeshToonMaterial({ color: 0xfdf6ec });
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.5, 12),
    new THREE.MeshToonMaterial({ color: 0xb03030 }));
  stand.position.y = 0.25; cat.add(stand);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), white);
  body.scale.set(1, 1.15, 0.9);
  body.position.y = 1.0; cat.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), white);
  head.position.y = 1.85; cat.add(head);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.22, 4), white);
    ear.position.set(s * 0.26, 2.22, 0);
    cat.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x222222 }));
    eye.position.set(s * 0.15, 1.92, 0.38);
    cat.add(eye);
  }
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 6, 14),
    new THREE.MeshToonMaterial({ color: 0xcc2222 }));
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.5; cat.add(collar);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8),
    new THREE.MeshToonMaterial({ color: 0xffd24a }));
  bell.position.set(0, 1.42, 0.3); cat.add(bell);
  // gold koban coin held against the belly
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.07, 12),
    new THREE.MeshToonMaterial({ color: 0xf3c14b }));
  coin.rotation.x = Math.PI / 2;
  coin.position.set(0, 1.0, 0.48); cat.add(coin);
  // waving left arm — pivot at the shoulder
  const armPivot = new THREE.Group();
  armPivot.position.set(0.5, 1.35, 0.1);
  const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.4, 4, 8), white);
  arm.position.y = 0.25;
  armPivot.add(arm);
  cat.add(armPivot);
  cat.userData.arm = armPivot;
  return cat;
}
const luckyCat = makeLuckyCat();
luckyCat.position.set(11.5, 0, 30);     // on the Nathan Rd east pavement
luckyCat.rotation.y = -Math.PI / 2.3;
scene.add(luckyCat);
let catRubbed = false;

// ---------------- MTR fast-travel ----------------
const MTR_STATIONS = [
  { x: 12, z: -68, name: '佐敦 Jordan' },
  { x: 12, z: 42, name: '尖沙咀 TST' },
];
const fadeEl = document.createElement('div');
fadeEl.style.cssText =
  'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .4s;z-index:40;';
document.body.appendChild(fadeEl);
let mtrBusy = false;
function rideMtr() {
  if (mtrBusy || state.nearMtr == null) return;
  mtrBusy = true;
  const dest = MTR_STATIONS[1 - state.nearMtr];
  sfx.whoosh();
  fadeEl.style.opacity = '1';
  setTimeout(() => {
    girl.position.set(dest.x - 7, 0, dest.z);
    camera.position.copy(girl.position).add(CAM_OFFSET);
    fadeEl.style.opacity = '0';
    toast(`🚇 ${dest.name}站到喇！小心月台空隙 Mind the gap!`, 3200);
    mtrBusy = false;
    earnStamp('mtr', '🎫 地鐵印章GET！搭過喇 (+20 分)', 20);
  }, 450);
}

// ---------------- hidden Golden Bauhinia 金紫荊 ----------------
const bauhinia = new THREE.Group();
{
  const gold = new THREE.MeshStandardMaterial({
    color: 0xffc83c, emissive: 0xa87410, metalness: 0.7, roughness: 0.3,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), gold);
  core.position.y = 1.1; bauhinia.add(core);
  for (let i = 0; i < 5; i++) {                 // five petals
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), gold);
    petal.scale.set(1, 0.28, 0.55);
    const a = i / 5 * Math.PI * 2;
    petal.position.set(Math.cos(a) * 0.38, 1.18, Math.sin(a) * 0.38);
    petal.rotation.y = -a;
    petal.rotation.z = 0.5;
    bauhinia.add(petal);
  }
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.0, 6), gold);
  stem.position.y = 0.5; bauhinia.add(stem);
  bauhinia.position.set(-52, 0, -103);          // shhh… hidden behind the temple
  scene.add(bauhinia);
}
let bauhiniaFound = false;

// ---------------- dragon dance luck bonus ----------------
let dragonLuckAt = 0;   // cooldown timestamp

// ---------------- red packet rain 利是雨 ----------------
const redPackets = [];
let nextPacketRain = 0;
function makeRedPacket() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.72, 0.06),
    new THREE.MeshToonMaterial({ color: 0xd92b2b }));
  g.add(body);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.08),
    new THREE.MeshToonMaterial({ color: 0xffd35c }));
  g.add(stripe);
  return g;
}
function startPacketRain() {
  sfx.chestFound();
  toast('🧧 利是雨呀！快啲執！(每封 +20 分)', 3500);
  for (let i = 0; i < 6; i++) {
    const p = makeRedPacket();
    const a = Math.random() * Math.PI * 2, r = 3 + Math.random() * 9;
    let px = girl.position.x + Math.cos(a) * r;
    let pz = girl.position.z + Math.sin(a) * r;
    px = Math.max(MAP.minX + 2, Math.min(MAP.maxX - 2, px));
    pz = Math.max(MAP.minZ + 2, Math.min(MAP.maxZ - 2, pz));
    p.position.set(px, 9 + Math.random() * 4, pz);
    p.rotation.y = Math.random() * Math.PI;
    scene.add(p);
    redPackets.push({ m: p, expire: performance.now() + 14000 });
  }
}
function updateRedPackets(dt, t) {
  const now = performance.now();
  if (state.phase === 'play' && now > nextPacketRain) {
    nextPacketRain = now + 80000 + Math.random() * 30000;
    if (now > 15000) startPacketRain();      // not in the very first seconds
  }
  for (let i = redPackets.length - 1; i >= 0; i--) {
    const rp = redPackets[i];
    if (rp.m.position.y > 0.5) rp.m.position.y -= dt * 3.2;   // flutter down
    rp.m.rotation.y += dt * 2.5;
    const gone = now > rp.expire;
    const grabbed = !gone && state.phase === 'play' &&
      Math.hypot(rp.m.position.x - girl.position.x, rp.m.position.z - girl.position.z) < 1.3 &&
      rp.m.position.y < 2.2;
    if (grabbed) {
      state.score += 20;
      sfx.coin();
      sparkleBurst(rp.m.position, 0xd92b2b);
      popAt(rp.m.position, '+20');
      updateHUD();
    }
    if (gone || grabbed) {
      scene.remove(rp.m);
      redPackets.splice(i, 1);
    }
  }
}

// ---------------- photo spots 影相位 ----------------
const PHOTO_SPOTS = [
  { x: -62, z: 122, name: '鐘樓 Clock Tower' },
  { x: 56, z: 124, name: '星光大道 Avenue of Stars' },
  { x: -8, z: 118, name: '太空館 Space Museum' },
];
const STAMP_DEFS = [
  { id: 'friend', emoji: '🐶', title: '新朋友', hint: '摸摸公園門口嘅小狗', done: '小狗跟住你喇！' },
  { id: 'park', emoji: '🦩', title: '公園散步', hint: '帶小狗去九龍公園湖邊', done: '一齊睇咗紅鸛！' },
  { id: 'mtr', emoji: '🚇', title: 'Mind the gap', hint: '搭一次地鐵', done: '地鐵搭過喇！' },
  { id: 'first', emoji: '🎁', title: '第一個寶藏', hint: '打開第一個寶箱', done: '尋寶開始喇！' },
];
const album = [];
const PARK_POND = { x: -33, z: -10 };
let keepsakeOpen = false;
const photoTaken = new Set();
const flashEl = document.createElement('div');
flashEl.style.cssText =
  'position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .12s;z-index:41;';
document.body.appendChild(flashEl);
for (const ps of PHOTO_SPOTS) {              // glowing camera marker on the ground
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.15, 24),
    new THREE.MeshBasicMaterial({ color: 0x7df0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.75 }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(ps.x, 0.06, ps.z);
  scene.add(ring);
  ps.ring = ring;
}
function capturePolaroid(name) {
  if (composer) composer.render();
  else renderer.render(scene, camera);
  let dataUrl = '';
  try { dataUrl = renderer.domElement.toDataURL('image/jpeg', 0.68); } catch { /* some GPUs block readback */ }
  const shot = { name, dataUrl };
  album.push(shot);
  hudView.addPolaroid({ name, dataUrl, album });
}

function checkPhotoSpots() {
  for (const ps of PHOTO_SPOTS) {
    if (photoTaken.has(ps.name)) continue;
    if (Math.hypot(ps.x - girl.position.x, ps.z - girl.position.z) < 1.4) {
      photoTaken.add(ps.name);
      ps.ring.visible = false;
      state.score += 25;
      sfx.camera(); sfx.correct();
      capturePolaroid(ps.name);
      flashEl.style.opacity = '0.9';
      setTimeout(() => { flashEl.style.opacity = '0'; }, 130);
      toast(`📸 喺${ps.name}影咗張靚相！收入相簿喇 (+25 分)`, 3500);
      updateHUD();
    }
  }
}

function burstConfetti() {
  const layer = $('confetti');
  if (!layer || settings.reducedMotion) return;
  layer.replaceChildren();
  const colors = ['#ffd35c', '#ff8fb6', '#7db8ff', '#7dffb2', '#ff5c5c', '#fff'];
  for (let i = 0; i < 26; i++) {
    const bit = document.createElement('i');
    bit.className = 'confetti-bit';
    bit.style.left = `${6 + Math.random() * 88}%`;
    bit.style.background = colors[i % colors.length];
    bit.style.animationDelay = `${Math.random() * 0.28}s`;
    bit.style.animationDuration = `${1.15 + Math.random() * 0.7}s`;
    layer.appendChild(bit);
  }
  setTimeout(() => layer.replaceChildren(), 2000);
}

function earnStamp(id, message, points = 0) {
  if (state.stamps[id]) return false;
  state.stamps[id] = true;
  if (points) {
    state.score += points;
    popAt(girl.position, `+${points}`);
  }
  hudView.setStamps(state.stamps, STAMP_DEFS);
  if (message) toast(message, 3800);
  const all = STAMP_DEFS.every(def => state.stamps[def.id]);
  if (all && !state.stampSetBonus) {
    state.stampSetBonus = true;
    state.score += 50;
    sfx.fanfare();
    burstConfetti();
    toast('🎫 印章收集完成！(+50 分) Stamp set complete!', 4200);
  }
  updateHUD();
  return true;
}

function startFirstChestWow(chest) {
  burstConfetti();
  sfx.fanfare();
  for (let i = 0; i < 7; i++) {
    setTimeout(() => {
      sparkleBurst(
        chest.position.clone().add(new THREE.Vector3((Math.random() - .5) * 7, 1 + Math.random() * 7, (Math.random() - .5) * 7)),
        [0xffd35c, 0xff8fb6, 0x7db8ff, 0xfff3d6][i % 4]);
    }, i * 120);
  }
  if (!settings.reducedMotion && !window.__camLock) {
    state.wowUntil = performance.now() + 2100;
    state.wowChest = chest;
  }
  flashEl.style.background = '#ffe7a8';
  flashEl.style.opacity = '0.5';
  setTimeout(() => { flashEl.style.opacity = '0'; flashEl.style.background = '#fff'; }, 200);
}

function updateQuestBanner() {
  if (state.phase !== 'play') { hudView.hideQuest(); return; }
  if (dogFollowing && !state.stamps.park)
    hudView.showQuest('🐶 帶小狗去九龍公園湖邊！Walk the puppy to the pond');
  else if (!state.stamps.friend)
    hudView.showQuest('🐶 去公園門口摸摸小狗 Meet the puppy by the park');
  else if (!state.stamps.mtr)
    hudView.showQuest('🚇 試吓搭一次地鐵 Ride the MTR once');
  else if (!state.stamps.first && state.chestGoal > 0)
    hudView.showQuest('🎁 打開第一個寶箱 Open your first chest');
  else
    hudView.hideQuest();
}

function setKeepsakeOpen(which, open) {
  const albumScreen = $('album-screen'), stampScreen = $('stamp-screen');
  if (which === 'album') albumScreen.classList.toggle('hidden', !open);
  if (which === 'stamps') stampScreen.classList.toggle('hidden', !open);
  if (!open) {
    keepsakeOpen = !albumScreen.classList.contains('hidden') || !stampScreen.classList.contains('hidden');
  } else {
    keepsakeOpen = true;
    if (which === 'album') stampScreen.classList.add('hidden');
    if (which === 'stamps') albumScreen.classList.add('hidden');
    hudView.setStamps(state.stamps, STAMP_DEFS);
    hudView.renderAlbum(album);
  }
  keepsakeOpen = !albumScreen.classList.contains('hidden') || !stampScreen.classList.contains('hidden');
  if (keepsakeOpen) { input?.resetJoystick(); pauseSessionClock(state); }
  else if (state.phase === 'play') resumeSessionClock(state);
}

// ---------------- pigeon flocks that scatter ----------------
function makePigeon() {
  const p = new THREE.Group();
  const grey = new THREE.MeshToonMaterial({ color: 0x9aa0ad });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), grey);
  body.scale.set(1.35, 1, 1); body.position.y = 0.14; p.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6),
    new THREE.MeshToonMaterial({ color: 0x6f7686 }));
  head.position.set(0.16, 0.26, 0); p.add(head);
  const wings = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.42), grey);
  wings.position.y = 0.2; p.add(wings);
  p.userData.wings = wings;
  return p;
}
const flocks = [];
for (const [fx, fz] of [[-19, -34], [18, 78], [-15, 105]]) {
  const birds = [];
  for (let i = 0; i < 3; i++) {
    const b = makePigeon();
    const a = i * 2.1, r = 0.7 + i * 0.35;
    b.position.set(fx + Math.cos(a) * r, 0, fz + Math.sin(a) * r);
    b.rotation.y = Math.random() * Math.PI * 2;
    scene.add(b);
    birds.push({ m: b, hx: b.position.x, hz: b.position.z, va: a });
  }
  flocks.push({ birds, state: 'idle', t: 0, fx, fz });
}
function updatePigeons(dt, t) {
  for (const f of flocks) {
    if (f.state === 'idle') {
      for (const b of f.birds) {
        b.m.position.y = Math.abs(Math.sin(t * 3 + b.va)) * 0.03;  // pecking bob
        b.m.userData.wings.rotation.x = 0;
      }
      if (Math.hypot(f.fx - girl.position.x, f.fz - girl.position.z) < 3.5) {
        f.state = 'fly'; f.t = 0;
        sfx.flap?.();
      }
    } else if (f.state === 'fly') {
      f.t += dt;
      for (const b of f.birds) {
        const ang = b.va + f.t * 0.8;
        b.m.position.x += Math.cos(ang) * dt * 5;
        b.m.position.z += Math.sin(ang) * dt * 5;
        b.m.position.y += dt * (6 - f.t * 1.5);
        b.m.rotation.y = -ang;
        b.m.userData.wings.rotation.x = Math.sin(f.t * 30) * 0.9;  // frantic flapping
      }
      if (f.t > 2.6) {
        f.state = 'gone'; f.t = 0;
        for (const b of f.birds) b.m.visible = false;
      }
    } else {                                  // gone → respawn later
      f.t += dt;
      if (f.t > 9 && Math.hypot(f.fx - girl.position.x, f.fz - girl.position.z) > 8) {
        f.state = 'idle';
        for (const b of f.birds) {
          b.m.visible = true;
          b.m.position.set(b.hx, 0, b.hz);
          b.m.rotation.y = Math.random() * Math.PI * 2;
        }
      }
    }
  }
}

// ---------------- NPC friends (hints + fun facts) ----------------
const npcs = NPC_SPOTS.map((spot, i) => {
  const npc = createGirl();
  npc.scale.setScalar(1.38);
  npc.position.set(spot.x, 0, spot.z);
  npc.rotation.y = Math.random() * Math.PI * 2;
  scene.add(npc);
  // chat bubble marker
  const bubble = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff3d6 }));
  bubble.position.y = 2.1;
  npc.add(bubble);
  const dots = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0x2b3f8c }));
  dots.position.y = 2.1; dots.position.z = 0.17;
  npc.add(dots);
  return { model: npc, bubble, fact: spot.fact, talked: false, baseRot: npc.rotation.y, idx: i };
});

// ---------------- sparkle particle bursts (pooled) ----------------
const SPARKLE_N = 28;
const bursts = [];
function sparkleBurst(pos, color = 0xffd35c) {
  let b = bursts.find(item => item.life <= 0);
  if (!b) {
    if (bursts.length >= 10) b = bursts[0];
    else {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARKLE_N * 3), 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({
        color, size: 0.28, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      scene.add(pts);
      b = { pts, vels: Array.from({ length: SPARKLE_N }, () => new THREE.Vector3()), life: 0 };
      bursts.push(b);
    }
  }
  b.life = 1.1;
  b.pts.material.color.set(color);
  b.pts.material.opacity = 1;
  b.pts.visible = true;
  const posAttr = b.pts.geometry.attributes.position;
  for (let i = 0; i < SPARKLE_N; i++) {
    posAttr.array.set([pos.x, pos.y + 1, pos.z], i * 3);
    const a = Math.random() * Math.PI * 2, up = 2 + Math.random() * 4;
    b.vels[i].set(Math.cos(a) * (1 + Math.random() * 2), up, Math.sin(a) * (1 + Math.random() * 2));
  }
  posAttr.needsUpdate = true;
}
function updateBursts(dt) {
  for (const b of bursts) {
    if (b.life <= 0) { b.pts.visible = false; continue; }
    b.life -= dt;
    const pos = b.pts.geometry.attributes.position;
    for (let j = 0; j < b.vels.length; j++) {
      b.vels[j].y -= 9 * dt;
      pos.array[j * 3] += b.vels[j].x * dt;
      pos.array[j * 3 + 1] += b.vels[j].y * dt;
      pos.array[j * 3 + 2] += b.vels[j].z * dt;
    }
    pos.needsUpdate = true;
    b.pts.material.opacity = Math.max(0, b.life / 1.1);
    if (b.life <= 0) b.pts.visible = false;
  }
}

const _proj = new THREE.Vector3();
function popAt(pos, text) {
  _proj.copy(pos).project(camera);
  hudView.popScore(text,
    (_proj.x * 0.5 + 0.5) * window.innerWidth,
    (-_proj.y * 0.5 + 0.5) * window.innerHeight);
}

// ---------------- game state ----------------
const state = createGameState();

// ---------------- persistent settings and first-session guide ----------------
const settings = (() => {
  try {
    return { reducedMotion: false, smoothCamera: true, cameraSensitivity: 1,
      invertCamera: false, fixedCamera: false, musicVolume: 1, effectsVolume: 1,
      language: 'bilingual', textSize: 'standard', quality: 'auto', onlineScores: true,
      ...JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}') };
  } catch { return { reducedMotion: false, smoothCamera: true, cameraSensitivity: 1,
    invertCamera: false, fixedCamera: false, musicVolume: 1, effectsVolume: 1,
    language: 'bilingual', textSize: 'standard', quality: 'auto', onlineScores: true }; }
})();
function applySettings() {
  document.body.classList.toggle('reduced-motion', settings.reducedMotion);
  $('reduced-motion-setting').checked = settings.reducedMotion;
  $('smooth-camera-setting').checked = settings.smoothCamera;
  $('camera-sensitivity-setting').value = settings.cameraSensitivity;
  $('invert-camera-setting').checked = settings.invertCamera;
  $('fixed-camera-setting').checked = settings.fixedCamera;
  $('music-volume-setting').value = settings.musicVolume;
  $('effects-volume-setting').value = settings.effectsVolume;
  $('language-setting').value = settings.language;
  $('text-size-setting').value = settings.textSize;
  $('quality-setting').value = settings.quality;
  $('online-scores-setting').checked = settings.onlineScores;
  document.documentElement.dataset.language = settings.language;
  document.body.dataset.textSize = settings.textSize;
  document.documentElement.dataset.quality = settings.quality;
  setMusicVolume(settings.musicVolume);
  setEffectsVolume(settings.effectsVolume);
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}
applySettings();
const syncRemoteScore = (...args) => settings.onlineScores ? submitScore(...args) : Promise.resolve(null);

const tutorialSteps = [
  ['先試吓行路 Move around', '用 WASD、方向鍵或畫面搖桿移動。'],
  ['收集街頭寶物 Collect', '小地圖金點係寶箱；行近金幣、金星、禮物或小食會自動收集。'],
  ['探索及互動 Interact', '行近寶箱或人物，按 E、按互動鍵，或者直接點擊。'],
];
let tutorialStep = -1;
function renderTutorial() {
  if (tutorialStep < 0 || tutorialStep >= tutorialSteps.length) {
    tutorialCard.classList.add('hidden');
    return;
  }
  $('tutorial-progress').textContent = `${tutorialStep + 1} / ${tutorialSteps.length}`;
  $('tutorial-title').textContent = tutorialSteps[tutorialStep][0];
  $('tutorial-text').textContent = tutorialSteps[tutorialStep][1];
  tutorialCard.classList.remove('hidden');
}
function beginTutorial() {
  if (localStorage.getItem(STORAGE_KEYS.tutorial) === 'done') return;
  tutorialStep = 0;
  renderTutorial();
}
function advanceTutorial(expectedStep) {
  if (tutorialStep !== expectedStep) return;
  tutorialStep++;
  if (tutorialStep >= tutorialSteps.length) {
    localStorage.setItem(STORAGE_KEYS.tutorial, 'done');
    toast('✅ 教學完成 Tutorial complete! 開始尋寶啦！', 3000);
  }
  renderTutorial();
}
$('tutorial-skip').addEventListener('click', () => {
  localStorage.setItem(STORAGE_KEYS.tutorial, 'done');
  tutorialStep = -1;
  renderTutorial();
});

function setPaused(paused) {
  if (keepsakeOpen) {
    setKeepsakeOpen('album', false);
    setKeepsakeOpen('stamps', false);
    if (paused) return;
  }
  if (paused && state.phase !== 'play') return;
  if (!paused && state.phase !== 'paused') return;
  state.phase = paused ? 'paused' : 'play';
  if (paused) { input?.resetJoystick(); pauseSessionClock(state); renderMasterySummary(); }
  else resumeSessionClock(state);
  $('settings-screen').classList.toggle('hidden', !paused);
}
function renderMasterySummary() {
  const mastery = loadTopicMastery();
  const topics = [
    ['number-and-operations', '數學 Maths'],
    ['language-and-vocabulary', '英文 English'],
    ['reading-and-language', '中文 Chinese'],
    ['hong-kong-and-world-knowledge', '常識 General'],
  ];
  $('mastery-summary-list').replaceChildren(...topics.map(([key, label]) => {
    const stats = mastery[key] || { correct: 0, attempts: 0 };
    const row = document.createElement('div'); row.className = 'mastery-row';
    const accuracy = stats.attempts ? Math.round(stats.correct / stats.attempts * 100) : 0;
    row.textContent = `${label}: ${stats.attempts ? `${accuracy}% (${stats.correct}/${stats.attempts})` : '未有紀錄 No attempts'}`;
    return row;
  }));
}
function resetCamera() {
  cameraOrbit.yaw = 0;
  cameraOrbit.pitch = 0;
  camera.position.copy(girl.position).add(CAM_OFFSET);
  camera.lookAt(girl.position.x, girl.position.y + 1.55, girl.position.z);
  toast('🎥 鏡頭已重設 Camera reset');
}
$('pause-btn').addEventListener('click', () => setPaused(true));
$('resume-btn').addEventListener('click', () => setPaused(false));
$('reduced-motion-setting').addEventListener('change', event => {
  settings.reducedMotion = event.target.checked; applySettings();
});
$('smooth-camera-setting').addEventListener('change', event => {
  settings.smoothCamera = event.target.checked; applySettings();
});
$('camera-sensitivity-setting').addEventListener('input', event => {
  settings.cameraSensitivity = Number(event.target.value); applySettings();
});
$('invert-camera-setting').addEventListener('change', event => {
  settings.invertCamera = event.target.checked; applySettings();
});
$('fixed-camera-setting').addEventListener('change', event => {
  settings.fixedCamera = event.target.checked; resetCamera(); applySettings();
});
$('music-volume-setting').addEventListener('input', event => {
  settings.musicVolume = Number(event.target.value); applySettings();
});
$('effects-volume-setting').addEventListener('input', event => {
  settings.effectsVolume = Number(event.target.value); applySettings();
});
$('language-setting').addEventListener('change', event => {
  settings.language = event.target.value; applySettings();
});
$('text-size-setting').addEventListener('change', event => {
  settings.textSize = event.target.value; applySettings();
});
$('quality-setting').addEventListener('change', event => {
  settings.quality = event.target.value; applySettings();
  toast('畫質設定會在下次開啟遊戲生效 · Quality applies on next load');
});
$('online-scores-setting').addEventListener('change', event => {
  settings.onlineScores = event.target.checked; applySettings();
  toast(settings.onlineScores ? '🌍 網上排行榜已開啟' : '🔒 分數只會儲存在這部裝置');
});
$('camera-reset-btn').addEventListener('click', resetCamera);
$('album-btn').addEventListener('click', () => { if (state.phase === 'play') setKeepsakeOpen('album', true); });
$('stamp-btn').addEventListener('click', () => { if (state.phase === 'play') setKeepsakeOpen('stamps', true); });
$('album-close-btn').addEventListener('click', () => setKeepsakeOpen('album', false));
$('stamp-close-btn').addEventListener('click', () => setKeepsakeOpen('stamps', false));

function doInteract() {
  notePlayerActivity();
  if (state.nearChest) interactions.activateByRef('chest', state.nearChest);
  else if (state.nearNpc) interactions.activateByRef('npc', state.nearNpc);
  else if (state.nearDog && !dogFollowing) interactions.activateByRef('dog', dog);
  else if (state.nearCat) interactions.activateByRef('cat', luckyCat);
  else if (state.nearMtr != null) interactions.activateByRef('mtr', state.nearMtr);
}

// ---------------- input ----------------
const input = new InputController({
  onAction: action => {
    if (action === INPUT_ACTIONS.pause && keepsakeOpen) {
      setKeepsakeOpen('album', false);
      setKeepsakeOpen('stamps', false);
      return;
    }
    if (action === INPUT_ACTIONS.interact) doInteract();
    else if (action === INPUT_ACTIONS.pause) setPaused(state.phase === 'play');
    else if (action === INPUT_ACTIONS.cameraReset) resetCamera();
  },
  canAction: action => action === INPUT_ACTIONS.pause
    ? state.phase === 'play' || state.phase === 'paused' || keepsakeOpen
    : state.phase === 'play' && !keepsakeOpen,
});

// ---------------- direct mouse / touch interaction ----------------
// Every interactive model carries its own root marker, so a ray hit on any
// child mesh (lid, arm, hair, etc.) resolves to the correct gameplay object.
const interactions = new InteractionSystem({
  canvas, camera, player: girl,
  isEnabled: () => state.phase === 'play' && !keepsakeOpen,
  onTooFar: (_entry, distance) => toast(`行近一點再互動 · Move closer (${Math.ceil(distance)}m)`, 2200),
});
chests.forEach(ch => interactions.register(ch, 'chest', ch, {
  distance: GAME_CONFIG.interactionDistance.chest,
  isCompleted: () => ch.userData.opened || ch.userData.active === false,
  activate: () => openChest(ch),
}));
npcs.forEach(npc => interactions.register(npc.model, 'npc', npc, {
  distance: GAME_CONFIG.interactionDistance.npc,
  activate: () => talkToNpc(npc),
}));
interactions.register(dog, 'dog', dog, {
  distance: GAME_CONFIG.interactionDistance.dog,
  isCompleted: () => dogFollowing,
  activate: adoptDog,
});
interactions.register(luckyCat, 'cat', luckyCat, {
  distance: GAME_CONFIG.interactionDistance.cat,
  isCompleted: () => catRubbed,
  activate: rubLuckyCat,
});
MTR_STATIONS.forEach((station, i) => {
  // Transparent ray volume follows the visible entrance built in landmarks.js.
  const hitArea = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 4.5, 4.6),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  hitArea.position.set(station.x, 2.1, station.z);
  scene.add(hitArea);
  interactions.register(hitArea, 'mtr', i, {
    distance: GAME_CONFIG.interactionDistance.mtr,
    activate: () => { state.nearMtr = i; rideMtr(); },
  });
});

const hoverRing = new THREE.Mesh(
  new THREE.RingGeometry(.72, .9, 28),
  new THREE.MeshBasicMaterial({ color: 0xffee96, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false }));
hoverRing.rotation.x = -Math.PI / 2;
hoverRing.position.y = .09;
hoverRing.visible = false;
scene.add(hoverRing);

function pointerTarget(clientX, clientY) {
  return interactions.pick(clientX, clientY);
}

function activatePointerTarget(target) {
  notePlayerActivity();
  return interactions.activate(target).status !== 'disabled';
}

let canvasPress = null;
canvas.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('pointerdown', e => {
  if (e.button === 2 && !settings.fixedCamera) {
    cameraOrbit.dragging = true; cameraOrbit.x = e.clientX; cameraOrbit.y = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    return;
  }
  canvasPress = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('pointerup', e => {
  if (e.button === 2) { cameraOrbit.dragging = false; return; }
  if (!canvasPress || Math.hypot(e.clientX - canvasPress.x, e.clientY - canvasPress.y) > 10) return;
  activatePointerTarget(pointerTarget(e.clientX, e.clientY));
  canvasPress = null;
});
canvas.addEventListener('pointermove', e => {
  if (cameraOrbit.dragging && !settings.fixedCamera) {
    const scale = 0.004 * settings.cameraSensitivity;
    cameraOrbit.yaw -= (e.clientX - cameraOrbit.x) * scale;
    cameraOrbit.pitch += (e.clientY - cameraOrbit.y) * scale * (settings.invertCamera ? -1 : 1);
    cameraOrbit.pitch = THREE.MathUtils.clamp(cameraOrbit.pitch, -0.55, 0.65);
    cameraOrbit.x = e.clientX; cameraOrbit.y = e.clientY;
    return;
  }
  if (isTouch || state.phase !== 'play') return;
  const target = pointerTarget(e.clientX, e.clientY);
  canvas.classList.toggle('can-interact', !!target);
  hoverRing.visible = !!target;
  if (target) hoverRing.position.set(target.root.position.x, .09, target.root.position.z);
});
canvas.addEventListener('pointerleave', () => { canvas.classList.remove('can-interact'); hoverRing.visible = false; });
interactPrompt.addEventListener('click', () => { if (state.phase === 'play') doInteract(); });

function rubLuckyCat() {
  if (catRubbed) {
    toast('🐱 招財貓已經送咗好運俾你今次喇～');
    return;
  }
  catRubbed = true;
  advanceTutorial(2);
  const bonus = [28, 38, 58, 88][Math.floor(Math.random() * 4)];
  state.score += bonus;
  state.catWaveFast = performance.now() + 3000;
  sfx.coin();
  sparkleBurst(luckyCat.position.clone().add(new THREE.Vector3(0, 1.6, 0)), 0xffd24a);
  toast(`🐱✨ 招財貓送你好運！(+${bonus} 分)`, 4000);
  setPrompt(null);
  state.nearCat = false;
  updateHUD();
}

function adoptDog() {
  dogFollowing = true;
  advanceTutorial(2);
  state.score += 30;
  sfx.bark();
  sparkleBurst(dog.position, 0xc89058);
  toast('🐶 小狗好鍾意你！佢會跟住你一齊尋寶！(+30 分)', 4000);
  earnStamp('friend', '🎫 新朋友印章！帶佢去九龍公園湖邊行吓～');
  setPrompt(null);
  state.nearDog = false;
  updateHUD();
}

const joyZone = $('joystick-zone'), joyBase = $('joystick-base'), joyKnob = $('joystick-knob');
input.bindJoystick({
  zone: joyZone,
  base: joyBase,
  knob: joyKnob,
  onTap: (x, y) => activatePointerTarget(pointerTarget(x, y)),
});

actionBtn.addEventListener('click', () => {
  if (state.phase === 'play') doInteract();
});

// ---------------- movement & collision ----------------
const PLAYER_R = GAME_CONFIG.playerRadius, SPEED = GAME_CONFIG.playerSpeed;
function tryMove(pos, dx, dz) {
  for (const [mx, mz] of [[dx, 0], [0, dz]]) {
    const nx = pos.x + mx, nz = pos.z + mz;
    let blocked = nx < MAP.minX || nx > MAP.maxX || nz < MAP.minZ || nz > MAP.maxZ;
    if (!blocked) {
      for (const c of colliderIndex.queryPoint(nx, nz, PLAYER_R)) {
        if (nx > c.minX - PLAYER_R && nx < c.maxX + PLAYER_R &&
            nz > c.minZ - PLAYER_R && nz < c.maxZ + PLAYER_R) { blocked = true; break; }
      }
    }
    if (!blocked) { pos.x = nx; pos.z = nz; }
  }
}

// ---------------- HUD / minimap / prompts ----------------
const chestGoal = () => state.chestGoal;
const updateHUD = () => hudView.update(state, chestGoal());
const toast = (message, duration = 2400) => hudView.toast(message, duration);
const setPrompt = html => hudView.setPrompt(html);

function nearestUnopenedChestHint() {
  let best = null, bestD = Infinity;
  for (const ch of chests) {
    if (ch.userData.opened) continue;
    const d = Math.hypot(ch.position.x - girl.position.x, ch.position.z - girl.position.z);
    if (d < bestD) { bestD = d; best = ch; }
  }
  return best ? best.userData.hint : null;
}

function updateObjectiveGuide() {
  if (state.phase !== 'play') {
    hudView.hideObjective();
    trailCrumbs.forEach(c => { c.visible = false; });
    return;
  }
  let best = null, distance = Infinity;
  for (const chest of chests) {
    if (chest.userData.opened || chest.userData.active === false) continue;
    const d = Math.hypot(chest.position.x - girl.position.x, chest.position.z - girl.position.z);
    if (d < distance) { best = chest; distance = d; }
  }
  if (!best) {
    hudView.hideObjective();
    trailCrumbs.forEach(c => { c.visible = false; });
    return;
  }
  for (const chest of chests) {
    if (!chest.userData.beacon?.material) continue;
    chest.userData.beacon.material.opacity = chest === best ? 0.3 : 0.16;
  }
  for (let i = 0; i < trailCrumbs.length; i++) {
    const t = (i + 1) / (trailCrumbs.length + 1);
    trailCrumbs[i].visible = true;
    trailCrumbs[i].position.set(
      girl.position.x + (best.position.x - girl.position.x) * t,
      0.35 + Math.sin(performance.now() / 220 + i) * 0.08,
      girl.position.z + (best.position.z - girl.position.z) * t);
    trailCrumbs[i].material.opacity = 0.35 + t * 0.5;
  }
  const dx = best.position.x - girl.position.x, dz = best.position.z - girl.position.z;
  const inactive = performance.now() - lastPlayerActivity > 30000;
  hudView.showObjective({ hint: best.userData.hint, distance, angle: Math.atan2(dx, dz), inactive });
  if (inactive && !inactivityHintShown) {
    inactivityHintShown = true;
    toast('💡 需要幫忙？按右邊燈泡睇最近寶箱提示！', 4000);
  }
}
hudView.bindHint(() => {
  const hint = nearestUnopenedChestHint();
  if (hint) toast(`💡 最近嘅寶箱：${hint}`, 4000);
});

function talkToNpc(npc) {
  advanceTutorial(2);
  sfx.click();
  let msg = `💬 ${npc.fact}`;
  const hint = nearestUnopenedChestHint();
  if (hint) msg += ` 💡最近嘅寶箱喺：${hint}`;
  if (!npc.talked) {
    npc.talked = true;
    state.score += 20;
    msg += '（+20 分）';
    sparkleBurst(npc.model.position, 0x9be89b);
    updateHUD();
  }
  toast(msg, 5200);
}

// ---------------- quiz system ----------------
const quiz = new QuizSystem();

function quizTime() { return DIFFICULTIES[state.difficulty].time; }
function quizMult() { return DIFFICULTIES[state.difficulty].mult; }

function openChest(chest) {
  advanceTutorial(2);
  state.phase = 'quiz';
  state.nearChest = null;
  state.nearNpc = null;
  setPrompt(null);
  sfx.chestFound();
  sparkleBurst(chest.position);

  quiz.start(chest, state.difficulty, GAME_CONFIG.totalQuestionsPerChest,
    state.sessionMode === 'practice' ? { categories: ['math', 'english', 'chinese'] } : {});
  showQuestion();
}

function showQuestion() {
  const q = quiz.current;
  const cat = CATEGORIES[q.cat];
  quizView.showQuestion({
    item: q, index: quiz.index, total: GAME_CONFIG.totalQuestionsPerChest, category: cat,
    onAnswer: answer,
  });

  const T = state.sessionTimed ? quizTime() : null;
  if (!T) { quizView.setTimer(1); return; }
  quiz.beginTimer(T, {
    onTick: ({ ratio, secondsLeft, previousSecond }) => {
      quizView.setTimer(ratio);
      if (secondsLeft <= 4 && secondsLeft < previousSecond) sfx.tick();
    },
    onTimeout: () => answer(-1, null),
  });
}

function answer(choice, btn) {
  quiz.stopTimer();
  const q = quiz.current;
  quizView.lockAnswers(q.c, choice === q.c ? null : btn);
  const timeLeft = Math.max(0, (quiz.deadline - performance.now()) / 1000);

  if (choice === q.c) {
    recordQuestionResult(q, true);
    const scored = scoreCorrectAnswer({
      timeLeft, multiplier: quizMult(), previousStreak: state.streak,
    });
    const pts = scored.points;
    state.streak = scored.streak;
    let streakText = '';
    if (scored.streakBonus) {
      streakText = ` 🔥連續答對 ${state.streak} 題 +${scored.streakBonus}!`;
    }
    quiz.correct++;
    quiz.earned += pts;
    state.score += pts;
    quizView.showFeedback(`✅ 答對了！+${pts} 分${streakText}`, 'good');
    sfx.correct();
  } else if (choice === -1) {
    recordQuestionResult(q, false);
    state.streak = scoreMissedAnswer('timeout').streak;
    quizView.showFeedback('⏰ 時間到 Time\'s up!', 'bad');
    sfx.timeout();
  } else {
    recordQuestionResult(q, false);
    state.streak = scoreMissedAnswer('incorrect').streak;
    quizView.showFeedback('❌ 答錯了 Oops!', 'bad');
    sfx.wrong();
  }
  updateHUD();

  setTimeout(() => {
    if (quiz.advance()) showQuestion();
    else finishChestQuiz();
  }, 1300);
}

function finishChestQuiz() {
  quizView.hideQuestion();

  let perfectBonus = 0;
  if (quiz.correct === 3) {
    perfectBonus = perfectChestBonus(quizMult());
    state.score += perfectBonus;
    // celebration fireworks above the chest
    sfx.firework();
    const base = quiz.chest.position;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const p = new THREE.Vector3(
          base.x + (Math.random() - 0.5) * 16,
          14 + Math.random() * 10,
          base.z + (Math.random() - 0.5) * 16);
        sparkleBurst(p, [0xff8fb6, 0xffd35c, 0x7db8ff, 0x7dffb2, 0xc792ff][i]);
      }, 400 + i * 280);
    }
  }

  const chest = quiz.chest;
  const isFirstChest = state.chestsOpened === 0;
  chest.userData.opened = true;
  chest.userData.opening = 0;
  chest.userData.beacon.visible = false;
  if (chest.userData.glow.isPointLight) {
    chest.userData.glow.intensity = 2;
    chest.userData.glow.color.set(0x6688ff);
  }
  const mission = completeChest(state, chestGoal());
  sparkleBurst(chest.position, 0xff8fb6);
  let firstBonus = 0;
  if (isFirstChest) {
    firstBonus = 25;
    state.score += firstBonus;
    earnStamp('first');
    startFirstChestWow(chest);
  }

  state.phase = 'result';
  chestResult.querySelector('.result-card')?.classList.toggle('first-treasure', isFirstChest);
  const resultHtml = `📍 ${chest.userData.hint}<br>答對 ${quiz.correct} / 3 題 · 得到 <b>${quiz.earned}</b> 分` +
    (perfectBonus ? `<br>🌟 全對獎勵 Perfect Bonus +${perfectBonus}!` : '') +
    (isFirstChest ? `<br>🎁 第一個寶藏獎勵 First treasure +${firstBonus}!` : '') +
    `<br>剩餘寶箱 Chests left: <b>${mission.remaining}</b>`;
  quizView.showResult({
    emoji: isFirstChest ? '🏆' : quiz.correct === 3 ? '🌟' : quiz.correct >= 1 ? '🎉' : '😅',
    title: isFirstChest
      ? '第一個寶藏！First Treasure!'
      : quiz.correct === 3 ? '完美！Perfect!' : quiz.correct >= 1 ? '寶箱打開了！Chest Opened!' : '繼續努力 Keep Going!',
    html: resultHtml,
  });
  updateHUD();
}

// auto-save progress after every chest — local + global (best run kept)
let autosaveNotified = false;
function autoSaveProgress() {
  if (!state.playerName) return;
  const elapsed = Math.round((performance.now() - state.startTime) / 1000);
  const diff = DIFFICULTIES[state.difficulty];
  const displayName = `${diff.emoji} ${state.playerName}`;
  saveScore(displayName, state.score, elapsed);
  syncRemoteScore(displayName, state.score, elapsed, state.difficulty).then((remote) => {
    if (remote && !autosaveNotified) {
      autosaveNotified = true;
      toast('💾 分數會自動儲存到 🌍 全球排行榜！');
    }
  });
}

$('chest-continue-btn').addEventListener('click', () => {
  sfx.click();
  quizView.hideResult();
  autoSaveProgress();
  if (chestGoal() > 0 && missionStatus(state, chestGoal()).complete) showVictory();
  else {
    state.phase = 'play';
    toast(`🎁 還有 ${chestGoal() - state.chestsOpened} 個寶箱！跟住小地圖金點走！`);
  }
});

// ---------------- victory ----------------
function showVictory({ timedOut = false } = {}) {
  state.phase = 'victory';
  state.sessionDeadline = 0;
  quiz.stopTimer();
  quizView.hideQuestion();
  quizView.hideResult();
  sfx.victory();
  const elapsed = Math.round((performance.now() - state.startTime) / 1000);
  const mins = Math.floor(elapsed / 60), secs = elapsed % 60;

  const timeBonus = timedOut ? 0 : Math.max(0, (state.sessionDurationSeconds || 900) - elapsed);
  state.score += timeBonus;

  const diff = DIFFICULTIES[state.difficulty];
  const displayName = `${diff.emoji} ${state.playerName}`;
  // auto-save: local immediately, then sync to the global board
  saveScore(displayName, state.score, elapsed);
  renderBoard($('victory-lb-list'), loadBoard(), displayName);
  syncRemoteScore(displayName, state.score, elapsed, state.difficulty).then((remote) => {
    if (remote) {
      renderBoard($('victory-lb-list'), remote, displayName);
      toast('🌍 分數已自動上載到全球排行榜！');
    }
  });

  $('victory-title').textContent = timedOut
    ? '時間到！Quick Hunt Finished!'
    : '尋寶完成！Treasure Hunt Complete!';
  $('victory-stats').innerHTML =
    `${state.playerName} 同學，${timedOut ? '時間到，今次完成咗 ' + state.chestsOpened + ' 個寶箱！' : '做得好！'} (${diff.label})<br>` +
    `總分 Total Score: <b>${state.score}</b><br>` +
    `時間 Time: ${mins}:${String(secs).padStart(2, '0')} ` +
    (timeBonus ? `(速度獎勵 +${timeBonus})` : '') +
    `<br>金幣 💰 ${state.coinsCollected} · 金星 ⭐ ${state.starsCollected}` +
    `<br>🎫 印章 Stamps: ${Object.values(state.stamps).filter(Boolean).length}/4` +
    ` · 📷 相片 Photos: ${album.length}`;
  victoryScreen.classList.remove('hidden');
}

$('replay-btn').addEventListener('click', () => location.reload());

// ---------------- start flow ----------------
renderBoard($('start-lb-list'), loadBoard());
if (settings.onlineScores) {
  fetchRemoteBoard().then((remote) => {
    if (remote && remote.length) renderBoard($('start-lb-list'), remote);
  });
}
nameInput.addEventListener('input', () => {
  startBtn.disabled = normalizePlayerName(nameInput.value).length === 0;
});
nameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !startBtn.disabled) startBtn.click();
  e.stopPropagation();
});
document.querySelectorAll('#difficulty-row .diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#difficulty-row .diff-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.difficulty = btn.dataset.diff;
    sfx.click();
  });
});
// time-of-day choice — applies live so the player previews it behind the menu
document.querySelectorAll('#time-row .time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#time-row .time-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    setTimeMode(btn.dataset.time === 'morning');
    sfx.click();
  });
});
document.querySelectorAll('#session-row .diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#session-row .diff-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.sessionMode = btn.dataset.session;
    sfx.click();
  });
});
function setTimeMode(morning) {
  state.morning = morning;
  world.setMorning(morning);
  $('time-btn').textContent = morning ? '🌅 早晨' : '🌃 夜晚';
}
$('time-btn').addEventListener('click', () => {
  setTimeMode(!state.morning);
  sfx.click();
});
setTimeMode(true);   // default: bright morning
$('mute-btn').addEventListener('click', () => {
  const muted = toggleBgm();
  $('mute-btn').textContent = muted ? '🔇 音樂' : '🔊 音樂';
});
startBtn.addEventListener('click', () => {
  state.playerName = normalizePlayerName(nameInput.value);
  if (!state.playerName) { nameInput.focus(); return; }
  sfx.unlock();
  sfx.click();
  startBgm();
  resetQuestionPool();
  const session = configureSession(state, chests, state.sessionMode);
  startScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  $('hud-name').textContent = `⭐ ${state.playerName} ${DIFFICULTIES[state.difficulty].emoji} · ${session.label}`;
  state.phase = 'play';
  startSessionClock(state);
  hudView.setStamps(state.stamps, STAMP_DEFS);
  hudView.renderAlbum(album);
  updateHUD();
  hudView.updateSessionClock(sessionSecondsRemaining(state));
  beginTutorial();
  toast(state.sessionMode === 'explore'
    ? '🌿 自由探索模式：慢慢行、欣賞街景、同人物互動！'
    : `🗺️ ${session.description} 跟住小地圖嘅金色光點出發！`, 3600);
  if (tutorialStep < 0 && isTouch && window.innerHeight > window.innerWidth) {
    $('orientation-hint').classList.remove('hidden');
    setTimeout(() => $('orientation-hint').classList.add('hidden'), 5000);
  }
});

// ---------------- pickups ----------------
function grantGift() {
  const roll = Math.random();
  if (roll < 0.4) { state.score += 50; popAt(girl.position, '+50'); toast('🎀 神秘禮物：+50 分！'); }
  else if (roll < 0.7) { state.score += 100; popAt(girl.position, '+100'); toast('🎀 神秘禮物：+100 分！勁呀！'); }
  else if (roll < 0.85) { state.score += 150; popAt(girl.position, '+150'); toast('🎀 神秘禮物：+150 分！！超勁！'); }
  else {
    state.boostUntil = performance.now() + 10000;
    toast('🎀 神秘禮物：⚡ 加速 10 秒！衝呀！');
  }
}

function checkPickups() {
  let collected = false;
  const gx = girl.position.x, gz = girl.position.z;
  const pull = (obj, range, grab) => {
    const d = Math.hypot(obj.position.x - gx, obj.position.z - gz);
    if (d < range && d > 0.12) {
      const k = Math.min(0.28, (range - d) / range * 0.35);
      obj.position.x += (gx - obj.position.x) * k;
      obj.position.z += (gz - obj.position.z) * k;
    }
    return d < grab;
  };
  for (const coin of coins) {
    if (coin.userData.taken) continue;
    if (pull(coin, 2.6, 1.1)) {
      coin.userData.taken = true;
      coin.visible = false;
      state.coinsCollected++;
      state.score += 10;
      collected = true;
      sfx.coin();
      sparkleBurst(coin.position, 0xffe9a8);
      popAt(coin.position, '+10');
    }
  }
  for (const star of stars) {
    if (star.userData.taken) continue;
    if (pull(star, 2.8, 1.3)) {
      star.userData.taken = true;
      star.visible = false;
      state.starsCollected++;
      state.score += 25;
      collected = true;
      sfx.coin();
      sfx.correct();
      sparkleBurst(star.position, 0xffe066);
      popAt(star.position, '+25');
      toast('⭐ 金星 +25 分！');
    }
  }
  for (const gift of gifts) {
    if (gift.userData.taken) continue;
    if (pull(gift, 2.8, 1.4)) {
      gift.userData.taken = true;
      gift.visible = false;
      sfx.chestFound();
      sparkleBurst(gift.position, 0xff8fb6);
      grantGift();
      collected = true;
    }
  }
  for (const f of foodStalls) {
    if (f.eaten) continue;
    if (Math.hypot(f.x - gx, f.z - gz) < 2.6) {
      f.eaten = true;
      f.foodMesh.visible = false;
      state.score += 15;
      state.boostUntil = Math.max(state.boostUntil, performance.now() + 8000);
      sfx.coin();
      const fp = new THREE.Vector3(f.x, 1, f.z);
      sparkleBurst(fp, 0xffe9a8);
      popAt(fp, '+15');
      toast(`😋 食咗${f.name}！+15 分，⚡加速 8 秒！`);
      collected = true;
    }
  }
  if (collected) {
    updateHUD();
    advanceTutorial(1);
  }
}

world.systems.add('events', (dt, t) => {
  updateBursts(dt);
  updateRedPackets(dt, t);
  if (state.phase === 'play' || state.phase === 'quiz') updatePigeons(dt, t);
});

// ---------------- main loop ----------------
const clock = new THREE.Clock();
const camTarget = new THREE.Vector3();
const camOffset = new THREE.Vector3();
let targetYaw = 0;
let lastPlayerActivity = performance.now();
let inactivityHintShown = false;
let lastObjectiveUpdate = 0;
let lastMinimapUpdate = 0;
const GUIDANCE_UPDATE_INTERVAL = 120;
const MINIMAP_UPDATE_INTERVAL = 80;
function notePlayerActivity() {
  lastPlayerActivity = performance.now();
  inactivityHintShown = false;
  hudView.clearHintAttention();
}

function cameraPositionIsBlocked(position) {
  if (position.x < MAP.minX || position.x > MAP.maxX || position.z < MAP.minZ || position.z > MAP.maxZ) return true;
  return [...colliderIndex.queryPoint(position.x, position.z)].some(c =>
    position.x > c.minX && position.x < c.maxX && position.z > c.minZ && position.z < c.maxZ);
}

function resolveCameraObstruction(desired) {
  if (!cameraPositionIsBlocked(desired)) return desired;
  for (let step = 1; step <= 12; step++) {
    desired.lerpVectors(desired, girl.position, step / 12);
    desired.y = Math.max(desired.y, girl.position.y + 2.2);
    if (!cameraPositionIsBlocked(desired)) break;
  }
  return desired;
}

let loopArmed = false;
let skipNextFrame = false;
function loop() {
  requestAnimationFrame(loop);
  if (!loopArmed) { loopArmed = true; return; }
  if (skipNextFrame) { skipNextFrame = false; return; }
  if (pageHidden) return;
  const frameStart = performance.now();
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  const now = performance.now();

  hudView.updateSessionClock(sessionSecondsRemaining(state, now));
  if (state.phase !== 'start' && state.phase !== 'victory' && sessionHasExpired(state, now)) {
    showVictory({ timedOut: true });
  }

  // The start screen still renders the scene as a backdrop, but does not need
  // traffic, water, birds, particles or other simulation work until play begins.
  // Keeping the render loop alive preserves the animated camera/preview while
  // avoiding a large amount of main-thread work behind the menu.
  const simulationActive = state.phase !== 'start';
  if (simulationActive) world.systems.update(dt, t);

  for (const ch of simulationActive ? chests : []) {
    if (ch.userData.opening != null && ch.userData.opening < 1) {
      ch.userData.opening = Math.min(1, ch.userData.opening + dt * 2.4);
      ch.userData.lid.rotation.x = -1.05 * ch.userData.opening;
    }
    if (!ch.userData.opened && ch.userData.active !== false) {
      ch.position.y = Math.sin(t * 2 + ch.userData.index * 1.3) * 0.12 + 0.05;
      ch.rotation.y += dt * 0.6;
      if (ch.userData.glow.isPointLight) ch.userData.glow.intensity = 7 + Math.sin(t * 4 + ch.userData.index) * 2.5;
    }
  }
  if (simulationActive) {
    const gx = girl.position.x, gz = girl.position.z;
    for (const coin of coins) {
      if (coin.userData.taken) continue;
      if (Math.abs(coin.position.x - gx) > 36 || Math.abs(coin.position.z - gz) > 36) continue;
      coin.rotation.z += dt * 3;
    }
  }
  for (const star of simulationActive ? stars : []) {
    if (star.userData.taken) continue;
    star.rotation.y += dt * 2;
    star.position.y = 1.4 + Math.sin(t * 2.4 + star.position.x) * 0.18;
  }
  for (const gift of simulationActive ? gifts : []) {
    if (gift.userData.taken) continue;
    gift.rotation.y += dt * 1.4;
    gift.position.y = 1.3 + Math.sin(t * 2 + gift.position.z) * 0.2;
  }
  for (const npc of simulationActive ? npcs : []) {
    animateGirl(npc.model, dt, 0);
    npc.model.rotation.y = npc.baseRot + Math.sin(t * 0.4 + npc.idx * 2) * 0.6;
    npc.bubble.scale.setScalar(1 + Math.sin(t * 3 + npc.idx) * 0.12);
  }

  // ---------------- player movement ----------------
  let speedFactor = 0;
  const boosted = performance.now() < state.boostUntil;
  boostRing.visible = boosted && state.phase === 'play';
  if (boosted) boostRing.rotation.z += dt * 4;

  if (state.phase === 'play' && !keepsakeOpen) {
    const movement = input.movement();
    const ix = movement.x, iz = movement.z;

    const len = Math.hypot(ix, iz);
    if (len > 0.15) {
      notePlayerActivity();
      advanceTutorial(0);
      speedFactor = Math.min(1, len);
      const spd = SPEED * (boosted ? 1.65 : 1);
      const moveX = (ix / Math.max(len, 1)) * spd * dt * speedFactor;
      const moveZ = (iz / Math.max(len, 1)) * spd * dt * speedFactor;
      tryMove(girl.position, moveX, moveZ);
      targetYaw = Math.atan2(moveX, moveZ);
    }

    let dy = targetYaw - girl.rotation.y;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    girl.rotation.y += dy * Math.min(1, dt * 12);

    checkPickups();
    checkLandmarkVisits();
    if (dogFollowing && !state.stamps.park &&
        Math.hypot(girl.position.x - PARK_POND.x, girl.position.z - PARK_POND.z) < 7.5) {
      earnStamp('park', '🦩 帶小狗睇咗紅鸛！公園印章GET (+40 分)', 40);
      sparkleBurst(new THREE.Vector3(PARK_POND.x, 1, PARK_POND.z), 0xff8fb6);
    }

    // traffic collision — watch out crossing the road!
    if (performance.now() > state.hitInvulnUntil) {
      for (const v of world.vehicles) {
        const dx = girl.position.x - v.group.position.x;
        const dz = girl.position.z - v.group.position.z;
        const d = Math.hypot(dx, dz);
        if (state.trafficEnabled && d < v.hitR) {
          state.hitInvulnUntil = performance.now() + 2200;
          state.dizzyUntil = performance.now() + 800;
          const inv = 1 / (d || 1);
          tryMove(girl.position, dx * inv * 1.6, dz * inv * 1.6);
          tryMove(girl.position, dx * inv * 1.4, dz * inv * 1.4);
          state.score = Math.max(0, state.score - 10);
          sfx.horn();
          sparkleBurst(girl.position, 0xff5c5c);
          toast('🚖 哎呀！俾車撞到！記住行斑馬線呀！(-10 分)');
          updateHUD();
          break;
        }
      }
    }

    // chest / npc / puppy proximity
    let nearChest = null;
    for (const ch of chests) {
      if (ch.userData.opened || ch.userData.active === false) continue;
      if (Math.hypot(ch.position.x - girl.position.x, ch.position.z - girl.position.z) < 3.2) {
        nearChest = ch; break;
      }
    }
    let nearNpc = null;
    if (!nearChest) {
      for (const npc of npcs) {
        if (Math.hypot(npc.model.position.x - girl.position.x, npc.model.position.z - girl.position.z) < 2.6) {
          nearNpc = npc; break;
        }
      }
    }
    const nearDog = !nearChest && !nearNpc && !dogFollowing &&
      Math.hypot(dog.position.x - girl.position.x, dog.position.z - girl.position.z) < 2.4;
    const nearCat = !nearChest && !nearNpc && !nearDog && !catRubbed &&
      Math.hypot(luckyCat.position.x - girl.position.x, luckyCat.position.z - girl.position.z) < 2.6;
    let nearMtr = null;
    if (!nearChest && !nearNpc && !nearDog && !nearCat && !mtrBusy) {
      for (let i = 0; i < MTR_STATIONS.length; i++) {
        const s = MTR_STATIONS[i];
        if (Math.hypot(s.x - girl.position.x, s.z - girl.position.z) < 6) { nearMtr = i; break; }
      }
    }
    if (nearChest !== state.nearChest || nearNpc !== state.nearNpc ||
        nearDog !== state.nearDog || nearCat !== state.nearCat || nearMtr !== state.nearMtr) {
      state.nearChest = nearChest;
      state.nearNpc = nearNpc;
      state.nearDog = nearDog;
      state.nearCat = nearCat;
      state.nearMtr = nearMtr;
      if (nearChest) setPrompt('<span class="key-cap">E</span> 開寶箱 Open Chest!');
      else if (nearNpc) setPrompt('<span class="key-cap">E</span> 同同學傾偈 Talk!');
      else if (nearDog) setPrompt('<span class="key-cap">E</span> 摸吓小狗 Pet the puppy!');
      else if (nearCat) setPrompt('<span class="key-cap">E</span> 摸吓招財貓 Lucky cat!');
      else if (nearMtr != null)
        setPrompt(`<span class="key-cap">E</span> 搭地鐵去${MTR_STATIONS[1 - nearMtr].name} Ride the MTR!`);
      else setPrompt(null);
      actionBtn.textContent =
        nearChest ? '🎁' : nearDog ? '🐶' : nearCat ? '🐱' : nearMtr != null ? '🚇' : '💬';
    }
  }

  // dizzy spin after a traffic bump
  if (performance.now() < state.dizzyUntil) girl.rotation.y += dt * 16;

  // puppy: follow the girl once adopted, otherwise wag by the park
  {
    const tail = dog.userData.tail;
    tail.rotation.z = Math.sin(t * 9) * 0.5;
    if (dogFollowing) {
      const yaw = girl.rotation.y;
      const tx = girl.position.x - Math.sin(yaw) * 1.7;
      const tz = girl.position.z - Math.cos(yaw) * 1.7;
      const ddx = tx - dog.position.x, ddz = tz - dog.position.z;
      const dist = Math.hypot(ddx, ddz);
      if (dist > 0.25) {
        const step = Math.min(1, dt * (dist > 6 ? 6 : 3.2));
        dog.position.x += ddx * step;
        dog.position.z += ddz * step;
        dog.rotation.y = Math.atan2(ddx, ddz);
        dog.position.y = Math.abs(Math.sin(t * 9)) * 0.12;   // happy little hops
      } else {
        dog.position.y = 0;
      }
    } else {
      dog.rotation.y = 0.8 + Math.sin(t * 0.6) * 0.5;
    }
  }

  // lucky cat waves; pigeons peck / scatter; golden bauhinia twinkles
  {
    const fast = performance.now() < (state.catWaveFast || 0);
    luckyCat.userData.arm.rotation.x = -0.6 + Math.sin(t * (fast ? 16 : 2.4)) * 0.5;
    if (state.phase === 'play') {
      checkPhotoSpots();
      // brush past the dragon dance for a luck bonus (once a minute)
      const dh = world.dragonHead;
      if (dh && performance.now() > dragonLuckAt &&
          Math.hypot(dh.position.x - girl.position.x, dh.position.z - girl.position.z) < 2.6) {
        dragonLuckAt = performance.now() + 60000;
        state.score += 30;
        sfx.chestFound();
        sparkleBurst(dh.position, 0xd92b2b);
        popAt(dh.position, '+30');
        toast('🐉 舞龍隊俾咗你好運！(+30 分)', 3500);
        updateHUD();
      }
    }
    if (!bauhiniaFound) {
      bauhinia.rotation.y = t * 1.2;
      bauhinia.position.y = Math.sin(t * 2) * 0.12;
      if (state.phase === 'play' &&
          Math.hypot(bauhinia.position.x - girl.position.x, bauhinia.position.z - girl.position.z) < 1.8) {
        bauhiniaFound = true;
        bauhinia.visible = false;
        state.score += 200;
        sfx.firework();
        sparkleBurst(bauhinia.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0xffc83c);
        popAt(bauhinia.position, '+200');
        toast('💛 嘩！你搵到隱藏嘅金紫荊！(+200 分)', 4500);
        updateHUD();
      }
    }
  }

  animateGirl(girl, dt, speedFactor * (boosted ? 1.25 : 1));

  if (!window.__camLock) {
    if (state.wowUntil && now < state.wowUntil && state.wowChest) {
      const chest = state.wowChest.position;
      camTarget.set(chest.x, 6.2, chest.z - 8);
      camera.position.lerp(camTarget, Math.min(1, dt * 4));
      camera.lookAt(chest.x, 1.2, chest.z);
    } else {
      camOffset.copy(CAM_OFFSET);
      if (!settings.fixedCamera) {
        camOffset.y += cameraOrbit.pitch * 8;
        camOffset.applyAxisAngle(THREE.Object3D.DEFAULT_UP, cameraOrbit.yaw);
      }
      camTarget.copy(girl.position).add(camOffset);
      resolveCameraObstruction(camTarget);
      camera.position.lerp(camTarget, settings.smoothCamera ? Math.min(1, dt * 5) : 1);
      if (speedFactor > 0.2 && !settings.reducedMotion) {
        camera.position.y += Math.sin(t * 11) * 0.08 * speedFactor;
      }
      camera.lookAt(girl.position.x, girl.position.y + 1.55, girl.position.z);
    }
  }

  if (now - lastObjectiveUpdate >= GUIDANCE_UPDATE_INTERVAL) {
    lastObjectiveUpdate = now;
    updateObjectiveGuide();
    updateQuestBanner();
  }
  if (state.phase !== 'start' && now - lastMinimapUpdate >= MINIMAP_UPDATE_INTERVAL) {
    lastMinimapUpdate = now;
    hudView.drawMinimap({
      world, chests, player: girl, now,
      dog: dogFollowing ? dog : null,
      photos: PHOTO_SPOTS.filter(spot => !photoTaken.has(spot.name)),
    });
  }
  if (composer) composer.render();
  else renderer.render(scene, camera);
  const frameMs = performance.now() - frameStart;
  if (frameMs > 90) skipNextFrame = true;
  if (composer && frameMs > 120) {
    composer.dispose();
    composer = null;
  }
}

// Read-only landmark inspection views used for visual QA. Normal gameplay is
// unchanged; open /?inspect=clock (or space, pier, peninsula, isquare, k11)
// to review a remodelled object without walking across the whole map.
const inspectKey = new URLSearchParams(location.search).get('inspect');
const inspectViews = {
  clock:     { target: [-68, 18, 118], camera: [-68, 24, 80] },
  pier:      { target: [-86, 6, 120],  camera: [-86, 14, 90] },
  space:     { target: [-16, 8, 116],  camera: [-16, 16, 84] },
  peninsula: { target: [-24, 14, 82],  camera: [-24, 18, 114] },
  isquare:   { target: [-20, 22, 38],  camera: [10, 28, 6] },
  k11:       { target: [48, 16, 110],  camera: [90, 28, 68] },
  cultural:  { target: [-48, 8, 117],  camera: [-48, 16, 86] },
  heritage:  { target: [-46, 10, 84],  camera: [-24, 16, 110] },
  mosque:    { target: [-18, 10, -4],  camera: [10, 16, 24] },
  park:      { target: [-38, 3, -18],  camera: [-18, 12, 6] },
  ocean:     { target: [-108, 4, 48],  camera: [-88, 14, 72] },
  harbour:   { target: [-80, 10, 40],  camera: [-48, 22, 8] },
  dog:       { target: [-11, .6, -20],  camera: [-11, 4, -27], player: [-14, 0, -22], showHud: true },
  chest:     { target: [-68, 1, 110],   camera: [-68, 4, 102], player: [-65, 0, 107], showHud: true },
  npc:       { target: [-38, 1.5, -8],   camera: [-38, 4, -15], player: [-41, 0, -10], showHud: true },
};
if (inspectViews[inspectKey]) {
  const view = inspectViews[inspectKey];
  window.__camLock = true;
  $('start-screen').classList.add('hidden');
  if (!view.showHud) $('hud').classList.add('hidden');
  else $('hud').classList.remove('hidden');
  if (view.player) girl.position.set(...view.player);
  camera.position.set(...view.camera);
  camera.lookAt(...view.target);
}

window.__dg = {
  girl, chests, state, openChest, camera, renderer, scene, world, gpuCapabilities, rendererPreset,
  coins, stars, gifts, foodStalls, npcs, dog, luckyCat, quiz, MTR_STATIONS,
  doInteract, activatePointerTarget, checkPickups, rideMtr, showVictory, input, interactions,
  cameraOrbit, settings, album, STAMP_DEFS, PHOTO_SPOTS,
  get dogFollowing() { return dogFollowing; },
  get catRubbed() { return catRubbed; },
  get mtrBusy() { return mtrBusy; },
};
loop();
window.addEventListener('beforeunload', () => {
  quiz.dispose();
  world.systems.dispose();
  dialogAccessibility.dispose();
  stopAudio();
  disposeObject3D(scene);
  composer?.dispose();
  renderer.dispose();
}, { once: true });
