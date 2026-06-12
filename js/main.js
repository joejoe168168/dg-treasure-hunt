// ============================================================
// DG Treasure Hunt — main game engine
// ============================================================
import * as THREE from 'three';
import { createGirl, animateGirl } from './character.js';
import {
  createWorld, CHEST_SPOTS, STAR_SPOTS, GIFT_SPOTS, FOOD_STALLS, NPC_SPOTS, ROADS, MAP,
} from './world.js';
import { pickQuestions, resetQuestionPool, CATEGORIES, DIFFICULTIES } from './questions.js';
import { sfx, startBgm, toggleBgm } from './audio.js';
import {
  saveScore, loadBoard, renderBoard, fetchRemoteBoard, submitScore,
} from './leaderboard.js';

// ---------------- DOM ----------------
const $ = id => document.getElementById(id);
const canvas = $('game-canvas');
const startScreen = $('start-screen'), hud = $('hud');
const quizScreen = $('quiz-screen'), chestResult = $('chest-result');
const victoryScreen = $('victory-screen');
const nameInput = $('player-name'), startBtn = $('start-btn');
const interactPrompt = $('interact-prompt'), actionBtn = $('action-btn');
const toastEl = $('toast');

const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (isTouch) document.body.classList.add('touch-device');

// ---------------- renderer / scene / camera ----------------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 600);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------- world & player ----------------
const world = createWorld(scene);
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

const CAM_OFFSET = new THREE.Vector3(0, 9.5, -11.5);
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

  const glow = new THREE.PointLight(0xffc83c, 8, 12, 1.8);
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
  const lite = new THREE.PointLight(0xffd9a0, 3, 7, 2);
  lite.position.y = 2;
  g.add(lite);
  g.position.set(f.x, 0, f.z);
  scene.add(g);
  world.colliders.push({ minX: f.x - 1.2, maxX: f.x + 1.2, minZ: f.z - 0.8, maxZ: f.z + 0.8 });
  return { group: g, ...f, eaten: false, foodMesh: food };
});

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

// ---------------- sparkle particle bursts ----------------
const bursts = [];
function sparkleBurst(pos, color = 0xffd35c) {
  const n = 40;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(n * 3);
  const vels = [];
  for (let i = 0; i < n; i++) {
    positions.set([pos.x, pos.y + 1, pos.z], i * 3);
    const a = Math.random() * Math.PI * 2, up = 2 + Math.random() * 4;
    vels.push(new THREE.Vector3(Math.cos(a) * (1 + Math.random() * 2), up, Math.sin(a) * (1 + Math.random() * 2)));
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color, size: 0.28, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(pts);
  bursts.push({ pts, vels, life: 1.2 });
}
function updateBursts(dt) {
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    b.life -= dt;
    const pos = b.pts.geometry.attributes.position;
    for (let j = 0; j < b.vels.length; j++) {
      b.vels[j].y -= 9 * dt;
      pos.array[j * 3] += b.vels[j].x * dt;
      pos.array[j * 3 + 1] += b.vels[j].y * dt;
      pos.array[j * 3 + 2] += b.vels[j].z * dt;
    }
    pos.needsUpdate = true;
    b.pts.material.opacity = Math.max(0, b.life / 1.2);
    if (b.life <= 0) { scene.remove(b.pts); bursts.splice(i, 1); }
  }
}

// ---------------- game state ----------------
const state = {
  phase: 'start',         // start | play | quiz | result | victory
  playerName: '',
  difficulty: 'easy',
  score: 0,
  coinsCollected: 0,
  starsCollected: 0,
  chestsOpened: 0,
  streak: 0,              // consecutive correct answers across chests
  startTime: 0,
  nearChest: null,
  nearNpc: null,
  nearDog: false,
  boostUntil: 0,
  hitInvulnUntil: 0,
  dizzyUntil: 0,
  morning: true,
};

// ---------------- input ----------------
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyE' && state.phase === 'play') doInteract();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function doInteract() {
  if (state.nearChest) openChest(state.nearChest);
  else if (state.nearNpc) talkToNpc(state.nearNpc);
  else if (state.nearDog && !dogFollowing) adoptDog();
}

