// ============================================================
// Recognisable Tsim Sha Tsui landmarks, modelled low-poly:
// Clock Tower, Star Ferry Pier, Cultural Centre, Space Museum,
// The Peninsula, 1881 Heritage, iSQUARE, Chungking Mansions,
// K11 MUSEA, Harbour City, Kowloon Mosque, St Andrew's Church,
// Avenue of Stars and MTR entrances.
// Positions follow the real street layout (+z = toward harbour).
// ============================================================
import * as THREE from 'three';
import { LOW_FX, pointLight } from './quality.js';

function signTexture(text, color = '#ffffff', bg = '#10142e', fontSize = 44) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 96;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 96);
  let size = fontSize;
  g.font = `bold ${size}px "Microsoft JhengHei", sans-serif`;
  while (size > 18 && g.measureText(text).width > 488) {
    size -= 2;
    g.font = `bold ${size}px "Microsoft JhengHei", sans-serif`;
  }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = color; g.shadowBlur = 14;
  g.fillStyle = color;
  g.fillText(text, 256, 52);
  g.fillText(text, 256, 52);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function addSign(scene, text, x, y, z, w, color, ry = 0, bg) {
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(w, w * 96 / 512),
    new THREE.MeshBasicMaterial({ map: signTexture(text, color, bg), side: THREE.DoubleSide, transparent: false }));
  sign.position.set(x, y, z);
  sign.rotation.y = ry;
  scene.add(sign);
  return sign;
}

function makeCanvasTexture(draw, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), c);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function brickMaterial(base = '#a9573e', mortar = '#d6c8b7') {
  const tex = makeCanvasTexture((g) => {
    g.fillStyle = mortar; g.fillRect(0, 0, 256, 256);
    const shades = [base, '#914832', '#b66347', '#9f5038'];
    for (let y = 0, row = 0; y < 256; y += 18, row++) {
      for (let x = -24 + (row % 2) * 24; x < 256; x += 48) {
        g.fillStyle = shades[Math.abs((x / 24 + row * 3) | 0) % shades.length];
        g.fillRect(x + 1, y + 1, 45, 15);
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + 2, y + 2, 42, 2);
      }
    }
  });
  tex.repeat.set(1.5, 6);
  return new THREE.MeshStandardMaterial({ map: tex, roughness: .92, bumpMap: tex, bumpScale: .06 });
}

function limestoneMaterial() {
  const tex = makeCanvasTexture((g) => {
    g.fillStyle = '#d8c9b0'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i++) {
      g.fillStyle = `rgba(${200 + (i % 30)},${180 + (i % 22)},${150 + (i % 18)},.18)`;
      g.fillRect((i * 47) % 256, (i * 91) % 256, 18 + (i % 20), 10 + (i % 12));
    }
    g.strokeStyle = 'rgba(120,100,80,.22)'; g.lineWidth = 1;
    for (let y = 0; y < 256; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
    for (let x = 0; x < 256; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
  });
  tex.repeat.set(2, 3);
  return new THREE.MeshStandardMaterial({ map: tex, roughness: .88, bumpMap: tex, bumpScale: .035 });
}

function livingWallMaterial() {
  const tex = makeCanvasTexture((g) => {
    g.fillStyle = '#1f5a32'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 220; i++) {
      const greens = ['#2e7a40', '#3d8f4e', '#246334', '#4ea45c', '#1a4a28'];
      g.fillStyle = greens[i % greens.length];
      g.beginPath();
      g.ellipse((i * 53) % 256, (i * 79) % 256, 8 + (i % 7), 11 + (i % 9), 0, 0, 7);
      g.fill();
    }
    for (let i = 0; i < 18; i++) {
      g.fillStyle = i % 2 ? '#e07aa0' : '#f0c45c';
      g.beginPath(); g.arc((i * 97) % 256, (i * 61) % 256, 2.2, 0, 7); g.fill();
    }
  });
  tex.repeat.set(1.4, 2.4);
  return new THREE.MeshStandardMaterial({ map: tex, roughness: .95, emissive: 0x0a2210, emissiveIntensity: .12 });
}

function ledGlassMaterial(tint = '#1a3d58') {
  const tex = makeCanvasTexture((g) => {
    g.fillStyle = tint; g.fillRect(0, 0, 256, 256);
    g.fillStyle = 'rgba(255,255,255,.08)';
    for (let y = 8; y < 256; y += 22) g.fillRect(0, y, 256, 2);
    for (let x = 10; x < 256; x += 28) g.fillRect(x, 0, 2, 256);
    for (let y = 14; y < 250; y += 44) {
      for (let x = 16; x < 250; x += 28) {
        if ((x + y) % 3 === 0) {
          g.fillStyle = ['#7fe7ff', '#ffe08a', '#ff8fb6', '#9dffc2'][(x / 28 | 0) % 4];
          g.globalAlpha = .45; g.fillRect(x, y, 14, 12); g.globalAlpha = 1;
        }
      }
    }
  });
  tex.repeat.set(2, 4);
  return new THREE.MeshStandardMaterial({
    map: tex, roughness: .28, metalness: .42, emissive: 0x123848, emissiveIntensity: .55,
  });
}

const frameMats = new Map();
const UNIT_PLANE = new THREE.PlaneGeometry(1, 1);
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
function framedWindow(parent, x, y, z, w, h, ry = 0, glow = 0x9ccce0) {
  const group = new THREE.Group();
  if (!frameMats.has(glow)) {
    frameMats.set(glow, {
      glass: new THREE.MeshStandardMaterial({ color: glow, emissive: glow, emissiveIntensity: .18, metalness: .55, roughness: .18 }),
      frame: new THREE.MeshStandardMaterial({ color: 0xe5ddcf, roughness: .65 }),
    });
  }
  const mats = frameMats.get(glow);
  const glass = new THREE.Mesh(UNIT_PLANE, mats.glass);
  glass.scale.set(w, h, 1);
  group.add(glass);
  for (const [fw, fh, fx, fy] of [[w + .18, .11, 0, h / 2], [w + .18, .11, 0, -h / 2], [.11, h, -w / 2, 0], [.11, h, w / 2, 0], [.07, h, 0, 0]]) {
    const f = new THREE.Mesh(UNIT_BOX, mats.frame);
    f.scale.set(fw, fh, .08); f.position.set(fx, fy, .04); group.add(f);
  }
  group.position.set(x, y, z); group.rotation.y = ry; parent.add(group); return group;
}

