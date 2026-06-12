// ============================================================
// The girl character — tailor-made low-poly model based on the
// reference photos: white short-sleeve dress, royal-blue round
// collar, blue sleeve cuffs, wide blue waist belt, blue hem trim,
// white socks and black school shoes, with pigtail hair.
// ============================================================
import * as THREE from 'three';

const COL = {
  skin:   0xf7d3b3,
  blush:  0xf2a98a,
  white:  0xfdfdfa,
  blue:   0x2b3f8c,   // royal blue of collar / belt / trim
  hair:   0x2e2018,
  sock:   0xffffff,
  shoe:   0x1c1c1f,
  eye:    0x241a12,
  mouth:  0xd86a6a,
};

function mat(color, opts = {}) {
  return new THREE.MeshToonMaterial({ color, ...opts });
}

export function createGirl() {
  const girl = new THREE.Group();
  const parts = {};

  const skinM  = mat(COL.skin);
  const whiteM = mat(COL.white);
  const blueM  = mat(COL.blue);
  const hairM  = mat(COL.hair);
  const shoeM  = mat(COL.shoe);

  // ---------------- body root (bobs while walking) ----------------
  const body = new THREE.Group();
  body.position.y = 0.62;
  girl.add(body);
  parts.body = body;

  // ---------------- dress: flared white skirt ----------------
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.34, 0.42, 14, 1), whiteM);
  skirt.position.y = 0.21;
  skirt.castShadow = true;
  body.add(skirt);
  parts.skirt = skirt;

  // wide royal-blue band right at the bottom edge of the skirt,
  // matching the real uniform's hem stripe
  const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.305, 0.348, 0.095, 14, 1, true), blueM);
  hem.position.y = -0.165;
  skirt.add(hem);

  // ---------------- torso (white bodice) ----------------
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.165, 0.34, 12), whiteM);
  torso.position.y = 0.56;
  torso.castShadow = true;
  body.add(torso);

  // wide royal-blue waist belt — the signature of the uniform
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.168, 0.20, 0.085, 14), blueM);
  belt.position.y = 0.415;
  body.add(belt);

  // round blue collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.155, 0.06, 12), blueM);
  collar.position.y = 0.745;
  body.add(collar);

  // tiny school badge on the chest
  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.028, 10), mat(0xffd35c));
  badge.position.set(0.055, 0.66, 0.152);
  badge.rotation.x = -0.08;
  body.add(badge);

  // ---------------- head ----------------
  const headG = new THREE.Group();
  headG.position.y = 0.80;
  body.add(headG);
  parts.head = headG;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 18, 16), skinM);
  head.position.y = 0.13;
  head.scale.set(1, 1.04, 0.96);
  head.castShadow = true;
  headG.add(head);

  // hair cap
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.165, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), hairM);
  hairCap.position.set(0, 0.158, -0.022);
  hairCap.scale.set(1, 1.05, 1);
  headG.add(hairCap);

  // fringe — covers the forehead only, leaving the face visible
  const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.162, 14, 8, 0, Math.PI, 0, Math.PI * 0.24), hairM);
  fringe.position.set(0, 0.145, 0.012);
  fringe.rotation.x = Math.PI * 0.18;
  headG.add(fringe);

  // pigtails with little blue ribbons
  parts.pigtails = [];
  for (const side of [-1, 1]) {
    const tail = new THREE.Group();
    tail.position.set(side * 0.155, 0.16, -0.03);
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), hairM);
    tuft.scale.set(0.8, 1.5, 0.8);
    tuft.position.y = -0.075;
    tail.add(tuft);
    const ribbon = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 8), blueM);
    ribbon.scale.set(1.6, 0.7, 0.9);
    ribbon.position.y = 0.012;
    tail.add(ribbon);
    tail.rotation.z = side * 0.35;
    headG.add(tail);
    parts.pigtails.push(tail);
  }

  // eyes — big and friendly
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), mat(COL.eye));
    eye.position.set(side * 0.056, 0.128, 0.144);
    eye.scale.set(1, 1.2, 0.6);
    headG.add(eye);
    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff }));
    spark.position.set(side * 0.052, 0.14, 0.158);
    headG.add(spark);
    // blush cheeks
    const blush = new THREE.Mesh(new THREE.CircleGeometry(0.022, 8),
      new THREE.MeshBasicMaterial({ color: COL.blush, transparent: true, opacity: 0.55 }));
    blush.position.set(side * 0.092, 0.088, 0.136);
    blush.rotation.y = side * 0.45;
    headG.add(blush);
  }

  // smiling mouth
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.007, 6, 10, Math.PI), mat(COL.mouth));
  mouth.position.set(0, 0.082, 0.148);
  mouth.rotation.x = Math.PI;
  headG.add(mouth);

  // ---------------- arms: white puff sleeve + blue cuff + skin ----------------
  parts.arms = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.185, 0.72, 0);

    const sleeve = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 10), whiteM);
    sleeve.scale.set(1, 1.25, 1);
    sleeve.position.y = -0.04;
    arm.add(sleeve);

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.05, 0.035, 10), blueM);
    cuff.position.y = -0.115;
    arm.add(cuff);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.03, 0.21, 8), skinM);
    forearm.position.y = -0.23;
    forearm.castShadow = true;
    arm.add(forearm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), skinM);
    hand.position.y = -0.345;
    arm.add(hand);

    body.add(arm);
    parts.arms.push(arm);
  }

  // ---------------- legs: skin + white sock + black shoe ----------------
  parts.legs = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.085, 0.06, 0);

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.3, 8), skinM);
    thigh.position.y = -0.15;
    thigh.castShadow = true;
    leg.add(thigh);

    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.16, 8), mat(COL.sock));
    sock.position.y = -0.37;
    leg.add(sock);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.06, 0.16), shoeM);
    shoe.position.set(0, -0.47, 0.025);
    shoe.castShadow = true;
    leg.add(shoe);

    body.add(leg);
    parts.legs.push(leg);
  }

  girl.userData.parts = parts;
  girl.userData.animTime = 0;
  return girl;
}

// Procedural walk / idle animation.
// speed: 0 = idle, 1 = full walk
export function animateGirl(girl, dt, speed) {
  const p = girl.userData.parts;
  girl.userData.animTime += dt * (1.5 + speed * 8.5);
  const t = girl.userData.animTime;

  const swing = Math.sin(t) * 0.75 * speed;
  p.legs[0].rotation.x = swing;
  p.legs[1].rotation.x = -swing;
  p.arms[0].rotation.x = -swing * 0.85;
  p.arms[1].rotation.x = swing * 0.85;
  p.arms[0].rotation.z = 0.12 + Math.sin(t * 0.5) * 0.03;
  p.arms[1].rotation.z = -0.12 - Math.sin(t * 0.5) * 0.03;

  // body bob + skirt sway
  p.body.position.y = 0.62 + Math.abs(Math.sin(t)) * 0.045 * speed
    + Math.sin(t * 0.45) * 0.008 * (1 - speed);
  p.skirt.rotation.y = Math.sin(t * 0.9) * 0.06 * speed;
  p.skirt.scale.x = p.skirt.scale.z = 1 + Math.abs(Math.sin(t)) * 0.05 * speed;

  // head + pigtails bounce
  p.head.rotation.z = Math.sin(t * 0.5) * 0.04;
  p.head.rotation.x = speed * 0.06;
  p.pigtails[0].rotation.z = 0.35 + Math.sin(t + 0.4) * (0.06 + 0.14 * speed);
  p.pigtails[1].rotation.z = -0.35 - Math.sin(t) * (0.06 + 0.14 * speed);
}