function adoptDog() {
  dogFollowing = true;
  state.score += 30;
  sfx.bark();
  sparkleBurst(dog.position, 0xc89058);
  toast('🐶 小狗好鍾意你！佢會跟住你一齊尋寶！(+30 分)', 4000);
  setPrompt(null);
  state.nearDog = false;
  updateHUD();
}

// virtual joystick
const joy = { active: false, dx: 0, dy: 0 };
const joyZone = $('joystick-zone'), joyBase = $('joystick-base'), joyKnob = $('joystick-knob');
joyZone.addEventListener('pointerdown', e => {
  joy.active = true;
  joy.id = e.pointerId;
  joyBase.style.display = 'block';
  joyBase.style.left = (e.clientX - 60) + 'px';
  joyBase.style.top = (e.clientY - 60) + 'px';
  joyBase.style.bottom = 'auto';
  joyZone.setPointerCapture(e.pointerId);
});
joyZone.addEventListener('pointermove', e => {
  if (!joy.active || e.pointerId !== joy.id) return;
  const rect = joyBase.getBoundingClientRect();
  const cx = rect.left + 60, cy = rect.top + 60;
  let dx = e.clientX - cx, dy = e.clientY - cy;
  const len = Math.hypot(dx, dy);
  if (len > 48) { dx = dx / len * 48; dy = dy / len * 48; }
  joyKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  joy.dx = dx / 48; joy.dy = dy / 48;
});
function joyEnd(e) {
  if (e.pointerId !== joy.id) return;
  joy.active = false; joy.dx = joy.dy = 0;
  joyKnob.style.transform = 'translate(-50%, -50%)';
  joyBase.style.display = 'none';
}
joyZone.addEventListener('pointerup', joyEnd);
joyZone.addEventListener('pointercancel', joyEnd);

actionBtn.addEventListener('click', () => {
  if (state.phase === 'play') doInteract();
});

// ---------------- movement & collision ----------------
const PLAYER_R = 0.45, SPEED = 9;
function tryMove(pos, dx, dz) {
  for (const [mx, mz] of [[dx, 0], [0, dz]]) {
    const nx = pos.x + mx, nz = pos.z + mz;
    let blocked = nx < MAP.minX || nx > MAP.maxX || nz < MAP.minZ || nz > MAP.maxZ;
    if (!blocked) {
      for (const c of world.colliders) {
        if (nx > c.minX - PLAYER_R && nx < c.maxX + PLAYER_R &&
            nz > c.minZ - PLAYER_R && nz < c.maxZ + PLAYER_R) { blocked = true; break; }
      }
    }
    if (!blocked) { pos.x = nx; pos.z = nz; }
  }
}

// ---------------- HUD ----------------
function updateHUD() {
  $('hud-score').textContent = `分數 Score: ${state.score}`;
  $('hud-chests').textContent = `寶箱 🎁 ${state.chestsOpened} / ${TOTAL_CHESTS}`;
  $('hud-coins').innerHTML = `💰 ${state.coinsCollected} &nbsp;⭐ ${state.starsCollected}`;
}
let toastTimer = null;
function toast(msg, ms = 2400) {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add('hidden'), ms);
}