function roundedBlock(w, h, d, radius, material) {
  const s = new THREE.Shape(); const x = w / 2, y = h / 2, r = Math.min(radius, x, y);
  s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.quadraticCurveTo(x, -y, x, -y + r);
  s.lineTo(x, y - r); s.quadraticCurveTo(x, y, x - r, y); s.lineTo(-x + r, y);
  s.quadraticCurveTo(-x, y, -x, y - r); s.lineTo(-x, -y + r); s.quadraticCurveTo(-x, -y, -x + r, -y);
  const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: .16, bevelThickness: .16, bevelSegments: 2 }), material);
  mesh.geometry.translate(0, 0, -d / 2); mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}

export function addLandmarks(scene, world, { buildingTexture }) {
  const addCollider = (x, z, w, d) =>
    world.colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  const mark = (x, z, color, r = 5) => world.minimapItems.push({ x, z, color, r });
  const M = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts });

  // ============ Clock Tower (-68, 118) — Edwardian red brick + octagonal belfry ============
  {
    const g = new THREE.Group();
    const brick = brickMaterial('#9b3d2e', '#cbb7a4'), stone = M(0xe8ddd0, { roughness: .7 });
    const granite = M(0xb7b0a4, { roughness: .62 });
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(8.4 - i * .55, .32, 8.4 - i * .55), granite);
      step.position.y = i * .28; g.add(step);
    }
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.2, 6.2), granite);
    plinth.position.y = 1.7; plinth.castShadow = true; g.add(plinth);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(4.5, 18.6, 4.5), brick);
    shaft.position.y = 12.4; shaft.castShadow = true; g.add(shaft);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const quoin = new THREE.Mesh(new THREE.BoxGeometry(.42, 18.6, .42), stone);
      quoin.position.set(sx * 2.28, 12.4, sz * 2.28); g.add(quoin);
    }
    for (const y of [6.2, 10.4, 14.8]) {
      framedWindow(g, 0, y, 2.28, .95, 1.55, 0, 0x6e8ea0);
      framedWindow(g, 2.28, y, 0, .95, 1.55, Math.PI / 2, 0x6e8ea0);
      framedWindow(g, 0, y, -2.28, .95, 1.55, Math.PI, 0x6e8ea0);
      framedWindow(g, -2.28, y, 0, .95, 1.55, -Math.PI / 2, 0x6e8ea0);
    }
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(5.6, .55, 5.6), stone); cornice.position.y = 22; g.add(cornice);
    const clockBand = new THREE.Mesh(new THREE.BoxGeometry(5.1, 4.2, 5.1), brick); clockBand.position.y = 24.3; g.add(clockBand);
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(6.4, .28, 6.4), stone); balcony.position.y = 22.4; g.add(balcony);
    const clockTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const gg = c.getContext('2d');
      gg.fillStyle = '#f4ecd4'; gg.beginPath(); gg.arc(64, 64, 60, 0, 7); gg.fill();
      gg.strokeStyle = '#1a1510'; gg.lineWidth = 5; gg.stroke();
      gg.lineWidth = 3;
      for (let n = 0; n < 12; n++) {
        const a = n / 12 * Math.PI * 2 - Math.PI / 2;
        gg.beginPath(); gg.moveTo(64 + Math.cos(a) * 46, 64 + Math.sin(a) * 46);
        gg.lineTo(64 + Math.cos(a) * 56, 64 + Math.sin(a) * 56); gg.stroke();
      }
      gg.lineWidth = 5;
      gg.beginPath(); gg.moveTo(64, 64); gg.lineTo(64, 22); gg.stroke();
      gg.lineWidth = 4;
      gg.beginPath(); gg.moveTo(64, 64); gg.lineTo(94, 72); gg.stroke();
      gg.fillStyle = '#1a1510'; gg.beginPath(); gg.arc(64, 64, 4, 0, 7); gg.fill();
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    for (let i = 0; i < 4; i++) {
      const face = new THREE.Mesh(new THREE.CircleGeometry(1.45, LOW_FX ? 12 : 22), new THREE.MeshBasicMaterial({ map: clockTex }));
      face.position.y = 24.3;
      if (i === 0) face.position.z = 2.58;
      if (i === 1) { face.position.z = -2.58; face.rotation.y = Math.PI; }
      if (i === 2) { face.position.x = 2.58; face.rotation.y = Math.PI / 2; }
      if (i === 3) { face.position.x = -2.58; face.rotation.y = -Math.PI / 2; }
      g.add(face);
    }
    // Real tower: octagonal red-brick belfry + small concrete dome + 7 m lightning rod.
    const belfry = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 2.15, 4.2, 8), brick);
    belfry.position.y = 28.5; belfry.castShadow = true; g.add(belfry);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.7, .7, 12), stone); drum.position.y = 30.85; g.add(drum);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.7, LOW_FX ? 8 : 14, LOW_FX ? 6 : 10, 0, Math.PI * 2, 0, Math.PI / 2), stone);
    dome.position.y = 31.15; g.add(dome);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, 5.4, 5), M(0xc9c3b6, { metalness: .55, roughness: .35 }));
    rod.position.y = 34.4; g.add(rod);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.12, .45, 6), M(0xffd35c, { metalness: .7 })); tip.position.y = 37.2; g.add(tip);
    g.position.set(-68, 0, 118);
    scene.add(g);
    addCollider(-68, 118, 6.5, 6.5);
    mark(-68, 118, '#d9a23c', 4);
    const up = pointLight(0xffe2b0, 10, 35, 1.6);
    up.position.set(-68, 6, 122); scene.add(up);
  }

  // ============ Star Ferry Pier (-86, 120) ============
  {
    const g = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(16, 1, 18), M(0x6e6a72));
    deck.position.y = 0.5; g.add(deck);
    const hall = new THREE.Mesh(new THREE.BoxGeometry(13, 5, 13), M(0xf3efe4));
    hall.position.y = 3.5; hall.castShadow = true; g.add(hall);
    const clockDisc = new THREE.Mesh(new THREE.CircleGeometry(.7, 16), M(0xf4ecd5));
    clockDisc.position.set(0, 5.1, -6.55); g.add(clockDisc);
    // Deep entrance arcade, green-framed windows and pier-side railings.
    const dark = M(0x183947, { metalness: .3, roughness: .35 });
    for (const x of [-4.4, 0, 4.4]) {
      const door = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.6, .22), dark); door.position.set(x, 2.9, -6.62); g.add(door);
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.3, .25, 1.3), M(0x2d6b4f)); canopy.position.set(x, 5.15, -7); g.add(canopy);
    }
    for (const x of [-4.7, -1.55, 1.55, 4.7]) framedWindow(g, x, 4, 6.52, 2.1, 1.7, 0, 0x8fc4ce);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 12, 3, 1), M(0x2d6b4f));
    roof.scale.set(1, 0.25, 1);
    roof.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    roof.position.y = 7;
    g.add(roof);
    // Two recognisable green clock/vent towers and rooftop finials.
    for (const x of [-4.6, 4.6]) {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 2.2), M(0xe6dfce)); tower.position.set(x, 7.8, 0); g.add(tower);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.2, 4), M(0x2d6b4f)); cap.rotation.y = Math.PI / 4; cap.position.set(x, 10.5, 0); g.add(cap);
    }
    const railM = M(0xd7d2c7, { metalness: .45, roughness: .5 });
    for (let x = -7; x <= 7; x += 1.4) { const r = new THREE.Mesh(new THREE.BoxGeometry(.08, 1, .08), railM); r.position.set(x, 1.6, 8.5); g.add(r); }
    g.position.set(-86, 0, 120);
    scene.add(g);
    addCollider(-86, 120, 14, 14);
    addSign(scene, '天星碼頭 Star Ferry', -86, 6.6, 112.4, 12, '#2d6b4f', Math.PI, '#f0ece0');
    mark(-86, 120, '#2d6b4f', 5);
  }

  // ============ HK Cultural Centre (-48, 117) — sweeping ski-slope roof ============
  {
    const g = new THREE.Group();
    const wing = (sx) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0); shape.lineTo(13, 0); shape.lineTo(13, 3); shape.lineTo(0, 11); shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 9, bevelEnabled: false });
      const m = new THREE.Mesh(geo, M(0xd7c4a8, { roughness: .84 }));
      m.castShadow = true;
      m.scale.x = sx;
      m.position.z = -4.5;
      return m;
    };
    const left = wing(-1), right = wing(1);
    g.add(left, right);
    const glass = M(0x24434e, { metalness: .48, roughness: .2, emissive: 0x10262c, emissiveIntensity: .45 });
    const lobby = new THREE.Mesh(new THREE.BoxGeometry(17, 5.5, 1.2), glass); lobby.position.set(0, 3.2, -5.15); g.add(lobby);
    // Deep sandstone fins are the centre's most recognisable street-level rhythm.
    const sandstone = M(0xd4c7ae, { roughness: .82 });
    for (let x = -11.5; x <= 11.5; x += 2.3) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(.38, 7.5, 1.6), sandstone); fin.position.set(x, 4, -5.5); g.add(fin);
    }
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(25 - i * 1.6, .28, 2.2), sandstone); step.position.set(0, .14 + i * .17, -7.3 - i * .75); g.add(step);
    }
    const roofLine = new THREE.Mesh(new THREE.BoxGeometry(27.5, .45, 10), M(0xb7aa94)); roofLine.position.y = 11.2; g.add(roofLine);
    const sculpture = new THREE.Mesh(new THREE.TorusKnotGeometry(1.15, .18, 48, 8), M(0x8c633d, { metalness: .75, roughness: .3 })); sculpture.position.set(9, 2.2, -8); sculpture.rotation.x = .6; g.add(sculpture);
    g.position.set(-48, 0, 117);
    scene.add(g);
    addCollider(-48, 117, 27, 10);
    mark(-48, 117, '#cfc4ae', 5);
    addSign(scene, '香港文化中心', -48, 4.2, 111.4, 10, '#ffd35c', Math.PI, '#3a3450');
  }

  // ============ Space Museum (-20, 116) — egg planetarium + west exhibition wing ============
  {
    const g = new THREE.Group();
    const shell = M(0xf4f1ea, { roughness: .42 });
    const podium = M(0xd4c4ae, { roughness: .82 });
    // West wing: rectangular Hall of Astronomy / gift shop, beside the egg (not under it).
    const west = new THREE.Mesh(new THREE.BoxGeometry(11.5, 5.6, 12.5), podium);
    west.position.set(-6.8, 2.8, .4); west.castShadow = true; g.add(west);
    const westRoof = new THREE.Mesh(new THREE.BoxGeometry(12, .35, 13), M(0xcbbba6)); westRoof.position.set(-6.8, 5.75, .4); g.add(westRoof);
    const ribbon = M(0x1c3d52, { metalness: .45, roughness: .22, emissive: 0x0c2430, emissiveIntensity: .4 });
    for (const z of [-5.8, 6.6]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(10.2, 1.15, .12), ribbon);
      band.position.set(-6.8, 3.6, z); g.add(band);
    }
    // East wing: the famous egg-shaped planetarium, offset so the silhouette reads from Salisbury Road.
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 6.1, 2.4, LOW_FX ? 16 : 28), podium);
    drum.position.set(5.2, 1.2, 0); g.add(drum);
    const egg = new THREE.Mesh(new THREE.SphereGeometry(6.15, LOW_FX ? 18 : 36, LOW_FX ? 14 : 24), shell);
    egg.scale.set(1.02, 1.18, 1.06); egg.position.set(5.2, 6.35, 0); egg.castShadow = true; g.add(egg);
    const seamM = new THREE.MeshBasicMaterial({ color: 0xc5c4bf, transparent: true, opacity: .55 });
    const radials = LOW_FX ? 4 : 8;
    for (let i = 0; i < radials; i++) {
      const seam = new THREE.Mesh(new THREE.TorusGeometry(6.15, .03, 4, LOW_FX ? 16 : 32, Math.PI * .95), seamM);
      seam.rotation.set(0, i / radials * Math.PI * 2, 0); seam.position.set(5.2, 6.35, 0); g.add(seam);
    }
    // Glass lobby linking the two wings, facing Salisbury.
    const lobby = new THREE.Mesh(new THREE.BoxGeometry(8.4, 3.4, .4), M(0x16384a, { metalness: .5, roughness: .16, emissive: 0x0d2836, emissiveIntensity: .55 }));
    lobby.position.set(-1.2, 2.1, -6.35); g.add(lobby);
    for (const x of [-3.4, -1.2, 1]) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(.12, 3.4, .22), M(0xc5d0d4)); mullion.position.set(x, 2.1, -6.55); g.add(mullion);
    }
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(9.2, .18, 1.8), M(0xe8e0d2)); canopy.position.set(-1.2, 3.95, -6.9); g.add(canopy);
    const planet = new THREE.Mesh(new THREE.SphereGeometry(.9, 16, 12), M(0x4c78b5, { metalness: .28, roughness: .4 }));
    planet.position.set(-11.4, 1.7, -5.2); g.add(planet);
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.4, .05, 6, 28), M(0xd7b960, { metalness: .7 }));
    orbit.rotation.x = 1.05; orbit.position.copy(planet.position); g.add(orbit);
    g.position.set(-20, 0, 116);
    scene.add(g);
    addCollider(-20, 116, 20, 13);
    mark(-20, 116, '#f2efe6', 5);
    addSign(scene, '香港太空館 Space Museum', -20, 5.2, 108.6, 13, '#7db8ff', Math.PI, '#1c2440');
    const up = pointLight(0x9fc8ff, 7, 24, 1.8);
    up.position.set(-14, 12, 116); scene.add(up);
  }

  // ============ The Peninsula (-24, 82) — colonial H-shape with fountain ============
  {
    const g = new THREE.Group();
    const cream = M(0xeadcc4, { roughness: .78 });
    const centre = new THREE.Mesh(new THREE.BoxGeometry(12, 22, 8), cream);
    centre.position.y = 11; centre.castShadow = true; g.add(centre);
    for (const side of [-1, 1]) {
      const wingB = new THREE.Mesh(new THREE.BoxGeometry(6, 18, 12), cream);
      wingB.position.set(side * 9, 9, 2);
      wingB.castShadow = true;
      g.add(wingB);
      for (let fy = 3; fy < 17; fy += 2.8) {
        for (const wx of [-1.7, 0, 1.7]) framedWindow(g, side * 9 + wx, fy, 8.06, 1.05, 1.35, 0, 0xffd990);
      }
    }
    // window rows (emissive strip planes)
    const winM = new THREE.MeshBasicMaterial({ color: 0xffe9b8 });
    for (let fy = 3; fy <= 19; fy += 2.6) {
      const row = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.8), winM);
      row.position.set(0, fy, 4.05);
      g.add(row);
    }
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(13, 1, 9), M(0x9c8a64));
    cornice.position.y = 22.4; g.add(cornice);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.4, 6), cream); crown.position.y = 25.1; g.add(crown);
    const crownRoof = new THREE.Mesh(new THREE.BoxGeometry(8.4, .65, 6.8), M(0x69806e)); crownRoof.position.y = 27.55; g.add(crownRoof);
    const nameBand = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.1, .25), M(0x29352f, { metalness: .3 })); nameBand.position.set(0, 7.5, 4.2); g.add(nameBand);
    // Covered arrival entrance and classical columns.
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(7.5, .45, 3.2), M(0x53705f)); canopy.position.set(0, 4.6, 5.6); g.add(canopy);
    for (const x of [-3, -1, 1, 3]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(.18, .23, 4.1, 10), M(0xeee5d1)); col.position.set(x, 2.3, 6.5); g.add(col);
    }
    for (const x of [-4.7, 4.7]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.035, .05, 5, 6), M(0x52555b, { metalness: .7 })); pole.position.set(x, 5, 6); g.add(pole);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.35, .7), new THREE.MeshBasicMaterial({ color: x < 0 ? 0xd73c3c : 0x2b4d91, side: THREE.DoubleSide })); flag.position.set(x + .65, 6.8, 6); g.add(flag);
    }
    // fountain forecourt
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.2, 0.6, 14), M(0xb9b2a4));
    pool.position.set(0, 0.3, 9);
    g.add(pool);
    const waterDisc = new THREE.Mesh(new THREE.CircleGeometry(2.7, 14), M(0x4a90d9, { roughness: 0.2, metalness: 0.5 }));
    waterDisc.rotation.x = -Math.PI / 2;
    waterDisc.position.set(0, 0.62, 9);
    g.add(waterDisc);
    const jet = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.2, 8), new THREE.MeshBasicMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.7 }));
    jet.position.set(0, 1.6, 9);
    g.add(jet);
    const sideJets = [];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      const j = new THREE.Mesh(new THREE.CylinderGeometry(.035, .08, 1.15, 6), new THREE.MeshBasicMaterial({ color: 0xa9d7ff, transparent: true, opacity: .65 }));
      j.position.set(Math.cos(a) * 1.8, 1.05, 9 + Math.sin(a) * 1.8); j.rotation.z = -Math.cos(a) * .65; j.rotation.x = Math.sin(a) * .65; g.add(j); sideJets.push(j);
    }
    world.systems.add('decorative', (dt, t) => { jet.scale.y = 1 + Math.sin(t * 5) * 0.18; sideJets.forEach((j, i) => { j.scale.y = .8 + Math.sin(t * 4 + i) * .18; }); });
    g.position.set(-24, 0, 80);
    scene.add(g);
    addCollider(-24, 82, 25, 14);
    addCollider(-24, 89, 7, 4);  // fountain
    mark(-24, 82, '#e8dcc2', 6);
    addSign(scene, 'The Peninsula 半島酒店', -24, 24, 84.2, 14, '#ffd35c', 0, '#3a3043');
  }

  // ============ 1881 Heritage (-48, 84) — Victorian Marine Police HQ + round Time Ball Tower ============
  {
    const g = new THREE.Group();
    const cream = M(0xf3eee4, { roughness: .82 });
    const roofM = M(0x6a3a32, { roughness: .7 });
    const main = new THREE.Mesh(new THREE.BoxGeometry(16, 8.4, 10), cream);
    main.position.y = 4.2; main.castShadow = true; g.add(main);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(17.2, 1.05, 11), roofM); roof.position.y = 8.85; g.add(roof);
    for (let i = -2; i <= 2; i++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(.32, .38, 8.2, 10), M(0xfffaf2));
      col.position.set(i * 3.1, 4.1, 5.15); g.add(col);
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.2, .18, 8, 18, Math.PI), cream);
      arch.position.set(i * 3.1, 6.05, 5.22); g.add(arch);
      framedWindow(g, i * 2.7, 3.4, -5.05, 1.3, 2.1, Math.PI, 0x8bb1bd);
    }
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(16.6, .24, 1.4), M(0xcfc0a8)); balcony.position.set(0, 7.55, 5.4); g.add(balcony);
    for (let x = -7.5; x <= 7.5; x += .85) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(.07, .7, .07), M(0xf7f1e6)); b.position.set(x, 8, 5.9); g.add(b);
    }
    // The real signal tower is a ROUND house with a time ball, not a square turret.
    const round = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.35, 11.5, LOW_FX ? 10 : 16), cream);
    round.position.set(7.4, 9.6, -1.2); round.castShadow = true; g.add(round);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.35, .12, 6, 16), M(0xcfc0a8)); ring.rotation.x = Math.PI / 2; ring.position.set(7.4, 14.6, -1.2); g.add(ring);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(2.05, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), roofM);
    cap.position.set(7.4, 15.3, -1.2); g.add(cap);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.8, 6), M(0x8a8478, { metalness: .4 })); mast.position.set(7.4, 17.4, -1.2); g.add(mast);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.38, 10, 8), M(0x1c1c20, { metalness: .55 })); ball.position.set(7.4, 18.7, -1.2); g.add(ball);
    // Old Kowloon Fire Station — red brick, beside the compound.
    const fire = new THREE.Mesh(new THREE.BoxGeometry(6.5, 5.2, 5.5), brickMaterial('#8f3a32', '#c9b8a6'));
    fire.position.set(-10.5, 2.6, 1.5); fire.castShadow = true; g.add(fire);
    const fireRoof = new THREE.Mesh(new THREE.BoxGeometry(7.1, .55, 6.1), M(0x4a5c48)); fireRoof.position.set(-10.5, 5.4, 1.5); g.add(fireRoof);
    const lawn = new THREE.Mesh(new THREE.CircleGeometry(5.4, 16), M(0x3f7a48, { roughness: 1 }));
    lawn.rotation.x = -Math.PI / 2; lawn.position.set(0, .03, 8.6); g.add(lawn);
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(17.5 - i, .22, 1.8), M(0xc8b99f));
      step.position.set(0, .12 + i * .16, 6.2 + i * .55); g.add(step);
    }
    g.position.set(-48, 0, 84);
    scene.add(g);
    addCollider(-48, 84, 16, 11);
    addCollider(-58.5, 85.5, 7, 6);
    mark(-48, 84, '#f2ede2', 4);
    addSign(scene, '1881 Heritage', -48, 6.8, 90.2, 10, '#d9a23c', 0, '#2a2438');
  }

  // ============ iSQUARE (-20, 38) — stacked glass boxes, LED sky lobbies on Nathan Rd ============
  {
    const g = new THREE.Group();
    const curtain = ledGlassMaterial('#1b3550');
    const podium = new THREE.Mesh(new THREE.BoxGeometry(17.5, 10, 16.5), curtain);
    podium.position.set(0, 5, 0); podium.castShadow = true; g.add(podium);
    // Offset restaurant / cinema stacks — the real form is a stack of glass volumes, not one slab.
    const mid = new THREE.Mesh(new THREE.BoxGeometry(13.5, 14, 12.5), curtain);
    mid.position.set(-1.2, 17.2, .8); mid.castShadow = true; g.add(mid);
    const top = new THREE.Mesh(new THREE.BoxGeometry(11, 16, 10.5), curtain);
    top.position.set(1.6, 32.2, -1.1); top.castShadow = true; g.add(top);
    // Colour-coded sky lobbies (red / gold / cyan) visible through the Nathan Road façade.
    const lobbyCols = [0xff5a6a, 0xffd35c, 0x5cffe8];
    lobbyCols.forEach((col, i) => {
      const band = new THREE.Mesh(new THREE.BoxGeometry(13.7, 1.6, .18),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .85 }));
      band.position.set(-1.2, 12 + i * 5.2, 7.15); g.add(band);
    });
    // Express escalators read as a diagonal glass slot on Nathan Road.
    const esc = new THREE.Mesh(new THREE.BoxGeometry(.7, 11, 1.1),
      M(0x6ce5e5, { emissive: 0x174f58, emissiveIntensity: 1, metalness: .45 }));
    esc.position.set(7.2, 8.4, 3.2); esc.rotation.z = -.42; g.add(esc);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(12.4, 3.2, 11.6),
      M(0x0d2438, { metalness: .5, roughness: .2, emissive: 0x1a4e66, emissiveIntensity: .9 }));
    crown.position.set(1.6, 42, -1.1); g.add(crown);
    const ledScreen = new THREE.Mesh(new THREE.BoxGeometry(10.6, 2.4, .12),
      new THREE.MeshBasicMaterial({ color: 0x5cffe8 }));
    ledScreen.position.set(1.6, 42, 4.8); g.add(ledScreen);
    const portal = new THREE.Mesh(new THREE.BoxGeometry(8, 5.2, .4),
      M(0x6ce5e5, { emissive: 0x174f58, emissiveIntensity: 1, metalness: .45 }));
    portal.position.set(0, 2.8, -8.35); g.add(portal);
    g.position.set(-20, 0, 38); scene.add(g);
    addCollider(-20, 38, 17.5, 16.5);
    mark(-20, 38, '#1b3550', 6);
    addSign(scene, 'iSQUARE 國際廣場', -10.4, 12, 38, 11, '#5cffe8', Math.PI / 2, '#101a36');
  }

  // ============ Chungking Mansions (19, 72) — five 17-storey blocks on a bazaar podium ============
  {
    const g = new THREE.Group();
    const tex = buildingTexture('#6e5f4e', 0.5);
    const grey = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 });
    // Five towers A–E rise from a two-storey arcade, as in the real 1961 plan.
    for (let i = 0; i < 5; i++) {
      const blk = new THREE.Mesh(new THREE.BoxGeometry(4.1, 28, 11.5), grey);
      blk.position.set(-8.4 + i * 4.2, 17.2, .6); blk.castShadow = true; g.add(blk);
    }
    const podium = new THREE.Mesh(new THREE.BoxGeometry(22, 6.2, 14.5), M(0x7a6a56, { roughness: .92 }));
    podium.position.y = 3.1; g.add(podium);
    const signCols = [0xff5c5c, 0xffd35c, 0x7dffb2, 0x7db8ff, 0xff8fb6, 0xff9a3c];
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.15, .12), new THREE.MeshBasicMaterial({ color: signCols[i] }));
      s.position.set(-9.2 + i * 3.6, 3.6 + (i % 2) * .7, -7.35); g.add(s);
    }
    // Blue LED façade bands added in the 2011 cleanup.
    const led = new THREE.MeshBasicMaterial({ color: 0x4aa8ff });
    for (const y of [7.4, 14.2, 21]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(21.4, .16, .12), led); band.position.set(0, y, -6.2); g.add(band);
    }
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.4, .3), M(0x1a1a1e, { emissive: 0x33220c, emissiveIntensity: .6 }));
    entrance.position.set(0, 1.8, -7.4); g.add(entrance);
    g.position.set(19, 0, 72);
    g.rotation.y = Math.PI;
    scene.add(g);
    addCollider(19, 72, 22, 14.5);
    mark(19, 72, '#6e5f4e', 6);
    addSign(scene, '重慶大廈 Chungking Mansions', 19, 8.5, 64.2, 14, '#ff8a5c', Math.PI, '#241c14');
  }

  // ============ K11 MUSEA (42, 114) — limestone manor + living walls + Victoria Dockside ============
  {
    const g = new THREE.Group();
    const limestone = limestoneMaterial();
    const wall = livingWallMaterial();
    const glass = M(0x163342, { metalness: .62, roughness: .14, emissive: 0x142c34, emissiveIntensity: .55 });
    const cream = M(0xe6dcc8, { roughness: .78 });
    // Stepped Portuguese-limestone floors (the real exterior is cream stone, not bronze).
    for (const [w, h, d, y] of [[26, 7.2, 20, 3.6], [22, 5.4, 17, 10], [18, 5, 14.5, 15.2], [13, 4.2, 11, 19.8]]) {
      const b = roundedBlock(w, h, d, 1.4, limestone); b.position.y = y; g.add(b);
    }
    // Cascading living walls — K11's most recognisable harbour-front colour.
    for (const [w, h, y, z] of [[18, 6.4, 6.8, -10.15], [14, 5, 12.4, -8.65], [10, 4.2, 17.4, -7.4]]) {
      const green = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wall);
      green.position.set(0, y, z); g.add(green);
    }
    for (const side of [-1, 1]) {
      const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), wall);
      sideWall.rotation.y = side * Math.PI / 2; sideWall.position.set(side * 13.05, 7.2, -2); g.add(sideWall);
    }
    // Roof gardens / Nature Discovery Park.
    const gardenM = M(0x3b7656, { roughness: .85 });
    for (let i = 0; i < 10; i++) {
      const shrub = new THREE.Mesh(new THREE.IcosahedronGeometry(.42 + (i % 3) * .08, 1), gardenM);
      shrub.position.set(-6 + (i % 5) * 3, 22.4, -3 + (i % 2) * 3.4); g.add(shrub);
    }
    const lantern = roundedBlock(4.6, 2.6, 4.6, .55, glass); lantern.position.y = 23.6; g.add(lantern);
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.8, .45, 20), cream);
    plaza.position.set(0, .22, -13.4); g.add(plaza);
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(8.5, 5.2, .4), glass); entrance.position.set(0, 2.9, -10.2); g.add(entrance);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(4.1, .28, 8, 24, Math.PI), cream);
    arch.position.set(0, 5.4, -10.4); g.add(arch);
    const beacon = pointLight(0xffbe7a, 7, 28, 1.7); beacon.position.set(0, 24, 0); g.add(beacon);
    g.position.set(42, 0, 114);
    scene.add(g);
    addCollider(42, 114, 24, 22);
    mark(42, 114, '#d8c9b0', 7);
    addSign(scene, 'K11 MUSEA', 42, 16, 100.5, 11, '#ffe7c2', Math.PI, '#2a2418');
    const up = pointLight(0xffb070, 9, 30, 1.7);
    up.position.set(42, 5, 100); scene.add(up);

    // Victoria Dockside / Rosewood tower — the 284 m glass neighbour that completes the skyline.
    const tower = new THREE.Mesh(new THREE.BoxGeometry(10, 78, 10), ledGlassMaterial('#16344c'));
    tower.position.set(58, 39, 108); tower.castShadow = true; scene.add(tower);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(8.2, 4.5, 8.2), M(0x0e2434, { metalness: .55, roughness: .22, emissive: 0x1a4a62, emissiveIntensity: .7 }));
    crown.position.set(58, 80, 108); scene.add(crown);
    addCollider(58, 108, 10, 10);
    mark(58, 108, '#1a3d58', 4);
  }

  // ============ Harbour City + Ocean Terminal (-80, 40) — Canton Rd mall + harbour pier ============
  {
    const mallGroup = new THREE.Group();
    const mall = new THREE.Mesh(
      new THREE.BoxGeometry(18, 13, 78),
      new THREE.MeshStandardMaterial({ map: buildingTexture('#44506e', 0.6), roughness: 0.8 }));
    mall.position.set(0, 6.5, 0); mall.castShadow = true; mallGroup.add(mall);
    const glass = M(0x21475c, { metalness: .55, roughness: .18, emissive: 0x0f2633, emissiveIntensity: .5 });
    const cream = M(0xe8e4d8, { roughness: .7 });
    // Luxury Canton Road shopfronts (east face).
    for (const z of [-30, -12, 8, 28]) {
      const bay = new THREE.Mesh(new THREE.BoxGeometry(2.4, 8.2, 14), glass); bay.position.set(10.2, 5.8, z); mallGroup.add(bay);
      const awning = new THREE.Mesh(new THREE.BoxGeometry(2.8, .22, 14.2), cream); awning.position.set(11.1, 10.2, z); mallGroup.add(awning);
    }
    const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(20, .5, 48), M(0xb5b9b4)); roofDeck.position.set(0, 13.4, 10); mallGroup.add(roofDeck);
    mallGroup.position.set(-80, 0, 40); scene.add(mallGroup);
    addCollider(-80, 40, 18, 78);
    mark(-80, 40, '#44506e', 8);
    addSign(scene, '海港城 Harbour City', -70.2, 10, 40, 16, '#7db8ff', Math.PI / 2, '#141c34');

    // Foster + Partners Ocean Terminal extension: ship-bow terraces reaching into the harbour.
    const pier = new THREE.Group();
    const white = M(0xf2f4f6, { roughness: .55, metalness: .18 });
    const pane = M(0x8ec4d8, { metalness: .45, roughness: .18, emissive: 0x1a3d50, emissiveIntensity: .45 });
    for (const [w, h, d, y, x] of [[22, 3.2, 28, 1.6, 0], [18, 3, 22, 4.6, -1.2], [14, 2.6, 16, 7.4, -2.4]]) {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), white);
      deck.position.set(x, y, 0); pier.add(deck);
    }
    const glazing = new THREE.Mesh(new THREE.BoxGeometry(.4, 8.4, 24), pane); glazing.position.set(-11.4, 4.4, 0); pier.add(glazing);
    const bow = new THREE.Mesh(new THREE.CylinderGeometry(7, 9, 3.2, 3), white);
    bow.rotation.set(0, Math.PI / 2, Math.PI / 2); bow.position.set(-12, 2.2, 0); pier.add(bow);
    pier.position.set(-102, 0, 42); scene.add(pier);
    addCollider(-102, 42, 22, 28);

    const ship = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(11, 5.2, 46), M(0xf5f5f0)); hull.position.y = 2.6; ship.add(hull);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(11.1, .45, 46.1), M(0x1d4d8c)); stripe.position.y = 1.6; ship.add(stripe);
    const decks = new THREE.Mesh(new THREE.BoxGeometry(8.4, 4.2, 34), M(0xe8e8e0)); decks.position.y = 7.2; ship.add(decks);
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.45, 4.2, 10), M(0xd23a3a)); funnel.position.set(0, 11.4, -6); ship.add(funnel);
    ship.position.set(-118, 0, 55); scene.add(ship);
    addCollider(-118, 55, 12, 46);
  }

  // ============ Kowloon Mosque (-18, -4) — white marble, onion domes, four minarets ============
  {
    const g = new THREE.Group();
    const white = M(0xf7f4ee, { roughness: .72 });
    const green = M(0x2a8a5c, { roughness: .42, metalness: .08 });
    const gold = M(0xe8c15a, { metalness: .65, roughness: .35 });
    const main = new THREE.Mesh(new THREE.BoxGeometry(12.2, 7.4, 12.2), white);
    main.position.y = 3.7; main.castShadow = true; g.add(main);
    const band = new THREE.Mesh(new THREE.BoxGeometry(12.5, .45, 12.5), gold); band.position.y = 6.6; g.add(band);
    // Full onion dome, not a cut hemisphere — the mosque's skyline signature from Nathan Road.
    const dome = new THREE.Mesh(new THREE.SphereGeometry(3.6, 16, 12), green);
    dome.scale.set(1, 1.22, 1); dome.position.y = 10.1; g.add(dome);
    const finial = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 1.6, 5), gold); finial.position.y = 14.6; g.add(finial);
    const crescent = new THREE.Mesh(new THREE.TorusGeometry(.28, .05, 6, 12, Math.PI * 1.4), gold);
    crescent.rotation.z = .4; crescent.position.y = 15.5; g.add(crescent);
    for (const [mx, mz] of [[-5.4, -5.4], [5.4, -5.4], [-5.4, 5.4], [5.4, 5.4]]) {
      const minaret = new THREE.Mesh(new THREE.CylinderGeometry(.55, .68, 14.5, 10), white);
      minaret.position.set(mx, 7.25, mz); minaret.castShadow = true; g.add(minaret);
      const balcony = new THREE.Mesh(new THREE.CylinderGeometry(.95, .95, .22, 10), gold);
      balcony.position.set(mx, 12.4, mz); g.add(balcony);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(.95, 10, 8), green);
      cap.scale.set(1, 1.25, 1); cap.position.set(mx, 15.1, mz); g.add(cap);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(.12, 6, 6), gold); tip.position.set(mx, 16.5, mz); g.add(tip);
    }
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.7, .22, 8, 16, Math.PI), gold);
    arch.position.set(0, 3.6, 6.2); g.add(arch);
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.4, .2), M(0x1a3d30, { roughness: .4 })); door.position.set(0, 1.8, 6.2); g.add(door);
    g.position.set(-18, 0, -4);
    scene.add(g);
    addCollider(-18, -4, 13, 13);
    mark(-18, -4, '#f5f2ea', 5);
    addSign(scene, '九龍清真寺 Kowloon Mosque', -18, 8.8, 3.2, 12, '#7dffb2', 0, '#14241c');
  }

  // ============ St Andrew's Church (16, -22) — red brick, steeple, cross ============
  {
    const g = new THREE.Group();
    const brick = brickMaterial('#9e4a38', '#cbb7a4');
    const nave = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 14), brick);
    nave.position.y = 3; nave.castShadow = true; g.add(nave);
    // pitched roof = 3-sided prism
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.4, 14.5, 3, 1), M(0x5a4438));
    roof.scale.set(1, 0.45, 1);
    roof.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    roof.position.y = 7.2;
    g.add(roof);
    const towerC = new THREE.Mesh(new THREE.BoxGeometry(4, 11, 4), brick);
    towerC.position.set(0, 5.5, 8.5);
    towerC.castShadow = true;
    g.add(towerC);
    const spireC = new THREE.Mesh(new THREE.ConeGeometry(2.8, 5, 4), M(0x5a4438));
    spireC.position.set(0, 13.5, 8.5);
    spireC.rotation.y = Math.PI / 4;
    g.add(spireC);
    // cross
    const crossM = new THREE.MeshBasicMaterial({ color: 0xfff3d6 });
    const cv = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2, 0.22), crossM);
    cv.position.set(0, 17, 8.5); g.add(cv);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.22), crossM);
    ch.position.set(0, 17.3, 8.5); g.add(ch);
    // arched windows (glowing warm)
    const winM = new THREE.MeshBasicMaterial({ color: 0xffd97a });
    for (let i = -1; i <= 1; i++) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(1, 2.2), winM);
      w.position.set(-4.05, 3, i * 4);
      w.rotation.y = -Math.PI / 2;
      g.add(w);
    }
    g.position.set(16, 0, -22);
    scene.add(g);
    addCollider(16, -22, 9, 16);
    addCollider(16, -13, 5, 5);
    mark(16, -22, '#9e4a38', 5);
    addSign(scene, "聖安德烈堂 St Andrew's", 16, 7.8, -30.6, 12, '#ffd97a', Math.PI, '#241a14');
  }

  // ============ Avenue of Stars (promenade, z≈126) ============
  {
    // star plaques inlaid in the promenade
    const starShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 1 : 0.42;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      i === 0 ? starShape.moveTo(px, py) : starShape.lineTo(px, py);
    }
    starShape.closePath();
    const starGeo = new THREE.ShapeGeometry(starShape);
    const starM = new THREE.MeshStandardMaterial({ color: 0xd9a23c, metalness: 0.7, roughness: 0.3 });
    for (let i = 0; i < 9; i++) {
      const plaque = new THREE.Mesh(starGeo, starM);
      plaque.rotation.x = -Math.PI / 2;
      plaque.position.set(6 + i * 8, 0.06, 124 + (i % 2) * 3);
      scene.add(plaque);
    }
    // statue on a pedestal (martial-arts pose silhouette)
    const sg = new THREE.Group();
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2, 1.6, 10), M(0x6e6a72));
    ped.position.y = 0.8; sg.add(ped);
    const bronze = M(0x7a5c30, { metalness: 0.8, roughness: 0.35 });
    const torsoS = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.6, 8), bronze);
    torsoS.position.y = 2.8; torsoS.rotation.z = 0.15; sg.add(torsoS);
    const headS = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), bronze);
    headS.position.y = 3.85; sg.add(headS);
    const armA = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.5, 6), bronze);
    armA.position.set(0.7, 3.3, 0); armA.rotation.z = -1.25; sg.add(armA);
    const armB = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.3, 6), bronze);
    armB.position.set(-0.55, 2.45, 0); armB.rotation.z = 0.9; sg.add(armB);
    const legA = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.4, 6), bronze);
    legA.position.set(0.2, 1.5, 0); sg.add(legA);
    const legB = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.3, 6), bronze);
    legB.position.set(-0.45, 1.55, 0.2); legB.rotation.x = 0.7; sg.add(legB);
    sg.position.set(40, 0, 126);
    scene.add(sg);
    addCollider(40, 126, 4, 4);
    addSign(scene, '星光大道 Avenue of Stars', 60, 3.2, 128, 14, '#ffd35c', Math.PI, '#241c2c');
  }

  // ============ MTR entrances (Jordan & TST stations) ============
  for (const [mx, mz, name] of [[12, -68, '佐敦 Jordan'], [12, 42, '尖沙咀 TST']]) {
    const g = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 3), M(0xb9344a));
    box.position.y = 1.5; box.castShadow = true; g.add(box);
    const top = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.5, 3.6), M(0x8a2438));
    top.position.y = 3.2; g.add(top);
    g.position.set(mx, 0, mz);
    scene.add(g);
    addCollider(mx, mz, 4.5, 3.5);
    addSign(scene, `🚇 ${name}`, mx, 2.2, mz - 1.85, 4.6, '#ffffff', Math.PI, '#b9344a');
    mark(mx, mz, '#b9344a', 3);
  }
}

// footprint rectangles where generic filler buildings must NOT spawn
export const LANDMARK_ZONES = [
  { minX: -54, maxX: -12, minZ: -32, maxZ: 2 },     // Kowloon Park (incl. Mosque corner)
  { minX: 6, maxX: 26, minZ: -32, maxZ: -8 },       // St Andrew's
  { minX: -31, maxX: -9, minZ: 28, maxZ: 48 },      // iSQUARE
  { minX: 7, maxX: 31, minZ: 60, maxZ: 84 },        // Chungking
  { minX: -38, maxX: -10, minZ: 72, maxZ: 92 },     // Peninsula
  { minX: -57, maxX: -39, minZ: 76, maxZ: 92 },     // 1881
  { minX: -92, maxX: -68, minZ: -2, maxZ: 82 },     // Harbour City
  { minX: -34, maxX: -22, minZ: -110, maxZ: -42 },  // Temple St market strip
  { minX: 8, maxX: 17, minZ: -73, maxZ: -63 },      // Jordan MTR
  { minX: 8, maxX: 17, minZ: 37, maxZ: 47 },        // TST MTR
];
