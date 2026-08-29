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

function brickMaterial(base = '#a9573e', mortar = '#d6c8b7') {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = mortar; g.fillRect(0, 0, 256, 256);
  const shades = [base, '#914832', '#b66347', '#9f5038'];
  for (let y = 0, row = 0; y < 256; y += 18, row++) {
    for (let x = -24 + (row % 2) * 24; x < 256; x += 48) {
      g.fillStyle = shades[Math.abs((x / 24 + row * 3) | 0) % shades.length];
      g.fillRect(x + 1, y + 1, 45, 15);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + 2, y + 2, 42, 2);
    }
  }
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.5, 6); tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: tex, roughness: .92, bumpMap: tex, bumpScale: .06 });
}

function framedWindow(parent, x, y, z, w, h, ry = 0, glow = 0x9ccce0) {
  const group = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ color: glow, emissive: glow, emissiveIntensity: .18, metalness: .55, roughness: .18 }));
  group.add(glass);
  const frameM = new THREE.MeshStandardMaterial({ color: 0xe5ddcf, roughness: .65 });
  for (const [fw, fh, fx, fy] of [[w + .18, .11, 0, h / 2], [w + .18, .11, 0, -h / 2], [.11, h, -w / 2, 0], [.11, h, w / 2, 0], [.07, h, 0, 0]]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, .08), frameM); f.position.set(fx, fy, .04); group.add(f);
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

  // ============ Clock Tower (-68, 118) ============
  {
    const g = new THREE.Group();
    const brick = brickMaterial(), stone = M(0xd9cdb8, { roughness: .72 });
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(8 - i * .7, .35, 8 - i * .7), stone);
      step.position.y = i * .28; g.add(step);
    }
    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 6), stone);
    base.position.y = 1.5; base.castShadow = true; g.add(base);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(4.4, 20, 4.4), brick);
    shaft.position.y = 13; shaft.castShadow = true; g.add(shaft);
    // Pale corner quoins and arched slit windows match the real masonry rhythm.
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      for (let y = 4.5; y < 22; y += 2.1) {
        const q = new THREE.Mesh(new THREE.BoxGeometry(.38, .72, .38), stone);
        q.position.set(sx * 2.18, y, sz * 2.18); g.add(q);
      }
    }
    for (const y of [6, 10.5, 15]) {
      framedWindow(g, 0, y, 2.23, 1.05, 1.7, 0, 0x6e8ea0);
      framedWindow(g, 2.23, y, 0, 1.05, 1.7, Math.PI / 2, 0x6e8ea0);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 5), stone);
    top.position.y = 24.2; g.add(top);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.2, LOW_FX ? 8 : 12, LOW_FX ? 6 : 10, 0, Math.PI * 2, 0, Math.PI / 2), stone);
    dome.position.y = 25.5; g.add(dome);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), stone);
    spire.position.y = 29; g.add(spire);
    const clockTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const gg = c.getContext('2d');
      gg.fillStyle = '#fff8e0'; gg.beginPath(); gg.arc(32, 32, 30, 0, 7); gg.fill();
      gg.strokeStyle = '#222'; gg.lineWidth = 3;
      for (let n = 0; n < 12; n++) {
        const a = n / 12 * Math.PI * 2 - Math.PI / 2;
        gg.beginPath(); gg.moveTo(32 + Math.cos(a) * 23, 32 + Math.sin(a) * 23);
        gg.lineTo(32 + Math.cos(a) * 28, 32 + Math.sin(a) * 28); gg.stroke();
      }
      gg.beginPath(); gg.moveTo(32, 32); gg.lineTo(32, 12); gg.stroke();
      gg.beginPath(); gg.moveTo(32, 32); gg.lineTo(46, 36); gg.stroke();
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    for (let i = 0; i < 4; i++) {
      const face = new THREE.Mesh(new THREE.CircleGeometry(1.5, LOW_FX ? 12 : 20), new THREE.MeshBasicMaterial({ map: clockTex }));
      face.position.y = 21.5;
      if (i === 0) face.position.z = 2.25;
      if (i === 1) { face.position.z = -2.25; face.rotation.y = Math.PI; }
      if (i === 2) { face.position.x = 2.25; face.rotation.y = Math.PI / 2; }
      if (i === 3) { face.position.x = -2.25; face.rotation.y = -Math.PI / 2; }
      g.add(face);
    }
    // Clock-level balcony, rails and projecting cornices add a readable silhouette.
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(6.2, .35, 6.2), stone); balcony.position.y = 20; g.add(balcony);
    const railM = M(0x3c3834, { metalness: .6, roughness: .38 });
    for (let i = -2; i <= 2; i++) {
      for (const z of [-3, 3]) { const r = new THREE.Mesh(new THREE.BoxGeometry(.08, .75, .08), railM); r.position.set(i * 1.2, 20.55, z); g.add(r); }
      for (const x of [-3, 3]) { const r = new THREE.Mesh(new THREE.BoxGeometry(.08, .75, .08), railM); r.position.set(x, 20.55, i * 1.2); g.add(r); }
    }
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
    const hall = new THREE.Mesh(new THREE.BoxGeometry(13, 5, 13), M(0xf0ece0));
    hall.position.y = 3.5; hall.castShadow = true; g.add(hall);
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
      const m = new THREE.Mesh(geo, M(0xcfc4ae));
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

  // ============ Space Museum (-20, 116) — the iconic white "egg" dome ============
  {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(18, 4, 12), M(0xd8c8b2));
    base.position.y = 2; base.castShadow = true; g.add(base);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(6, LOW_FX ? 18 : 36, LOW_FX ? 12 : 22, 0, Math.PI * 2, 0, Math.PI / 2), M(0xf2efe6, { roughness: 0.46 }));
    dome.position.y = 4; dome.castShadow = true; g.add(dome);
    // Panel seams turn the white blob into the museum's tiled hemispherical shell.
    const seamM = new THREE.MeshBasicMaterial({ color: 0xb8b9b6, transparent: true, opacity: .72 });
    for (let y = 4.8; y <= 8.4; y += LOW_FX ? 2.3 : 1.15) {
      const radius = Math.sqrt(Math.max(.1, 36 - (y - 4) * (y - 4)));
      const seam = new THREE.Mesh(new THREE.TorusGeometry(radius, .035, 5, 64), seamM); seam.rotation.x = Math.PI / 2; seam.position.y = y; g.add(seam);
    }
    const radialSeams = LOW_FX ? 4 : 8;
    for (let i = 0; i < radialSeams; i++) {
      const seam = new THREE.Mesh(new THREE.TorusGeometry(6, .03, 5, 48, Math.PI / 2), seamM);
      seam.rotation.set(0, i / radialSeams * Math.PI * 2, 0); seam.position.y = 4; g.add(seam);
    }
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(7, 3, .35), M(0x19384c, { metalness: .5, roughness: .18 })); entrance.position.set(0, 2.1, -6.18); g.add(entrance);
    for (const x of [-2.3, 0, 2.3]) { const mullion = new THREE.Mesh(new THREE.BoxGeometry(.15, 3, .25), M(0xbac3c5)); mullion.position.set(x, 2.1, -6.4); g.add(mullion); }
    const planet = new THREE.Mesh(new THREE.SphereGeometry(.85, 18, 12), M(0x4c78b5, { metalness: .25 })); planet.position.set(7.2, 2.4, -4); g.add(planet);
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.35, .06, 6, 36), M(0xd7b960, { metalness: .7 })); orbit.rotation.x = 1.1; orbit.position.copy(planet.position); g.add(orbit);
    g.position.set(-20, 0, 116);
    scene.add(g);
    addCollider(-20, 116, 18, 12);
    mark(-20, 116, '#f2efe6', 5);
    addSign(scene, '香港太空館 Space Museum', -20, 5.2, 109.4, 13, '#7db8ff', Math.PI, '#1c2440');
    const up = pointLight(0x9fc8ff, 7, 24, 1.8);
    up.position.set(-20, 12, 116); scene.add(up);
  }

  // ============ The Peninsula (-24, 82) — colonial H-shape with fountain ============
  {
    const g = new THREE.Group();
    const cream = M(0xe8dcc2);
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

  // ============ 1881 Heritage (-48, 84) — white colonial w/ arches ============
  {
    const g = new THREE.Group();
    const main = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 9), M(0xf2ede2));
    main.position.y = 4; main.castShadow = true; g.add(main);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(15, 1.2, 10), M(0x8a4438));
    roof.position.y = 8.6; g.add(roof);
    for (let i = -2; i <= 2; i++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 8, 8), M(0xffffff));
      col.position.set(i * 3, 4, 4.8);
      g.add(col);
    }
    // Veranda arches, balcony balustrade and the historic time-ball tower.
    const archM = M(0xe2d7c5, { roughness: .76 });
    for (let i = -2; i <= 2; i++) {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.15, .22, 8, 22, Math.PI), archM);
      arch.position.set(i * 3, 5.7, 4.88); g.add(arch);
      framedWindow(g, i * 2.6, 3.2, -4.55, 1.35, 2.25, Math.PI, 0x8bb1bd);
    }
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(15.4, .28, 1.25), M(0xc7b69b)); balcony.position.set(0, 7.4, 5); g.add(balcony);
    for (let x = -7; x <= 7; x += .8) { const b = new THREE.Mesh(new THREE.BoxGeometry(.07, .75, .07), M(0xede4d5)); b.position.set(x, 7.85, 5.45); g.add(b); }
    const tower = new THREE.Mesh(new THREE.BoxGeometry(4.2, 8, 4.2), M(0xeee7d8)); tower.position.set(-3.5, 12.6, 0); tower.castShadow = true; g.add(tower);
    const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 4, 4), M(0x55705f)); towerRoof.rotation.y = Math.PI / 4; towerRoof.position.set(-3.5, 18.5, 0); g.add(towerRoof);
    for (const [x, z, ry] of [[-3.5, 2.15, 0], [-1.35, 0, Math.PI / 2]]) {
      const clock = new THREE.Mesh(new THREE.CircleGeometry(.75, 20), M(0xf4ecd5)); clock.position.set(x, 14, z); clock.rotation.y = ry; g.add(clock);
    }
    for (let i = 0; i < 3; i++) { const step = new THREE.Mesh(new THREE.BoxGeometry(17 - i, .25, 2), M(0xc8b99f)); step.position.set(0, .12 + i * .16, 6 + i * .65); g.add(step); }
    g.position.set(-48, 0, 84);
    scene.add(g);
    addCollider(-48, 84, 15, 10);
    mark(-48, 84, '#f2ede2', 4);
    addSign(scene, '1881 Heritage', -48, 6.5, 89.6, 9, '#d9a23c', 0, '#2a2438');
  }

  // ============ iSQUARE (-20, 66) — glass tower at Nathan × Peking ============
  {
    const g = new THREE.Group();
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(14, 46, 14),
      new THREE.MeshStandardMaterial({ map: buildingTexture('#23365c', 0.75), roughness: 0.55, metalness: 0.3 }));
    // real location: NW corner of Nathan Rd × Peking Rd
    tower.position.set(0, 23, 0);
    tower.castShadow = true;
    g.add(tower);
    const podium = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 17), M(0x32466e, { metalness: 0.4, roughness: 0.5 }));
    podium.position.set(0, 4, 0); g.add(podium);
    const steel = M(0x8aa3ad, { metalness: .75, roughness: .24 });
    for (let y = 4; y < 45; y += 3.7) { const band = new THREE.Mesh(new THREE.BoxGeometry(14.18, .12, 14.18), steel); band.position.y = y; g.add(band); }
    for (const x of [-5.2, -2.6, 0, 2.6, 5.2]) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(.11, 44, .16), steel); mullion.position.set(x, 24, 7.08); g.add(mullion);
    }
    const crown = new THREE.Mesh(new THREE.BoxGeometry(11, 4, 11), M(0x1a3b54, { metalness: .55, roughness: .22 })); crown.position.y = 48; crown.rotation.y = .12; g.add(crown);
    const portal = new THREE.Mesh(new THREE.BoxGeometry(7, 4.8, .4), M(0x6ce5e5, { emissive: 0x174f58, emissiveIntensity: 1, metalness: .45 })); portal.position.set(0, 2.7, -8.7); g.add(portal);
    for (const x of [-6.7, -2.25, 2.25, 6.7]) framedWindow(g, x, 4, -8.58, 3.5, 4.6, Math.PI, 0x7fd5e1);
    g.position.set(-20, 0, 38); scene.add(g);
    addCollider(-20, 38, 18, 17);
    mark(-20, 38, '#32466e', 6);
    addSign(scene, 'iSQUARE 國際廣場', -11, 14, 38, 11, '#5cffe8', Math.PI / 2, '#101a36');
  }

  // ============ Chungking Mansions (19, 72) — five joined blocks ============
  {
    const g = new THREE.Group();
    const tex = buildingTexture('#6e5f4e', 0.5);
    for (let i = 0; i < 3; i++) {
      const blk = new THREE.Mesh(new THREE.BoxGeometry(6.5, 30, 12), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
      blk.position.set(-6.5 + i * 6.5, 15, 0);
      blk.castShadow = true;
      g.add(blk);
    }
    const podium = new THREE.Mesh(new THREE.BoxGeometry(21, 6, 14), M(0x7d6c58));
    podium.position.y = 3;
    g.add(podium);
    // cluttered little shop signs at street level
    const signCols = ['#ff5c5c', '#ffd35c', '#7dffb2', '#7db8ff', '#ff8fb6'];
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.1),
        new THREE.MeshBasicMaterial({ color: signCols[i] }));
      s.position.set(-8 + i * 4, 4.2 + (i % 2), -7.1);
      g.add(s);
    }
    g.position.set(19, 0, 72);
    g.rotation.y = Math.PI;
    scene.add(g);
    addCollider(19, 72, 21, 14);
    mark(19, 72, '#6e5f4e', 6);
    addSign(scene, '重慶大廈 Chungking Mansions', 19, 8.5, 64.6, 14, '#ff8a5c', Math.PI, '#241c14');
  }

  // ============ K11 MUSEA (42, 114) — curvy bronze waterfront mall ============
  {
    const g = new THREE.Group();
    const bronze = M(0xa77a4f, { metalness: .48, roughness: .36, emissive: 0x211107, emissiveIntensity: .25 });
    const paleBronze = M(0xd0a775, { metalness: .62, roughness: .28 });
    const glass = M(0x163342, { metalness: .62, roughness: .14, emissive: 0x142c34, emissiveIntensity: .55 });
    // A contemporary manor: broad rounded podium, stepped upper floors and roof pavilion.
    for (const [w, h, d, y, material] of [
      [28, 8, 22, 4, bronze], [26, 6, 20, 11, glass], [23, 6, 18, 17, bronze], [18, 6, 15, 23, glass], [12, 4, 11, 28, bronze],
    ]) { const b = roundedBlock(w, h, d, 1.6, material); b.position.y = y; g.add(b); }
    // Projecting garden terraces and warm horizontal datum lines.
    for (const [w, d, y] of [[29, 23, 8.1], [27, 21, 14.1], [24, 19, 20.1], [19, 16, 26.1]]) {
      const terrace = roundedBlock(w, .45, d, 1.7, paleBronze); terrace.position.y = y; g.add(terrace);
    }
    const gardenM = M(0x3b7656, { roughness: .85 });
    for (let i = 0; i < 18; i++) {
      const level = i % 2 ? 20.7 : 26.7, width = i % 2 ? 10.5 : 7.5;
      const shrub = new THREE.Mesh(new THREE.IcosahedronGeometry(.45 + (i % 3) * .1, 1), gardenM);
      shrub.position.set(-width + (i % 9) * width / 4, level, i % 2 ? -8.8 : -7.1); g.add(shrub);
    }
    // Sculpted bronze facade ribbons curve across the harbour-facing elevation.
    for (let i = 0; i < 11; i++) {
      const x = -12.5 + i * 2.5;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, 1, -11.25), new THREE.Vector3(x + Math.sin(i) * .7, 8, -11.65),
        new THREE.Vector3(x - Math.cos(i) * .8, 15, -10.55), new THREE.Vector3(x * .68, 25.5, -8.15),
      ]);
      const fin = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, .15, 7, false), paleBronze); g.add(fin);
    }
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(9, 5.8, .45), glass); entrance.position.set(0, 3.2, -11.4); g.add(entrance);
    const entranceArch = new THREE.Mesh(new THREE.TorusGeometry(4.5, .35, 10, 36, Math.PI), paleBronze); entranceArch.position.set(0, 5.9, -11.68); g.add(entranceArch);
    for (const x of [-3.2, -1.6, 0, 1.6, 3.2]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.1, 5, .12), paleBronze); m.position.set(x, 3.2, -11.7); g.add(m); }
    // Roof lantern and art beacon.
    const lantern = roundedBlock(5, 3, 5, .7, glass); lantern.position.y = 31; g.add(lantern);
    const beacon = pointLight(0xffbe7a, 7, 28, 1.7); beacon.position.set(0, 29, 0); g.add(beacon);
    g.position.set(42, 0, 114);
    scene.add(g);
    addCollider(42, 114, 25, 25);
    mark(42, 114, '#a8855c', 7);
    addSign(scene, 'K11 MUSEA', 42, 20, 101, 11, '#ffc88a', Math.PI, '#221608');
    const up = pointLight(0xffb070, 9, 30, 1.7);
    up.position.set(42, 5, 100); scene.add(up);
  }

  // ============ Harbour City (-80, 40) — long mall along Canton Rd ============
  {
    const mallGroup = new THREE.Group();
    const mall = new THREE.Mesh(
      new THREE.BoxGeometry(20, 14, 78),
      new THREE.MeshStandardMaterial({ map: buildingTexture('#44506e', 0.6), roughness: 0.8 }));
    mall.position.set(0, 7, 0);
    mall.castShadow = true;
    mallGroup.add(mall);
    // Ocean Terminal's layered retail frontage and glazed harbour decks.
    const glass = M(0x21475c, { metalness: .55, roughness: .18, emissive: 0x0f2633, emissiveIntensity: .5 });
    for (const z of [-30, -12, 8, 28]) {
      const bay = new THREE.Mesh(new THREE.BoxGeometry(2.2, 8.5, 14), glass); bay.position.set(11.1, 6.2, z); mallGroup.add(bay);
      for (let y = 3; y < 10; y += 2.2) { const band = new THREE.Mesh(new THREE.BoxGeometry(.18, .12, 14.2), M(0x8daeb9, { metalness: .7 })); band.position.set(12.25, y, z); mallGroup.add(band); }
    }
    const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(22, .6, 48), M(0xb5b9b4)); roofDeck.position.set(0, 14.3, 10); mallGroup.add(roofDeck);
    for (let z = -10; z <= 30; z += 5) {
      const tree = new THREE.Mesh(new THREE.IcosahedronGeometry(.85, 1), M(0x4b7d5d)); tree.position.set(7.5, 15.5, z); mallGroup.add(tree);
    }
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(.5, 6, 11), glass); entrance.position.set(10.3, 3.2, -31); mallGroup.add(entrance);
    mallGroup.position.set(-80, 0, 40); scene.add(mallGroup);
    addCollider(-80, 40, 20, 78);
    mark(-80, 40, '#44506e', 8);
    addSign(scene, '海港城 Harbour City', -69.6, 10, 40, 16, '#7db8ff', Math.PI / 2, '#141c34');
    // docked cruise ship at Ocean Terminal (west of mall)
    const ship = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 44), M(0xf5f5f0));
    hull.position.y = 2.5; ship.add(hull);
    const decks = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 34), M(0xe8e8e0));
    decks.position.y = 7; ship.add(decks);
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 4, 10), M(0xd23a3a));
    funnel.position.set(0, 11, -6); ship.add(funnel);
    ship.position.set(-101, 0, 55);
    scene.add(ship);
    addCollider(-101, 55, 11, 45);
  }

  // ============ Kowloon Mosque (-19, 22) — white with green domes ============
  {
    const g = new THREE.Group();
    const white = M(0xf5f2ea), green = M(0x2d8a5f, { roughness: 0.5 });
    const main = new THREE.Mesh(new THREE.BoxGeometry(11, 7, 11), white);
    main.position.y = 3.5; main.castShadow = true; g.add(main);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(3.4, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), green);
    dome.position.y = 7; g.add(dome);
    for (const [mx, mz] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) {
      const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 12, 8), white);
      minaret.position.set(mx, 6, mz);
      minaret.castShadow = true;
      g.add(minaret);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), green);
      cap.position.set(mx, 12, mz);
      g.add(cap);
    }
    // real location: SE corner of Kowloon Park at Nathan Rd × Haiphong Rd
    g.position.set(-18, 0, -4);
    scene.add(g);
    addCollider(-18, -4, 12, 12);
    mark(-18, -4, '#f5f2ea', 5);
    addSign(scene, '九龍清真寺 Kowloon Mosque', -18, 8.8, 2.2, 12, '#7dffb2', 0, '#14241c');
  }

  // ============ St Andrew's Church (16, -22) — red brick, steeple, cross ============
  {
    const g = new THREE.Group();
    const brick = M(0x9e4a38);
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