// ---------------- minimap ----------------
const mm = $('minimap'), mmCtx = mm.getContext('2d');
function mapToMM(x, z) {
  return [
    (x - MAP.minX) / (MAP.maxX - MAP.minX) * mm.width,
    (z - MAP.minZ) / (MAP.maxZ - MAP.minZ) * mm.height,
  ];
}
function drawMinimap() {
  mmCtx.clearRect(0, 0, mm.width, mm.height);
  mmCtx.fillStyle = 'rgba(15,18,52,0.9)';
  mmCtx.fillRect(0, 0, mm.width, mm.height);
  mmCtx.fillStyle = '#16335e';
  const [, wy] = mapToMM(0, 124);
  mmCtx.fillRect(0, wy, mm.width, mm.height - wy);
  mmCtx.strokeStyle = '#4a5170';
  for (const r of ROADS) {
    mmCtx.lineWidth = Math.max(2, (r.vertical ? r.w : r.d) / 5);
    let a, b;
    if (r.vertical) { a = mapToMM(r.x, r.z - r.d / 2); b = mapToMM(r.x, r.z + r.d / 2); }
    else { a = mapToMM(r.x - r.w / 2, r.z); b = mapToMM(r.x + r.w / 2, r.z); }
    mmCtx.beginPath(); mmCtx.moveTo(a[0], a[1]); mmCtx.lineTo(b[0], b[1]); mmCtx.stroke();
  }
  for (const it of world.minimapItems) {
    const [x, y] = mapToMM(it.x, it.z);
    mmCtx.fillStyle = it.color;
    mmCtx.fillRect(x - it.r / 2, y - it.r / 2, it.r, it.r);
  }
  const pulse = 0.6 + Math.sin(performance.now() / 250) * 0.4;
  for (const ch of chests) {
    if (ch.userData.opened) continue;
    const [x, y] = mapToMM(ch.position.x, ch.position.z);
    mmCtx.fillStyle = `rgba(255, 211, 92, ${0.5 + pulse * 0.5})`;
    mmCtx.beginPath(); mmCtx.arc(x, y, 3.5 + pulse * 2, 0, 7); mmCtx.fill();
  }
  const [px, py] = mapToMM(girl.position.x, girl.position.z);
  mmCtx.fillStyle = '#ff8fb6';
  mmCtx.beginPath(); mmCtx.arc(px, py, 5, 0, 7); mmCtx.fill();
  mmCtx.strokeStyle = '#fff'; mmCtx.lineWidth = 2; mmCtx.stroke();
}

// ---------------- interactions: chest / npc prompts ----------------
function setPrompt(html) {
  if (html === null) {
    interactPrompt.classList.add('hidden');
    if (isTouch) actionBtn.classList.add('hidden');
  } else {
    interactPrompt.innerHTML = html;
    interactPrompt.classList.remove('hidden');
    if (isTouch) actionBtn.classList.remove('hidden');
  }
}

function nearestUnopenedChestHint() {
  let best = null, bestD = Infinity;
  for (const ch of chests) {
    if (ch.userData.opened) continue;
    const d = Math.hypot(ch.position.x - girl.position.x, ch.position.z - girl.position.z);
    if (d < bestD) { bestD = d; best = ch; }
  }
  return best ? best.userData.hint : null;
}

function talkToNpc(npc) {
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
const quiz = { questions: [], index: 0, correct: 0, earned: 0, timer: null, deadline: 0 };

function quizTime() { return DIFFICULTIES[state.difficulty].time; }
function quizMult() { return DIFFICULTIES[state.difficulty].mult; }

function openChest(chest) {
  state.phase = 'quiz';
  state.nearChest = null;
  state.nearNpc = null;
  setPrompt(null);
  sfx.chestFound();
  sparkleBurst(chest.position);

  quiz.chest = chest;
  quiz.questions = pickQuestions(3, state.difficulty);
  quiz.index = 0;
  quiz.correct = 0;
  quiz.earned = 0;
  quizScreen.classList.remove('hidden');
  showQuestion();
}

function showQuestion() {
  const q = quiz.questions[quiz.index];
  const cat = CATEGORIES[q.cat];
  const catEl = $('quiz-category');
  catEl.textContent = cat.label;
  catEl.className = `cat-badge ${cat.cls}`;
  $('quiz-progress').textContent = `第 ${quiz.index + 1} / 3 題`;
  $('quiz-question').textContent = q.q;
  $('quiz-feedback').className = 'hidden';

  const answersEl = $('quiz-answers');
  answersEl.innerHTML = '';
  q.a.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = text;
    btn.addEventListener('click', () => answer(i, btn));
    answersEl.appendChild(btn);
  });

  const T = quizTime();
  quiz.deadline = performance.now() + T * 1000;
  cancelAnimationFrame(quiz.timer);
  let lastTickSec = T;
  const tick = () => {
    const left = Math.max(0, quiz.deadline - performance.now());
    $('timer-bar').style.width = (left / (T * 1000) * 100) + '%';
    const leftSec = Math.ceil(left / 1000);
    if (leftSec <= 4 && leftSec < lastTickSec) { sfx.tick(); lastTickSec = leftSec; }
    if (left <= 0) { answer(-1, null); return; }
    quiz.timer = requestAnimationFrame(tick);
  };
  tick();
}

