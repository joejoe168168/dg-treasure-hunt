// ============================================================
// Jordan / Tsim Sha Tsui at dusk, following the real street
// grid: Nathan Road spine, Jordan / Austin / Haiphong / Peking /
// Salisbury Roads, Canton Road, Temple Street and Chatham Road.
// Landmarks (iSQUARE, Chungking Mansions, K11 MUSEA, Peninsula,
// Space Museum, Mosque, St Andrew's, 1881, Harbour City, Clock
// Tower, Cultural Centre, Star Ferry, Avenue of Stars, MTR) are
// built in landmarks.js.   (+z = toward Victoria Harbour)
// ============================================================
import * as THREE from 'three';
import { addLandmarks, LANDMARK_ZONES } from './landmarks.js';
import { LOW_FX, pointLight } from './quality.js';

export const MAP = {
  minX: -98, maxX: 92,
  minZ: -106, maxZ: 130,     // beyond maxZ is the harbour
};

const rng = (() => { let s = 1337; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

// ------------------------------------------------------------
// canvas texture helpers
// ------------------------------------------------------------
export function buildingTexture(baseColor, litRatio = 0.55) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = baseColor;
  g.fillRect(0, 0, 128, 256);
  const litColors = ['#ffd97a', '#ffe9b8', '#9fd8ff', '#fff3d6'];
  for (let y = 8; y < 248; y += 22) {
    for (let x = 8; x < 120; x += 20) {
      if (Math.random() < litRatio) {
        g.fillStyle = litColors[(Math.random() * litColors.length) | 0];
        g.shadowColor = g.fillStyle; g.shadowBlur = 4;
      } else {
        g.fillStyle = '#10142e'; g.shadowBlur = 0;
      }
      g.fillRect(x, y, 13, 14);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function neonTexture(text, color, bg = 'rgba(8,8,24,0.92)') {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, 256, 128);
  g.strokeStyle = color; g.lineWidth = 5;
  g.strokeRect(6, 6, 244, 116);
  g.font = 'bold 52px "Microsoft JhengHei", sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = color; g.shadowBlur = 24;
  g.fillStyle = color;
  g.fillText(text, 128, 68);
  g.fillText(text, 128, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function roadTexture(vertical) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#262a38';
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#cfd35a'; g.lineWidth = 4;
  g.setLineDash([18, 14]);
  g.beginPath();
  if (vertical) { g.moveTo(64, 0); g.lineTo(64, 128); }
  else { g.moveTo(0, 64); g.lineTo(128, 64); }
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// the real street grid (game coordinates)
export const ROADS = [
  { name: '彌敦道 Nathan Rd',    x: 0,   z: 8,    w: 16,  d: 230, vertical: true },
  { name: '佐敦道 Jordan Rd',    x: -3,  z: -80,  w: 190, d: 13,  vertical: false },
  { name: '柯士甸道 Austin Rd',  x: -3,  z: -38,  w: 190, d: 12,  vertical: false },
  { name: '海防道 Haiphong Rd',  x: -3,  z: 8,    w: 190, d: 10,  vertical: false },
  { name: '北京道 Peking Rd',    x: -3,  z: 52,   w: 190, d: 10,  vertical: false },
  { name: '梳士巴利道 Salisbury',x: -3,  z: 98,   w: 190, d: 13,  vertical: false },
  { name: '廣東道 Canton Rd',    x: -62, z: 8,    w: 12,  d: 230, vertical: true },
  { name: '廟街 Temple St',      x: -28, z: -72,  w: 8,   d: 70,  vertical: true },
  { name: '漆咸道南 Chatham Rd', x: 60,  z: 8,    w: 12,  d: 230, vertical: true },
];

// ------------------------------------------------------------
export function createWorld(scene) {
  const world = {
    colliders: [],
    updatables: [],
    minimapItems: [],
    vehicles: [],        // moving traffic {group, hitR} — dodge them!
  };
  const addCollider = (x, z, w, d) =>
    world.colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });

  // ---------------- sky / fog / lights (day & night moods) ----------------
  const hemi = new THREE.HemisphereLight(0x6b7ad9, 0x3a3050, 1.4);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xbfd0ff, 1.2);
  moon.position.set(-60, 90, -40);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.left = -110; moon.shadow.camera.right = 110;
  moon.shadow.camera.top = 130; moon.shadow.camera.bottom = -110;
  moon.shadow.camera.far = 300;
  scene.add(moon);
  const warm = new THREE.DirectionalLight(0xffb070, 0.35);
  warm.position.set(50, 40, 60);
  scene.add(warm);

  scene.background = new THREE.Color();
  scene.fog = new THREE.Fog(0x1a1f4d, 70, 250);
  const nightOnly = [];     // stars, light beams… hidden in morning mode
  const tintables = { roads: [], ground: null, walk: null };   // ground materials to re-tint

  // 🌅 morning / 🌃 night — switchable any time
  world.setMorning = (on) => {
    if (on) {
      scene.background.set(0x9ec9ee);
      scene.fog.color.set(0xb9d4ea);
      scene.fog.near = 95; scene.fog.far = 330;
      hemi.color.set(0xcfe4ff); hemi.groundColor.set(0x9a9580); hemi.intensity = 2.2;
      moon.color.set(0xfff3da); moon.intensity = 2.6;   // the sun!
      moon.position.set(70, 110, 50);
      warm.intensity = 0.12;
      tintables.ground?.color.set(0x8e9388);
      tintables.walk?.color.set(0xa9aeb6);
      tintables.roads.forEach(m => m.color.setRGB(2.1, 2.1, 2.1));   // brighten road texture
    } else {
      scene.background.set(0x1a1f4d);
      scene.fog.color.set(0x1a1f4d);
      scene.fog.near = 70; scene.fog.far = 250;
      // mobile has no decorative lamps, so lift the ambient a little
      hemi.color.set(0x6b7ad9); hemi.groundColor.set(0x3a3050); hemi.intensity = LOW_FX ? 1.8 : 1.4;
      moon.color.set(0xbfd0ff); moon.intensity = 1.2;
      moon.position.set(-60, 90, -40);
      warm.intensity = 0.35;
      tintables.ground?.color.set(0x3a3f52);
      tintables.walk?.color.set(0x4d5266);
      tintables.roads.forEach(m => m.color.setRGB(1, 1, 1));
    }
    nightOnly.forEach(o => { o.visible = !on; });
    world.isMorning = on;
  };

  // stars
  {
    const n = 350, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2, r = 250 + rng() * 150;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = 60 + rng() * 180;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false }));
    scene.add(stars);
    nightOnly.push(stars);
  }

  // ---------------- ground ----------------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(280, 300),
    new THREE.MeshStandardMaterial({ color: 0x3a3f52, roughness: 1 }));
  tintables.ground = ground.material;
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, 10);
  ground.receiveShadow = true;
  scene.add(ground);

  // ---------------- roads ----------------
  for (const r of ROADS) {
    const tex = roadTexture(r.vertical);
    tex.repeat.set(Math.max(1, r.w / 14), Math.max(1, r.d / 14));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.d),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
    tintables.roads.push(m.material);
    m.rotation.x = -Math.PI / 2;
    m.position.set(r.x, 0.0, r.z);
    m.receiveShadow = true;
    scene.add(m);
  }

  // ---------------- generic building blocks (filler city fabric) ----------------
  const palette = ['#3d4668', '#54486a', '#475672', '#5a4f63', '#3f5a6e', '#62556e'];
  const blocks = [
    // west of Nathan
    { x0: -52, x1: -12, z0: -106, z1: -88 },
    { x0: -52, x1: -12, z0: -72, z1: -46 },
    { x0: -54, x1: -12, z0: 15, z1: 45 },
    { x0: -54, x1: -12, z0: 59, z1: 90 },
    // east of Nathan
    { x0: 12, x1: 52, z0: -106, z1: -88 },
    { x0: 12, x1: 52, z0: -72, z1: -46 },
    { x0: 12, x1: 52, z0: -30, z1: 1 },
    { x0: 12, x1: 52, z0: 15, z1: 45 },
    { x0: 12, x1: 52, z0: 59, z1: 90 },
    // east of Chatham
    { x0: 68, x1: 90, z0: -106, z1: -88 },
    { x0: 68, x1: 90, z0: -72, z1: -46 },
    { x0: 68, x1: 90, z0: -30, z1: 1 },
    { x0: 68, x1: 90, z0: 15, z1: 45 },
    { x0: 68, x1: 90, z0: 59, z1: 90 },
    // west of Canton (north of Harbour City)
    { x0: -96, x1: -70, z0: -106, z1: -88 },
    { x0: -96, x1: -70, z0: -72, z1: -46 },
    { x0: -96, x1: -70, z0: -30, z1: -6 },
  ];
  // areas that must stay clear (landmarks + chest spots, padded)
  const exclusions = [...LANDMARK_ZONES];
  for (const s of CHEST_SPOTS) {
    exclusions.push({ minX: s.x - 4, maxX: s.x + 4, minZ: s.z - 4, maxZ: s.z + 4 });
  }
  const overlapsExclusion = (x0, x1, z0, z1) =>
    exclusions.some(e => x0 < e.maxX && x1 > e.minX && z0 < e.maxZ && z1 > e.minZ);

  const buildMats = {};
  for (const b of blocks) {
    let cx = b.x0;
    while (cx < b.x1 - 6) {
      let cz = b.z0;
      const w = 9 + rng() * 8;
      while (cz < b.z1 - 6) {
        const d = 9 + rng() * 8;
        if (cx + w > b.x1 || cz + d > b.z1) break;
        if (!overlapsExclusion(cx, cx + w, cz, cz + d)) {
          const h = 14 + rng() * 30;
          const colorKey = palette[(rng() * palette.length) | 0] + ((rng() * 3) | 0);
          if (!buildMats[colorKey]) {
            buildMats[colorKey] = new THREE.MeshStandardMaterial({
              map: buildingTexture(colorKey.slice(0, 7)),
              roughness: 0.9,
            });
          }
          const bld = new THREE.Mesh(new THREE.BoxGeometry(w - 2.5, h, d - 2.5), buildMats[colorKey]);
          bld.position.set(cx + w / 2, h / 2, cz + d / 2);
          bld.castShadow = bld.receiveShadow = true;
          scene.add(bld);
          addCollider(cx + w / 2, cz + d / 2, w - 2.2, d - 2.2);
          world.minimapItems.push({ x: cx + w / 2, z: cz + d / 2, color: '#3a4470', r: 3 });
          if (rng() < 0.4) {
            const tank = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2, 8),
              new THREE.MeshStandardMaterial({ color: 0x8a8d9c }));
            tank.position.set(cx + w / 2 + (rng() - 0.5) * 3, h + 1, cz + d / 2 + (rng() - 0.5) * 3);
            scene.add(tank);
          }
        }
        cz += d + 1.5;
      }
      cx += w + 1.5;
    }
  }

  // ---------------- neon signs over Nathan Road ----------------
  const neonDefs = [
    { text: '金行', color: '#ffd35c' }, { text: '茶餐廳', color: '#ff7eb6' },
    { text: '藥房', color: '#7dffb2' }, { text: '麻雀', color: '#ff5c5c' },
    { text: 'KARAOKE', color: '#7db8ff' }, { text: '海鮮酒家', color: '#ffae42' },
    { text: '佐敦', color: '#c792ff' }, { text: '尖沙咀', color: '#5cffe8' },
    { text: '涼茶', color: '#aaff5c' }, { text: '錶行', color: '#ff8a5c' },
    { text: '找換店', color: '#ffd35c' }, { text: '餐廳', color: '#7db8ff' },
  ];
  neonDefs.forEach((n, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const z = -98 + i * 16;
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 3.5),
      new THREE.MeshBasicMaterial({ map: neonTexture(n.text, n.color), side: THREE.DoubleSide }));
    sign.position.set(side * 9.5, 8 + (i % 3) * 3, z);
    sign.rotation.y = -side * Math.PI / 2;
    scene.add(sign);
    const pole = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.3, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x555a6e }));
    pole.position.set(side * 12, sign.position.y + 1.6, z);
    scene.add(pole);
    const glow = pointLight(new THREE.Color(n.color), 6, 18, 1.8);
    glow.position.set(side * 8.5, sign.position.y, z);
    scene.add(glow);
    world.updatables.push((dt, t) => {
      glow.intensity = 5 + Math.sin(t * 3 + i * 1.7) * 1.5 + (Math.sin(t * 23 + i * 9) > 0.93 ? -3 : 0);
    });
  });

  // ---------------- street lamps along Nathan & Salisbury ----------------
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x3c4254 });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0 });
  const placeLamp = (x, z, facing) => {
    const lamp = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6, 6), lampMat);
    post.position.y = 3;
    lamp.add(post);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), bulbMat);
    bulb.position.set(facing * -1.2, 6, 0);
    lamp.add(bulb);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.12), lampMat);
    arm.position.set(facing * -0.6, 6.1, 0);
    lamp.add(arm);
    lamp.position.set(x, 0, z);
    scene.add(lamp);
    const lite = pointLight(0xffc878, 6, 16, 2);
    lite.position.set(x + facing * -1.2, 5.6, z);
    scene.add(lite);
  };
  for (let z = -95; z <= 90; z += 26) {
    placeLamp(10.5, z, 1);
    placeLamp(-10.5, z, -1);
  }
  for (let x = -90; x <= 85; x += 30) {
    if (Math.abs(x) > 12) placeLamp(x, 92, 1);
  }

  // ---------------- Kowloon Park (west of Nathan, by Haiphong Rd) ----------------
  {
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(40, 32),
      new THREE.MeshStandardMaterial({ color: 0x2f6b3c, roughness: 1 }));
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(-33, 0.02, -15);
    grass.receiveShadow = true;
    scene.add(grass);
    world.minimapItems.push({ x: -33, z: -15, color: '#2f6b3c', r: 12 });

    const trunkM = new THREE.MeshStandardMaterial({ color: 0x6b4a2e });
    const leafM = new THREE.MeshToonMaterial({ color: 0x3e9c4f });
    const leafM2 = new THREE.MeshToonMaterial({ color: 0x57b569 });
    for (let i = 0; i < 16; i++) {
      const tx = -50 + rng() * 33, tz = -29 + rng() * 27;
      if (Math.hypot(tx + 33, tz + 10) < 6.5) continue;  // keep pond clear
      if (tx > -27 && tz > -13) continue;                // keep mosque corner clear
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.2, 6), trunkM);
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      tree.add(trunk);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.5 + rng(), 8, 7), rng() > 0.5 ? leafM : leafM2);
      crown.position.y = 2.8 + rng() * 0.8;
      crown.castShadow = true;
      tree.add(crown);
      tree.position.set(tx, 0, tz);
      scene.add(tree);
      addCollider(tx, tz, 1.0, 1.0);
    }
    // flamingo pond
    const pond = new THREE.Mesh(new THREE.CircleGeometry(5, 20),
      new THREE.MeshStandardMaterial({ color: 0x3a7fc4, roughness: 0.2, metalness: 0.4 }));
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(-33, 0.04, -10);
    scene.add(pond);
    for (let i = 0; i < 5; i++) {
      const fl = new THREE.Group();
      const bodyF = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), new THREE.MeshToonMaterial({ color: 0xff8fb6 }));
      bodyF.position.y = 0.7; bodyF.scale.set(1.2, 1, 1);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6), new THREE.MeshToonMaterial({ color: 0xff8fb6 }));
      neck.position.set(0.25, 1.05, 0); neck.rotation.z = -0.4;
      const legF = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 4), new THREE.MeshToonMaterial({ color: 0xe06a90 }));
      legF.position.y = 0.35;
      fl.add(bodyF, neck, legF);
      const a = rng() * Math.PI * 2, r = 2 + rng() * 2.4;
      fl.position.set(-33 + Math.cos(a) * r, 0, -10 + Math.sin(a) * r);
      fl.rotation.y = rng() * Math.PI * 2;
      scene.add(fl);
    }
    // park gate sign
    const gate = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 0.4),
      new THREE.MeshToonMaterial({ color: 0x2d6b4f }));
    gate.position.set(-14, 3.4, -15);
    scene.add(gate);
    for (const gz of [-17.4, -12.6]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 3.4, 8),
        new THREE.MeshToonMaterial({ color: 0x2d6b4f }));
      post.position.set(-14, 1.7, gz);
      scene.add(post);
    }
  }

  // ---------------- Temple Street night market (west, north of Austin) ----------------
  {
    // red paifang gate at the entrance
    const red = new THREE.MeshToonMaterial({ color: 0xc23a3a });
    const gold = new THREE.MeshToonMaterial({ color: 0xe8b54a });
    const gate = new THREE.Group();
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 7, 8), red);
      pillar.position.set(side * 4.5, 3.5, 0);
      gate.add(pillar);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(11, 1.2, 1), red);
    beam.position.y = 7;
    gate.add(beam);
    const roofG = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.6, 2), gold);
    roofG.position.y = 7.9;
    gate.add(roofG);
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 1.4),
      new THREE.MeshBasicMaterial({ map: neonTexture('廟街', '#ffd35c', '#7a1f1f') }));
    plaque.position.set(0, 6.95, 1.05);
    gate.add(plaque);
    gate.position.set(-28, 0, -44);
    scene.add(gate);
    addCollider(-32.5, -44, 1.2, 1.2);
    addCollider(-23.5, -44, 1.2, 1.2);

    const canopyColors = [0xc94f4f, 0x3f9e5a, 0xd8a23c, 0x4f6fc9];
    for (let i = 0; i < 8; i++) {
      const z = -98 + i * 6.5;
      const stall = new THREE.Group();
      const table = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 2),
        new THREE.MeshStandardMaterial({ color: 0x7a5a3a }));
      table.position.y = 0.5;
      table.castShadow = true;
      stall.add(table);
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 2.6),
        new THREE.MeshToonMaterial({ color: canopyColors[i % 4] }));
      canopy.position.y = 2.4;
      stall.add(canopy);
      for (const [px, pz] of [[-1.6, -1.1], [1.6, -1.1], [-1.6, 1.1], [1.6, 1.1]]) {
        const legS = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 5),
          new THREE.MeshStandardMaterial({ color: 0x555555 }));
        legS.position.set(px, 1.2, pz);
        stall.add(legS);
      }
      const goods = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 1.5),
        new THREE.MeshBasicMaterial({ color: [0xffd35c, 0xff8fb6, 0x7dffb2][i % 3] }));
      goods.position.y = 1.2;
      stall.add(goods);
      const sx = i % 2 === 0 ? -33.5 : -22.5;
      stall.position.set(sx, 0, z);
      scene.add(stall);
      addCollider(sx, z, 3.4, 2.4);
      const stallLight = pointLight(0xffd9a0, 4, 9, 2);
      stallLight.position.set(sx, 2, z);
      scene.add(stallLight);
    }
  }

  // ---------------- landmarks (the real TST icons) ----------------
  addLandmarks(scene, world, { buildingTexture });

  // ---------------- harbour promenade + water + HK Island skyline ----------------
  {
    const prom = new THREE.Mesh(new THREE.PlaneGeometry(230, 26),
      new THREE.MeshStandardMaterial({ color: 0x55505e, roughness: 1 }));
    prom.rotation.x = -Math.PI / 2;
    prom.position.set(-3, 0.02, 118);
    prom.receiveShadow = true;
    scene.add(prom);

    const railM = new THREE.MeshStandardMaterial({ color: 0x8aa0b8, metalness: 0.6, roughness: 0.4 });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(230, 0.1, 0.1), railM);
    rail.position.set(-3, 1.05, 129.5);
    scene.add(rail);
    for (let x = -115; x <= 110; x += 4) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.05, 5), railM);
      p.position.set(x, 0.53, 129.5);
      scene.add(p);
    }

    const waterGeo = new THREE.PlaneGeometry(340, 120, 60, 24);
    const water = new THREE.Mesh(waterGeo,
      new THREE.MeshStandardMaterial({ color: 0x16335e, roughness: 0.15, metalness: 0.55, flatShading: true }));
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.25, 190);
    scene.add(water);
    const wPos = waterGeo.attributes.position;
    const wBase = wPos.array.slice();
    world.updatables.push((dt, t) => {
      for (let i = 0; i < wPos.count; i++) {
        const x = wBase[i * 3], y = wBase[i * 3 + 1];
        wPos.array[i * 3 + 2] = Math.sin(x * 0.12 + t * 1.3) * 0.35 + Math.cos(y * 0.2 + t * 0.9) * 0.3;
      }
      wPos.needsUpdate = true;
    });

    // HK Island skyline across the water
    for (let i = 0; i < 26; i++) {
      const w = 6 + rng() * 10, h = 18 + rng() * 45;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 8),
        new THREE.MeshStandardMaterial({
          map: buildingTexture('#1c2247', 0.7),
          emissive: 0x0c1030, roughness: 0.9,
        }));
      b.position.set(-130 + i * 10.5 + rng() * 4, h / 2 - 2, 248 + rng() * 14);
      scene.add(b);
    }
    const ifc = new THREE.Mesh(new THREE.CylinderGeometry(4, 5.5, 75, 8),
      new THREE.MeshStandardMaterial({ map: buildingTexture('#283460', 0.8), roughness: 0.85 }));
    ifc.position.set(-60, 35, 254);
    scene.add(ifc);

    // "Symphony of Lights" — sweeping searchlight beams from the island skyline
    const beamColors = [0x7db8ff, 0xff8fb6, 0x7dffb2, 0xffd35c, 0xc792ff];
    for (let i = 0; i < 5; i++) {
      const beamGeo = new THREE.CylinderGeometry(0.4, 4, 150, 8, 1, true);
      beamGeo.translate(0, 75, 0);   // pivot at the base so it sweeps from the rooftop
      const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
        color: beamColors[i], transparent: true, opacity: 0.10,
        side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      beam.position.set(-110 + i * 55, 40 + (i % 3) * 12, 250);
      scene.add(beam);
      nightOnly.push(beam);
      const phase = i * 1.3;
      world.updatables.push((dt, t) => {
        beam.rotation.z = Math.sin(t * 0.35 + phase) * 0.55;
        beam.rotation.x = -0.5 + Math.cos(t * 0.22 + phase) * 0.25;
        beam.material.opacity = 0.08 + Math.abs(Math.sin(t * 0.5 + phase)) * 0.06;
      });
    }

    // Star Ferry crossing the harbour
    const ferry = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(7, 1.4, 2.6), new THREE.MeshToonMaterial({ color: 0x1d4d33 }));
    hull.position.y = 0.7;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.2, 2.2), new THREE.MeshToonMaterial({ color: 0xf5f2e8 }));
    deck.position.y = 2;
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 1.4, 8), new THREE.MeshToonMaterial({ color: 0xf5f2e8 }));
    funnel.position.y = 3.2;
    ferry.add(hull, deck, funnel);
    ferry.position.set(0, 0, 165);
    scene.add(ferry);
    world.updatables.push((dt, t) => {
      ferry.position.x = Math.sin(t * 0.07) * 90;
      ferry.position.y = Math.sin(t * 1.1) * 0.18;
      ferry.rotation.y = Math.cos(t * 0.07) > 0 ? Math.PI : 0;
    });

    // junk boat with red sails — classic harbour sight
    const junk = new THREE.Group();
    const jHull = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 2.2), new THREE.MeshToonMaterial({ color: 0x4a2e1a }));
    jHull.position.y = 0.6;
    junk.add(jHull);
    const sailM = new THREE.MeshToonMaterial({ color: 0xc23a3a, side: THREE.DoubleSide });
    for (const [sx, sh] of [[-1.6, 2.6], [0.2, 3.6], [1.9, 2.2]]) {
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(2, sh), sailM);
      sail.position.set(sx, 1.4 + sh / 2, 0);
      junk.add(sail);
    }
    junk.position.set(40, 0, 175);
    scene.add(junk);
    world.updatables.push((dt, t) => {
      junk.position.x = 50 + Math.sin(t * 0.045 + 2) * 70;
      junk.position.y = Math.sin(t * 0.9 + 1) * 0.15;
      junk.rotation.y = Math.cos(t * 0.045 + 2) > 0 ? Math.PI : 0;
    });
  }

  // ---------------- traffic: taxis, double-deckers & HK minibuses ----------------
  const wheelM = new THREE.MeshStandardMaterial({ color: 0x14141a });
  function addWheels(g, positions, r = 0.32) {
    for (const [wx, wz] of positions) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.25, 10), wheelM);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, r, wz);
      g.add(wheel);
    }
  }
  function makeTaxi(color = 0xd23a3a) {
    const taxi = new THREE.Group();
    const bodyT = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 4.2), new THREE.MeshToonMaterial({ color }));
    bodyT.position.y = 0.65;
    bodyT.castShadow = true;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 2.2), new THREE.MeshToonMaterial({ color: 0xf0f0ec }));
    cab.position.y = 1.2;
    const lightBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0xfff2b0 }));
    lightBox.position.y = 1.6;
    taxi.add(bodyT, cab, lightBox);
    addWheels(taxi, [[-0.95, 1.4], [0.95, 1.4], [-0.95, -1.4], [0.95, -1.4]]);
    const head = pointLight(0xfff0c0, 3, 9, 2);
    head.position.set(0, 0.8, 2.4);
    taxi.add(head);
    return taxi;
  }
  // HK public light bus: cream body with red or green roof band
  function makeMinibus(topColor = 0xc23a3a) {
    const bus = new THREE.Group();
    const bodyB = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.5, 5.2), new THREE.MeshToonMaterial({ color: 0xf2eee0 }));
    bodyB.position.y = 1.15;
    bodyB.castShadow = true;
    bus.add(bodyB);
    const band = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.45, 5.25), new THREE.MeshToonMaterial({ color: topColor }));
    band.position.y = 1.75;
    bus.add(band);
    const windows = new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.5, 3.8), new THREE.MeshBasicMaterial({ color: 0x9fd8ff }));
    windows.position.set(0, 1.35, -0.3);
    bus.add(windows);
    addWheels(bus, [[-1.0, 1.8], [1.0, 1.8], [-1.0, -1.8], [1.0, -1.8]]);
    const head = pointLight(0xfff0c0, 3, 9, 2);
    head.position.set(0, 0.8, 2.9);
    bus.add(head);
    return bus;
  }
  // KMB-style red double-decker
  function makeDoubleDecker() {
    const bus = new THREE.Group();
    const bodyB = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.6, 8), new THREE.MeshToonMaterial({ color: 0xcc2233 }));
    bodyB.position.y = 2.1;
    bodyB.castShadow = true;
    bus.add(bodyB);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.5, 8.05), new THREE.MeshToonMaterial({ color: 0xf5f2e8 }));
    stripe.position.y = 2.15;
    bus.add(stripe);
    for (const wy of [1.2, 3.1]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(2.46, 0.6, 6.5), new THREE.MeshBasicMaterial({ color: 0xffe9b8 }));
      win.position.y = wy;
      bus.add(win);
    }
    addWheels(bus, [[-1.1, 2.6], [1.1, 2.6], [-1.1, -2.6], [1.1, -2.6]], 0.45);
    const head = pointLight(0xfff0c0, 3, 10, 2);
    head.position.set(0, 0.8, 4.2);
    bus.add(head);
    return bus;
  }

  // vehicles are faster than the girl (walk speed 9) — dodge carefully!
  const routes = [
    // Nathan Road — the busy spine
    { make: () => makeTaxi(),            vertical: true,  fixed: -4,  from: -100, to: 92,  speed: 16,   hitR: 2.3 },
    { make: () => makeDoubleDecker(),    vertical: true,  fixed: 4,   from: 92,  to: -100, speed: 11.5, hitR: 3.4 },
    { make: () => makeTaxi(),            vertical: true,  fixed: -4,  from: -100, to: 92,  speed: 13,   hitR: 2.3, offset: 0.5 },
    // Jordan Road — red minibus (HK minibuses are famously quick)
    { make: () => makeMinibus(0xc23a3a), vertical: false, fixed: -77, from: -90, to: 88,  speed: 15,   hitR: 2.6 },
    // Austin Road — taxi
    { make: () => makeTaxi(),            vertical: false, fixed: -35, from: 88,  to: -90,  speed: 14,   hitR: 2.3 },
    // Salisbury Road — green minibus
    { make: () => makeMinibus(0x3f9e5a), vertical: false, fixed: 101, from: -90, to: 88,  speed: 14.5, hitR: 2.6 },
    // Canton Road — taxi + double-decker
    { make: () => makeTaxi(),            vertical: true,  fixed: -60, from: -100, to: 90,  speed: 14.5, hitR: 2.3 },
    { make: () => makeDoubleDecker(),    vertical: true,  fixed: -63, from: 90,  to: -100, speed: 10.5, hitR: 3.4 },
  ];
  routes.forEach((r) => {
    const v = r.make();
    scene.add(v);
    let prog = (rng() + (r.offset || 0)) % 1;
    world.updatables.push((dt) => {
      prog = (prog + dt * r.speed / Math.abs(r.to - r.from)) % 1;
      const c = r.from + (r.to - r.from) * prog;
      if (r.vertical) {
        v.position.set(r.fixed, 0, c);
        v.rotation.y = r.to > r.from ? 0 : Math.PI;
      } else {
        v.position.set(c, 0, r.fixed);
        v.rotation.y = r.to > r.from ? Math.PI / 2 : -Math.PI / 2;
      }
    });
    world.vehicles.push({ group: v, hitR: r.hitR });
  });

  // ---------------- zebra crossings at Nathan Rd intersections ----------------
  const zebraTex = (() => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 64;
    const g = c.getContext('2d');
    g.fillStyle = '#262a38'; g.fillRect(0, 0, 128, 64);
    g.fillStyle = '#e8e8e0';
    for (let x = 4; x < 128; x += 24) g.fillRect(x, 4, 13, 56);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const zebraM = new THREE.MeshStandardMaterial({ map: zebraTex, roughness: 0.95 });
  const crossings = [
    // across Nathan Rd (north & south side of each junction)
    [0, -89.5, 16, 4, 0], [0, -70.5, 16, 4, 0],
    [0, -47, 16, 4, 0], [0, -29, 16, 4, 0],
    [0, 0, 16, 4, 0], [0, 16, 16, 4, 0],
    [0, 44, 16, 4, 0], [0, 60, 16, 4, 0],
    [0, 88.5, 16, 4, 0],
    // across Canton Rd at Salisbury & Haiphong
    [-62, 88.5, 12, 4, 0], [-62, 16, 12, 4, 0],
    // across Jordan Rd at Temple St
    [-28, -80, 4, 13, 0],
  ];
  for (const [cx, cz, cw, cd] of crossings) {
    const zc = new THREE.Mesh(new THREE.PlaneGeometry(cw, cd), zebraM);
    zc.rotation.x = -Math.PI / 2;
    if (cd > cw) zc.rotation.z = Math.PI / 2;
    zc.position.set(cx, 0.015, cz);
    zc.receiveShadow = true;
    scene.add(zc);
  }

  // ---------------- raised sidewalks flanking Nathan Road ----------------
  const walkM = new THREE.MeshStandardMaterial({ color: 0x4d5266, roughness: 1 });
  tintables.walk = walkM;
  const nathanSegs = [[-106, -88], [-72.5, -45.5], [-30.5, 1.5], [14.5, 45.5], [58.5, 90]];
  for (const [z0, z1] of nathanSegs) {
    for (const side of [-1, 1]) {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, z1 - z0), walkM);
      sw.position.set(side * 9.8, 0.06, (z0 + z1) / 2);
      sw.receiveShadow = true;
      scene.add(sw);
    }
  }

  // ================== HK street-life props ==================

  // ---- pedestrian crossing lights (red/green man, synchronised) ----
  {
    const poleM = new THREE.MeshToonMaterial({ color: 0x3c4150 });
    const redM = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
    const grnM = new THREE.MeshBasicMaterial({ color: 0x144528 });
    const spots = [[8.6, -89.5], [-8.6, -70.5], [8.6, 0], [-8.6, 16], [8.6, 60], [-8.6, 88.5]];
    for (const [px, pz] of spots) {
      const g = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.6, 8), poleM);
      pole.position.y = 1.3; g.add(pole);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, 0.3), poleM);
      box.position.y = 2.95; g.add(box);
      const red = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.24), redM);
      red.position.set(0, 3.16, 0.16);
      const grn = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.24), grnM);
      grn.position.set(0, 2.78, 0.16);
      g.add(red, grn);
      g.rotation.y = px > 0 ? -Math.PI / 2 : Math.PI / 2;
      g.position.set(px, 0, pz);
      scene.add(g);
    }
    world.updatables.push((dt, t) => {
      const phase = t % 14;
      const green = phase > 7;
      const flash = green && phase > 12 && Math.sin(t * 18) > 0;
      grnM.color.set(green && !flash ? 0x35e06a : 0x144528);
      redM.color.set(green ? 0x4a1410 : 0xff3b30);
    });
  }

  // ---- bamboo scaffolding on a building "under renovation" ----
  {
    const g = new THREE.Group();
    const bld = new THREE.Mesh(new THREE.BoxGeometry(8, 15, 8),
      new THREE.MeshStandardMaterial({ color: 0x6e6a72, roughness: 1 }));
    bld.position.y = 7.5; bld.castShadow = true; g.add(bld);
    const bambooM = new THREE.MeshToonMaterial({ color: 0xd6b878 });
    for (let i = 0; i <= 5; i++) {            // verticals on two faces
      for (const face of [[i * 1.9 - 4.75, 4.85], [4.85, i * 1.9 - 4.75]]) {
        const v = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 15.6, 5), bambooM);
        v.position.set(face[0], 7.8, face[1]);
        g.add(v);
      }
    }
    for (let j = 0; j <= 6; j++) {            // horizontals
      const h1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 10, 5), bambooM);
      h1.rotation.z = Math.PI / 2;
      h1.position.set(0, 1 + j * 2.4, 4.85);
      const h2 = h1.clone();
      h2.rotation.set(Math.PI / 2, 0, 0);
      h2.position.set(4.85, 1 + j * 2.4, 0);
      g.add(h1, h2);
    }
    const net = new THREE.Mesh(new THREE.PlaneGeometry(10, 15.6),
      new THREE.MeshBasicMaterial({ color: 0x2a6e4a, transparent: true, opacity: 0.32, side: THREE.DoubleSide }));
    net.position.set(0, 7.8, 5.05); g.add(net);
    const net2 = net.clone();
    net2.rotation.y = Math.PI / 2;
    net2.position.set(5.05, 7.8, 0); g.add(net2);
    g.position.set(24, 0, -56);
    scene.add(g);
    addCollider(24, -56, 10.6, 10.6);
  }

  // ---- hanging laundry across Temple Street ----
  {
    const clothColors = [0xff8fb6, 0x7db8ff, 0xfff2b0, 0x9be89b, 0xe8e8e8];
    const cloths = [];
    for (const lz of [-56, -74, -92]) {
      const line = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 9.4, 4),
        new THREE.MeshBasicMaterial({ color: 0x999999 }));
      line.rotation.z = Math.PI / 2;
      line.position.set(-28, 6.8, lz);
      scene.add(line);
      for (let i = 0; i < 4; i++) {
        const c = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.5),
          new THREE.MeshToonMaterial({ color: clothColors[(i + lz) & 3], side: THREE.DoubleSide }));
        c.position.set(-31.4 + i * 2.2, 6.0, lz);
        scene.add(c);
        cloths.push({ c, ph: i * 1.4 + lz });
      }
    }
    world.updatables.push((dt, t) => {
      for (const { c, ph } of cloths) c.rotation.x = Math.sin(t * 1.6 + ph) * 0.35;
    });
  }

  // ---- Tin Hau Temple (天后廟, by the Temple St market) ----
  {
    const g = new THREE.Group();
    const red = new THREE.MeshToonMaterial({ color: 0xa83232 });
    const roofM = new THREE.MeshToonMaterial({ color: 0x2d6b4f });
    const base = new THREE.Mesh(new THREE.BoxGeometry(12, 0.6, 9),
      new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 1 }));
    base.position.y = 0.3; g.add(base);
    const hall = new THREE.Mesh(new THREE.BoxGeometry(10, 4.4, 7), red);
    hall.position.y = 2.8; hall.castShadow = true; g.add(hall);
    for (const cx of [-4.2, 4.2]) {           // gold-trimmed columns
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 4.4, 8),
        new THREE.MeshToonMaterial({ color: 0xe8b54a }));
      col.position.set(cx, 2.8, 3.6); g.add(col);
    }
    // sloped roof: two tilted slabs meeting at a ridge
    for (const s of [-1, 1]) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.25, 4.6), roofM);
      slab.rotation.x = s * 0.42;
      slab.position.set(0, 5.85, s * 2.05);
      slab.castShadow = true;
      g.add(slab);
    }
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.4, 0.5), roofM);
    ridge.position.y = 6.75; g.add(ridge);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.2),
      new THREE.MeshBasicMaterial({ map: neonTexture('天后廟', '#ffd35c') }));
    sign.position.set(0, 4.4, 3.56); g.add(sign);
    // incense smoke wisp
    const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.3 }));
    smoke.position.set(3, 4, 4.4); g.add(smoke);
    world.updatables.push((dt, t) => {
      smoke.position.y = 4 + ((t * 0.5) % 2.4);
      smoke.material.opacity = 0.32 - ((t * 0.5) % 2.4) * 0.12;
      smoke.scale.setScalar(1 + ((t * 0.5) % 2.4) * 0.45);
    });
    g.position.set(-44, 0, -96);
    scene.add(g);
    addCollider(-44, -96, 12.5, 9.5);
  }

  // ---- sightseeing helicopter circling the harbour ----
  {
    const heli = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8),
      new THREE.MeshToonMaterial({ color: 0xe8e2d8 }));
    body.scale.set(1.5, 0.85, 0.9); heli.add(body);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.3, 3.4, 6),
      new THREE.MeshToonMaterial({ color: 0xc23a3a }));
    tail.rotation.z = Math.PI / 2;
    tail.position.x = -2.5; heli.add(tail);
    const rotor = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.07, 0.32),
      new THREE.MeshToonMaterial({ color: 0x333845 }));
    rotor.position.y = 1.1; heli.add(rotor);
    const blink = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff4040 }));
    blink.position.y = -0.95; heli.add(blink);
    scene.add(heli);
    world.updatables.push((dt, t) => {
      const a = t * 0.1;
      heli.position.set(Math.sin(a) * 95, 36 + Math.sin(t * 0.7) * 1.5, 150 + Math.cos(a) * 38);
      heli.rotation.y = -a;                  // nose along the flight path
      rotor.rotation.y = t * 22;
      blink.material.color.set(Math.sin(t * 6) > 0 ? 0xff4040 : 0x401010);
    });
  }

  // ---- seagulls wheeling over the promenade ----
  {
    const gullM = new THREE.MeshToonMaterial({ color: 0xf2f4f8 });
    const gulls = [];
    for (let i = 0; i < 5; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), gullM);
      body.scale.set(1.6, 0.8, 1); g.add(body);
      for (const s of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.85), gullM);
        wing.position.z = s * 0.5;
        g.add(wing);
        (s < 0 ? (g.userData.wl = wing) : (g.userData.wr = wing));
      }
      scene.add(g);
      gulls.push({ g, r: 9 + i * 3.5, h: 9 + (i % 3) * 2.5, sp: 0.5 + (i % 2) * 0.22, ph: i * 1.3 });
    }
    world.updatables.push((dt, t) => {
      for (const u of gulls) {
        const a = t * u.sp + u.ph;
        u.g.position.set(Math.cos(a) * u.r, u.h + Math.sin(t * 1.2 + u.ph) * 0.8, 132 + Math.sin(a) * u.r * 0.55);
        u.g.rotation.y = -a + Math.PI / 2;
        const flap = Math.sin(t * 7 + u.ph) * 0.55;
        u.g.userData.wl.rotation.x = flap;
        u.g.userData.wr.rotation.x = -flap;
      }
    });
  }

  // ---- red lanterns strung over Temple Street ----
  {
    const lanternM = new THREE.MeshBasicMaterial({ color: 0xff4636 });
    const tasselM = new THREE.MeshBasicMaterial({ color: 0xffc94a });
    const lanterns = [];
    for (const lz of [-48, -64, -82, -100]) {
      const line = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 9.4, 4),
        new THREE.MeshBasicMaterial({ color: 0x77503a }));
      line.rotation.z = Math.PI / 2;
      line.position.set(-28, 7.6, lz);
      scene.add(line);
      for (let i = 0; i < 3; i++) {
        const g = new THREE.Group();
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), lanternM);
        ball.scale.y = 0.82; g.add(ball);
        const tas = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 0.5, 5), tasselM);
        tas.position.y = -0.55; g.add(tas);
        g.position.set(-31 + i * 3, 7.0, lz);
        scene.add(g);
        lanterns.push({ g, ph: i * 2 + lz });
      }
    }
    world.updatables.push((dt, t) => {
      for (const { g, ph } of lanterns) g.rotation.z = Math.sin(t * 1.3 + ph) * 0.18;
    });
  }

  world.setMorning(false);   // default mood; main.js applies the player's choice
  return world;
}

