// ============================================================
// Recognisable Tsim Sha Tsui landmarks, modelled low-poly:
// Clock Tower, Star Ferry Pier, Cultural Centre, Space Museum,
// The Peninsula, 1881 Heritage, iSQUARE, Chungking Mansions,
// K11 MUSEA, Harbour City, Kowloon Mosque, St Andrew's Church,
// Avenue of Stars and MTR entrances.
// Positions follow the real street layout (+z = toward harbour).
// ============================================================
import * as THREE from 'three';

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

export function addLandmarks(scene, world, { buildingTexture }) {
  const addCollider = (x, z, w, d) =>
    world.colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  const mark = (x, z, color, r = 5) => world.minimapItems.push({ x, z, color, r });
  const M = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts });

  // ============ Clock Tower (-68, 118) ============
  {
    const g = new THREE.Group();
    const brick = M(0xb05a3c), stone = M(0xd9cdb8);
    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 6), stone);
    base.position.y = 1.5; base.castShadow = true; g.add(base);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(4.4, 20, 4.4), brick);
    shaft.position.y = 13; shaft.castShadow = true; g.add(shaft);
    const top = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 5), stone);
    top.position.y = 24.2; g.add(top);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), stone);
    dome.position.y = 25.5; g.add(dome);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), stone);
    spire.position.y = 29; g.add(spire);
    const clockTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const gg = c.getContext('2d');
      gg.fillStyle = '#fff8e0'; gg.beginPath(); gg.arc(32, 32, 30, 0, 7); gg.fill();
      gg.strokeStyle = '#222'; gg.lineWidth = 3;
      gg.beginPath(); gg.moveTo(32, 32); gg.lineTo(32, 12); gg.stroke();
      gg.beginPath(); gg.moveTo(32, 32); gg.lineTo(46, 36); gg.stroke();
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    for (let i = 0; i < 4; i++) {
      const face = new THREE.Mesh(new THREE.CircleGeometry(1.5, 20), new THREE.MeshBasicMaterial({ map: clockTex }));
      face.position.y = 21.5;
      if (i === 0) face.position.z = 2.25;
      if (i === 1) { face.position.z = -2.25; face.rotation.y = Math.PI; }
      if (i === 2) { face.position.x = 2.25; face.rotation.y = Math.PI / 2; }
      if (i === 3) { face.position.x = -2.25; face.rotation.y = -Math.PI / 2; }
      g.add(face);
    }
    g.position.set(-68, 0, 118);
    scene.add(g);
    addCollider(-68, 118, 6.5, 6.5);
    mark(-68, 118, '#d9a23c', 4);
    const up = new THREE.PointLight(0xffe2b0, 10, 35, 1.6);
    up.position.set(-68, 6, 122); scene.add(up);
  }

  // ============ Star Ferry Pier (-86, 120) ============
  {
    const g = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(16, 1, 18), M(0x6e6a72));
    deck.position.y = 0.5; g.add(deck);
    const hall = new THREE.Mesh(new THREE.BoxGeometry(13, 5, 13), M(0xf0ece0));
    hall.position.y = 3.5; hall.castShadow = true; g.add(hall);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 12, 3, 1), M(0x2d6b4f));
    roof.scale.set(1, 0.25, 1);
    roof.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    roof.position.y = 7;
    g.add(roof);
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
    const dome = new THREE.Mesh(new THREE.SphereGeometry(6, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), M(0xf2efe6, { roughness: 0.6 }));
    dome.position.y = 4; dome.castShadow = true; g.add(dome);
    g.position.set(-20, 0, 116);
    scene.add(g);
    addCollider(-20, 116, 18, 12);
    mark(-20, 116, '#f2efe6', 5);
    addSign(scene, '香港太空館 Space Museum', -20, 5.2, 109.4, 13, '#7db8ff', Math.PI, '#1c2440');
    const up = new THREE.PointLight(0x9fc8ff, 7, 24, 1.8);
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
    world.updatables.push((dt, t) => { jet.scale.y = 1 + Math.sin(t * 5) * 0.18; });
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
    g.position.set(-48, 0, 84);
    scene.add(g);
    addCollider(-48, 84, 15, 10);
    mark(-48, 84, '#f2ede2', 4);
    addSign(scene, '1881 Heritage', -48, 6.5, 89.6, 9, '#d9a23c', 0, '#2a2438');
  }

  // ============ iSQUARE (-20, 66) — glass tower at Nathan × Peking ============
  {
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(14, 46, 14),
      new THREE.MeshStandardMaterial({ map: buildingTexture('#23365c', 0.75), roughness: 0.55, metalness: 0.3 }));
    // real location: NW corner of Nathan Rd × Peking Rd
    tower.position.set(-20, 23, 38);
    tower.castShadow = true;
    scene.add(tower);
    const podium = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 17), M(0x32466e, { metalness: 0.4, roughness: 0.5 }));
    podium.position.set(-20, 4, 38);
    scene.add(podium);
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
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 13, 18, 8),
      M(0xb08a5c, { metalness: 0.45, roughness: 0.4, emissive: 0x2a1c0c, emissiveIntensity: 0.8 }));
    body.position.y = 9; body.castShadow = true; g.add(body);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(7, 10, 7, 8),
      M(0xc89c68, { metalness: 0.5, roughness: 0.35, emissive: 0x2a1c0c, emissiveIntensity: 0.8 }));
    crown.position.y = 21; g.add(crown);
    // glowing vertical fins
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.4, 16, 0.4), new THREE.MeshBasicMaterial({ color: 0xffc88a }));
      fin.position.set(Math.cos(a) * 12.2, 8, Math.sin(a) * 12.2);
      g.add(fin);
    }
    g.position.set(42, 0, 114);
    scene.add(g);
    addCollider(42, 114, 25, 25);
    mark(42, 114, '#a8855c', 7);
    addSign(scene, 'K11 MUSEA', 42, 20, 101, 11, '#ffc88a', Math.PI, '#221608');
    const up = new THREE.PointLight(0xffb070, 9, 30, 1.7);
    up.position.set(42, 5, 100); scene.add(up);
  }

  // ============ Harbour City (-80, 40) — long mall along Canton Rd ============
  {
    const mall = new THREE.Mesh(
      new THREE.BoxGeometry(20, 14, 78),
      new THREE.MeshStandardMaterial({ map: buildingTexture('#44506e', 0.6), roughness: 0.8 }));
    mall.position.set(-80, 7, 40);
    mall.castShadow = true;
    scene.add(mall);
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