function answer(choice, btn) {
  cancelAnimationFrame(quiz.timer);
  const q = quiz.questions[quiz.index];
  const buttons = [...$('quiz-answers').children];
  buttons.forEach(b => b.disabled = true);
  buttons[q.c]?.classList.add('correct');

  const fb = $('quiz-feedback');
  const timeLeft = Math.max(0, (quiz.deadline - performance.now()) / 1000);

  if (choice === q.c) {
    const bonus = Math.round(timeLeft * 5);
    let pts = Math.round((100 + bonus) * quizMult());
    state.streak++;
    let streakText = '';
    if (state.streak >= 3) {
      const streakBonus = Math.round(state.streak * 10 * quizMult());
      pts += streakBonus;
      streakText = ` 🔥連續答對 ${state.streak} 題 +${streakBonus}!`;
    }
    quiz.correct++;
    quiz.earned += pts;
    state.score += pts;
    fb.textContent = `✅ 答對了！+${pts} 分${streakText}`;
    fb.className = 'good';
    sfx.correct();
  } else if (choice === -1) {
    state.streak = 0;
    fb.textContent = '⏰ 時間到 Time\'s up!';
    fb.className = 'bad';
    sfx.timeout();
  } else {
    state.streak = 0;
    btn?.classList.add('wrong');
    fb.textContent = '❌ 答錯了 Oops!';
    fb.className = 'bad';
    sfx.wrong();
  }
  updateHUD();

  setTimeout(() => {
    quiz.index++;
    if (quiz.index < quiz.questions.length) showQuestion();
    else finishChestQuiz();
  }, 1300);
}

