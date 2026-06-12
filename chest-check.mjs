// Snapshot every treasure chest spot using the REAL in-game camera angle
// (girl at the chest, camera 11.5 behind looking north) + collider check.
import puppeteer from 'puppeteer-core';

const b = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--use-gl=angle', '--enable-unsafe-swiftshader'],
});
const pg = await b.newPage();
pg.on('pageerror', e => console.log('PAGEERROR:', e.message));
await pg.setViewport({ width: 800, height: 500 });
await pg.goto('http://localhost:8000', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3000));
await pg.type('#player-name', 'X');
await pg.click('#start-btn');
await new Promise(r => setTimeout(r, 1000));

// ---- minimap orientation test: walk north (+z) → dot must move UP ----
const mmTest = await pg.evaluate(async () => {
  const dg = window.__dg;
  const mmCanvas = document.getElementById('minimap');
  const findDot = () => {
    const g = mmCanvas.getContext('2d');
    const d = g.getImageData(0, 0, mmCanvas.width, mmCanvas.height).data;
    for (let y = 0; y < mmCanvas.height; y++)
      for (let x = 0; x < mmCanvas.width; x++) {
        const i = (y * mmCanvas.width + x) * 4;
        if (d[i] > 240 && d[i + 1] > 110 && d[i + 1] < 180 && d[i + 2] > 150) return { x, y };
      }
    return null;
  };
  dg.girl.position.set(0, 0, -20);
  await new Promise(r => setTimeout(r, 250));
  const a = findDot();
  dg.girl.position.set(0, 0, 40);            // walk "up" (toward harbour)
  await new Promise(r => setTimeout(r, 250));
  const c = findDot();
  return { before: a, after: c };
});
const ok = mmTest.before && mmTest.after && mmTest.after.y < mmTest.before.y;
console.log(`Minimap: dot ${JSON.stringify(mmTest.before)} -> ${JSON.stringify(mmTest.after)}`,
  ok ? '(moves UP, correct)' : '(WRONG)');

// ---- reachability vs colliders ----
const report = await pg.evaluate(() => {
  const dg = window.__dg;
  const colliders = dg.world.colliders;
  const R = 0.45;
  const free = (x, z) =>
    !colliders.some(c => x > c.minX - R && x < c.maxX + R && z > c.minZ - R && z < c.maxZ + R);
  return dg.chests.map(ch => {
    const { x, z } = ch.position;
    let standable = free(x, z);
    const buried = !standable;
    if (!standable) {
      for (let r = 1; r <= 3 && !standable; r += 0.5)
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8)
          if (free(x + Math.cos(a) * r, z + Math.sin(a) * r)) { standable = true; break; }
    }
    return { hint: ch.userData.hint, x, z, buried, reachable: standable };
  });
});
for (const r of report) {
  console.log(
    `${r.reachable ? 'OK ' : 'BLOCKED'} ${r.buried ? '[INSIDE COLLIDER] ' : ''}(${r.x}, ${r.z}) ${r.hint}`);
}

// ---- in-game-angle snapshots ----
await pg.evaluate(() => {
  window.__dg.state.phase = 'paused-debug';
  window.__camLock = true;
  document.getElementById('hud').style.display = 'none';
});
const spots = await pg.evaluate(() =>
  window.__dg.chests.map(c => ({ x: c.position.x, z: c.position.z, hint: c.userData.hint })));
for (let i = 0; i < spots.length; i++) {
  const s = spots[i];
  await pg.evaluate((s) => {
    const dg = window.__dg;
    dg.girl.position.set(s.x, 0, s.z - 2.5);   // girl just south of the chest
    const cam = dg.camera;
    cam.position.set(s.x, 9.5, s.z - 2.5 - 11.5);   // real CAM_OFFSET
    cam.lookAt(s.x, 1.5, s.z - 2.5 + 3);
  }, s);
  await new Promise(r => setTimeout(r, 350));
  await pg.screenshot({ path: `chest-${String(i).padStart(2, '0')}.png` });
}
await b.close();
console.log('done');