// ------------------------------------------------------------
// 16 treasure chests — one at each real landmark
// ------------------------------------------------------------
export const CHEST_SPOTS = [
  { x: -68, z: 110, hint: '鐘樓 Clock Tower' },
  { x: -86, z: 110, hint: '天星碼頭 Star Ferry Pier' },
  { x: -48, z: 108, hint: '文化中心 Cultural Centre' },
  { x: -20, z: 106, hint: '太空館 Space Museum' },
  { x: -24, z: 93,  hint: '半島酒店 The Peninsula' },
  { x: -48, z: 93,  hint: '1881 Heritage' },
  { x: -20, z: 24,  hint: 'iSQUARE 國際廣場' },
  { x: 19,  z: 60,  hint: '重慶大廈 Chungking Mansions' },
  { x: 42,  z: 98,  hint: 'K11 MUSEA' },
  { x: 30,  z: 125, hint: '星光大道 Avenue of Stars' },
  { x: -66, z: 40,  hint: '海港城 Harbour City' },
  { x: -33, z: -20, hint: '九龍公園 Kowloon Park' },
  { x: -18, z: 8,   hint: '九龍清真寺 Kowloon Mosque' },
  { x: 16,  z: -6,  hint: '聖安德烈堂 St Andrew\u2019s Church' },
  { x: -28, z: -60, hint: '廟街夜市 Temple St Night Market' },
  { x: 12,  z: -62, hint: '佐敦站 Jordan MTR' },
];