function finishChestQuiz() {
  quizScreen.classList.add('hidden');

  let perfectBonus = 0;
  if (quiz.correct === 3) {
    perfectBonus = Math.round(150 * quizMult());
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
  chest.userData.opened = true;
  chest.userData.lid.rotation.x = -0.9;
  chest.userData.beacon.visible = false;
  chest.userData.glow.intensity = 2;
  chest.userData.glow.color.set(0x6688ff);
  state.chestsOpened++;
  sparkleBurst(chest.position, 0xff8fb6);

  state.phase = 'result';
  $('chest-result-emoji').textContent = quiz.correct === 3 ? '🌟' : quiz.correct >= 1 ? '🎉' : '😅';
  $('chest-result-title').textContent =
    quiz.correct === 3 ? '完美！Perfect!' : quiz.correct >= 1 ? '寶箱打開了！Chest Opened!' : '繼續努力 Keep Going!';
  $('chest-result-text').innerHTML =
    `📍 ${chest.userData.hint}<br>答對 ${quiz.correct} / 3 題 · 得到 <b>${quiz.earned}</b> 分` +
    (perfectBonus ? `<br>🌟 全對獎勵 Perfect Bonus +${perfectBonus}!` : '') +
    `<br>剩餘寶箱 Chests left: <b>${TOTAL_CHESTS - state.chestsOpened}</b>`;
  chestResult.classList.remove('hidden');
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
  submitScore(displayName, state.score, elapsed, state.difficulty).then((remote) => {
    if (remote && !autosaveNotified) {
      autosaveNotified = true;
      toast('💾 分數會自動儲存到 🌍 全球排行榜！');
    }
  });
}

$('chest-continue-btn').addEventListener('click', () => {
  sfx.click();
  chestResult.classList.add('hidden');
  autoSaveProgress();
  if (state.chestsOpened >= TOTAL_CHESTS) showVictory();
  else {
    state.phase = 'play';
    toast(`🎁 還有 ${TOTAL_CHESTS - state.chestsOpened} 個寶箱！跟住小地圖金點走！`);
  }
});

// ---------------- victory ----------------
function showVictory() {
  state.phase = 'victory';
  sfx.victory();
  const elapsed = Math.round((performance.now() - state.startTime) / 1000);
  const mins = Math.floor(elapsed / 60), secs = elapsed % 60;

  const timeBonus = Math.max(0, 900 - elapsed);
  state.score += timeBonus;

  const diff = DIFFICULTIES[state.difficulty];
  const displayName = `${diff.emoji} ${state.playerName}`;
  // auto-save: local immediately, then sync to the global board
  saveScore(displayName, state.score, elapsed);
  renderBoard($('victory-lb-list'), loadBoard(), displayName);
  submitScore(displayName, state.score, elapsed, state.difficulty).then((remote) => {
    if (remote) {
      renderBoard($('victory-lb-list'), remote, displayName);
      toast('🌍 分數已自動上載到全球排行榜！');
    }
  });

  $('victory-stats').innerHTML =
    `${state.playerName} 同學，做得好！(${diff.label})<br>` +
    `總分 Total Score: <b>${state.score}</b><br>` +
    `時間 Time: ${mins}:${String(secs).padStart(2, '0')} ` +
    (timeBonus ? `(速度獎勵 +${timeBonus})` : '') +
    `<br>金幣 💰 ${state.coinsCollected} · 金星 ⭐ ${state.starsCollected}`;
  victoryScreen.classList.remove('hidden');
}

$('replay-btn').addEventListener('click', () => location.reload());

// ---------------- start flow ----------------
renderBoard($('start-lb-list'), loadBoard());
fetchRemoteBoard().then((remote) => {
  if (remote && remote.length) renderBoard($('start-lb-list'), remote);
});
nameInput.addEventListener('input', () => {
  startBtn.disabled = nameInput.value.trim().length === 0;
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
  state.playerName = nameInput.value.trim();
  sfx.unlock();
  sfx.click();
  startBgm();
  resetQuestionPool();
  startScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  $('hud-name').textContent = `⭐ ${state.playerName} ${DIFFICULTIES[state.difficulty].emoji}`;
  state.phase = 'play';
  state.startTime = performance.now();
  updateHUD();
  toast('🗺️ 跟住小地圖嘅金色光點搵寶箱啦！沿途記得執金幣同金星！', 3600);
  if (isTouch && window.innerHeight > window.innerWidth) {
    $('orientation-hint').classList.remove('hidden');
    setTimeout(() => $('orientation-hint').classList.add('hidden'), 5000);
  }
});

// ---------------- pickups ----------------
function grantGift() {
  const roll = Math.random();
  if (roll < 0.4) { state.score += 50; toast('🎀 神秘禮物：+50 分！'); }
  else if (roll < 0.7) { state.score += 100; toast('🎀 神秘禮物：+100 分！勁呀！'); }
  else if (roll < 0.85) { state.score += 150; toast('🎀 神秘禮物：+150 分！！超勁！'); }
  else {
    state.boostUntil = performance.now() + 10000;
    toast('🎀 神秘禮物：⚡ 加速 10 秒！衝呀！');
  }
}

function checkPickups() {
  const gx = girl.position.x, gz = girl.position.z;
  for (const coin of coins) {
    if (coin.userData.taken) continue;
    if (Math.hypot(coin.position.x - gx, coin.position.z - gz) < 1.1) {
      coin.userData.taken = true;
      coin.visible = false;
      state.coinsCollected++;
      state.score += 10;
      sfx.coin();
      sparkleBurst(coin.position, 0xffe9a8);
    }
  }
  for (const star of stars) {
    if (star.userData.taken) continue;
    if (Math.hypot(star.position.x - gx, star.position.z - gz) < 1.3) {
      star.userData.taken = true;
      star.visible = false;
      state.starsCollected++;
      state.score += 25;
      sfx.coin();
      sfx.correct();
      sparkleBurst(star.position, 0xffe066);
      toast('⭐ 金星 +25 分！');
    }
  }
  for (const gift of gifts) {
    if (gift.userData.taken) continue;
    if (Math.hypot(gift.position.x - gx, gift.position.z - gz) < 1.4) {
      gift.userData.taken = true;
      gift.visible = false;
      sfx.chestFound();
      sparkleBurst(gift.position, 0xff8fb6);
      grantGift();
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
      sparkleBurst(new THREE.Vector3(f.x, 1, f.z), 0xffe9a8);
      toast(`😋 食咗${f.name}！+15 分，⚡加速 8 秒！`);
    }
  }
  updateHUD();
}

// ---------------- main loop ----------------
const clock = new THREE.Clock();
const camTarget = new THREE.Vector3();
let targetYaw = 0;

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  for (const fn of world.updatables) fn(dt, t);
  updateBursts(dt);

  for (const ch of chests) {
    if (!ch.userData.opened) {
      ch.position.y = Math.sin(t * 2 + ch.userData.index * 1.3) * 0.12 + 0.05;
      ch.rotation.y += dt * 0.6;
      ch.userData.glow.intensity = 7 + Math.sin(t * 4 + ch.userData.index) * 2.5;
    }
  }
  for (const coin of coins) if (!coin.userData.taken) coin.rotation.z += dt * 3;
  for (const star of stars) {
    if (star.userData.taken) continue;
    star.rotation.y += dt * 2;
    star.position.y = 1.4 + Math.sin(t * 2.4 + star.position.x) * 0.18;
  }
  for (const gift of gifts) {
    if (gift.userData.taken) continue;
    gift.rotation.y += dt * 1.4;
    gift.position.y = 1.3 + Math.sin(t * 2 + gift.position.z) * 0.2;
  }
  for (const npc of npcs) {
    animateGirl(npc.model, dt, 0);
    npc.model.rotation.y = npc.baseRot + Math.sin(t * 0.4 + npc.idx * 2) * 0.6;
    npc.bubble.scale.setScalar(1 + Math.sin(t * 3 + npc.idx) * 0.12);
  }

  // ---------------- player movement ----------------
  let speedFactor = 0;
  const boosted = performance.now() < state.boostUntil;
  boostRing.visible = boosted && state.phase === 'play';
  if (boosted) boostRing.rotation.z += dt * 4;

  if (state.phase === 'play') {
    let ix = 0, iz = 0;
    if (keys.KeyW || keys.ArrowUp) iz += 1;
    if (keys.KeyS || keys.ArrowDown) iz -= 1;
    if (keys.KeyA || keys.ArrowLeft) ix += 1;
    if (keys.KeyD || keys.ArrowRight) ix -= 1;
    if (joy.active) { ix = -joy.dx; iz = -joy.dy; }

    const len = Math.hypot(ix, iz);
    if (len > 0.15) {
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

    // traffic collision — watch out crossing the road!
    if (performance.now() > state.hitInvulnUntil) {
      for (const v of world.vehicles) {
        const dx = girl.position.x - v.group.position.x;
        const dz = girl.position.z - v.group.position.z;
        const d = Math.hypot(dx, dz);
        if (d < v.hitR) {
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
      if (ch.userData.opened) continue;
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
    if (nearChest !== state.nearChest || nearNpc !== state.nearNpc || nearDog !== state.nearDog) {
      state.nearChest = nearChest;
      state.nearNpc = nearNpc;
      state.nearDog = nearDog;
      if (nearChest) setPrompt('<span class="key-cap">E</span> 開寶箱 Open Chest!');
      else if (nearNpc) setPrompt('<span class="key-cap">E</span> 同同學傾偈 Talk!');
      else if (nearDog) setPrompt('<span class="key-cap">E</span> 摸吓小狗 Pet the puppy!');
      else setPrompt(null);
      actionBtn.textContent = nearChest ? '🎁' : nearDog ? '🐶' : '💬';
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

  animateGirl(girl, dt, speedFactor * (boosted ? 1.25 : 1));

  if (!window.__camLock) {
    camTarget.copy(girl.position).add(CAM_OFFSET);
    camera.position.lerp(camTarget, Math.min(1, dt * 5));
    camera.lookAt(girl.position.x, girl.position.y + 1.5, girl.position.z + 3);
  }

  if (state.phase !== 'start') drawMinimap();
  renderer.render(scene, camera);
}
loop();

// debug hook for automated testing
window.__dg = { girl, chests, state, openChest, camera };