// fun collectibles & friends — positions on streets / open areas
export const STAR_SPOTS = [
  [0, -95], [0, -60], [0, -20], [0, 30], [0, 70], [4, 90],
  [-28, -88], [-28, -52], [-45, -80], [25, -80], [55, -38],
  [-62, -20], [-62, 30], [-62, 70], [30, 8], [70, 8],
  [-40, 52], [25, 52], [60, 70], [-3, 118], [55, 122], [-35, 118],
];

export const GIFT_SPOTS = [
  [6, -40], [-6, 15], [-50, 8], [35, -58], [-28, -70],
  [-62, 90], [20, 92], [70, 30], [-90, -55], [5, 122],
  [48, 8], [-40, -38],
];

export const FOOD_STALLS = [
  { x: -10, z: -52, name: '蛋撻 Egg Tarts' },
  { x: 10, z: 16, name: '魚蛋 Fishballs' },
  { x: -54, z: 60, name: '雞蛋仔 Egg Waffles' },
  { x: 24, z: -42, name: '砵仔糕 Pudding Cake' },
  { x: -16, z: 118, name: '雪糕車 Ice Cream' },
];

export const NPC_SPOTS = [
  { x: -38, z: -8, fact: '你知道嗎？九龍公園以前係英軍嘅威菲路軍營，而家仲有紅鸛喺個湖度！' },
  { x: 5, z: 100, fact: '尖沙咀鐘樓有成 44 米高，係舊九廣鐵路火車總站淨低嘅唯一部分！' },
  { x: 3, z: -76, fact: '廟街夜市晚晚都好熱鬧，有平嘢買、有嘢食，仲有人唱粵曲添！' },
  { x: -57, z: 96, fact: '1881 Heritage 以前係水警總部，起咗成百幾年喇！' },
  { x: 30, z: 120, fact: '天星小輪行咗超過 120 年，係全世界最抵坐嘅海上觀光路綫之一！' },
];
